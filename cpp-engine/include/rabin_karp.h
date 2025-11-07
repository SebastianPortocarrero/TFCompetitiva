#ifndef RABIN_KARP_H
#define RABIN_KARP_H

#include <string>

/**
 * Algoritmo Rabin-Karp para búsqueda de patrones usando hashing
 * Complejidad: O(n + m) promedio, O(nm) peor caso
 * Ideal para: Patrones largos
 */
class RabinKarp {
public:
    /**
     * Busca un patrón en un texto usando Rabin-Karp
     * @param texto Cadena de ADN del sospechoso
     * @param patron Patrón de ADN a buscar
     * @return Posición de la primera coincidencia (-1 si no existe)
     */
    static int buscar(const std::string& texto, const std::string& patron);

private:
    // Base para el hash (4 porque son 4 nucleótidos: A, T, C, G)
    static const int BASE = 4;
    // Número primo grande para reducir colisiones
    static const long long PRIMO = 1000000007;

    /**
     * Calcula el hash de una subcadena
     * @param str Cadena a hashear
     * @param longitud Longitud de la subcadena
     * @return Valor del hash
     */
    static long long calcularHash(const std::string& str, int longitud);

    /**
     * Convierte un nucleótido a su valor numérico
     * A=0, T=1, C=2, G=3
     */
    static int charToInt(char c);
};

#endif // RABIN_KARP_H
