/**
 * Renderizador de resultados
 */
export class ResultsRenderer {
  constructor(containerId = "resultado") {
    this.containerId = containerId;
  }

  /**
   * Muestra los resultados en la interfaz
   * @param {Array} resultados - Array de resultados con puntuaciones
   * @param {Array<string>} camposObligatoriosPendientes - Campos obligatorios sin completar
   */
  mostrarResultados(resultados, camposObligatoriosPendientes = []) {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`No se encontró el elemento con ID: ${this.containerId}`);
      return;
    }

    container.innerHTML = "";

    // Verificar si hay campos obligatorios pendientes
    if (camposObligatoriosPendientes.length > 0) {
      this._mostrarAlertaCamposObligatorios(container, camposObligatoriosPendientes);
      return;
    }

    // Verificar si no hay resultados
    if (!resultados || resultados.length === 0) {
      this._mostrarSinResultados(container);
      return;
    }

    // Mostrar resultados
    this._mostrarListaResultados(container, resultados);
  }

  /**
   * Muestra la alerta de campos obligatorios pendientes
   * @private
   * @param {HTMLElement} container - Contenedor de resultados
   * @param {Array<string>} camposObligatoriosPendientes - Campos pendientes
   */
  _mostrarAlertaCamposObligatorios(container, camposObligatoriosPendientes) {
    const alertaDiv = document.createElement("div");
    alertaDiv.className = "alerta-obligatorios-faltantes";
    alertaDiv.innerHTML = `
      <h3>🚫 Campos obligatorios pendientes</h3>
      <p>Complete los campos marcados en rojo para obtener recomendaciones.</p>
      <div class="campos-faltantes">
        Pendientes: ${camposObligatoriosPendientes.join(", ")}
      </div>
    `;
    container.appendChild(alertaDiv);
  }

  /**
   * Muestra el mensaje de sin resultados
   * @private
   * @param {HTMLElement} container - Contenedor de resultados
   */
  _mostrarSinResultados(container) {
    const sinResultados = document.createElement("div");
    sinResultados.className = "sin-resultados";
    sinResultados.innerHTML = `
      <h3>🔍 No hay soluciones disponibles</h3>
      <p>Los valores actuales no cumplen los criterios de ninguna solución.</p>
    `;
    container.appendChild(sinResultados);
  }

  /**
   * Muestra la lista de resultados
   * @private
   * @param {HTMLElement} container - Contenedor de resultados
   * @param {Array} resultados - Array de resultados
   */
  _mostrarListaResultados(container, resultados) {
    resultados.forEach((resultado, index) => {
      const resultadoElement = this._crearElementoResultado(resultado, index);
      container.appendChild(resultadoElement);
    });
  }

  /**
   * Crea el elemento HTML para un resultado individual
   * @private
   * @param {Object} resultado - Resultado individual
   * @param {number} index - Índice del resultado
   * @returns {HTMLElement} Elemento del resultado
   */
  _crearElementoResultado(resultado, index) {
    const div = document.createElement("div");
    div.className = `resultado-item ${index === 0 ? "recomendado" : ""}`;

    const porcentaje = Math.round(resultado.probabilidad * 100);
    const badge = index === 0 ? '<span class="badge-recomendado">RECOMENDADO</span>' : "";

    div.innerHTML = `
      <div class="resultado-header">
        <h3>${resultado.nombre} ${badge}</h3>
        <div class="probabilidad">${porcentaje}%</div>
      </div>
      <p class="descripcion">${resultado.descripcion}</p>
    `;

    return div;
  }

  /**
   * Obtiene los campos obligatorios pendientes
   * @param {Set<string>} camposObligatorios - Campos obligatorios
   * @param {Object} valoresEntradas - Valores actuales
   * @returns {Array<string>} Campos obligatorios pendientes
   */
  obtenerCamposObligatoriosPendientes(camposObligatorios, valoresEntradas) {
    const camposObligatoriosPendientes = [];

    for (const campo of camposObligatorios) {
      const div = document.getElementById(`campo-${campo}`);
      if (div && div.style.display !== "none") {
        const valor = valoresEntradas[campo];
        if (valor === undefined || valor === "") {
          camposObligatoriosPendientes.push(campo);
        }
      }
    }

    return camposObligatoriosPendientes;
  }
}
