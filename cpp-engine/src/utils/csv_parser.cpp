#include "../../include/csv_parser.h"
#include <sstream>
#include <stdexcept>
#include <algorithm>
#include <cctype>

std::vector<Sospechoso> CSVParser::parsear(const std::string& rutaArchivo) {
    std::vector<Sospechoso> sospechosos;
    std::ifstream archivo(rutaArchivo);

    if (!archivo.is_open()) {
        throw std::runtime_error("No se pudo abrir el archivo: " + rutaArchivo);
    }

    std::string linea;
    int numeroLinea = 0;

    // Leer archivo línea por línea
    while (std::getline(archivo, linea)) {
        numeroLinea++;

        // Saltar líneas vacías
        if (trim(linea).empty()) {
            continue;
        }

        // Saltar la línea de encabezado (si existe)
        if (numeroLinea == 1 &&
            (linea.find("nombre") != std::string::npos ||
             linea.find("Nombre") != std::string::npos)) {
            continue;
        }

        // Dividir la línea en campos
        std::vector<std::string> campos = dividirLinea(linea);

        // Validar que tenga exactamente 3 campos
        if (campos.size() != 3) {
            throw std::runtime_error(
                "Error en línea " + std::to_string(numeroLinea) +
                ": se esperaban 3 campos, se encontraron " + std::to_string(campos.size())
            );
        }

        Sospechoso sospechoso;
        sospechoso.nombreCompleto = trim(campos[0]);
        sospechoso.cedula = trim(campos[1]);
        sospechoso.cadenaADN = trim(campos[2]);

        // Validaciones
        if (sospechoso.nombreCompleto.empty()) {
            throw std::runtime_error(
                "Error en línea " + std::to_string(numeroLinea) + ": nombre vacío"
            );
        }

        if (sospechoso.cedula.empty()) {
            throw std::runtime_error(
                "Error en línea " + std::to_string(numeroLinea) + ": cédula vacía"
            );
        }

        if (!validarCadenaADN(sospechoso.cadenaADN)) {
            throw std::runtime_error(
                "Error en línea " + std::to_string(numeroLinea) +
                ": cadena de ADN inválida (solo se permiten A, T, C, G)"
            );
        }

        if (sospechoso.cadenaADN.length() < 20) {
            throw std::runtime_error(
                "Error en línea " + std::to_string(numeroLinea) +
                ": cadena de ADN muy corta (mínimo 20 caracteres)"
            );
        }

        sospechosos.push_back(sospechoso);
    }

    archivo.close();

    if (sospechosos.empty()) {
        throw std::runtime_error("El archivo CSV no contiene registros válidos");
    }

    return sospechosos;
}

bool CSVParser::validarCadenaADN(const std::string& cadenaADN) {
    if (cadenaADN.empty()) {
        return false;
    }

    for (char c : cadenaADN) {
        if (c != 'A' && c != 'T' && c != 'C' && c != 'G') {
            return false;
        }
    }

    return true;
}

std::vector<std::string> CSVParser::dividirLinea(const std::string& linea) {
    std::vector<std::string> campos;
    std::string campoActual;
    bool dentroComillas = false;

    for (size_t i = 0; i < linea.length(); i++) {
        char c = linea[i];

        if (c == '"') {
            dentroComillas = !dentroComillas;
        } else if (c == ',' && !dentroComillas) {
            campos.push_back(campoActual);
            campoActual.clear();
        } else {
            campoActual += c;
        }
    }

    // Agregar el último campo
    campos.push_back(campoActual);

    return campos;
}

std::string CSVParser::trim(const std::string& str) {
    size_t inicio = 0;
    size_t fin = str.length();

    // Encontrar primer carácter no espacio
    while (inicio < fin && std::isspace(static_cast<unsigned char>(str[inicio]))) {
        inicio++;
    }

    // Encontrar último carácter no espacio
    while (fin > inicio && std::isspace(static_cast<unsigned char>(str[fin - 1]))) {
        fin--;
    }

    return str.substr(inicio, fin - inicio);
}
