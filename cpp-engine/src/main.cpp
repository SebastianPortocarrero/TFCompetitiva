#include <iostream>
#include <chrono>
#include <vector>
#include <string>
#include <sstream>
#include "../include/kmp.h"
#include "../include/rabin_karp.h"
#include "../include/aho_corasick.h"
#include "../include/csv_parser.h"
#include "../include/algorithm_selector.h"
#include "../include/json_output.h"

/**
 * Divide una cadena por un delimitador
 */
std::vector<std::string> dividirPorComa(const std::string& str) {
    std::vector<std::string> resultado;
    std::stringstream ss(str);
    std::string item;

    while (std::getline(ss, item, ',')) {
        // Eliminar espacios en blanco
        size_t inicio = item.find_first_not_of(" \t");
        size_t fin = item.find_last_not_of(" \t");

        if (inicio != std::string::npos && fin != std::string::npos) {
            resultado.push_back(item.substr(inicio, fin - inicio + 1));
        }
    }

    return resultado;
}

int main(int argc, char* argv[]) {
    // Validar argumentos
    if (argc != 3) {
        std::string error = JSONOutput::generarError(
            "Argumentos insuficientes",
            "INVALID_ARGUMENTS",
            "Uso: ./busqueda_adn <patron1[,patron2,...]> <ruta_csv>"
        );
        std::cout << error << std::endl;
        return 1;
    }

    std::string patronesInput = argv[1];
    std::string rutaCSV = argv[2];

    // Inicio del timer
    auto inicio = std::chrono::high_resolution_clock::now();

    try {
        // Parsear patrones (pueden ser múltiples separados por coma)
        std::vector<std::string> patrones = dividirPorComa(patronesInput);

        if (patrones.empty()) {
            std::string error = JSONOutput::generarError(
                "No se especificaron patrones",
                "EMPTY_PATTERN",
                "Debe proporcionar al menos un patrón de ADN"
            );
            std::cout << error << std::endl;
            return 1;
        }

        // Validar todos los patrones
        for (size_t i = 0; i < patrones.size(); i++) {
            const std::string& patron = patrones[i];

            if (!CSVParser::validarCadenaADN(patron)) {
                std::ostringstream msg;
                msg << "Patrón " << (i + 1) << " inválido: \"" << patron << "\"";
                std::string error = JSONOutput::generarError(
                    msg.str(),
                    "INVALID_PATTERN",
                    "Los patrones solo pueden contener los caracteres A, T, C, G"
                );
                std::cout << error << std::endl;
                return 1;
            }

            if (patron.length() < 5 || patron.length() > 100) {
                std::ostringstream msg;
                msg << "Patrón " << (i + 1) << " tiene longitud inválida: " << patron.length();
                std::string error = JSONOutput::generarError(
                    msg.str(),
                    "INVALID_PATTERN_LENGTH",
                    "Cada patrón debe tener entre 5 y 100 caracteres"
                );
                std::cout << error << std::endl;
                return 1;
            }
        }

        // Parsear archivo CSV
        std::vector<Sospechoso> sospechosos;
        try {
            sospechosos = CSVParser::parsear(rutaCSV);
        } catch (const std::exception& e) {
            std::string error = JSONOutput::generarError(
                "Error al leer archivo CSV",
                "FILE_ERROR",
                std::string(e.what())
            );
            std::cout << error << std::endl;
            return 1;
        }

        // Calcular longitud promedio de los patrones
        int longitudTotal = 0;
        for (const auto& patron : patrones) {
            longitudTotal += patron.length();
        }
        int longitudPromedioPatron = longitudTotal / patrones.size();

        int numPatrones = patrones.size();
        int numSospechosos = sospechosos.size();

        // Seleccionar algoritmo óptimo
        AlgorithmSelector::Algorithm algoritmoSeleccionado =
            AlgorithmSelector::seleccionar(numPatrones, longitudPromedioPatron, numSospechosos);

        std::string nombreAlgoritmo = AlgorithmSelector::toString(algoritmoSeleccionado);
        std::string criterioSeleccion = AlgorithmSelector::obtenerCriterio(
            algoritmoSeleccionado, numPatrones, longitudPromedioPatron, numSospechosos
        );

        // Buscar coincidencias en todos los sospechosos
        std::vector<Coincidencia> coincidencias;

        if (numPatrones >= 2) {
            // CASO: MÚLTIPLES PATRONES → Usar Aho-Corasick (búsqueda simultánea)
            for (const auto& sospechoso : sospechosos) {
                std::vector<CoincidenciaMultiple> resultados =
                    AhoCorasick::buscarMultiple(sospechoso.cadenaADN, patrones);

                // Convertir resultados a estructura final
                for (const auto& res : resultados) {
                    Coincidencia coincidencia;
                    coincidencia.nombre = sospechoso.nombreCompleto;
                    coincidencia.cedula = sospechoso.cedula;
                    coincidencia.patronId = res.patronId;
                    coincidencia.patron = patrones[res.patronId];
                    coincidencia.posicion = res.posicion;
                    coincidencias.push_back(coincidencia);
                }
            }

        } else {
            // CASO: UN SOLO PATRÓN → Usar algoritmo seleccionado
            const std::string& patron = patrones[0];

            for (const auto& sospechoso : sospechosos) {
                int posicion = -1;

                // Ejecutar algoritmo seleccionado
                switch (algoritmoSeleccionado) {
                    case AlgorithmSelector::KMP:
                        posicion = KMP::buscar(sospechoso.cadenaADN, patron);
                        break;

                    case AlgorithmSelector::RABIN_KARP:
                        posicion = RabinKarp::buscar(sospechoso.cadenaADN, patron);
                        break;

                    case AlgorithmSelector::AHO_CORASICK:
                        posicion = AhoCorasick::buscar(sospechoso.cadenaADN, patron);
                        break;
                }

                // Si se encontró coincidencia, agregarla
                if (posicion != -1) {
                    Coincidencia coincidencia;
                    coincidencia.nombre = sospechoso.nombreCompleto;
                    coincidencia.cedula = sospechoso.cedula;
                    coincidencia.patronId = 0;
                    coincidencia.patron = patron;
                    coincidencia.posicion = posicion;
                    coincidencias.push_back(coincidencia);
                }
            }
        }

        // Fin del timer
        auto fin = std::chrono::high_resolution_clock::now();
        auto duracion = std::chrono::duration_cast<std::chrono::milliseconds>(fin - inicio);

        // Generar salida JSON
        std::string salidaJSON = JSONOutput::generarExito(
            patrones,
            nombreAlgoritmo,
            criterioSeleccion,
            numSospechosos,
            coincidencias,
            duracion.count()
        );

        std::cout << salidaJSON << std::endl;
        return 0;

    } catch (const std::exception& e) {
        std::string error = JSONOutput::generarError(
            "Error inesperado",
            "UNEXPECTED_ERROR",
            std::string(e.what())
        );
        std::cout << error << std::endl;
        return 1;
    }
}
