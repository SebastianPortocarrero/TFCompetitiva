#include "../../include/aho_corasick.h"

// Wrapper para un solo patrón (compatibilidad con código anterior)
int AhoCorasick::buscar(const std::string& texto, const std::string& patron) {
    std::vector<std::string> patrones = {patron};
    std::vector<CoincidenciaMultiple> resultados = buscarMultiple(texto, patrones);

    if (resultados.empty()) {
        return -1;
    }

    return resultados[0].posicion;
}

// NUEVA FUNCIÓN: Buscar MÚLTIPLES patrones simultáneamente
std::vector<CoincidenciaMultiple> AhoCorasick::buscarMultiple(
    const std::string& texto,
    const std::vector<std::string>& patrones
) {
    std::vector<CoincidenciaMultiple> coincidencias;

    int n = texto.length();

    // Validar que haya patrones
    if (patrones.empty() || n == 0) {
        return coincidencias;
    }

    // Construir el trie y los enlaces de fallo
    std::vector<TrieNode> trie;
    trie.push_back(TrieNode()); // Nodo raíz (índice 0)

    construirTrieMultiple(patrones, trie);
    construirFallos(trie);

    // Búsqueda en el texto
    int estado = 0;

    for (int i = 0; i < n; i++) {
        char c = texto[i];

        // Seguir los enlaces de fallo si no hay transición directa
        while (estado != 0 && trie[estado].hijos.find(c) == trie[estado].hijos.end()) {
            estado = trie[estado].fallo;
        }

        // Realizar transición si existe
        if (trie[estado].hijos.find(c) != trie[estado].hijos.end()) {
            estado = trie[estado].hijos[c];
        }

        // Verificar si encontramos algún patrón en este estado
        if (!trie[estado].patronesEncontrados.empty()) {
            // Puede haber múltiples patrones que terminan aquí
            for (size_t j = 0; j < trie[estado].patronesEncontrados.size(); j++) {
                int patronId = trie[estado].patronesEncontrados[j];
                int longitudPatron = trie[estado].longitudesPatrones[j];

                CoincidenciaMultiple coincidencia;
                coincidencia.patronId = patronId;
                coincidencia.posicion = i - longitudPatron + 1;

                coincidencias.push_back(coincidencia);
            }
        }

        // También verificar estados alcanzables por enlaces de fallo
        int estadoTemp = trie[estado].fallo;
        while (estadoTemp != 0 && estadoTemp != -1) {
            if (!trie[estadoTemp].patronesEncontrados.empty()) {
                for (size_t j = 0; j < trie[estadoTemp].patronesEncontrados.size(); j++) {
                    int patronId = trie[estadoTemp].patronesEncontrados[j];
                    int longitudPatron = trie[estadoTemp].longitudesPatrones[j];

                    CoincidenciaMultiple coincidencia;
                    coincidencia.patronId = patronId;
                    coincidencia.posicion = i - longitudPatron + 1;

                    coincidencias.push_back(coincidencia);
                }
            }
            estadoTemp = trie[estadoTemp].fallo;
        }
    }

    return coincidencias;
}

void AhoCorasick::construirTrieMultiple(
    const std::vector<std::string>& patrones,
    std::vector<TrieNode>& trie
) {
    for (size_t patronId = 0; patronId < patrones.size(); patronId++) {
        const std::string& patron = patrones[patronId];
        int estadoActual = 0;

        // Insertar el patrón en el trie
        for (char c : patron) {
            // Si no existe la transición, crear nuevo nodo
            if (trie[estadoActual].hijos.find(c) == trie[estadoActual].hijos.end()) {
                trie[estadoActual].hijos[c] = trie.size();
                trie.push_back(TrieNode());
            }

            estadoActual = trie[estadoActual].hijos[c];
        }

        // Marcar el último nodo como patrón
        trie[estadoActual].patronesEncontrados.push_back(patronId);
        trie[estadoActual].longitudesPatrones.push_back(patron.length());
    }
}

int AhoCorasick::construirTrie(const std::string& patron, std::vector<TrieNode>& trie) {
    int estadoActual = 0;

    for (char c : patron) {
        // Si no existe la transición, crear nuevo nodo
        if (trie[estadoActual].hijos.find(c) == trie[estadoActual].hijos.end()) {
            trie[estadoActual].hijos[c] = trie.size();
            trie.push_back(TrieNode());
        }

        estadoActual = trie[estadoActual].hijos[c];
    }

    // Marcar el último nodo como patrón
    trie[estadoActual].patronesEncontrados.push_back(0);
    trie[estadoActual].longitudesPatrones.push_back(patron.length());

    return estadoActual;
}

void AhoCorasick::construirFallos(std::vector<TrieNode>& trie) {
    std::queue<int> cola;

    // Enlaces de fallo para hijos de la raíz apuntan a la raíz
    for (auto& par : trie[0].hijos) {
        int hijo = par.second;
        trie[hijo].fallo = 0;
        cola.push(hijo);
    }

    // BFS para construir enlaces de fallo
    while (!cola.empty()) {
        int estadoActual = cola.front();
        cola.pop();

        for (auto& par : trie[estadoActual].hijos) {
            char c = par.first;
            int hijo = par.second;

            // Encontrar el enlace de fallo
            int fallo = trie[estadoActual].fallo;

            while (fallo != 0 && fallo != -1 && trie[fallo].hijos.find(c) == trie[fallo].hijos.end()) {
                fallo = trie[fallo].fallo;
            }

            if (fallo != -1 && trie[fallo].hijos.find(c) != trie[fallo].hijos.end() &&
                trie[fallo].hijos[c] != hijo) {
                trie[hijo].fallo = trie[fallo].hijos[c];
            } else {
                trie[hijo].fallo = 0;
            }

            cola.push(hijo);
        }
    }
}
