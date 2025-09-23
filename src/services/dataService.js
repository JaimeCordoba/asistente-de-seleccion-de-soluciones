import { CONFIG } from "../config.js";

/**
 * Servicio para cargar datos desde archivos JSON
 */
export class DataService {
  /**
   * Carga todos los datos necesarios para el sistema
   * @returns {Promise<{entradas: Array, salidas: Array, reglas: Object}>}
   */
  static async cargarTodosDatos() {
    try {
      const [entradas, salidas, reglas] = await Promise.all([this.cargarEntradas(), this.cargarSalidas(), this.cargarReglas()]);

      return { entradas, salidas, reglas };
    } catch (error) {
      console.error("Error cargando datos:", error);
      throw error;
    }
  }

  /**
   * Carga las entradas desde el archivo JSON
   * @returns {Promise<Array>}
   */
  static async cargarEntradas() {
    const respuesta = await fetch(CONFIG.DATA_PATHS.ENTRADAS);
    if (!respuesta.ok) {
      throw new Error(`Error cargando entradas: ${respuesta.status}`);
    }
    return respuesta.json();
  }

  /**
   * Carga las salidas desde el archivo JSON
   * @returns {Promise<Array>}
   */
  static async cargarSalidas() {
    const respuesta = await fetch(CONFIG.DATA_PATHS.SALIDAS);
    if (!respuesta.ok) {
      throw new Error(`Error cargando salidas: ${respuesta.status}`);
    }
    return respuesta.json();
  }

  /**
   * Carga las reglas desde el archivo JSON
   * @returns {Promise<Object>}
   */
  static async cargarReglas() {
    const respuesta = await fetch(CONFIG.DATA_PATHS.REGLAS);
    if (!respuesta.ok) {
      throw new Error(`Error cargando reglas: ${respuesta.status}`);
    }
    return respuesta.json();
  }
}
