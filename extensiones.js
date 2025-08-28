/**
 * Extensiones del Sistema de Selección de Soluciones
 * Este archivo contiene funciones adicionales para gestión avanzada
 */

class GestorConfiguracion {
    constructor(sistema) {
        this.sistema = sistema;
        this.historialConfiguraciones = [];
    }

    // Clonar configuración de otra zona
    clonarConfiguracion(configuracionOrigen, nuevaZona, nuevaSubzona, nuevoTecnico) {
        const configClonada = JSON.parse(JSON.stringify(configuracionOrigen));
        
        // Actualizar condiciones obligatorias en todas las reglas
        Object.keys(configClonada.reglas).forEach(nombreSalida => {
            const regla = configClonada.reglas[nombreSalida];
            if (regla.condiciones_obligatorias) {
                regla.condiciones_obligatorias.zona = nuevaZona;
                if (nuevaSubzona) {
                    regla.condiciones_obligatorias.subzona = Array.isArray(nuevaSubzona) 
                        ? nuevaSubzona : [nuevaSubzona];
                }
                if (nuevoTecnico) {
                    regla.condiciones_obligatorias.tecnico = nuevoTecnico;
                }
            }
        });

        // Actualizar opciones en entradas
        configClonada.entradas.forEach(entrada => {
            if (entrada.nombre === 'zona') {
                entrada.opciones = [nuevaZona];
            } else if (entrada.nombre === 'subzona') {
                entrada.opciones = Array.isArray(nuevaSubzona) ? nuevaSubzona : [nuevaSubzona];
            } else if (entrada.nombre === 'tecnico') {
                entrada.opciones = [nuevoTecnico];
            }
        });

        return configClonada;
    }

    // Guardar configuración con versionado
    guardarVersion(descripcion) {
        const version = {
            timestamp: new Date().toISOString(),
            descripcion: descripcion,
            configuracion: this.sistema.exportarConfiguracion()
        };
        
        this.historialConfiguraciones.push(version);
        localStorage.setItem('historial_configuraciones', 
                           JSON.stringify(this.historialConfiguraciones));
    }

    // Cargar configuración desde versión
    cargarVersion(index) {
        if (index >= 0 && index < this.historialConfiguraciones.length) {
            const version = this.historialConfiguraciones[index];
            this.sistema.importarConfiguracion(version.configuracion);
            return version;
        }
        return null;
    }

    // Comparar dos configuraciones
    compararConfiguraciones(config1, config2) {
        const diferencias = {
            entradas: {
                agregadas: [],
                eliminadas: [],
                modificadas: []
            },
            salidas: {
                agregadas: [],
                eliminadas: [],
                modificadas: []
            },
            reglas: {
                agregadas: [],
                eliminadas: [],
                modificadas: []
            }
        };

        // Comparar entradas
        const entradas1 = config1.entradas.map(e => e.nombre);
        const entradas2 = config2.entradas.map(e => e.nombre);
        
        diferencias.entradas.agregadas = entradas2.filter(e => !entradas1.includes(e));
        diferencias.entradas.eliminadas = entradas1.filter(e => !entradas2.includes(e));

        // Comparar salidas
        const salidas1 = config1.salidas.map(s => s.nombre);
        const salidas2 = config2.salidas.map(s => s.nombre);
        
        diferencias.salidas.agregadas = salidas2.filter(s => !salidas1.includes(s));
        diferencias.salidas.eliminadas = salidas1.filter(s => !salidas2.includes(s));

        // Comparar reglas
        const reglas1 = Object.keys(config1.reglas);
        const reglas2 = Object.keys(config2.reglas);
        
        diferencias.reglas.agregadas = reglas2.filter(r => !reglas1.includes(r));
        diferencias.reglas.eliminadas = reglas1.filter(r => !reglas2.includes(r));

        return diferencias;
    }
}

class AnalizadorRendimiento {
    constructor(sistema) {
        this.sistema = sistema;
        this.metricas = {
            evaluaciones: 0,
            tiempoTotal: 0,
            distribucionResultados: {},
            variablesMasUsadas: {},
            erroresEvaluacion: 0
        };
    }

