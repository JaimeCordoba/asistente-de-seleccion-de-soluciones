import { CONFIG } from "../config.js";

/**
 * Generador de formularios dinámicos
 */
export class FormGenerator {
  constructor(entradas, onValueChange) {
    this.entradas = entradas;
    this.onValueChange = onValueChange;
    this.valoresActuales = {};
    this.dependenciasMap = this._construirMapaDependencias();
  }

  /**
   * Genera el formulario completo
   * @param {string} containerId - ID del contenedor del formulario
   */
  generarFormulario(containerId = "formEntradas") {
    const form = document.getElementById(containerId);
    if (!form) {
      console.error(`No se encontró el elemento con ID: ${containerId}`);
      return;
    }

    form.innerHTML = "";

    this.entradas.forEach((entrada) => {
      const fieldElement = this._crearCampoEntrada(entrada);
      form.appendChild(fieldElement);
    });
  }

  /**
   * Crea un campo de entrada individual
   * @private
   * @param {Object} entrada - Configuración de la entrada
   * @returns {HTMLElement} Elemento del campo
   */
  _crearCampoEntrada(entrada) {
    const div = document.createElement("div");
    div.className = "campo-entrada";
    div.id = `campo-${entrada.nombre}`;

    const label = this._crearLabel(entrada);
    const input = this._crearInput(entrada);

    div.appendChild(label);
    div.appendChild(input);

    return div;
  }

  /**
   * Crea la etiqueta para un campo
   * @private
   * @param {Object} entrada - Configuración de la entrada
   * @returns {HTMLElement} Elemento label
   */
  _crearLabel(entrada) {
    const label = document.createElement("label");
    label.textContent = `${entrada.nombre}:`;
    label.setAttribute("for", entrada.nombre);
    return label;
  }

  /**
   * Crea el input para un campo
   * @private
   * @param {Object} entrada - Configuración de la entrada
   * @returns {HTMLElement} Elemento input
   */
  _crearInput(entrada) {
    let input;

    switch (entrada.tipo) {
      case "texto":
        input = this._crearSelectTexto(entrada);
        break;
      case "booleano":
        input = this._crearSelectBooleano(entrada);
        break;
      case "numero":
        input = this._crearInputNumero(entrada);
        break;
      default:
        console.warn(`Tipo de entrada no soportado: ${entrada.tipo}`);
        input = this._crearInputTexto(entrada);
    }

    // Agregar listener para cambios
    input.addEventListener("change", () => {
      this.valoresActuales[entrada.nombre] = input.value;
      this._actualizarCamposDependientes(entrada.nombre, input.value);
      this.onValueChange(entrada.nombre, input.value);
    });

    return input;
  }

  /**
   * Crea un select para campos de texto con opciones
   * @private
   * @param {Object} entrada - Configuración de la entrada
   * @returns {HTMLElement} Elemento select
   */
  _crearSelectTexto(entrada) {
    const select = document.createElement("select");
    select.id = entrada.nombre;
    select.name = entrada.nombre;

    this._poblarOpcionesSelect(select, entrada);

    return select;
  }

  /**
   * Crea un select para campos booleanos
   * @private
   * @param {Object} entrada - Configuración de la entrada
   * @returns {HTMLElement} Elemento select
   */
  _crearSelectBooleano(entrada) {
    const select = document.createElement("select");
    select.id = entrada.nombre;
    select.name = entrada.nombre;

    const opciones = [
      { value: "", text: "-- Seleccionar --" },
      { value: "true", text: "Sí" },
      { value: "false", text: "No" },
    ];

    opciones.forEach((opcion) => {
      const option = document.createElement("option");
      option.value = opcion.value;
      option.textContent = opcion.text;
      select.appendChild(option);
    });

    return select;
  }

  /**
   * Crea un input numérico
   * @private
   * @param {Object} entrada - Configuración de la entrada
   * @returns {HTMLElement} Elemento input
   */
  _crearInputNumero(entrada) {
    const input = document.createElement("input");
    input.type = "number";
    input.id = entrada.nombre;
    input.name = entrada.nombre;
    input.placeholder = "Ingrese un número";
    return input;
  }

  /**
   * Crea un input de texto genérico
   * @private
   * @param {Object} entrada - Configuración de la entrada
   * @returns {HTMLElement} Elemento input
   */
  _crearInputTexto(entrada) {
    const input = document.createElement("input");
    input.type = "text";
    input.id = entrada.nombre;
    input.name = entrada.nombre;
    input.placeholder = `Ingrese ${entrada.nombre.toLowerCase()}`;
    return input;
  }

  /**
   * Actualiza la visibilidad de los campos
   * @param {Set<string>} camposRelevantes - Campos que deben ser visibles
   */
  actualizarVisibilidadCampos(camposRelevantes) {
    this.entradas.forEach((entrada) => {
      const div = document.getElementById(`campo-${entrada.nombre}`);
      if (div) {
        if (camposRelevantes.has(entrada.nombre)) {
          div.style.display = "block";
        } else {
          div.style.display = "none";
        }
      }
    });
  }

