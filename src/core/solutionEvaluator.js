import { CONFIG } from "../config.js";

/**
 * Evaluador de soluciones que determina qué salidas son posibles
 * y calcula sus puntuaciones
 */
export class SolutionEvaluator {
  constructor(rulesEngine) {
    this.rulesEngine = rulesEngine;
  }

  /**
   * Obtiene las salidas posibles basándose en los valores actuales
   * @param {Array} salidas - Array de todas las salidas posibles
   * @param {Object} reglas - Todas las reglas del sistema
   * @param {Object} valoresEntradas - Los valores actuales de las entradas
   * @returns {Array} Array de salidas posibles
   */
  obtenerSalidasPosibles(salidas, reglas, valoresEntradas) {
    const salidasPosibles = [];

    for (const salida of salidas) {
      const reglasSalida = reglas[salida.nombre];
      if (!reglasSalida) continue;

      // Verificar condiciones obligatorias
      if (!this.rulesEngine.cumpleCondicionesObligatorias(reglasSalida, valoresEntradas)) continue;

      // Verificar reglas de inclusión
      if (!this.rulesEngine.cumpleReglasInclusion(reglasSalida, valoresEntradas)) continue;

      // Verificar reglas de exclusión
      if (this.rulesEngine.cumpleReglasExclusion(reglasSalida, valoresEntradas)) continue;

      salidasPosibles.push(salida);
    }

    if (CONFIG.DEBUG_MODE) {
      console.log(
        "Salidas posibles:",
        salidasPosibles.map((s) => s.nombre)
      );
    }

    return salidasPosibles;
  }

  /**
   * Calcula las puntuaciones de las salidas usando reglas blandas
   * @param {Array} salidasPosibles - Array de salidas posibles
   * @param {Object} reglas - Todas las reglas del sistema
   * @param {Object} valoresEntradas - Los valores actuales de las entradas
   * @returns {Array} Array de resultados con puntuaciones y probabilidades
   */
  calcularPuntuaciones(salidasPosibles, reglas, valoresEntradas) {
    const resultados = [];

    for (const salida of salidasPosibles) {
      const reglasSalida = reglas[salida.nombre];
      let puntuacion = 1.0;

      // Aplicar reglas blandas si existen
      const reglasBlandas = reglasSalida.reglas_blandas || [];
      for (const regla of reglasBlandas) {
        const resultado = this.rulesEngine.evaluarRegla(regla.condicion, valoresEntradas);
        if (resultado === true) {
          puntuacion += regla.apoyo || 0;
        }
      }

      resultados.push({
        nombre: salida.nombre,
        descripcion: salida.descripcion,
        puntuacion: puntuacion,
      });
    }

    // Calcular probabilidades usando softmax
    this._calcularProbabilidades(resultados);

    // Ordenar por probabilidad descendente
    return resultados.sort((a, b) => b.probabilidad - a.probabilidad);
  }

  /**
   * Calcula las probabilidades usando softmax
   * @private
   * @param {Array} resultados - Array de resultados
   */
  _calcularProbabilidades(resultados) {
    const total = resultados.reduce((sum, r) => sum + Math.exp(r.puntuacion), 0);
    resultados.forEach((resultado) => {
      resultado.probabilidad = Math.exp(resultado.puntuacion) / total;
    });
  }

  /**
   * Determina qué campos son relevantes para las salidas posibles
   * @param {Array} salidasPosibles - Salidas posibles
   * @param {Object} reglas - Todas las reglas
   * @param {Object} valoresEntradas - Valores actuales
   * @returns {Set<string>} Conjunto de campos relevantes
   */
  determinarCamposRelevantes(salidasPosibles, reglas, valoresEntradas) {
    const camposRelevantes = new Set();

    // Incluir campos que ya tienen valor
    Object.keys(valoresEntradas).forEach((campo) => camposRelevantes.add(campo));

    // Incluir campos necesarios para las salidas posibles
    for (const salida of salidasPosibles) {
      const reglasSalida = reglas[salida.nombre];
      if (!reglasSalida) continue;

      // Campos de condiciones obligatorias
      Object.keys(reglasSalida.condiciones_obligatorias || {}).forEach((campo) => camposRelevantes.add(campo));

      // Campos de reglas de inclusión
      (reglasSalida.reglas_inclusion || []).forEach((regla) => {
        this.rulesEngine.extraerVariablesDeRegla(regla).forEach((campo) => camposRelevantes.add(campo));
      });

      // Campos de reglas de exclusión
      (reglasSalida.reglas_exclusion || []).forEach((regla) => {
        this.rulesEngine.extraerVariablesDeRegla(regla).forEach((campo) => camposRelevantes.add(campo));
      });

      // Campos de reglas blandas
      (reglasSalida.reglas_blandas || []).forEach((regla) => {
        if (regla.variable) {
          camposRelevantes.add(regla.variable);
        }
        if (regla.condicion) {
          this.rulesEngine.extraerVariablesDeRegla(regla.condicion).forEach((campo) => camposRelevantes.add(campo));
        }
      });
    }

    if (CONFIG.DEBUG_MODE) {
      console.log("Campos relevantes:", Array.from(camposRelevantes));
    }

    return camposRelevantes;
  }
}
