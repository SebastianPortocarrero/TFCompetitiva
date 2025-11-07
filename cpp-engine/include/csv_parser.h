#ifndef CSV_PARSER_H
#define CSV_PARSER_H

#include <string>
#include <vector>
#include <fstream>

/**
 * Estructura que representa un sospechoso
 */
struct Sospechoso {
    std::string nombreCompleto;
    std::string cedula;
    std::string cadenaADN;
};

/**
 * Parser de archivos CSV con datos de sospechosos
 * Formato esperado: nombre_completo,cedula,cadena_adn
 */
class CSVParser {
public:
    /**
     * Lee y parsea un archivo CSV
     * @param rutaArchivo Ruta al archivo CSV
     * @return Vector con todos los sospechosos parseados
     * @throws std::runtime_error si el archivo no existe o está mal formado
     */
    static std::vector<Sospechoso> parsear(const std::string& rutaArchivo);

    /**
     * Valida que una cadena de ADN solo contenga A, T, C, G
     * @param cadenaADN Cadena a validar
     * @return true si es válida, false en caso contrario
     */
    static bool validarCadenaADN(const std::string& cadenaADN);

private:
    /**
     * Divide una línea CSV en campos
     * @param linea Línea a dividir
     * @return Vector con los campos separados
     */
    static std::vector<std::string> dividirLinea(const std::string& linea);

    /**
     * Elimina espacios en blanco al inicio y final
     */
    static std::string trim(const std::string& str);
};

#endif // CSV_PARSER_H
