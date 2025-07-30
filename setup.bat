@echo off
echo ========================================
echo  Sistema de Encuestas - Setup Script
echo ========================================
echo.

echo Instalando dependencias del backend...
cd encuestas-backend
call npm install
if %errorlevel% neq 0 (
    echo Error instalando dependencias del backend
    pause
    exit /b 1
)

echo.
echo Instalando dependencias del frontend...
cd ..\encuestas-frontend
call npm install
if %errorlevel% neq 0 (
    echo Error instalando dependencias del frontend
    pause
    exit /b 1
)

echo.
echo ========================================
echo  Instalacion completada exitosamente!
echo ========================================
echo.
echo Para ejecutar el proyecto:
echo 1. Backend: cd encuestas-backend ^&^& npm run start:dev
echo 2. Frontend: cd encuestas-frontend ^&^& ng serve
echo.
echo No olvides configurar las variables de entorno en:
echo - encuestas-backend/.env
echo.
pause
