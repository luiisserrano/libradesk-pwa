@echo off
echo Iniciando Panel de Administracion LibraDesk...
cd /d "%~dp0admin-panel"
call npm run dev
pause
