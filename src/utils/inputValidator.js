/**
 * Validador de entrada para tipos específicos
 */
export class InputValidator {
  /**
   * Convierte y valida un valor según el tipo de entrada
   * @param {*} valor - Valor a convertir
   * @param {Object} entrada - Configuración de la entrada
   * @returns {*} Valor convertido y validado
   */
  static convertirValor(valor, entrada) {
    if (valor === "" || valor === null || valor === undefined) {
      return undefined;
    }

    switch (entrada.tipo) {
      case "booleano":
        return this._convertirBooleano(valor);
      case "numero":
        return this._convertirNumero(valor);
      case "texto":
        return this._convertirTexto(valor, entrada);
      default:
        return valor;
    }
  }

  /**
   * Convierte un valor a booleano
   * @private
   * @param {*} valor - Valor a convertir
   * @returns {boolean|undefined}
   */
  static _convertirBooleano(valor) {
    if (typeof valor === "boolean") return valor;
    if (valor === "true") return true;
    if (valor === "false") return false;
    return undefined;
  }

  /**
   * Convierte un valor a número
   * @private
   * @param {*} valor - Valor a convertir
   * @returns {number|undefined}
   */
  static _convertirNumero(valor) {
    const numero = parseFloat(valor);
    return isNaN(numero) ? undefined : numero;
  }

  /**
   * Valida y convierte un valor de texto
   * @private
   * @param {*} valor - Valor a convertir
   * @param {Object} entrada - Configuración de la entrada
   * @returns {string|undefined}
   */
  static _convertirTexto(valor, entrada) {
    const valorStr = String(valor);

    // Si hay opciones definidas, validar que el valor esté en ellas
    if (entrada.opciones && entrada.opciones.length > 0) {
      return entrada.opciones.includes(valorStr) ? valorStr : undefined;
    }

    return valorStr;
  }

  /**
   * Valida si un valor es válido para una entrada específica
   * @param {*} valor - Valor a validar
   * @param {Object} entrada - Configuración de la entrada
   * @returns {boolean} true si es válido
   */
  static esValorValido(valor, entrada) {
    if (valor === undefined || valor === null || valor === "") {
      return false;
    }

    const valorConvertido = this.convertirValor(valor, entrada);
    return valorConvertido !== undefined;
  }

  /**
   * Obtiene un mensaje de error para un valor inválido
   * @param {*} valor - Valor inválido
   * @param {Object} entrada - Configuración de la entrada
   * @returns {string} Mensaje de error
   */
  static obtenerMensajeError(valor, entrada) {
    if (valor === undefined || valor === null || valor === "") {
      return `El campo ${entrada.nombre} es obligatorio`;
    }

    switch (entrada.tipo) {
      case "booleano":
        return `${entrada.nombre} debe ser Sí o No`;
      case "numero":
        return `${entrada.nombre} debe ser un número válido`;
      case "texto":
        if (entrada.opciones && entrada.opciones.length > 0) {
          return `${entrada.nombre} debe ser una de las opciones: ${entrada.opciones.join(", ")}`;
        }
        return `${entrada.nombre} debe ser un texto válido`;
      default:
        return `Valor inválido para ${entrada.nombre}`;
    }
  }
}
