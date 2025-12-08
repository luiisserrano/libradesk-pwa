<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifica tu correo - LibraDesk</title>
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
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white !important;
            text-decoration: none;
            padding: 15px 40px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
        }
        .button:hover {
            opacity: 0.9;
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
        .expiry-notice {
            background: #fff3cd;
            color: #856404;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📖 LibraDesk</h1>
            <p>Tu biblioteca digital personal</p>
        </div>
        <div class="content">
            <h2>¡Hola, {{ $user->username }}!</h2>
            <p>Gracias por registrarte en LibraDesk. Para completar tu registro y comenzar a disfrutar de tu biblioteca digital, por favor verifica tu correo electrónico.</p>
            
            <a href="{{ $verificationUrl }}" class="button">
                Verificar mi correo
            </a>
            
            <div class="expiry-notice">
                ⏰ Este enlace expirará en 24 horas
            </div>
        </div>
        <div class="footer">
            <p>Si no creaste una cuenta en LibraDesk, puedes ignorar este correo.</p>
            <p>© {{ date('Y') }} LibraDesk. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
