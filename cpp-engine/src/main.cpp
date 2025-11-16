#include <iostream>
#include <chrono>
#include <vector>
#include <string>
#include <sstream>
#include <set>
#include "../include/kmp.h"
#include "../include/rabin_karp.h"
#include "../include/aho_corasick.h"
#include "../include/csv_parser.h"
#include "../include/algorithm_selector.h"
#include "../include/json_output.h"
using namespace std;


vector<string> dividirPorComa(const string& str) {
    vector<string> resultado;
    stringstream ss(str);
    string item;

    while (getline(ss, item, ',')) {
        // Eliminar espacios en blanco, tabs, retornos de carro y saltos de línea
        size_t inicio = item.find_first_not_of(" \t\r\n");
        size_t fin = item.find_last_not_of(" \t\r\n");

        if (inicio != string::npos && fin != string::npos) {
            resultado.push_back(item.substr(inicio, fin - inicio + 1));
        }
    }

    return resultado;
}

int main(int argc, char* argv[]) {
    // Validar argumentos
    if (argc != 3) {
        string error = JSONOutput::generarError(
            "Argumentos insuficientes",
            "INVALID_ARGUMENTS",
            "Uso: ./busqueda_adn <patron1[,patron2,...]> <ruta_csv>"
        );
        cout << error << endl;
        return 1;
    }

    string patronesInput = argv[1];
    string rutaCSV = argv[2];

    // Inicio del timer
    auto inicio = chrono::high_resolution_clock::now();

    try {
        // DEBUG: Mostrar lo que recibimos
        cerr << "[DEBUG] Argumento recibido (argv[1]): '" << patronesInput << "'" << endl;
        cerr << "[DEBUG] Longitud: " << patronesInput.length() << endl;
        cerr << "[DEBUG] Bytes (hex): ";
        for (unsigned char c : patronesInput) {
            cerr << hex << (int)c << " ";
        }
        cerr << dec << endl;

        // Parsear patrones (pueden ser múltiples separados por coma)
        vector<string> patrones = dividirPorComa(patronesInput);

        // DEBUG: Mostrar patrones parseados
        cerr << "[DEBUG] Patrones parseados: " << patrones.size() << endl;
        for (size_t i = 0; i < patrones.size(); i++) {
            cerr << "[DEBUG] Patron " << i << ": '" << patrones[i] << "' (len=" << patrones[i].length() << ")" << endl;
            cerr << "[DEBUG] Bytes: ";
            for (unsigned char c : patrones[i]) {
                cerr << hex << (int)c << " ";
            }
            cerr << dec << endl;
        }

        if (patrones.empty()) {
            string error = JSONOutput::generarError(
                "No se especificaron patrones",
                "EMPTY_PATTERN",
                "Debe proporcionar al menos un patrón de ADN"
            );
            cout << error << endl;
            return 1;
        }

        // Validar todos los patrones
        for (size_t i = 0; i < patrones.size(); i++) {
            const string& patron = patrones[i];

            cerr << "[DEBUG] Validando patron " << i << ": '" << patron << "'" << endl;

            if (!CSVParser::validarCadenaADN(patron)) {
                ostringstream msg;
                msg << "Patrón " << (i + 1) << " inválido: \"" << patron << "\"";
                string error = JSONOutput::generarError(
                    msg.str(),
                    "INVALID_PATTERN",
                    "Los patrones solo pueden contener los caracteres A, T, C, G"
                );
                cout << error << endl;
                return 1;
            }

            if (patron.length() < 100 || patron.length() > 1000) {
                ostringstream msg;
                msg << "Patrón " << (i + 1) << " tiene longitud inválida: " << patron.length();
                string error = JSONOutput::generarError(
                    msg.str(),
                    "INVALID_PATTERN_LENGTH",
                    "Cada patrón debe tener entre 100 y 1000 caracteres"
                );
                cout << error << endl;
                return 1;
            }
        }

        // Parsear archivo CSV
        vector<Sospechoso> sospechosos;
        try {
            sospechosos = CSVParser::parsear(rutaCSV);
        } catch (const exception& e) {
            string error = JSONOutput::generarError(
                "Error al leer archivo CSV",
                "FILE_ERROR",
                string(e.what())
            );
            cout << error << endl;
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

        string nombreAlgoritmo = AlgorithmSelector::toString(algoritmoSeleccionado);
        string criterioSeleccion = AlgorithmSelector::obtenerCriterio(
            algoritmoSeleccionado, numPatrones, longitudPromedioPatron, numSospechosos
        );

        // Buscar coincidencias en todos los sospechosos
        vector<Coincidencia> coincidencias;
        set<string> cedulasEncontradas;  // Para evitar duplicados

        if (numPatrones >= 2) {
            // CASO: MÚLTIPLES PATRONES → Usar Aho-Corasick (búsqueda simultánea)
            for (const auto& sospechoso : sospechosos) {
                // Si ya encontramos esta persona, saltarla
                if (cedulasEncontradas.find(sospechoso.cedula) != cedulasEncontradas.end()) {
                    continue;
                }

                vector<CoincidenciaMultiple> resultados =
                    AhoCorasick::buscarMultiple(sospechoso.cadenaADN, patrones);

                // Solo registrar la PRIMERA coincidencia encontrada para esta persona
                if (!resultados.empty()) {
                    const auto& res = resultados[0];  // Primera coincidencia
                    Coincidencia coincidencia;
                    coincidencia.nombre = sospechoso.nombreCompleto;
                    coincidencia.cedula = sospechoso.cedula;
                    coincidencia.patronId = res.patronId;
                    coincidencia.patron = patrones[res.patronId];
                    coincidencia.posicion = res.posicion;
                    coincidencias.push_back(coincidencia);
                    cedulasEncontradas.insert(sospechoso.cedula);  // Marcar como encontrado
                }
            }

        } else {
            // CASO: UN SOLO PATRÓN → Usar algoritmo seleccionado
            const string& patron = patrones[0];

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
        auto fin = chrono::high_resolution_clock::now();
        auto duracion = chrono::duration_cast<chrono::milliseconds>(fin - inicio);

        // Generar salida JSON
        string salidaJSON = JSONOutput::generarExito(
            patrones,
            nombreAlgoritmo,
            criterioSeleccion,
            numSospechosos,
            coincidencias,
            duracion.count()
        );

        cout << salidaJSON << endl;
        return 0;

    } catch (const exception& e) {
        string error = JSONOutput::generarError(
            "Error inesperado",
            "UNEXPECTED_ERROR",
            string(e.what())
        );
        cout << error << endl;
        return 1;
    }
}
