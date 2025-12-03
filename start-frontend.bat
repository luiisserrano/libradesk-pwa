@echo off
echo ========================================
echo Iniciando Frontend React/Ionic
echo ========================================
echo.

REM Cambiar al directorio del frontend
cd /d "%~dp0frontend"

REM Mostrar la IP local
echo Obteniendo direccion IP local...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP:~1%
echo.
echo ========================================
echo Frontend estara disponible en:
echo   - Local: http://localhost:5173
echo   - Red:   http://%IP%:5173
echo ========================================
echo.
echo IMPORTANTE: Asegurate de que el backend este corriendo en:
echo   http://%IP%:8000
echo.

REM Iniciar el servidor Vite
echo Iniciando servidor Vite...
npm run dev
