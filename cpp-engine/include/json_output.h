#ifndef JSON_OUTPUT_H
#define JSON_OUTPUT_H

#include <string>
#include <vector>

/**
 * Estructura para una coincidencia encontrada
 */
struct Coincidencia {
    std::string nombre;
    std::string cedula;
    int patronId;          // ID del patrón que coincidió (para múltiples patrones)
    std::string patron;    // El patrón específico que coincidió
    int posicion;
};

/**
 * Generador de salida en formato JSON
 * No usa librerías externas, genera el JSON manualmente
 */
class JSONOutput {
public:
    /**
     * Genera JSON de éxito con coincidencias (múltiples patrones)
     */
    static std::string generarExito(
        const std::vector<std::string>& patrones,
        const std::string& algoritmoUsado,
        const std::string& criterioSeleccion,
        int totalProcesados,
        const std::vector<Coincidencia>& coincidencias,
        long tiempoEjecucionMs
    );

    /**
     * Genera JSON de error
     */
    static std::string generarError(
        const std::string& mensajeError,
        const std::string& codigoError,
        const std::string& detalles
    );

private:
    /**
     * Escapa caracteres especiales para JSON
     */
    static std::string escaparJSON(const std::string& str);
};

#endif // JSON_OUTPUT_H
