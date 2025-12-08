<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Role;
use App\Http\Controllers\EmailVerificationController;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
    // Registro
    public function register(Request $request)
    {
        try {
            $validated = $request->validate([
                'username' => 'required|string|unique:users,username',
                'email' => 'required|string|email|unique:users,email',
                'password' => 'required|string|min:6',
                'profile_picture' => 'nullable|image|max:2048',
            ]);

            $result = DB::transaction(function () use ($request) {
                $userData = [
                    'username' => $request->username,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                    'role_id' => 2, // Default to User
                    'name' => $request->username,
                ];

                // Imagen
                if ($request->hasFile('profile_picture')) {
                    $path = $request->file('profile_picture')->store('profiles', 'public');
                    $userData['profile_picture'] = $path;
                }

                $user = User::create($userData);

                return ['user' => $user];
            });

            // Enviar email de verificación
            $emailVerificationController = new EmailVerificationController();
            $emailVerificationController->sendVerificationEmail($result['user']);

            return response()->json([
                'success' => true,
                'message' => 'Registro exitoso. Por favor revisa tu correo electrónico para verificar tu cuenta.',
                'user' => [
                    'id' => $result['user']->id,
                    'username' => $result['user']->username,
                    'email' => $result['user']->email,
                ],
                'requires_verification' => true,
            ], 201);

        } catch (ValidationException $e) {
            // Retornar errores de validación con código 422
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Registration error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error en el registro',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    // Login
    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|string|email',
                'password' => 'required|string',
            ]);

            // Primero verificar si el usuario existe
            $user = User::where('email', $request->email)->first();
            
            if (!$user) {
                return response()->json([
                    'message' => 'Credenciales inválidas',
                    'errors' => [
                        'email' => ['El email o la contraseña son incorrectos']
                    ]
                ], 422);
            }

            // Verificar si el email está verificado
            if (!$user->email_verified_at) {
                return response()->json([
                    'message' => 'Debes verificar tu correo electrónico antes de iniciar sesión',
                    'errors' => [
                        'email' => ['Tu correo no ha sido verificado. Revisa tu bandeja de entrada.']
                    ],
                    'requires_verification' => true,
                    'email' => $user->email,
                ], 403);
            }

            if (!Auth::attempt($request->only('email', 'password'))) {
                return response()->json([
                    'message' => 'Credenciales inválidas',
                    'errors' => [
                        'email' => ['El email o la contraseña son incorrectos']
                    ]
                ], 422);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'user' => $user->load('role'),
                'token' => $token,
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Login error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al iniciar sesión',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    // Logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }

    // Obtener foto de perfil
    public function getProfilePhoto($id)
    {
        $user = User::find($id);
        if (!$user || !$user->profile_picture) {
            return response("Image not found", 404);
        }

        $path = storage_path('app/public/' . $user->profile_picture);

        if (!file_exists($path)) {
            return response("Image file missing", 404);
        }

        return response()->file($path);
    }

    // Actualizar perfil
    public function updateProfile(Request $request)
    {
        try {
            $user = $request->user();

            $validatedData = $request->validate([
                'username' => ['sometimes', 'string', Rule::unique('users')->ignore($user->id)],
                'email' => ['sometimes', 'string', 'email', Rule::unique('users')->ignore($user->id)],
                'password' => 'sometimes|string|min:6',
                'profile_picture' => 'nullable|image|max:2048',
            ]);

            // Actualizar campos
            if (isset($validatedData['username'])) {
                $user->username = $validatedData['username'];
                $user->name = $validatedData['username'];
            }

            if (isset($validatedData['email'])) {
                $user->email = $validatedData['email'];
            }

            if (isset($validatedData['password'])) {
                $user->password = Hash::make($validatedData['password']);
            }

            // Imagen
            if ($request->hasFile('profile_picture')) {
                if ($user->profile_picture && Storage::disk('public')->exists($user->profile_picture)) {
                    Storage::disk('public')->delete($user->profile_picture);
                }
                $user->profile_picture = $request->file('profile_picture')->store('profiles', 'public');
            }

            $user->save();

            return response()->json([
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'role_id' => $user->role_id,
                    'name' => $user->name,
                    'profile_picture_url' => $user->profile_picture
                        ? asset('storage/' . $user->profile_picture)
                        : null
                ],
                'message' => 'Profile updated successfully'
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Profile update error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al actualizar perfil',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
