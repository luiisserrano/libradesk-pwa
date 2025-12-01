<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Role;
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
            $request->validate([
                'username' => 'required|string|unique:users,username',
                'email' => 'required|string|email|unique:users,email',
                'password' => 'required|string|min:6',
                'role_id' => 'required|exists:roles,id',
                'profile_picture' => 'nullable|image|max:2048',
            ]);

            $result = DB::transaction(function () use ($request) {
                $userData = [
                    'username' => $request->username,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                    'role_id' => $request->role_id,
                    'name' => $request->username,
                ];

                // Imagen
                if ($request->hasFile('profile_picture')) {
                    $path = $request->file('profile_picture')->store('profiles', 'public');
                    $userData['profile_picture'] = $path;
                }

                $user = User::create($userData);
                $token = $user->createToken('auth_token')->plainTextToken;

                return ['user' => $user, 'token' => $token];
            });

            return response()->json([
                'user' => [
                    'id' => $result['user']->id,
                    'username' => $result['user']->username,
                    'email' => $result['user']->email,
                    'role_id' => $result['user']->role_id,
                    'name' => $result['user']->name,
                    'profile_picture_url' => $result['user']->profile_picture
                        ? asset('storage/' . $result['user']->profile_picture)
                        : null
                ],
                'token' => $result['token'],
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Registration error: ' . $e->getMessage());
            return response()->json(['message' => 'Registration failed', 'error' => $e->getMessage()], 500);
        }
    }

    // Login
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials'],
            ]);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user->load('role'),
            'token' => $token,
        ]);
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

        $photo = $user->profile_picture;

        if (is_string($photo)) {
            $path = storage_path('app/public/' . trim($photo));
            if (file_exists($path)) {
                return response()->file($path);
            }
        }

        return response("Invalid image format", 500);
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

        } catch (\Exception $e) {
            \Log::error('Profile update error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Profile update failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
