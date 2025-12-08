<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\EmailVerificationToken;
use App\Mail\VerifyEmailMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Carbon\Carbon;

class EmailVerificationController extends Controller
{
    /**
     * Enviar email de verificación
     */
    public function sendVerificationEmail(User $user): void
    {
        // Eliminar tokens anteriores
        EmailVerificationToken::where('user_id', $user->id)->delete();

        // Crear nuevo token
        $token = Str::random(64);
        
        EmailVerificationToken::create([
            'user_id' => $user->id,
            'token' => $token,
            'expires_at' => Carbon::now()->addHours(24),
        ]);

        // Generar URL de verificación (apunta al frontend PWA)
        $frontendUrl = config('app.frontend_url', 'https://digilady.online');
        $verificationUrl = "{$frontendUrl}/verify-email?token={$token}";

        // Enviar email
        Mail::to($user->email)->send(new VerifyEmailMail($user, $verificationUrl));
    }

    /**
     * Verificar email con token
     */
    public function verify(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        $verificationToken = EmailVerificationToken::where('token', $request->token)->first();

        if (!$verificationToken) {
            return response()->json([
                'success' => false,
                'message' => 'Token de verificación inválido',
            ], 400);
        }

        if ($verificationToken->isExpired()) {
            $verificationToken->delete();
            return response()->json([
                'success' => false,
                'message' => 'El token ha expirado. Por favor solicita un nuevo correo de verificación.',
            ], 400);
        }

        // Marcar email como verificado
        $user = $verificationToken->user;
        $user->email_verified_at = Carbon::now();
        $user->save();

        // Eliminar token usado
        $verificationToken->delete();

        return response()->json([
            'success' => true,
            'message' => '¡Correo verificado exitosamente! Ya puedes iniciar sesión.',
        ]);
    }

    /**
     * Reenviar email de verificación
     */
    public function resend(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            // No revelar si el email existe o no
            return response()->json([
                'success' => true,
                'message' => 'Si el correo está registrado, recibirás un email de verificación.',
            ]);
        }

        if ($user->email_verified_at) {
            return response()->json([
                'success' => true,
                'message' => 'Este correo ya está verificado.',
            ]);
        }

        $this->sendVerificationEmail($user);

        return response()->json([
            'success' => true,
            'message' => 'Correo de verificación enviado. Revisa tu bandeja de entrada.',
        ]);
    }

    /**
     * Verificar estado de verificación
     */
    public function status(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'verified' => false,
                'exists' => false,
            ]);
        }

        return response()->json([
            'verified' => $user->email_verified_at !== null,
            'exists' => true,
        ]);
    }
}