    // Medir rendimiento de evaluación
    evaluarConMedicion(mostrarResultados = true) {
        const inicio = performance.now();
        
        try {
            const resultados = this.sistema.evaluar(mostrarResultados);
            const fin = performance.now();
            
            // Actualizar métricas
            this.metricas.evaluaciones++;
            this.metricas.tiempoTotal += (fin - inicio);
            
            // Registrar distribución de resultados
            if (resultados.length > 0) {
                const mejorResultado = resultados[0].nombre;
                this.metricas.distribucionResultados[mejorResultado] = 
                    (this.metricas.distribucionResultados[mejorResultado] || 0) + 1;
            }

            // Registrar variables usadas
            Object.keys(this.sistema.valoresEntradas).forEach(variable => {
                this.metricas.variablesMasUsadas[variable] = 
                    (this.metricas.variablesMasUsadas[variable] || 0) + 1;
            });

            return resultados;
        } catch (error) {
            this.metricas.erroresEvaluacion++;
            console.error('Error en evaluación:', error);
            return [];
        }
    }

    // Obtener reporte de rendimiento
    obtenerReporte() {
        const tiempoPromedio = this.metricas.evaluaciones > 0 
            ? this.metricas.tiempoTotal / this.metricas.evaluaciones 
            : 0;

        return {
            evaluaciones: this.metricas.evaluaciones,
            tiempoPromedio: Math.round(tiempoPromedio * 100) / 100,
            errorRate: this.metricas.evaluaciones > 0 
                ? this.metricas.erroresEvaluacion / this.metricas.evaluaciones 
                : 0,
            resultadoMasFrecuente: this.obtenerMasFrecuente(this.metricas.distribucionResultados),
            variableMasUsada: this.obtenerMasFrecuente(this.metricas.variablesMasUsadas),
            distribucionCompleta: this.metricas.distribucionResultados
        };
    }

    obtenerMasFrecuente(objeto) {
        let masFrecuente = '';
        let maxCount = 0;
        
        Object.entries(objeto).forEach(([key, count]) => {
            if (count > maxCount) {
                maxCount = count;
                masFrecuente = key;
            }
        });

        return { nombre: masFrecuente, count: maxCount };
    }

    // Resetear métricas
    reset() {
        this.metricas = {
            evaluaciones: 0,
            tiempoTotal: 0,
            distribucionResultados: {},
            variablesMasUsadas: {},
            erroresEvaluacion: 0
        };
    }
}

class ValidadorConfiguracion {
    static validarEntradas(entradas) {
        const errores = [];
        const nombresUsados = new Set();

        entradas.forEach((entrada, index) => {
            // Validar nombre único
            if (nombresUsados.has(entrada.nombre)) {
                errores.push(`Entrada ${index}: Nombre duplicado '${entrada.nombre}'`);
            }
            nombresUsados.add(entrada.nombre);

            // Validar campos requeridos
            if (!entrada.nombre || !entrada.tipo) {
                errores.push(`Entrada ${index}: Falta nombre o tipo`);
            }

            // Validar tipo
            if (!['texto', 'booleano', 'numero'].includes(entrada.tipo)) {
                errores.push(`Entrada ${index}: Tipo inválido '${entrada.tipo}'`);
            }

            // Validar opciones para tipo texto
            if (entrada.tipo === 'texto' && (!entrada.opciones || entrada.opciones.length === 0)) {
                errores.push(`Entrada ${index}: Tipo texto requiere opciones`);
            }
        });

        return errores;
    }

    static validarSalidas(salidas) {
        const errores = [];
        const nombresUsados = new Set();

        salidas.forEach((salida, index) => {
            // Validar nombre único
            if (nombresUsados.has(salida.nombre)) {
                errores.push(`Salida ${index}: Nombre duplicado '${salida.nombre}'`);
            }
            nombresUsados.add(salida.nombre);

            // Validar campos requeridos
            if (!salida.nombre || !salida.descripcion) {
                errores.push(`Salida ${index}: Falta nombre o descripción`);
            }
        });

        return errores;
    }

