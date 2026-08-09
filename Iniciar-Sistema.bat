@echo off
title Sistema de Gestao - Tempo Integral
color 0a

echo ==========================================================
echo    INICIANDO O SISTEMA DE GESTAO - TEMPO INTEGRAL
echo ==========================================================
echo.

:: 1. Verificar se o Node.js esta instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] O Node.js nao foi encontrado neste computador!
    echo Por favor, instale o Node.js (LTS) antes de rodar o sistema.
    echo.
    pause
    exit
)

:: 2. Instalar dependencias se a pasta node_modules nao existir
if not exist "node_modules" (
    echo [INFO] Primeira execucao detectada. Instalando dependencias do sistema...
    echo (Isso pode levar alguns segundos. Por favor, aguarde...)
    call npm.cmd install
    echo [OK] Dependencias instaladas com sucesso.
    echo.
)

:: 3. Rodar seed para popular banco caso esteja vazio
echo [INFO] Verificando e semeando banco de dados...
call npx.cmd tsx src/lib/seed.ts
echo [OK] Banco de dados verificado.
echo.

:: 4. Abrir o navegador automaticamente na pagina do sistema
echo [INFO] Abrindo o navegador em http://localhost:3000...
start http://localhost:3000

:: 5. Iniciar o servidor local do Next.js
echo [INFO] Iniciando o servidor... (Nao feche esta janela enquanto usar o sistema)
echo ==========================================================
echo.
call npm.cmd run dev
