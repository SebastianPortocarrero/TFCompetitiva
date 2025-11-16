#ifndef AHO_CORASICK_H
#define AHO_CORASICK_H

#include <string>
#include <vector>
#include <queue>
#include <unordered_map>


struct CoincidenciaMultiple {
    int patronId;        
    int posicion;        
};

class AhoCorasick {
public:

    static std::vector<CoincidenciaMultiple> buscarMultiple(
        const std::string& texto,
        const std::vector<std::string>& patrones
    );

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
