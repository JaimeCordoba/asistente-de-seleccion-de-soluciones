/**
 * Sistema de Selección de Soluciones Simplificado
 * Flujo dinámico: introduce entrada -> evalúa salidas posibles -> oculta entradas irrelevantes
 */

// Activar modo debug
window.DEBUG_MODE = true;

class SistemaSeleccionSoluciones {
    constructor() {
        this.entradas = [];
        this.salidas = [];
        this.reglas = {};
        this.valoresEntradas = {};
        this.camposObligatorios = new Set();
        this.init();
    }

    async init() {
        try {
            await this.cargarDatos();
            this.identificarCamposObligatorios();
            this.generarFormulario();
            this.actualizarInterfaz();
        } catch (error) {
            console.error('Error al inicializar el sistema:', error);
        }
    }

    async cargarDatos() {
        const respuestaEntradas = await fetch('entradas.json');
        this.entradas = await respuestaEntradas.json();

        const respuestaSalidas = await fetch('salidas.json');
        this.salidas = await respuestaSalidas.json();

        const respuestaReglas = await fetch('reglas.json');
        this.reglas = await respuestaReglas.json();
    }

    identificarCamposObligatorios() {
        this.camposObligatorios.clear();
        
        for (const reglasSalida of Object.values(this.reglas)) {
            // Campos de condiciones obligatorias
            const condicionesObligatorias = reglasSalida.condiciones_obligatorias || {};
            Object.keys(condicionesObligatorias).forEach(variable => 
                this.camposObligatorios.add(variable));
            
            // Campos de reglas de inclusión
            const reglasIncluye = reglasSalida.reglas_inclusion || [];
            reglasIncluye.forEach(regla => {
                this.extraerVariablesDeRegla(regla).forEach(variable => 
                    this.camposObligatorios.add(variable));
            });
            
            // Campos de reglas de exclusión
            const reglasExcluye = reglasSalida.reglas_exclusion || [];
            reglasExcluye.forEach(regla => {
                this.extraerVariablesDeRegla(regla).forEach(variable => 
                    this.camposObligatorios.add(variable));
            });
            
            // NO incluir campos de reglas blandas como obligatorios
            // Las reglas blandas son opcionales y solo afectan la puntuación
        }

        if (window.DEBUG_MODE) {
            console.log('Campos obligatorios:', Array.from(this.camposObligatorios));
        }
    }

    generarFormulario() {
        const form = document.getElementById('formEntradas');
        form.innerHTML = '';

        this.entradas.forEach(entrada => {
            const div = document.createElement('div');
            div.className = 'campo-entrada';
            div.id = `campo-${entrada.nombre}`;

            const label = document.createElement('label');
            label.textContent = `${entrada.nombre}:`;
            label.setAttribute('for', entrada.nombre);

            let input;

            switch (entrada.tipo) {
                case 'texto':
                    input = document.createElement('select');
                    input.id = entrada.nombre;
                    input.name = entrada.nombre;
                    
                    const opcionVacia = document.createElement('option');
                    opcionVacia.value = '';
                    opcionVacia.textContent = '-- Seleccionar --';
                    input.appendChild(opcionVacia);

                    if (entrada.opciones) {
                        entrada.opciones.forEach(opcion => {
                            const option = document.createElement('option');
                            option.value = opcion;
                            option.textContent = opcion;
                            input.appendChild(option);
                        });
                    }
                    break;

                case 'booleano':
                    input = document.createElement('select');
                    input.id = entrada.nombre;
                    input.name = entrada.nombre;
                    
                    const opciones = [
                        { value: '', text: '-- Seleccionar --' },
                        { value: 'true', text: 'Sí' },
                        { value: 'false', text: 'No' }
                    ];

                    opciones.forEach(opcion => {
                        const option = document.createElement('option');
                        option.value = opcion.value;
                        option.textContent = opcion.text;
                        input.appendChild(option);
                    });
                    break;

                case 'numero':
                    input = document.createElement('input');
                    input.type = 'number';
                    input.id = entrada.nombre;
                    input.name = entrada.nombre;
                    input.placeholder = 'Ingrese un número';
                    break;
            }

            input.addEventListener('change', () => {
                this.actualizarValor(entrada.nombre, input.value);
            });

            div.appendChild(label);
            div.appendChild(input);
            form.appendChild(div);
        });
    }

    actualizarValor(nombre, valor) {
        if (valor === '') {
            delete this.valoresEntradas[nombre];
        } else {
            const entrada = this.entradas.find(e => e.nombre === nombre);
            if (entrada.tipo === 'booleano') {
                this.valoresEntradas[nombre] = valor === 'true';
            } else if (entrada.tipo === 'numero') {
                this.valoresEntradas[nombre] = parseFloat(valor) || 0;
            } else {
                this.valoresEntradas[nombre] = valor;
            }
        }

        if (window.DEBUG_MODE) {
            console.log(`Valor actualizado: ${nombre} = ${this.valoresEntradas[nombre]}`);
        }

        this.actualizarInterfaz();
    }

