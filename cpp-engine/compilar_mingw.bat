@echo off
echo ========================================
echo Compilando Motor de Busqueda de ADN
echo Usando MinGW/g++
echo ========================================

if not exist build mkdir build
cd build

echo.
echo Compilando con g++...
g++ -std=c++17 -O3 -Wall -I../include ../src/main.cpp ../src/algorithms/kmp.cpp ../src/algorithms/rabin_karp.cpp ../src/algorithms/aho_corasick.cpp ../src/utils/csv_parser.cpp ../src/utils/algorithm_selector.cpp ../src/utils/json_output.cpp -o busqueda_adn.exe

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo COMPILACION EXITOSA!
    echo Ejecutable: build\busqueda_adn.exe
    echo ========================================
    echo.
    echo Para probar:
    echo build\busqueda_adn.exe "TGTACCTTACAATCG" "data\sospechosos_test.csv"
) else (
    echo.
    echo ========================================
    echo ERROR EN LA COMPILACION
    echo ========================================
    echo.
    echo Verifica que tengas MinGW/g++ instalado
    echo Descarga desde: https://www.mingw-w64.org/
)

cd ..
pause
