#ifndef KMP_H
#define KMP_H

#include <string>
#include <vector>

/**
 * Algoritmo Knuth-Morris-Pratt para búsqueda de patrones
 * Complejidad: O(n + m) donde n = longitud texto, m = longitud patrón
 * Ideal para: Patrones cortos y múltiples textos
 */
class KMP {
public:
    /**
     * Busca un patrón en un texto usando KMP
     * @param texto Cadena de ADN del sospechoso
     * @param patron Patrón de ADN a buscar
     * @return Posición de la primera coincidencia (-1 si no existe)
     */
    static int buscar(const std::string& texto, const std::string& patron);

private:
    /**
     * Construye la tabla de prefijos (LPS - Longest Proper Prefix which is also Suffix)
     * @param patron Patrón a analizar
     * @return Vector con la tabla LPS
     */
    static std::vector<int> construirTablaLPS(const std::string& patron);
};

#endif // KMP_H
