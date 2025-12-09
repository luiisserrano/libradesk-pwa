<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\TwoFactorCode;
use App\Mail\TwoFactorCodeMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;

class TwoFactorController extends Controller
{
    /**
     * Generar y enviar código 2FA
     */
    public function sendCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Credenciales inválidas'
            ], 401);
        }

        // Verificar si el email está verificado
        if (!$user->email_verified_at) {
            return response()->json([
                'message' => 'Debes verificar tu email antes de iniciar sesión',
                'requires_verification' => true
            ], 403);
        }

        // Si 2FA está deshabilitado, hacer login directo
        if (!$user->two_factor_enabled) {
            $token = $user->createToken('auth_token')->plainTextToken;
            
            return response()->json([
                'requires_2fa' => false,
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'role' => $user->role ? $user->role->name : 'user',
                    'two_factor_enabled' => $user->two_factor_enabled,
                ]
            ]);
        }

        // Eliminar códigos anteriores
        TwoFactorCode::where('user_id', $user->id)->delete();

        // Generar código de 6 dígitos
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Guardar código (expira en 10 minutos)
        TwoFactorCode::create([
            'user_id' => $user->id,
            'code' => $code,
            'expires_at' => now()->addMinutes(10),
        ]);

        // Enviar código por email con plantilla bonita
        try {
            Mail::to($user->email)->send(new TwoFactorCodeMail($user, $code));
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al enviar el código de verificación'
            ], 500);
        }

        return response()->json([
            'message' => 'Código enviado a tu correo electrónico',
            'requires_2fa' => true,
            'email_hint' => $this->maskEmail($user->email)
        ]);
    }

    /**
     * Verificar código 2FA y completar login
     */
    public function verifyCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        $twoFactorCode = TwoFactorCode::where('user_id', $user->id)
            ->where('code', $request->code)
            ->first();

        if (!$twoFactorCode) {
            return response()->json([
                'message' => 'Código inválido'
            ], 401);
        }

        if ($twoFactorCode->isExpired()) {
            $twoFactorCode->delete();
            return response()->json([
                'message' => 'El código ha expirado. Solicita uno nuevo.'
            ], 401);
        }

        // Eliminar código usado
        $twoFactorCode->delete();

        // Crear token de acceso
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Autenticación exitosa',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role ? $user->role->name : 'user',
                'two_factor_enabled' => $user->two_factor_enabled,
            ]
        ]);
    }

    /**
     * Reenviar código 2FA
     */
    public function resendCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        // Eliminar códigos anteriores
        TwoFactorCode::where('user_id', $user->id)->delete();

        // Generar nuevo código
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        TwoFactorCode::create([
            'user_id' => $user->id,
            'code' => $code,
            'expires_at' => now()->addMinutes(10),
        ]);

        // Enviar código por email con plantilla bonita
        try {
            Mail::to($user->email)->send(new TwoFactorCodeMail($user, $code));
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al enviar el código'
            ], 500);
        }

        return response()->json([
            'message' => 'Nuevo código enviado a tu correo electrónico'
        ]);
    }

    /**
     * Habilitar/deshabilitar 2FA para el usuario
     */
    public function toggle(Request $request)
    {
        $user = $request->user();
        $user->two_factor_enabled = !$user->two_factor_enabled;
        $user->save();

        return response()->json([
            'message' => $user->two_factor_enabled ? '2FA habilitado' : '2FA deshabilitado',
            'two_factor_enabled' => $user->two_factor_enabled
        ]);
    }

    /**
     * Ocultar parcialmente el email
     */
    private function maskEmail(string $email): string
    {
        $parts = explode('@', $email);
        $name = $parts[0];
        $domain = $parts[1];
        
        $maskedName = substr($name, 0, 2) . str_repeat('*', max(strlen($name) - 2, 3));
        
        return $maskedName . '@' . $domain;
    }
}
