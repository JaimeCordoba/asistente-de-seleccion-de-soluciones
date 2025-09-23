/**
 * Ejemplos de uso del sistema refactorizado
 * Este archivo demuestra cómo usar los módulos individualmente
 */

import { SistemaSeleccionSoluciones, DataService, RulesEngine, InputValidator, DebugUtils } from "./index.js";

// Ejemplo 1: Uso básico del sistema completo
async function ejemploSistemaCompleto() {
  const sistema = new SistemaSeleccionSoluciones();
  await sistema.init();

  // El sistema se inicializa automáticamente y genera la interfaz
  console.log("Sistema inicializado:", sistema.obtenerEstado());
}

// Ejemplo 2: Uso individual del DataService
async function ejemploDataService() {
  try {
    const datos = await DataService.cargarTodosDatos();
    console.log("Datos cargados:", datos);
  } catch (error) {
    console.error("Error cargando datos:", error);
  }
}

// Ejemplo 3: Uso del RulesEngine independientemente
async function ejemploRulesEngine() {
  const datos = await DataService.cargarTodosDatos();
  const rulesEngine = new RulesEngine(datos.entradas);

  // Evaluar una regla específica
  const valoresEjemplo = {
    tipo_instalacion: "Residencial",
    potencia_contratada: 5.5,
  };

  const resultado = rulesEngine.evaluarRegla('tipo_instalacion === "Residencial" && potencia_contratada > 5', valoresEjemplo);

  console.log("Resultado de la regla:", resultado);
}

// Ejemplo 4: Uso del InputValidator
function ejemploInputValidator() {
  const entradaBooleana = { nombre: "es_trifasico", tipo: "booleano" };
  const entradaNumerica = { nombre: "potencia", tipo: "numero" };

  // Convertir valores
  const valorBooleano = InputValidator.convertirValor("true", entradaBooleana);
  const valorNumerico = InputValidator.convertirValor("5.5", entradaNumerica);

  console.log("Valor booleano:", valorBooleano); // true
  console.log("Valor numérico:", valorNumerico); // 5.5

  // Validar valores
  const esValidoBooleano = InputValidator.esValorValido("maybe", entradaBooleana);
  console.log('¿Es válido "maybe" para booleano?', esValidoBooleano); // false
}

// Ejemplo 5: Uso del sistema de debug
function ejemploDebugUtils() {
  // Habilitar debug temporalmente
  const debugOriginal = window.DEBUG_MODE;
  window.DEBUG_MODE = true;

  DebugUtils.log("Mensaje de debug");
  DebugUtils.warn("Mensaje de advertencia");

  // Medir tiempo de ejecución
  DebugUtils.medirTiempo("Operación ejemplo", () => {
    // Simular operación
    for (let i = 0; i < 1000; i++) {
      Math.random();
    }
    return "completado";
  });

  // Restaurar configuración original
  window.DEBUG_MODE = debugOriginal;
}

// Ejemplo 6: Uso programático para integrar con otros sistemas
async function ejemploIntegracionExterna() {
  const sistema = new SistemaSeleccionSoluciones();
  await sistema.init();

  // Establecer valores programáticamente
  sistema.actualizarValor("tipo_instalacion", "Industrial");
  sistema.actualizarValor("potencia_contratada", 15.0);
  sistema.actualizarValor("distancia_trafo", 100);

  // Obtener estado actual
  const estado = sistema.obtenerEstado();
  console.log("Estado después de establecer valores:", estado);

  // Esto podría integrarse con APIs, bases de datos, etc.
  return estado;
}

// Ejemplo 7: Crear un sistema personalizado extendiendo las clases base
class SistemaPersonalizado extends SistemaSeleccionSoluciones {
  constructor(configuracionPersonalizada) {
    super();
    this.configuracionPersonalizada = configuracionPersonalizada;
  }

  async init() {
    await super.init();

    // Lógica personalizada después de la inicialización
    this.aplicarConfiguracionPersonalizada();
  }

  aplicarConfiguracionPersonalizada() {
    if (this.configuracionPersonalizada.valoresIniciales) {
      Object.entries(this.configuracionPersonalizada.valoresIniciales).forEach(([nombre, valor]) => {
        this.actualizarValor(nombre, valor);
      });
    }
  }
}

// Uso del sistema personalizado
async function ejemploSistemaPersonalizado() {
  const sistemaPersonalizado = new SistemaPersonalizado({
    valoresIniciales: {
      tipo_instalacion: "Comercial",
      potencia_contratada: 10.0,
    },
  });

  await sistemaPersonalizado.init();
  console.log("Sistema personalizado inicializado");
}

// Exportar ejemplos para uso en consola del navegador
window.ejemplos = {
  sistemaCompleto: ejemploSistemaCompleto,
  dataService: ejemploDataService,
  rulesEngine: ejemploRulesEngine,
  inputValidator: ejemploInputValidator,
  debugUtils: ejemploDebugUtils,
  integracionExterna: ejemploIntegracionExterna,
  sistemaPersonalizado: ejemploSistemaPersonalizado,
};

console.log("Ejemplos cargados. Usa window.ejemplos para acceder a ellos.");
console.log("Por ejemplo: window.ejemplos.sistemaCompleto()");