    actualizarInterfaz() {
        // 1. Evaluar salidas posibles
        const salidasPosibles = this.obtenerSalidasPosibles();
        
        // 2. Determinar campos relevantes para esas salidas
        const camposRelevantes = this.determinarCamposRelevantes(salidasPosibles);
        
        // 3. Actualizar visibilidad de campos
        this.actualizarVisibilidadCampos(camposRelevantes);
        
        // 4. Marcar campos obligatorios pendientes
        this.marcarCamposObligatorios();
        
        // 5. Mostrar resultados
        this.mostrarResultados(salidasPosibles);
    }

    obtenerSalidasPosibles() {
        const salidasPosibles = [];
        
        for (const salida of this.salidas) {
            const reglasSalida = this.reglas[salida.nombre];
            if (!reglasSalida) continue;
            
            // Verificar condiciones obligatorias
            if (!this.cumpleCondicionesObligatorias(reglasSalida)) continue;
            
            // Verificar reglas de inclusión
            if (!this.cumpleReglasInclusion(reglasSalida)) continue;
            
            // Verificar reglas de exclusión
            if (this.cumpleReglasExclusion(reglasSalida)) continue;
            
            salidasPosibles.push(salida);
        }
        
        if (window.DEBUG_MODE) {
            console.log('Salidas posibles:', salidasPosibles.map(s => s.nombre));
        }
        
        return salidasPosibles;
    }

