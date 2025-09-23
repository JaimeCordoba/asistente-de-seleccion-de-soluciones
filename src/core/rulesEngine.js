import { CONFIG } from "../config.js";

/**
 * Motor de reglas para evaluar condiciones y reglas del sistema
 */
export class RulesEngine {
  constructor(entradas) {
    this.entradas = entradas;
  }

  /**
   * Evalúa una regla dada contra los valores actuales
   * @param {string} regla - La regla a evaluar
   * @param {Object} valoresEntradas - Los valores actuales de las entradas
   * @returns {boolean|null} true/false si se puede evaluar, null si faltan variables
   */
  evaluarRegla(regla, valoresEntradas) {
    try {
      const variables = this.extraerVariablesDeRegla(regla);

      // Verificar si todas las variables tienen valor
      for (const variable of variables) {
        if (valoresEntradas[variable] === undefined) {
          return null; // No se puede evaluar
        }
      }

      // Reemplazar variables por valores
      let expresion = regla;
      for (const variable of variables) {
        const valor = valoresEntradas[variable];
        const regex = new RegExp(`\\b${variable}\\b`, "g");

        if (typeof valor === "string") {
          expresion = expresion.replace(regex, `'${valor}'`);
        } else {
          expresion = expresion.replace(regex, valor);
        }
      }

      return Function(`"use strict"; return (${expresion})`)();
    } catch (error) {
      console.warn(`Error evaluando regla: ${regla}`, error);
      return false;
    }
  }

  /**
   * Extrae las variables de una regla
   * @param {string} regla - La regla de la cual extraer variables
   * @returns {Array<string>} Array de nombres de variables
   */
  extraerVariablesDeRegla(regla) {
    const variables = [];
    const regex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
    let match;

    while ((match = regex.exec(regla)) !== null) {
      const variable = match[1];
      if (this.entradas.some((e) => e.nombre === variable)) {
        variables.push(variable);
      }
    }

    return variables;
  }

  /**
   * Verifica si se cumplen las condiciones obligatorias
   * @param {Object} reglasSalida - Las reglas de la salida
   * @param {Object} valoresEntradas - Los valores actuales
   * @returns {boolean}
   */
  cumpleCondicionesObligatorias(reglasSalida, valoresEntradas) {
    const condiciones = reglasSalida.condiciones_obligatorias || {};

    for (const [variable, valorEsperado] of Object.entries(condiciones)) {
      const valorActual = valoresEntradas[variable];

      // Si la variable no tiene valor, la salida sigue siendo posible
      if (valorActual === undefined) continue;

      // Si tiene valor, debe cumplir la condición
      if (Array.isArray(valorEsperado)) {
        if (!valorEsperado.includes(valorActual)) return false;
      } else {
        if (valorActual !== valorEsperado) return false;
      }
    }

    return true;
  }

  /**
   * Verifica si se cumplen las reglas de inclusión
   * @param {Object} reglasSalida - Las reglas de la salida
   * @param {Object} valoresEntradas - Los valores actuales
   * @returns {boolean}
   */
  cumpleReglasInclusion(reglasSalida, valoresEntradas) {
    const reglas = reglasSalida.reglas_inclusion || [];

    for (const regla of reglas) {
      const resultado = this.evaluarRegla(regla, valoresEntradas);
      if (resultado === false) return false;
      // Si resultado es null (variables faltantes), la salida sigue siendo posible
    }

    return true;
  }

  /**
   * Verifica si se cumplen las reglas de exclusión
   * @param {Object} reglasSalida - Las reglas de la salida
   * @param {Object} valoresEntradas - Los valores actuales
   * @returns {boolean} true si está excluida, false si no
   */
  cumpleReglasExclusion(reglasSalida, valoresEntradas) {
    const reglas = reglasSalida.reglas_exclusion || [];

    for (const regla of reglas) {
      const resultado = this.evaluarRegla(regla, valoresEntradas);
      if (resultado === true) return true; // Está excluida
    }

    return false; // No está excluida
  }

  /**
   * Identifica los campos obligatorios basándose en las reglas
   * @param {Object} reglas - Todas las reglas del sistema
   * @returns {Set<string>} Conjunto de campos obligatorios
   */
  identificarCamposObligatorios(reglas) {
    const camposObligatorios = new Set();

    for (const reglasSalida of Object.values(reglas)) {
      // Campos de condiciones obligatorias
      const condicionesObligatorias = reglasSalida.condiciones_obligatorias || {};
      Object.keys(condicionesObligatorias).forEach((variable) => camposObligatorios.add(variable));

      // Campos de reglas de inclusión
      const reglasIncluye = reglasSalida.reglas_inclusion || [];
      reglasIncluye.forEach((regla) => {
        this.extraerVariablesDeRegla(regla).forEach((variable) => camposObligatorios.add(variable));
      });

      // Campos de reglas de exclusión
      const reglasExcluye = reglasSalida.reglas_exclusion || [];
      reglasExcluye.forEach((regla) => {
        this.extraerVariablesDeRegla(regla).forEach((variable) => camposObligatorios.add(variable));
      });
    }

    if (CONFIG.DEBUG_MODE) {
      console.log("Campos obligatorios:", Array.from(camposObligatorios));
    }

    return camposObligatorios;
  }
}
