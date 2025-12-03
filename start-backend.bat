@echo off
echo ========================================
echo Iniciando Backend Laravel
echo ========================================
echo.

REM Cambiar al directorio del backend
cd /d "%~dp0backend"

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
echo Backend estara disponible en:
echo   - Local: http://localhost:8000
echo   - Red:   http://%IP%:8000
echo ========================================
echo.

REM Iniciar el servidor Laravel en todas las interfaces
echo Iniciando servidor PHP en 0.0.0.0:8000...
php artisan serve --host=0.0.0.0 --port=8000
