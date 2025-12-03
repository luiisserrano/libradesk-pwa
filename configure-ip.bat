@echo off
echo ========================================
echo Configurador de IP para LibraDesk
echo ========================================
echo.

REM Obtener la IP local
echo Obteniendo tu direccion IP local...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP:~1%

echo.
echo Tu IP local es: %IP%
echo.
echo ========================================
echo Configurando archivos .env
echo ========================================
echo.

REM Configurar frontend
cd /d "%~dp0frontend"

REM Crear .env si no existe
if not exist .env (
    echo Creando archivo .env para el frontend...
    copy .env.example .env >nul
) else (
    echo El archivo .env ya existe.
)

REM Actualizar la URL del API en el .env
echo Configurando VITE_API_URL=http://%IP%:8000
(
    echo # Configuracion automatica generada el %date% %time%
    echo VITE_API_URL=http://%IP%:8000
) > .env

echo.
echo ========================================
echo Configuracion completada!
echo ========================================
echo.
echo Frontend configurado para usar: http://%IP%:8000
echo.
echo IMPORTANTE: 
echo 1. Reinicia el servidor frontend si esta corriendo
echo 2. Asegurate de que el backend este corriendo en: http://%IP%:8000
echo.
echo Para acceder desde tu telefono:
echo   Frontend: http://%IP%:5173
echo   Backend:  http://%IP%:8000
echo.
pause
