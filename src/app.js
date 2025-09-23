/**
 * Sistema de Selección de Soluciones - Refactorizado
 * Arquitectura modular profesional
 */

import { CONFIG } from "./config.js";
import { DataService } from "./services/dataService.js";
import { RulesEngine } from "./core/rulesEngine.js";
import { SolutionEvaluator } from "./core/solutionEvaluator.js";
import { FormGenerator } from "./ui/formGenerator.js";
import { ResultsRenderer } from "./ui/resultsRenderer.js";
import { ThemeManager } from "./ui/themeManager.js";
import { InputValidator } from "./utils/inputValidator.js";
import { DebugUtils } from "./utils/debugUtils.js";

/**
 * Clase principal del sistema de selección de soluciones
 */
export class SistemaSeleccionSoluciones {
  constructor() {
    this.entradas = [];
    this.salidas = [];
    this.reglas = {};
    this.valoresEntradas = {};
    this.camposObligatorios = new Set();

    // Componentes del sistema
    this.rulesEngine = null;
    this.solutionEvaluator = null;
    this.formGenerator = null;
    this.resultsRenderer = null;
    this.themeManager = null;
  }

  /**
   * Inicializa el sistema
   */
  async init() {
    try {
      DebugUtils.log("Inicializando sistema...");

      await DebugUtils.medirTiempo("Carga de datos", async () => {
        await this.cargarDatos();
      });

      await DebugUtils.medirTiempo("Inicialización de componentes", async () => {
        this.inicializarComponentes();
      });

      await DebugUtils.medirTiempo("Generación de interfaz", async () => {
        this.generarInterfazInicial();
      });

      DebugUtils.log("Sistema inicializado correctamente");
    } catch (error) {
      DebugUtils.error("Error al inicializar el sistema:", error);
      throw error;
    }
  }

  /**
   * Carga todos los datos necesarios
   */
  async cargarDatos() {
    const datos = await DataService.cargarTodosDatos();

    this.entradas = datos.entradas;
    this.salidas = datos.salidas;
    this.reglas = datos.reglas;

    // Validar datos cargados
    this._validarDatosCargados();
  }

  /**
   * Inicializa todos los componentes del sistema
   */
  inicializarComponentes() {
    // Motor de reglas
    this.rulesEngine = new RulesEngine(this.entradas);

    // Evaluador de soluciones
    this.solutionEvaluator = new SolutionEvaluator(this.rulesEngine);

    // Generador de formularios
    this.formGenerator = new FormGenerator(this.entradas, (nombre, valor) => this.actualizarValor(nombre, valor));

    // Renderizador de resultados
    this.resultsRenderer = new ResultsRenderer();

    // Manejador de tema
    this.themeManager = new ThemeManager();

    // Identificar campos obligatorios
    this.camposObligatorios = this.rulesEngine.identificarCamposObligatorios(this.reglas);
  }

  /**
   * Genera la interfaz inicial
   */
  generarInterfazInicial() {
    this.formGenerator.generarFormulario();
    this.actualizarInterfaz();
  }

  /**
   * Actualiza un valor de entrada
   * @param {string} nombre - Nombre del campo
   * @param {*} valor - Nuevo valor
   */
  actualizarValor(nombre, valor) {
    const entrada = this.entradas.find((e) => e.nombre === nombre);
    if (!entrada) {
      DebugUtils.warn(`Entrada no encontrada: ${nombre}`);
      return;
    }

    // Convertir y validar el valor
    const valorConvertido = InputValidator.convertirValor(valor, entrada);

    if (valorConvertido === undefined) {
      delete this.valoresEntradas[nombre];
    } else {
      this.valoresEntradas[nombre] = valorConvertido;
    }

    DebugUtils.log(`Valor actualizado: ${nombre} = ${this.valoresEntradas[nombre]}`);

    this.actualizarInterfaz();
  }

