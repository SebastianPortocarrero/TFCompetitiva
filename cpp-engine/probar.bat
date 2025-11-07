@echo off
echo ========================================
echo Probando Motor de Busqueda de ADN
echo ========================================

if not exist build\busqueda_adn.exe (
    echo ERROR: No se encontro el ejecutable
    echo Primero compila con compilar_mingw.bat o compilar_visual_studio.bat
    pause
    exit /b 1
)

echo.
echo Test 1: Patron que SI existe (TGTACCTTACAATCG)
echo ========================================
build\busqueda_adn.exe "TGTACCTTACAATCG" "data\sospechosos_test.csv"

echo.
echo.
echo Test 2: Patron que NO existe (AAAAAAAAAA)
echo ========================================
build\busqueda_adn.exe "AAAAAAAAAA" "data\sospechosos_test.csv"

echo.
echo.
echo Test 3: Patron invalido (deberia dar error)
echo ========================================
build\busqueda_adn.exe "ATCGXYZ" "data\sospechosos_test.csv"

echo.
echo.
echo ========================================
echo Tests completados
echo ========================================
pause
