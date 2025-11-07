#ifndef AHO_CORASICK_H
#define AHO_CORASICK_H

#include <string>
#include <vector>
#include <queue>
#include <unordered_map>

/**
 * Resultado de una coincidencia con múltiples patrones
 */
struct CoincidenciaMultiple {
    int patronId;        // Índice del patrón que coincidió (0, 1, 2...)
    int posicion;        // Posición en el texto donde se encontró
};

/**
 * Algoritmo Aho-Corasick para búsqueda de múltiples patrones
 * Complejidad: O(n + m + z) donde z = número de coincidencias
 * Ideal para: MÚLTIPLES PATRONES + muchos textos
 *
 * CASO DE USO: 2+ muestras de sangre vs 10,000 sospechosos
 * Una sola pasada encuentra TODOS los patrones simultáneamente
 */
class AhoCorasick {
public:
    /**
     * Busca MÚLTIPLES patrones en un texto usando Aho-Corasick
     * @param texto Cadena de ADN del sospechoso
     * @param patrones Vector con todos los patrones de ADN a buscar
     * @return Vector con todas las coincidencias encontradas
     */
    static std::vector<CoincidenciaMultiple> buscarMultiple(
        const std::string& texto,
        const std::vector<std::string>& patrones
    );

    /**
     * Busca un solo patrón (wrapper para compatibilidad)
     * @param texto Cadena de ADN del sospechoso
     * @param patron Patrón de ADN a buscar
     * @return Posición de la primera coincidencia (-1 si no existe)
     */
    static int buscar(const std::string& texto, const std::string& patron);

private:
    // Estructura de nodo del trie
    struct TrieNode {
        std::unordered_map<char, int> hijos;
        int fallo;
        std::vector<int> patronesEncontrados; // IDs de patrones que terminan aquí
        std::vector<int> longitudesPatrones;   // Longitudes correspondientes

        TrieNode() : fallo(-1) {}
    };

    /**
     * Construye el trie con TODOS los patrones
     */
    static void construirTrieMultiple(
        const std::vector<std::string>& patrones,
        std::vector<TrieNode>& trie
    );

    /**
     * Construye el trie de un solo patrón (compatibilidad)
     */
    static int construirTrie(const std::string& patron, std::vector<TrieNode>& trie);

    /**
     * Construye los enlaces de fallo (failure links)
     */
    static void construirFallos(std::vector<TrieNode>& trie);
};

#endif // AHO_CORASICK_H
