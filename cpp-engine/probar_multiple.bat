@echo off
echo ========================================
echo Probando Motor de Busqueda de ADN
echo CON MULTIPLES PATRONES
echo ========================================

if not exist build\busqueda_adn.exe (
    echo ERROR: No se encontro el ejecutable
    echo Primero compila con compilar_mingw.bat o compilar_visual_studio.bat
    pause
    exit /b 1
)

echo.
echo Test 1: UN SOLO PATRON (debe usar KMP o default)
echo ========================================
build\busqueda_adn.exe "TGTACCTTACAATCG" "data\sospechosos_test.csv"

echo.
echo.
echo Test 2: DOS PATRONES (debe usar Aho-Corasick automaticamente)
echo Patron 1: TGTACCTTACAATCG
echo Patron 2: GGCCTTAA
echo ========================================
build\busqueda_adn.exe "TGTACCTTACAATCG,GGCCTTAA" "data\sospechosos_test.csv"

echo.
echo.
echo Test 3: TRES PATRONES (debe usar Aho-Corasick)
echo Patron 1: TGTACCTTACAATCG
echo Patron 2: GGCCTTAA
echo Patron 3: ATGCATGC
echo ========================================
build\busqueda_adn.exe "TGTACCTTACAATCG,GGCCTTAA,ATGCATGC" "data\sospechosos_test.csv"

echo.
echo.
echo Test 4: PATRON que NO existe (0 coincidencias)
echo ========================================
build\busqueda_adn.exe "AAAAAAAAAA" "data\sospechosos_test.csv"

echo.
echo.
echo Test 5: MULTIPLES PATRONES donde solo uno existe
echo Patron 1: AAAAAAAAAA (NO existe)
echo Patron 2: TGTACCTTACAATCG (SI existe)
echo ========================================
build\busqueda_adn.exe "AAAAAAAAAA,TGTACCTTACAATCG" "data\sospechosos_test.csv"

echo.
echo.
echo ========================================
echo Tests completados
echo ========================================
echo.
echo INTERPRETACION DE RESULTADOS:
echo - Test 1: Debe mostrar algoritmo "kmp" o "rabin-karp"
echo - Test 2-3: Debe mostrar algoritmo "aho-corasick"
echo - Test 2-3: Debe mostrar "criterio_seleccion": "multiples_patrones_busqueda_simultanea"
echo - Cada coincidencia debe tener "patron_id" y "patron" especifico
echo.
pause
