# Sistema de Selección de Soluciones - Arquitectura Refactorizada

## Estructura del Proyecto

La aplicación ha sido refactorizada siguiendo principios de arquitectura modular profesional:

```
src/
├── app.js                  # Aplicación principal
├── config.js              # Configuración global
├── index.js               # Archivo barril (barrel exports)
├── core/                  # Lógica de negocio central
│   ├── rulesEngine.js     # Motor de evaluación de reglas
│   └── solutionEvaluator.js # Evaluador de soluciones
├── services/              # Servicios de datos
│   └── dataService.js     # Carga de datos desde JSON
├── ui/                    # Componentes de interfaz
│   ├── formGenerator.js   # Generador de formularios
│   ├── resultsRenderer.js # Renderizador de resultados
│   └── themeManager.js    # Manejador de temas
└── utils/                 # Utilidades
    ├── debugUtils.js      # Utilidades de depuración
    └── inputValidator.js  # Validador de entradas
```

## Descripción de Módulos

### 📁 Core (Lógica de Negocio)

#### `rulesEngine.js`

- **Responsabilidad**: Motor de evaluación de reglas y condiciones
- **Funciones principales**:
  - Evaluar reglas dinámicamente
  - Extraer variables de reglas
  - Verificar condiciones obligatorias, inclusión y exclusión
  - Identificar campos obligatorios

#### `solutionEvaluator.js`

- **Responsabilidad**: Evaluación y puntuación de soluciones
- **Funciones principales**:
  - Determinar salidas posibles
  - Calcular puntuaciones con reglas blandas
  - Determinar campos relevantes
  - Cálculo de probabilidades con softmax

### 📁 Services (Servicios)

#### `dataService.js`

- **Responsabilidad**: Gestión de carga de datos
- **Funciones principales**:
  - Carga de entradas, salidas y reglas desde JSON
  - Manejo de errores de carga
  - Validación básica de respuestas HTTP

### 📁 UI (Interfaz de Usuario)

#### `formGenerator.js`

- **Responsabilidad**: Generación dinámica de formularios
- **Funciones principales**:
  - Crear campos según tipo de entrada
  - Manejar visibilidad de campos
  - Marcar campos obligatorios
  - Gestionar eventos de cambio

#### `resultsRenderer.js`

- **Responsabilidad**: Renderizado de resultados
- **Funciones principales**:
  - Mostrar resultados con probabilidades
  - Alertas de campos obligatorios
  - Mensajes de sin resultados
  - Formato de elementos HTML

#### `themeManager.js`

- **Responsabilidad**: Gestión de temas claro/oscuro
- **Funciones principales**:
  - Alternar entre temas
  - Persistir preferencias en localStorage
  - Inicialización automática del botón de tema

### 📁 Utils (Utilidades)

#### `inputValidator.js`

- **Responsabilidad**: Validación y conversión de tipos de entrada
- **Funciones principales**:
  - Conversión de tipos (string → boolean, number, etc.)
  - Validación de valores según configuración
  - Mensajes de error descriptivos

#### `debugUtils.js`

- **Responsabilidad**: Utilidades de depuración y logging
- **Funciones principales**:
  - Logging condicional según DEBUG_MODE
  - Medición de rendimiento
  - Validación de propiedades requeridas
  - Log estructurado del estado del sistema

### 📁 Configuración

#### `config.js`

- **Responsabilidad**: Configuración centralizada
- **Contenido**:
  - Rutas de archivos de datos
  - Configuración de debug
  - Configuración de UI (temas, storage keys)

## Principios de Diseño Aplicados

### 🔧 **Separación de Responsabilidades**

Cada módulo tiene una responsabilidad específica y bien definida.

### 🎯 **Principio de Responsabilidad Única**

Cada clase se enfoca en una sola tarea principal.

### 🔄 **Inyección de Dependencias**

Los componentes reciben sus dependencias como parámetros, facilitando testing y reutilización.

### 📦 **Encapsulación**

Los métodos privados están marcados con `_` y la lógica interna está oculta.

### 🚀 **Escalabilidad**

La arquitectura permite agregar nuevas funcionalidades fácilmente.

### 🧪 **Testabilidad**

Cada módulo puede ser probado independientemente.

## Flujo de Ejecución

1. **Inicialización**:

   ```
   app.js → DataService.cargarTodosDatos() → inicializarComponentes() → generarInterfazInicial()
   ```

2. **Actualización de Valor**:

   ```
   FormGenerator → InputValidator → actualizarValor() → actualizarInterfaz()
   ```

3. **Evaluación**:
   ```
   SolutionEvaluator → RulesEngine → ResultsRenderer
   ```

## Beneficios de la Refactorización

### ✅ **Mantenibilidad**

- Código más organizado y fácil de mantener
- Cambios localizados en módulos específicos

### ✅ **Reutilización**

- Componentes pueden ser reutilizados en otros proyectos
- Lógica de negocio separada de la UI

### ✅ **Testing**

- Cada módulo puede ser probado independientemente
- Mocking más fácil con dependencias inyectadas

### ✅ **Escalabilidad**

- Fácil agregar nuevas funcionalidades
- Arquitectura preparada para crecimiento

### ✅ **Legibilidad**

- Código más limpio y autodocumentado
- Responsabilidades claras

### ✅ **Debug**

- Sistema de logging estructurado
- Medición de rendimiento integrada
- Mejor trazabilidad de errores

## Uso

```javascript
// Importación simple desde el barril
import { SistemaSeleccionSoluciones } from "./src/index.js";

// O importaciones específicas
import { DataService, RulesEngine } from "./src/index.js";
```

## Configuración

Modifica `config.js` para ajustar:

- Rutas de archivos de datos
- Modo debug
- Configuración de UI

## Extensibilidad

Para agregar nuevas funcionalidades:

1. **Nuevos tipos de entrada**: Extiende `InputValidator`
2. **Nuevas reglas**: Extiende `RulesEngine`
3. **Nuevos renderizadores**: Crea en `ui/`
4. **Nuevos servicios**: Crea en `services/`