    cumpleCondicionesObligatorias(reglasSalida) {
        const condiciones = reglasSalida.condiciones_obligatorias || {};
        
        for (const [variable, valorEsperado] of Object.entries(condiciones)) {
            const valorActual = this.valoresEntradas[variable];
            
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

    cumpleReglasInclusion(reglasSalida) {
        const reglas = reglasSalida.reglas_inclusion || [];
        
        for (const regla of reglas) {
            const resultado = this.evaluarRegla(regla);
            if (resultado === false) return false;
            // Si resultado es null (variables faltantes), la salida sigue siendo posible
        }
        
        return true;
    }

    cumpleReglasExclusion(reglasSalida) {
        const reglas = reglasSalida.reglas_exclusion || [];
        
        for (const regla of reglas) {
            const resultado = this.evaluarRegla(regla);
            if (resultado === true) return true; // Está excluida
        }
        
        return false; // No está excluida
    }

    determinarCamposRelevantes(salidasPosibles) {
        const camposRelevantes = new Set();
        
        // Incluir campos que ya tienen valor
        Object.keys(this.valoresEntradas).forEach(campo => 
            camposRelevantes.add(campo));
        
        // Incluir campos necesarios para las salidas posibles
        for (const salida of salidasPosibles) {
            const reglasSalida = this.reglas[salida.nombre];
            if (!reglasSalida) continue;
            
            // Campos de condiciones obligatorias
            Object.keys(reglasSalida.condiciones_obligatorias || {})
                .forEach(campo => camposRelevantes.add(campo));
            
            // Campos de reglas de inclusión
            (reglasSalida.reglas_inclusion || []).forEach(regla => {
                this.extraerVariablesDeRegla(regla).forEach(campo => 
                    camposRelevantes.add(campo));
            });
            
            // Campos de reglas de exclusión
            (reglasSalida.reglas_exclusion || []).forEach(regla => {
                this.extraerVariablesDeRegla(regla).forEach(campo => 
                    camposRelevantes.add(campo));
            });
            
            // Campos de reglas blandas
            (reglasSalida.reglas_blandas || []).forEach(regla => {
                if (regla.variable) {
                    camposRelevantes.add(regla.variable);
                }
                if (regla.condicion) {
                    this.extraerVariablesDeRegla(regla.condicion).forEach(campo => 
                        camposRelevantes.add(campo));
                }
            });
        }
        
        if (window.DEBUG_MODE) {
            console.log('Campos relevantes:', Array.from(camposRelevantes));
        }
        
        return camposRelevantes;
    }

    actualizarVisibilidadCampos(camposRelevantes) {
        this.entradas.forEach(entrada => {
            const div = document.getElementById(`campo-${entrada.nombre}`);
            if (div) {
                if (camposRelevantes.has(entrada.nombre)) {
                    div.style.display = 'block';
                } else {
                    div.style.display = 'none';
                }
            }
        });
    }

    marcarCamposObligatorios() {
        for (const nombreCampo of this.camposObligatorios) {
            const div = document.getElementById(`campo-${nombreCampo}`);
            if (div && div.style.display !== 'none') {
                const valor = this.valoresEntradas[nombreCampo];
                if (valor === undefined || valor === '') {
                    div.classList.add('obligatorio-incompleto');
                } else {
                    div.classList.remove('obligatorio-incompleto');
                }
            }
        }
    }

    evaluarRegla(regla) {
        try {
            const variables = this.extraerVariablesDeRegla(regla);
            
            // Verificar si todas las variables tienen valor
            for (const variable of variables) {
                if (this.valoresEntradas[variable] === undefined) {
                    return null; // No se puede evaluar
                }
            }
            
            // Reemplazar variables por valores
            let expresion = regla;
            for (const variable of variables) {
                const valor = this.valoresEntradas[variable];
                const regex = new RegExp(`\\b${variable}\\b`, 'g');
                
                if (typeof valor === 'string') {
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

    extraerVariablesDeRegla(regla) {
        const variables = [];
        const regex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
        let match;
        
        while ((match = regex.exec(regla)) !== null) {
            const variable = match[1];
            if (this.entradas.some(e => e.nombre === variable)) {
                variables.push(variable);
            }
        }
        
        return variables;
    }

    mostrarResultados(salidasPosibles) {
        const listaResultados = document.getElementById('resultado');
        listaResultados.innerHTML = '';

        // Verificar si hay campos obligatorios pendientes
        const camposObligatoriosPendientes = [];
        for (const campo of this.camposObligatorios) {
            const div = document.getElementById(`campo-${campo}`);
            if (div && div.style.display !== 'none') {
                const valor = this.valoresEntradas[campo];
                if (valor === undefined || valor === '') {
                    camposObligatoriosPendientes.push(campo);
                }
            }
        }

        if (camposObligatoriosPendientes.length > 0) {
            const alertaDiv = document.createElement('div');
            alertaDiv.className = 'alerta-obligatorios-faltantes';
            alertaDiv.innerHTML = `
                <h3>🚫 Campos obligatorios pendientes</h3>
                <p>Complete los campos marcados en rojo para obtener recomendaciones.</p>
                <div class="campos-faltantes">
                    Pendientes: ${camposObligatoriosPendientes.join(', ')}
                </div>
            `;
            listaResultados.appendChild(alertaDiv);
            return;
        }

        if (salidasPosibles.length === 0) {
            const sinResultados = document.createElement('div');
            sinResultados.className = 'sin-resultados';
            sinResultados.innerHTML = `
                <h3>🔍 No hay soluciones disponibles</h3>
                <p>Los valores actuales no cumplen los criterios de ninguna solución.</p>
            `;
            listaResultados.appendChild(sinResultados);
            return;
        }

        // Calcular puntuaciones con reglas blandas
        const resultados = this.calcularPuntuaciones(salidasPosibles);

        // Mostrar resultados
        resultados.forEach((resultado, index) => {
            const div = document.createElement('div');
            div.className = `resultado-item ${index === 0 ? 'recomendado' : ''}`;
            
            const porcentaje = Math.round(resultado.probabilidad * 100);
            const badge = index === 0 ? '<span class="badge-recomendado">RECOMENDADO</span>' : '';
            
            div.innerHTML = `
                <div class="resultado-header">
                    <h3>${resultado.nombre} ${badge}</h3>
                    <div class="probabilidad">${porcentaje}%</div>
                </div>
                <p class="descripcion">${resultado.descripcion}</p>
            `;
            
            listaResultados.appendChild(div);
        });
    }

    calcularPuntuaciones(salidasPosibles) {
        const resultados = [];

        for (const salida of salidasPosibles) {
            const reglasSalida = this.reglas[salida.nombre];
            let puntuacion = 1.0;

            // Aplicar reglas blandas si existen
            const reglasBlandas = reglasSalida.reglas_blandas || [];
            for (const regla of reglasBlandas) {
                const resultado = this.evaluarRegla(regla.condicion);
                if (resultado === true) {
                    puntuacion += regla.apoyo || 0;
                }
            }

            resultados.push({
                nombre: salida.nombre,
                descripcion: salida.descripcion,
                puntuacion: puntuacion
            });
        }

        // Calcular probabilidades usando softmax
        const total = resultados.reduce((sum, r) => sum + Math.exp(r.puntuacion), 0);
        resultados.forEach(resultado => {
            resultado.probabilidad = Math.exp(resultado.puntuacion) / total;
        });

        // Ordenar por probabilidad descendente
        return resultados.sort((a, b) => b.probabilidad - a.probabilidad);
    }
}

// Instancia global del sistema
let sistema;

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    sistema = new SistemaSeleccionSoluciones();
    inicializarTema();
});

// Funciones para alternador de tema
function alternarTema() {
    document.body.classList.toggle('light-mode');
    const esClaro = document.body.classList.contains('light-mode');
    
    localStorage.setItem('tema', esClaro ? 'claro' : 'oscuro');
    
    const boton = document.querySelector('.theme-toggle');
    if (boton) {
        boton.textContent = esClaro ? '🌙' : '☀️';
    }
}

function inicializarTema() {
    const botonTema = document.createElement('button');
    botonTema.className = 'theme-toggle';
    botonTema.textContent = '☀️';
    botonTema.title = 'Alternar tema claro/oscuro';
    botonTema.onclick = alternarTema;
    document.body.appendChild(botonTema);
    
    const temaGuardado = localStorage.getItem('tema');
    if (temaGuardado === 'claro') {
        document.body.classList.add('light-mode');
        botonTema.textContent = '🌙';
    }
}
