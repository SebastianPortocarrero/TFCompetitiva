#include "../../include/algorithm_selector.h"

AlgorithmSelector::Algorithm AlgorithmSelector::seleccionar(
    int numPatrones,
    int longitudPromedioPatron,
    int numSospechosos
) {
    // REGLA 1: Si hay 2 o más patrones → Aho-Corasick SIEMPRE
    // Razón: Aho-Corasick busca todos los patrones en UNA sola pasada
    // Ejemplo: 3 patrones + 10,000 sospechosos
    //   - KMP: 3 × 10,000 = 30,000 comparaciones
    //   - Aho-Corasick: 1 × 10,000 = 10,000 comparaciones ⚡
    if (numPatrones >= 2) {
        return AHO_CORASICK;
    }

    // A partir de aquí: 1 solo patrón

    // REGLA 2: Patrón corto + muchos textos → KMP
    // KMP es eficiente para patrones cortos y tiene complejidad lineal garantizada
    if (longitudPromedioPatron <= 15 && numSospechosos > 500) {
        return KMP;
    }

    // REGLA 3: Patrón largo → Rabin-Karp
    // Rabin-Karp es eficiente para patrones largos debido al hashing
    if (longitudPromedioPatron > 30) {
        return RABIN_KARP;
    }

    // REGLA 4: Patrón medio + muchos textos → Aho-Corasick
    if (longitudPromedioPatron >= 15 && longitudPromedioPatron <= 30 && numSospechosos > 1000) {
        return AHO_CORASICK;
    }

    // Default: KMP (más confiable y sin overhead de construcción compleja)
    return KMP;
}

std::string AlgorithmSelector::toString(Algorithm algo) {
    switch (algo) {
        case KMP:
            return "kmp";
        case RABIN_KARP:
            return "rabin-karp";
        case AHO_CORASICK:
            return "aho-corasick";
        default:
            return "kmp";
    }
}

std::string AlgorithmSelector::obtenerCriterio(
    Algorithm algo,
    int numPatrones,
    int longitudPromedioPatron,
    int numSospechosos
) {
    // Si hay múltiples patrones, siempre es por esa razón
    if (numPatrones >= 2) {
        return "multiples_patrones_busqueda_simultanea";
    }

    switch (algo) {
        case KMP:
            if (longitudPromedioPatron <= 15 && numSospechosos > 500) {
                return "patron_corto_muchos_textos";
            }
            return "default_mas_confiable";

        case RABIN_KARP:
            return "patron_largo";

        case AHO_CORASICK:
            return "patron_medio_muchos_textos";

        default:
            return "default";
    }
}
