#include "../../include/kmp.h"

int KMP::buscar(const std::string& texto, const std::string& patron) {
    int n = texto.length();
    int m = patron.length();

    // Caso especial: patrón vacío
    if (m == 0) return 0;
    if (m > n) return -1;

    // Construir tabla LPS
    std::vector<int> lps = construirTablaLPS(patron);

    // Búsqueda usando KMP
    int i = 0; // índice para texto
    int j = 0; // índice para patrón

    while (i < n) {
        if (texto[i] == patron[j]) {
            i++;
            j++;
        }

        // Patrón encontrado
        if (j == m) {
            return i - j; // Retorna la posición de inicio
        }

        // Mismatch después de j coincidencias
        else if (i < n && texto[i] != patron[j]) {
            if (j != 0) {
                j = lps[j - 1];
            } else {
                i++;
            }
        }
    }

    return -1; // No encontrado
}

std::vector<int> KMP::construirTablaLPS(const std::string& patron) {
    int m = patron.length();
    std::vector<int> lps(m, 0);

    int longitud = 0; // Longitud del prefijo más largo que es también sufijo
    int i = 1;

    while (i < m) {
        if (patron[i] == patron[longitud]) {
            longitud++;
            lps[i] = longitud;
            i++;
        } else {
            if (longitud != 0) {
                longitud = lps[longitud - 1];
            } else {
                lps[i] = 0;
                i++;
            }
        }
    }

    return lps;
}