  /**
   * Marca los campos obligatorios que están incompletos
   * @param {Set<string>} camposObligatorios - Campos obligatorios
   * @param {Object} valoresEntradas - Valores actuales
   */
  marcarCamposObligatorios(camposObligatorios, valoresEntradas) {
    for (const nombreCampo of camposObligatorios) {
      const div = document.getElementById(`campo-${nombreCampo}`);
      if (div && div.style.display !== "none") {
        const valor = valoresEntradas[nombreCampo];
        if (valor === undefined || valor === "") {
          div.classList.add("obligatorio-incompleto");
        } else {
          div.classList.remove("obligatorio-incompleto");
        }
      }
    }
  }

  /**
   * Construye un mapa de dependencias para optimizar búsquedas
   * @private
   * @returns {Map} Mapa de dependencias
   */
  _construirMapaDependencias() {
    const mapa = new Map();

    this.entradas.forEach((entrada) => {
      if (entrada.dependeDe) {
        if (!mapa.has(entrada.dependeDe)) {
          mapa.set(entrada.dependeDe, []);
        }
        mapa.get(entrada.dependeDe).push(entrada);
      }
    });

    return mapa;
  }

  /**
   * Puebla las opciones de un select
   * @private
   * @param {HTMLSelectElement} select - Elemento select
   * @param {Object} entrada - Configuración de la entrada
   */
  _poblarOpcionesSelect(select, entrada) {
    // Limpiar opciones existentes
    select.innerHTML = "";

    // Opción vacía
    const opcionVacia = document.createElement("option");
    opcionVacia.value = "";
    opcionVacia.textContent = "-- Seleccionar --";
    select.appendChild(opcionVacia);

    let opciones = [];

    // Determinar qué opciones mostrar
    if (entrada.dependeDe && entrada.opcionesDependientes) {
      const valorPadre = this.valoresActuales[entrada.dependeDe];
      if (valorPadre && entrada.opcionesDependientes[valorPadre]) {
        opciones = entrada.opcionesDependientes[valorPadre];
      }
      // Si no hay valor padre o no tiene opciones dependientes, no mostrar opciones
    } else if (entrada.opciones) {
      // Campo independiente con opciones fijas
      opciones = entrada.opciones;
    }

    // Agregar opciones disponibles
    opciones.forEach((opcion) => {
      const option = document.createElement("option");
      option.value = opcion;
      option.textContent = opcion;
      select.appendChild(option);
    });

    // Habilitar/deshabilitar el select según disponibilidad de opciones
    select.disabled = opciones.length === 0;
  }

  /**
   * Actualiza los campos dependientes cuando cambia un valor
   * @private
   * @param {string} nombreCampo - Nombre del campo que cambió
   * @param {string} nuevoValor - Nuevo valor del campo
   */
  _actualizarCamposDependientes(nombreCampo, nuevoValor) {
    const camposDependientes = this.dependenciasMap.get(nombreCampo);

    if (camposDependientes) {
      camposDependientes.forEach((entrada) => {
        const select = document.getElementById(entrada.nombre);
        if (select) {
          // Limpiar valor actual del campo dependiente
          select.value = "";
          this.valoresActuales[entrada.nombre] = "";

          // Repoblar opciones
          this._poblarOpcionesSelect(select, entrada);

          // Actualizar campos que dependen de este
          this._actualizarCamposDependientes(entrada.nombre, "");
        }
      });
    }
  }

  /**
   * Actualiza los valores actuales desde el formulario
   * @param {Object} valores - Valores actuales del formulario
   */
  actualizarValores(valores) {
    this.valoresActuales = { ...valores };

    // Refrescar todos los selects dependientes
    this.entradas.forEach((entrada) => {
      if (entrada.dependeDe && entrada.opcionesDependientes) {
        const select = document.getElementById(entrada.nombre);
        if (select) {
          this._poblarOpcionesSelect(select, entrada);
          // Restaurar valor si es válido
          if (valores[entrada.nombre] && this._esOpcionValida(entrada, valores[entrada.nombre])) {
            select.value = valores[entrada.nombre];
          }
        }
      }
    });
  }

  /**
   * Verifica si una opción es válida para una entrada dependiente
   * @private
   * @param {Object} entrada - Configuración de la entrada
   * @param {string} valor - Valor a verificar
   * @returns {boolean} True si la opción es válida
   */
  _esOpcionValida(entrada, valor) {
    if (!entrada.dependeDe || !entrada.opcionesDependientes) {
      return entrada.opciones && entrada.opciones.includes(valor);
    }

    const valorPadre = this.valoresActuales[entrada.dependeDe];
    if (!valorPadre || !entrada.opcionesDependientes[valorPadre]) {
      return false;
    }

    return entrada.opcionesDependientes[valorPadre].includes(valor);
  }
}
