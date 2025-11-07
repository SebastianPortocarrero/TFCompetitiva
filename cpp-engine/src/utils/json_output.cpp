#include "../../include/json_output.h"
#include <sstream>
#include <iomanip>

std::string JSONOutput::generarExito(
    const std::vector<std::string>& patrones,
    const std::string& algoritmoUsado,
    const std::string& criterioSeleccion,
    int totalProcesados,
    const std::vector<Coincidencia>& coincidencias,
    long tiempoEjecucionMs
) {
    std::ostringstream json;

    json << "{\n";
    json << "  \"exito\": true,\n";

    // Array de patrones
    json << "  \"patrones\": [";
    for (size_t i = 0; i < patrones.size(); i++) {
        json << "\"" << escaparJSON(patrones[i]) << "\"";
        if (i < patrones.size() - 1) {
            json << ", ";
        }
    }
    json << "],\n";

    json << "  \"num_patrones\": " << patrones.size() << ",\n";
    json << "  \"algoritmo_usado\": \"" << algoritmoUsado << "\",\n";
    json << "  \"criterio_seleccion\": \"" << criterioSeleccion << "\",\n";
    json << "  \"total_procesados\": " << totalProcesados << ",\n";
    json << "  \"total_coincidencias\": " << coincidencias.size() << ",\n";

    // Array de coincidencias
    json << "  \"coincidencias\": [\n";
    for (size_t i = 0; i < coincidencias.size(); i++) {
        json << "    {\n";
        json << "      \"nombre\": \"" << escaparJSON(coincidencias[i].nombre) << "\",\n";
        json << "      \"cedula\": \"" << escaparJSON(coincidencias[i].cedula) << "\",\n";
        json << "      \"patron_id\": " << coincidencias[i].patronId << ",\n";
        json << "      \"patron\": \"" << escaparJSON(coincidencias[i].patron) << "\",\n";
        json << "      \"posicion\": " << coincidencias[i].posicion << "\n";
        json << "    }";

        if (i < coincidencias.size() - 1) {
            json << ",";
        }
        json << "\n";
    }
    json << "  ],\n";

    json << "  \"tiempo_ejecucion_ms\": " << tiempoEjecucionMs << "\n";
    json << "}";

    return json.str();
}

std::string JSONOutput::generarError(
    const std::string& mensajeError,
    const std::string& codigoError,
    const std::string& detalles
) {
    std::ostringstream json;

    json << "{\n";
    json << "  \"exito\": false,\n";
    json << "  \"error\": \"" << escaparJSON(mensajeError) << "\",\n";
    json << "  \"codigo_error\": \"" << codigoError << "\",\n";
    json << "  \"detalles\": \"" << escaparJSON(detalles) << "\"\n";
    json << "}";

    return json.str();
}

std::string JSONOutput::escaparJSON(const std::string& str) {
    std::ostringstream escapado;

    for (char c : str) {
        switch (c) {
            case '"':
                escapado << "\\\"";
                break;
            case '\\':
                escapado << "\\\\";
                break;
            case '\b':
                escapado << "\\b";
                break;
            case '\f':
                escapado << "\\f";
                break;
            case '\n':
                escapado << "\\n";
                break;
            case '\r':
                escapado << "\\r";
                break;
            case '\t':
                escapado << "\\t";
                break;
            default:
                escapado << c;
        }
    }

    return escapado.str();
}
