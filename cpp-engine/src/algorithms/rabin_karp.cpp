#include "../../include/rabin_karp.h"
#include <cmath>

int RabinKarp::buscar(const std::string& texto, const std::string& patron) {
    int n = texto.length();
    int m = patron.length();

    // Casos especiales
    if (m == 0) return 0;
    if (m > n) return -1;

    // Calcular hash del patrón
    long long hashPatron = calcularHash(patron, m);
    long long hashTexto = calcularHash(texto, m);

    // Calcular BASE^(m-1) mod PRIMO para rolling hash
    long long h = 1;
    for (int i = 0; i < m - 1; i++) {
        h = (h * BASE) % PRIMO;
    }

    // Deslizar el patrón sobre el texto
    for (int i = 0; i <= n - m; i++) {
        // Verificar si los hashes coinciden
        if (hashPatron == hashTexto) {
            // Verificación carácter por carácter (para evitar colisiones)
            bool coincide = true;
            for (int j = 0; j < m; j++) {
                if (texto[i + j] != patron[j]) {
                    coincide = false;
                    break;
                }
            }

            if (coincide) {
                return i; // Patrón encontrado
            }
        }

        // Calcular hash para la siguiente ventana (rolling hash)
        if (i < n - m) {
            hashTexto = (BASE * (hashTexto - charToInt(texto[i]) * h) + charToInt(texto[i + m])) % PRIMO;

            // Asegurar que el hash sea positivo
            if (hashTexto < 0) {
                hashTexto += PRIMO;
            }
        }
    }

    return -1; // No encontrado
}

long long RabinKarp::calcularHash(const std::string& str, int longitud) {
    long long hash = 0;
    for (int i = 0; i < longitud; i++) {
        hash = (hash * BASE + charToInt(str[i])) % PRIMO;
    }
    return hash;
}

int RabinKarp::charToInt(char c) {
    switch (c) {
        case 'A': return 0;
        case 'T': return 1;
        case 'C': return 2;
        case 'G': return 3;
        default: return 0; // Por si acaso, aunque no debería pasar
    }
}
