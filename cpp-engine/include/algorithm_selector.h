#ifndef ALGORITHM_SELECTOR_H
#define ALGORITHM_SELECTOR_H

#include <string>

/**
 * Selector automático del mejor algoritmo según características
 * del patrón y número de sospechosos
 */
class AlgorithmSelector {
public:
    enum Algorithm {
        KMP,
        RABIN_KARP,
        AHO_CORASICK
    };

    /**
     * Selecciona el algoritmo óptimo
     * @param numPatrones Número de patrones a buscar
     * @param longitudPromedioPatron Longitud promedio de los patrones
     * @param numSospechosos Número de sospechosos a procesar
     * @return Algoritmo seleccionado
     */
    static Algorithm seleccionar(int numPatrones, int longitudPromedioPatron, int numSospechosos);

    /**
     * Convierte el enum a string para el output JSON
     */
    static std::string toString(Algorithm algo);

    /**
     * Obtiene la razón de selección del algoritmo
     */
    static std::string obtenerCriterio(Algorithm algo, int numPatrones, int longitudPromedioPatron, int numSospechosos);
};

#endif // ALGORITHM_SELECTOR_H
