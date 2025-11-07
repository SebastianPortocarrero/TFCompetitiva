# Motor de Búsqueda de ADN en C++ - Múltiples Patrones

Motor de búsqueda de patrones de ADN utilizando tres algoritmos clásicos de búsqueda de cadenas.

**NUEVO**: ¡Ahora soporta búsqueda de **MÚLTIPLES PATRONES simultáneamente**!

## Algoritmos Implementados

1. **KMP (Knuth-Morris-Pratt)** - Óptimo para 1 patrón corto
2. **Rabin-Karp** - Óptimo para 1 patrón largo
3. **Aho-Corasick** - Óptimo para **2+ patrones** (búsqueda simultánea)

## Caso de Uso Real

**Escena del crimen con múltiples muestras de sangre:**

- 🩸 Sangre 1 (cuchillo): `TGTACCTTACAATCG`
- 🩸 Sangre 2 (puerta): `GGCCTTAAGGCCTTAA`
- 🩸 Sangre 3 (piso): `ATCGATCGATCG`
- 👥 Base de datos: 10,000 sospechosos

**Ventaja de Aho-Corasick:**
- KMP × 3: 30,000 comparaciones
- **Aho-Corasick: 10,000 comparaciones** (¡3 veces más rápido!)

## Compilación

### Windows con MinGW

```bash
cd D:\trabajoFinalCompe\cpp-engine
compilar_mingw.bat
```

### Windows con Visual Studio

```bash
# Abrir "Developer Command Prompt for VS"
cd D:\trabajoFinalCompe\cpp-engine
compilar_visual_studio.bat
```

## Uso

### Un Solo Patrón

```bash
./busqueda_adn "TGTACCTTACAATCG" "data/sospechosos.csv"
```

### Múltiples Patrones (Separados por coma)

```bash
./busqueda_adn "TGTACCTTACAATCG,GGCCTTAA,ATCGATCG" "data/sospechosos.csv"
```

## Formato del CSV

```csv
nombre_completo,cedula,cadena_adn
Juan Perez Martinez,12345678,ATCGATCGTGTACCTTACAATCGGGCCTTAA
Maria Lopez Garcia,23456789,GGCCTTAAGGCCTTAAGGCCTTAAGGCCTTAA
```

**Reglas:**
- Header opcional
- Cadena ADN: Solo A, T, C, G
- Longitud mínima cadena: 20 caracteres
- Longitud patrón: 5-100 caracteres

## Salida JSON

### Un Solo Patrón

```json
{
  "exito": true,
  "patrones": ["TGTACCTTACAATCG"],
  "num_patrones": 1,
  "algoritmo_usado": "kmp",
  "criterio_seleccion": "default_mas_confiable",
  "total_procesados": 10,
  "total_coincidencias": 3,
  "coincidencias": [
    {
      "nombre": "Juan Perez Martinez",
      "cedula": "12345678",
      "patron_id": 0,
      "patron": "TGTACCTTACAATCG",
      "posicion": 12
    }
  ],
  "tiempo_ejecucion_ms": 1
}
```

### Múltiples Patrones

```json
{
  "exito": true,
  "patrones": ["TGTACCTTACAATCG", "GGCCTTAA"],
  "num_patrones": 2,
  "algoritmo_usado": "aho-corasick",
  "criterio_seleccion": "multiples_patrones_busqueda_simultanea",
  "total_procesados": 10,
  "total_coincidencias": 5,
  "coincidencias": [
    {
      "nombre": "Juan Perez Martinez",
      "cedula": "12345678",
      "patron_id": 0,
      "patron": "TGTACCTTACAATCG",
      "posicion": 12
    },
    {
      "nombre": "Maria Lopez Garcia",
      "cedula": "23456789",
      "patron_id": 1,
      "patron": "GGCCTTAA",
      "posicion": 0
    }
  ],
  "tiempo_ejecucion_ms": 2
}
```

## Selección Automática de Algoritmo

### Regla 1: Múltiples Patrones
```
SI numPatrones >= 2 → Aho-Corasick SIEMPRE
```

### Regla 2-4: Un Solo Patrón
- **KMP**: Patrón ≤ 15 chars + >500 sospechosos (o default)
- **Rabin-Karp**: Patrón > 30 chars
- **Aho-Corasick**: Patrón 15-30 chars + >1000 sospechosos

## Tests

### Test Básico
```bash
probar.bat
```

### Test Múltiples Patrones
```bash
probar_multiple.bat
```

## Estructura del Proyecto

```
cpp-engine/
├── CMakeLists.txt
├── README.md
├── compilar_mingw.bat
├── compilar_visual_studio.bat
├── probar.bat
├── probar_multiple.bat         ← NUEVO
├── include/
│   ├── kmp.h
│   ├── rabin_karp.h
│   ├── aho_corasick.h          ← ACTUALIZADO (múltiples patrones)
│   ├── csv_parser.h
│   ├── algorithm_selector.h    ← ACTUALIZADO
│   └── json_output.h           ← ACTUALIZADO
├── src/
│   ├── main.cpp                ← ACTUALIZADO (parseo de múltiples)
│   ├── algorithms/
│   │   ├── kmp.cpp
│   │   ├── rabin_karp.cpp
│   │   └── aho_corasick.cpp    ← ACTUALIZADO (búsqueda simultánea)
│   └── utils/
│       ├── csv_parser.cpp
│       ├── algorithm_selector.cpp ← ACTUALIZADO
│       └── json_output.cpp     ← ACTUALIZADO
└── data/
    └── sospechosos_test.csv
```

## Performance

- 1 patrón, 1,000 registros: < 5 segundos
- 3 patrones, 10,000 registros: < 15 segundos
- Precisión: 100% (0% falsos positivos/negativos)

## Integración con Backend

### Desde Node.js

```javascript
const { exec } = require('child_process');

// Múltiples patrones
const patrones = ['TGTACCTTACAATCG', 'GGCCTTAA'];
const patronesStr = patrones.join(',');

exec(`./busqueda_adn.exe "${patronesStr}" "./sospechosos.csv"`, (error, stdout, stderr) => {
  if (error) {
    console.error('Error:', error);
    return;
  }

  const resultado = JSON.parse(stdout);
  console.log(`Algoritmo usado: ${resultado.algoritmo_usado}`);
  console.log(`Coincidencias: ${resultado.total_coincidencias}`);

  // Agrupar por sospechoso
  const porSospechoso = {};
  resultado.coincidencias.forEach(c => {
    if (!porSospechoso[c.cedula]) {
      porSospechoso[c.cedula] = {
        nombre: c.nombre,
        patrones: []
      };
    }
    porSospechoso[c.cedula].patrones.push({
      id: c.patron_id,
      patron: c.patron,
      posicion: c.posicion
    });
  });

  console.log('Sospechosos con coincidencias:', porSospechoso);
});
```

## Autor

Sistema Forense de Identificación de ADN - PNP
