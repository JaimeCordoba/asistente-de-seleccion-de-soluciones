let entradasConfig = [];
let reglas = {};
let datosCargados = { entradas: false, reglas: false };

// 🔹 Cargar entradas y generar formulario dinámico
fetch("entradas.json")
  .then((res) => res.json())
  .then((data) => {
    entradasConfig = data;
    generarFormulario(data);
    datosCargados.entradas = true;
    habilitarBoton();
  });

fetch("reglas.json")
  .then((res) => res.json())
  .then((data) => {
    reglas = data;
    datosCargados.reglas = true;
    habilitarBoton();
  });

function habilitarBoton() {
  if (datosCargados.entradas && datosCargados.reglas) {
    document.querySelector("button").disabled = false;
  }
}

function generarFormulario(config) {
  const form = document.getElementById("formEntradas");
  form.innerHTML = "";

  config.forEach((campo) => {
    const label = document.createElement("label");
    label.textContent = campo.nombre;

    let input;
    let datalist = null;

    if (campo.tipo === "booleano" || (campo.opciones && campo.opciones.length)) {
      // 🔹 Input con datalist para autocompletar y escribir
      input = document.createElement("input");
      input.setAttribute("list", campo.nombre + "_list");

      datalist = document.createElement("datalist");
      datalist.id = campo.nombre + "_list";

      (campo.tipo === "booleano" ? ["true", "false"] : campo.opciones).forEach((opt) => {
        const option = document.createElement("option");
        option.value = opt;
        datalist.appendChild(option);
      });
    } else if (campo.tipo === "numero") {
      input = document.createElement("input");
      input.type = "number";
    } else {
      input = document.createElement("input");
      input.type = "text";
    }

    input.id = campo.nombre;
    input.dataset.obligatoria = campo.obligatoria;
    label.appendChild(input);
    form.appendChild(label);
    if (datalist) form.appendChild(datalist);
  });
}

function evaluar() {
  if (!datosCargados.entradas || !datosCargados.reglas) {
    alert("Datos aún cargando, espera un momento.");
    return;
  }

  const entradas = {};
  let faltanObligatorias = false;
  let camposInvalidos = [];

  // Limpiar errores previos
  entradasConfig.forEach((campo) => {
    const inputEl = document.getElementById(campo.nombre);
    inputEl.classList.remove("input-error");
  });

  entradasConfig.forEach((campo) => {
    const inputEl = document.getElementById(campo.nombre);
    const valorInput = inputEl.value.trim();
    let valor;

    // Conversión de tipo
    if (campo.tipo === "numero") valor = parseFloat(valorInput || "0");
    else if (campo.tipo === "booleano") valor = valorInput.toLowerCase() === "true";
    else valor = valorInput;

    // Validación de obligatorias
    if (campo.obligatoria && valorInput === "") {
      faltanObligatorias = true;
      inputEl.classList.add("input-error");
    }

    // Validación de opciones
    if (campo.tipo === "booleano" || (campo.opciones && campo.opciones.length)) {
      const opcionesValidas = campo.tipo === "booleano" ? ["true", "false"] : campo.opciones;
      const normalizado = valorInput.toLowerCase();
      const valido = valorInput === "" || opcionesValidas.some((opt) => opt.toLowerCase() === normalizado);

      if (!valido) {
        camposInvalidos.push(campo.nombre);
        inputEl.classList.add("input-error");
      }
    }

    entradas[campo.nombre] = valor;
  });

  if (faltanObligatorias) {
    alert("Debes completar todas las entradas obligatorias.");
    return;
  }

  if (camposInvalidos.length > 0) {
    alert(`Valor incorrecto en: ${camposInvalidos.join(", ")}.\nSelecciona una opción de la lista.`);
    return;
  }

  const resultado = [];

  for (const salida in reglas) {
    let score = 0;
    let descartada = false;

    // Evaluar exclusiones
    for (const cond of reglas[salida].reglas_exclusion) {
      if (evalCondicion(cond, entradas)) {
        descartada = true;
        break;
      }
    }

    if (!descartada) {
      for (const regla of reglas[salida].reglas_positivas) {
        if (evalCondicion(regla.condicion, entradas)) {
          score += regla.peso;
        }
      }
    }

    if (!descartada) resultado.push({ salida, score });
  }

  // Ordenar por score descendente
  resultado.sort((a, b) => b.score - a.score);

  // Determinar el score máximo
  const maxScore = resultado.length > 0 ? resultado[0].score : 0;

  // Mostrar resultados con color proporcional y texto legible
  const ul = document.getElementById("resultado");
  ul.innerHTML = "";
  resultado.forEach((r) => {
    const li = document.createElement("li");
    li.textContent = `${r.salida} → Score: ${r.score.toFixed(2)}`;
    const bgColor = scoreToColor(r.score, maxScore);
    li.style.backgroundColor = bgColor;
    li.style.color = getTextColorForBg(bgColor);

    // 🔹 Crear contenedor para la descripción
    const descripcion = reglas[r.salida]?.descripcion;
    if (descripcion) {
      const descDiv = document.createElement("div");
      descDiv.textContent = descripcion;
      descDiv.classList.add("descripcion-desplegable");
      descDiv.style.display = "none"; // lo controlas con JS
      li.appendChild(descDiv);

      // Toggle al hacer clic
      li.style.cursor = "pointer";
      li.addEventListener("click", () => {
        descDiv.style.display = descDiv.style.display === "none" ? "block" : "none";
      });

      li.appendChild(descDiv);
    }

    ul.appendChild(li);
  });
}

function evalCondicion(condicion, entradas) {
  // Evalúa la condición en el contexto de las entradas
  return Function(...Object.keys(entradas), `return ${condicion};`)(...Object.values(entradas));
}

function scoreToColor(score, maxScore) {
  const ratio = maxScore > 0 ? score / maxScore : 0;
  const r = Math.round(255 - ratio * (255 - 77)); // 255 -> 77
  const g = Math.round(77 + ratio * (255 - 77)); // 77 -> 255
  const b = 77;
  return `rgb(${r}, ${g}, ${b})`;
}

function getTextColorForBg(rgb) {
  // Cambiar texto a blanco o negro según brillo
  const [r, g, b] = rgb.match(/\d+/g).map(Number);
  const brillo = r * 0.299 + g * 0.587 + b * 0.114;
  return brillo > 150 ? "#000" : "#fff";
}