  /**
   * Actualiza toda la interfaz según el estado actual
   */
  actualizarInterfaz() {
    try {
      // 1. Evaluar salidas posibles
      const salidasPosibles = this.solutionEvaluator.obtenerSalidasPosibles(this.salidas, this.reglas, this.valoresEntradas);

      // 2. Determinar campos relevantes
      const camposRelevantes = this.solutionEvaluator.determinarCamposRelevantes(
        salidasPosibles,
        this.reglas,
        this.valoresEntradas
      );

      // 3. Actualizar visibilidad de campos
      this.formGenerator.actualizarVisibilidadCampos(camposRelevantes);

      // 4. Marcar campos obligatorios
      this.formGenerator.marcarCamposObligatorios(this.camposObligatorios, this.valoresEntradas);

      // 5. Mostrar resultados
      this._mostrarResultados(salidasPosibles);

      // 6. Log del estado si está en modo debug
      if (CONFIG.DEBUG_MODE) {
        DebugUtils.logEstadoSistema({
          valoresEntradas: this.valoresEntradas,
          camposObligatorios: this.camposObligatorios,
          salidasPosibles: salidasPosibles,
          camposRelevantes: camposRelevantes,
        });
      }
    } catch (error) {
      DebugUtils.error("Error actualizando interfaz:", error);
    }
  }

  /**
   * Muestra los resultados calculados
   * @private
   * @param {Array} salidasPosibles - Salidas posibles actuales
   */
  _mostrarResultados(salidasPosibles) {
    // Obtener campos obligatorios pendientes
    const camposObligatoriosPendientes = this.resultsRenderer.obtenerCamposObligatoriosPendientes(
      this.camposObligatorios,
      this.valoresEntradas
    );

    if (camposObligatoriosPendientes.length > 0) {
      this.resultsRenderer.mostrarResultados([], camposObligatoriosPendientes);
      return;
    }

    if (salidasPosibles.length === 0) {
      this.resultsRenderer.mostrarResultados([]);
      return;
    }

    // Calcular puntuaciones
    const resultados = this.solutionEvaluator.calcularPuntuaciones(salidasPosibles, this.reglas, this.valoresEntradas);

    this.resultsRenderer.mostrarResultados(resultados);
  }

  /**
   * Valida que los datos cargados tengan la estructura correcta
   * @private
   */
  _validarDatosCargados() {
    DebugUtils.validarPropiedadesRequeridas(
      { entradas: this.entradas, salidas: this.salidas, reglas: this.reglas },
      ["entradas", "salidas", "reglas"],
      "datos del sistema"
    );

    if (!Array.isArray(this.entradas) || this.entradas.length === 0) {
      throw new Error("Las entradas deben ser un array no vacío");
    }

    if (!Array.isArray(this.salidas) || this.salidas.length === 0) {
      throw new Error("Las salidas deben ser un array no vacío");
    }

    if (typeof this.reglas !== "object" || Object.keys(this.reglas).length === 0) {
      throw new Error("Las reglas deben ser un objeto no vacío");
    }

    DebugUtils.log("Datos validados correctamente");
  }

  /**
   * Obtiene el estado actual del sistema
   * @returns {Object} Estado actual
   */
  obtenerEstado() {
    return {
      valoresEntradas: { ...this.valoresEntradas },
      camposObligatorios: new Set(this.camposObligatorios),
      entradas: [...this.entradas],
      salidas: [...this.salidas],
      reglas: { ...this.reglas },
    };
  }

  /**
   * Reinicia el sistema a su estado inicial
   */
  reiniciar() {
    this.valoresEntradas = {};
    this.formGenerator.generarFormulario();
    this.actualizarInterfaz();
    DebugUtils.log("Sistema reiniciado");
  }
}

// Variable global del sistema
let sistema = null;

/**
 * Función de inicialización global
 */
async function inicializarSistema() {
  try {
    DebugUtils.log("Iniciando aplicación...");
    sistema = new SistemaSeleccionSoluciones();
    await sistema.init();
    DebugUtils.log("Aplicación iniciada correctamente");
  } catch (error) {
    DebugUtils.error("Error fatal al iniciar la aplicación:", error);

    // Mostrar error al usuario
    const container = document.getElementById("resultado");
    if (container) {
      container.innerHTML = `
        <div class="sin-resultados">
          <h3>❌ Error del Sistema</h3>
          <p>No se pudo inicializar la aplicación. Por favor, recargue la página.</p>
          <p><small>Error: ${error.message}</small></p>
        </div>
      `;
    }
  }
}

// Inicializar cuando se carga la página
document.addEventListener("DOMContentLoaded", inicializarSistema);

// Exportar para uso externo si es necesario
export { sistema, inicializarSistema };
