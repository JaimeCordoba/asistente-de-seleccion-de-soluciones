import { CONFIG } from "../config.js";

/**
 * Utilidades de depuración y logging
 */
export class DebugUtils {
  /**
   * Registra un mensaje de debug si está habilitado
   * @param {string} mensaje - Mensaje a registrar
   * @param {...*} args - Argumentos adicionales
   */
  static log(mensaje, ...args) {
    if (CONFIG.DEBUG_MODE) {
      console.log(`[DEBUG] ${mensaje}`, ...args);
    }
  }

  /**
   * Registra un mensaje de advertencia
   * @param {string} mensaje - Mensaje a registrar
   * @param {...*} args - Argumentos adicionales
   */
  static warn(mensaje, ...args) {
    if (CONFIG.DEBUG_MODE) {
      console.warn(`[WARN] ${mensaje}`, ...args);
    }
  }

  /**
   * Registra un mensaje de error
   * @param {string} mensaje - Mensaje a registrar
   * @param {...*} args - Argumentos adicionales
   */
  static error(mensaje, ...args) {
    console.error(`[ERROR] ${mensaje}`, ...args);
  }

  /**
   * Registra información sobre el estado actual del sistema
   * @param {Object} estado - Estado del sistema
   */
  static logEstadoSistema(estado) {
    if (!CONFIG.DEBUG_MODE) return;

    console.group("[DEBUG] Estado del Sistema");
    console.log("Valores de entradas:", estado.valoresEntradas);
    console.log("Campos obligatorios:", Array.from(estado.camposObligatorios));
    console.log(
      "Salidas posibles:",
      estado.salidasPosibles?.map((s) => s.nombre)
    );
    console.log("Campos relevantes:", Array.from(estado.camposRelevantes));
    console.groupEnd();
  }

  /**
   * Mide el tiempo de ejecución de una función
   * @param {string} etiqueta - Etiqueta para identificar la medición
   * @param {Function} funcion - Función a medir
   * @returns {*} Resultado de la función
   */
  static async medirTiempo(etiqueta, funcion) {
    if (!CONFIG.DEBUG_MODE) {
      return await funcion();
    }

    const inicio = performance.now();
    try {
      const resultado = await funcion();
      const fin = performance.now();
      console.log(`[TIMING] ${etiqueta}: ${(fin - inicio).toFixed(2)}ms`);
      return resultado;
    } catch (error) {
      const fin = performance.now();
      console.error(`[TIMING] ${etiqueta} falló después de ${(fin - inicio).toFixed(2)}ms:`, error);
      throw error;
    }
  }

  /**
   * Valida que un objeto tenga las propiedades requeridas
   * @param {Object} objeto - Objeto a validar
   * @param {Array<string>} propiedadesRequeridas - Propiedades requeridas
   * @param {string} nombreObjeto - Nombre del objeto para mensajes de error
   * @throws {Error} Si faltan propiedades
   */
  static validarPropiedadesRequeridas(objeto, propiedadesRequeridas, nombreObjeto = "objeto") {
    if (!objeto) {
      throw new Error(`${nombreObjeto} es nulo o indefinido`);
    }

    const propiedadesFaltantes = propiedadesRequeridas.filter((prop) => !(prop in objeto));

    if (propiedadesFaltantes.length > 0) {
      throw new Error(`${nombreObjeto} no tiene las propiedades requeridas: ${propiedadesFaltantes.join(", ")}`);
    }
  }
}
