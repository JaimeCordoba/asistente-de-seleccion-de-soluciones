import { CONFIG } from "../config.js";

/**
 * Manejador del tema de la aplicación
 */
export class ThemeManager {
  constructor() {
    this.button = null;
    this.init();
  }

  /**
   * Inicializa el manejador de tema
   */
  init() {
    this._crearBotonTema();
    this._cargarTemaGuardado();
  }

  /**
   * Crea el botón para alternar tema
   * @private
   */
  _crearBotonTema() {
    this.button = document.createElement("button");
    this.button.className = "theme-toggle";
    this.button.textContent = "☀️";
    this.button.title = "Alternar tema claro/oscuro";
    this.button.onclick = () => this.alternarTema();
    document.body.appendChild(this.button);
  }

  /**
   * Carga el tema guardado desde localStorage
   * @private
   */
  _cargarTemaGuardado() {
    const temaGuardado = localStorage.getItem(CONFIG.UI.THEME_STORAGE_KEY);
    if (temaGuardado === "claro") {
      document.body.classList.add(CONFIG.UI.LIGHT_THEME_CLASS);
      this._actualizarIconoBoton(true);
    }
  }

  /**
   * Alterna entre tema claro y oscuro
   */
  alternarTema() {
    document.body.classList.toggle(CONFIG.UI.LIGHT_THEME_CLASS);
    const esClaro = document.body.classList.contains(CONFIG.UI.LIGHT_THEME_CLASS);

    // Guardar preferencia
    localStorage.setItem(CONFIG.UI.THEME_STORAGE_KEY, esClaro ? "claro" : "oscuro");

    // Actualizar icono del botón
    this._actualizarIconoBoton(esClaro);
  }

  /**
   * Actualiza el icono del botón de tema
   * @private
   * @param {boolean} esClaro - Si el tema actual es claro
   */
  _actualizarIconoBoton(esClaro) {
    if (this.button) {
      this.button.textContent = esClaro ? "🌙" : "☀️";
    }
  }

  /**
   * Obtiene el tema actual
   * @returns {string} 'claro' o 'oscuro'
   */
  obtenerTemaActual() {
    return document.body.classList.contains(CONFIG.UI.LIGHT_THEME_CLASS) ? "claro" : "oscuro";
  }

  /**
   * Establece un tema específico
   * @param {string} tema - 'claro' o 'oscuro'
   */
  establecerTema(tema) {
    const esClaro = tema === "claro";

    if (esClaro) {
      document.body.classList.add(CONFIG.UI.LIGHT_THEME_CLASS);
    } else {
      document.body.classList.remove(CONFIG.UI.LIGHT_THEME_CLASS);
    }

    localStorage.setItem(CONFIG.UI.THEME_STORAGE_KEY, tema);
    this._actualizarIconoBoton(esClaro);
  }
}
