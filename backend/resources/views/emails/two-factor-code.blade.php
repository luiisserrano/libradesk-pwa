<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Código de verificación - LibraDesk</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .header p {
            margin: 10px 0 0;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        .content h2 {
            color: #333;
            margin-bottom: 20px;
        }
        .content p {
            color: #666;
            margin-bottom: 30px;
        }
        .code-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 12px;
            padding: 25px 40px;
            border-radius: 12px;
            display: inline-block;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
        }
        .security-notice {
            background: #e8f4fd;
            color: #0c5460;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            font-size: 14px;
            text-align: left;
        }
        .security-notice strong {
            display: block;
            margin-bottom: 5px;
        }
        .expiry-notice {
            background: #fff3cd;
            color: #856404;
            padding: 15px;
            border-radius: 8px;
            margin-top: 15px;
            font-size: 14px;
        }
        .footer {
            background: #f9f9f9;
            padding: 20px 30px;
            text-align: center;
            color: #999;
            font-size: 12px;
        }
        .footer a {
            color: #667eea;
        }
        .icon {
            font-size: 50px;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 LibraDesk</h1>
            <p>Verificación de seguridad</p>
        </div>
        <div class="content">
            <div class="icon">🛡️</div>
            <h2>¡Hola, {{ $user->username }}!</h2>
            <p>Recibimos una solicitud para iniciar sesión en tu cuenta. Usa el siguiente código para completar la verificación:</p>
            
            <div class="code-box">
                {{ $code }}
            </div>
            
            <div class="expiry-notice">
                ⏰ Este código expira en <strong>10 minutos</strong>
            </div>
            
            <div class="security-notice">
                <strong>🔒 Consejos de seguridad:</strong>
                • Nunca compartas este código con nadie<br>
                • LibraDesk nunca te pedirá tu código por teléfono o mensaje<br>
                • Si no solicitaste este código, ignora este correo
            </div>
        </div>
        <div class="footer">
            <p>Este es un correo automático de <a href="https://digilady.online">LibraDesk</a>.</p>
            <p>Si no intentaste iniciar sesión, puedes ignorar este mensaje de forma segura.</p>
            <p style="margin-top: 15px;">© {{ date('Y') }} LibraDesk - Tu biblioteca digital personal</p>
        </div>
    </div>
</body>
</html>
