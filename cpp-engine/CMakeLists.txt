cmake_minimum_required(VERSION 3.15)
project(busqueda_adn VERSION 1.0.0 LANGUAGES CXX)

# Configuración del estándar C++
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Flags de compilación optimizados
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall -Wextra")
set(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} -O3")

# Archivos fuente
set(SOURCES
    src/main.cpp
    src/algorithms/kmp.cpp
    src/algorithms/rabin_karp.cpp
    src/algorithms/aho_corasick.cpp
    src/utils/csv_parser.cpp
    src/utils/algorithm_selector.cpp
    src/utils/json_output.cpp
)

# Directorios de include
include_directories(${PROJECT_SOURCE_DIR}/include)

# Crear el ejecutable
add_executable(busqueda_adn ${SOURCES})

# Configuración específica para Windows
if(WIN32)
    set_target_properties(busqueda_adn PROPERTIES
        RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}
        OUTPUT_NAME "busqueda_adn"
    )
endif()

# Mensaje de información
message(STATUS "==================================")
message(STATUS "Proyecto: ${PROJECT_NAME}")
message(STATUS "Versión: ${PROJECT_VERSION}")
message(STATUS "Compilador: ${CMAKE_CXX_COMPILER_ID}")
message(STATUS "Estándar C++: ${CMAKE_CXX_STANDARD}")
message(STATUS "==================================")