    static validarReglas(reglas, entradas, salidas) {
        const errores = [];
        const nombresSalidas = salidas.map(s => s.nombre);
        const nombresEntradas = entradas.map(e => e.nombre);

        Object.entries(reglas).forEach(([nombreSalida, regla]) => {
            // Validar que la salida existe
            if (!nombresSalidas.includes(nombreSalida)) {
                errores.push(`Regla '${nombreSalida}': Salida no encontrada`);
            }

            // Validar condiciones obligatorias
            if (regla.condiciones_obligatorias) {
                Object.keys(regla.condiciones_obligatorias).forEach(variable => {
                    if (!nombresEntradas.includes(variable)) {
                        errores.push(`Regla '${nombreSalida}': Variable '${variable}' no encontrada en condiciones obligatorias`);
                    }
                });
            }

            // Validar reglas blandas
            if (regla.reglas_blandas) {
                regla.reglas_blandas.forEach((reglaBlanda, index) => {
                    if (!nombresEntradas.includes(reglaBlanda.variable)) {
                        errores.push(`Regla '${nombreSalida}': Variable '${reglaBlanda.variable}' no encontrada en regla blanda ${index}`);
                    }
                    if (typeof reglaBlanda.apoyo !== 'number') {
                        errores.push(`Regla '${nombreSalida}': Apoyo debe ser numérico en regla blanda ${index}`);
                    }
                });
            }
        });

        return errores;
    }

    static validarConfiguracionCompleta(configuracion) {
        const errores = [];

        errores.push(...this.validarEntradas(configuracion.entradas));
        errores.push(...this.validarSalidas(configuracion.salidas));
        errores.push(...this.validarReglas(configuracion.reglas, configuracion.entradas, configuracion.salidas));

        return errores;
    }
}

// Funciones de utilidad para testing y desarrollo

function generarDatosPrueba() {
    return {
        entradaCompleta: {
            zona: "Aragón",
            subzona: "Teruel",
            tecnico: "Antonio",
            tratamiento_economico: "Baremo",
            tipo_solicitud: "Suministro",
            suministro_de_obras: false,
            numero_suministros: "Un solo suministro",
            linea_aerea_cercana: true,
            linea_subterranea_cercana: false,
            distancia_pcr: 25,
            instalar_conversion: false,
            instalar_nuevos_apoyos: false,
            cruzar_calles_desde_pc_a_parcela: false,
            fachada_con_espacio_para_cgp: true
        },
        entradaParcial: {
            zona: "Aragón",
            subzona: "Teruel",
            tecnico: "Antonio",
            tratamiento_economico: "Baremo"
        },
        entradaConflictiva: {
            zona: "Aragón",
            subzona: "Teruel",
            tecnico: "Antonio",
            tratamiento_economico: "Baremo",
            tipo_solicitud: "Suministro",
            instalar_conversion: true,
            instalar_nuevos_apoyos: true
        }
    };
}

function probarTodosLosEscenarios(sistema) {
    const datos = generarDatosPrueba();
    const resultados = {};

    // Probar entrada completa
    sistema.valoresEntradas = datos.entradaCompleta;
    resultados.completa = sistema.evaluar(false);

    // Probar entrada parcial
    sistema.valoresEntradas = datos.entradaParcial;
    resultados.parcial = sistema.evaluar(false);

    // Probar entrada conflictiva
    sistema.valoresEntradas = datos.entradaConflictiva;
    resultados.conflictiva = sistema.evaluar(false);

    // Limpiar
    sistema.valoresEntradas = {};

    return resultados;
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.GestorConfiguracion = GestorConfiguracion;
    window.AnalizadorRendimiento = AnalizadorRendimiento;
    window.ValidadorConfiguracion = ValidadorConfiguracion;
    window.generarDatosPrueba = generarDatosPrueba;
    window.probarTodosLosEscenarios = probarTodosLosEscenarios;
}
