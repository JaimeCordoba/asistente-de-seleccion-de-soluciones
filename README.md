# Asistente de Selección de Soluciones - Versión Simplificada

## Descripción

Sistema simplificado de selección de soluciones que muestra únicamente los campos relevantes según las salidas posibles en cada momento. El sistema funciona de manera progresiva:

1. **Se introduce la primera entrada**
2. **Se evalúa qué salidas siguen siendo posibles**
3. **Se ocultan todas las entradas que ya no sean relevantes** para el conjunto de salidas que siguen siendo posibles
4. **Se introduce otra entrada**
5. **Repetir desde el paso 2**

## Principales cambios respecto a la versión anterior

### 1. Eliminación del parámetro "obligatoria" 
- Se ha eliminado el campo `"obligatoria"` del archivo `entradas.json`
- Los campos obligatorios se determinan automáticamente desde las reglas definidas en `reglas.json`

### 2. Nuevo sistema de campos obligatorios
Los campos se consideran obligatorios si aparecen en:
- **Condiciones obligatorias** de cualquier salida
- **Reglas de inclusión** de cualquier salida  
- **Reglas de exclusión** de cualquier salida

### 3. Sistema de visibilidad progresiva
- Solo se muestran los campos relevantes para las salidas que aún son posibles
- Los campos se ocultan automáticamente cuando ya no pueden influir en el resultado
- Los campos con valor introducido no se ocultan automáticamente

### 4. Lógica simplificada
- Se eliminaron los algoritmos complejos de evaluación de impacto
- Se eliminaron los métodos de cálculo de cambios de probabilidad
- Se simplificó la lógica de determinación de campos relevantes

## Archivos modificados

### `entradas.json`
- **ANTES**: Cada entrada tenía un campo `"obligatoria": true/false`
- **AHORA**: Se eliminó completamente el campo `obligatoria`

```json
// ANTES
{ "nombre": "zona", "tipo": "texto", "obligatoria": true, "opciones": ["Aragón"] }

// AHORA  
{ "nombre": "zona", "tipo": "texto", "opciones": ["Aragón"] }
```

### `script.js`
- **Nuevo método**: `identificarCamposObligatorios()` - Analiza las reglas para determinar automáticamente qué campos son obligatorios
- **Nuevo método**: `actualizarVisibilidadCampos()` - Gestiona qué campos mostrar/ocultar
- **Nuevo método**: `obtenerSalidasPosibles()` - Calcula qué salidas siguen siendo posibles con los valores actuales
- **Nuevo método**: `determinarCamposRelevantesParaSalidas()` - Determina qué campos son necesarios para las salidas posibles
- **Nuevo método**: `evaluarYActualizar()` - Punto de entrada principal para actualizar visibilidad y evaluación

### `style.css`
- **Nuevos estilos**: Para campos ocultos (`.campo-entrada.oculto`)
- **Nuevos estilos**: Para indicadores visuales de campos obligatorios incompletos
- **Nuevos estilos**: Para mensajes de alerta mejorados
- **Animaciones**: Transiciones suaves para mostrar/ocultar campos

## Funcionamiento técnico

### Identificación de campos obligatorios
```javascript
identificarCamposObligatorios() {
    // Analiza todas las reglas y marca como obligatorios los campos que aparecen en:
    // - condiciones_obligatorias
    // - reglas_inclusion  
    // - reglas_exclusion
}
```

### Determinación de campos relevantes
```javascript
determinarCamposRelevantesParaSalidas(salidasPosibles) {
    // Para cada salida posible, incluye todos los campos que aparecen en:
    // - condiciones_obligatorias
    // - reglas_inclusion
    // - reglas_exclusion 
    // - reglas_blandas
    // + campos que ya tienen valor (no se auto-ocultan)
}
```

### Flujo de actualización
```javascript
actualizarValor(nombre, valor) {
    // 1. Actualizar valor en el modelo
    // 2. Llamar a evaluarYActualizar()
    //    - actualizarVisibilidadCampos()
    //    - evaluar()
}
```

## Ventajas del sistema simplificado

1. **Experiencia de usuario más limpia**: Solo se ven los campos necesarios
2. **Menos complejidad cognitiva**: El usuario no se abruma con campos irrelevantes  
3. **Guiado progresivo**: El sistema guía al usuario paso a paso
4. **Mantenimiento más sencillo**: Menos código complejo que mantener
5. **Configuración más intuitiva**: Los campos obligatorios se infieren automáticamente de las reglas

## Casos de uso

### Ejemplo de flujo típico:
1. Usuario selecciona **zona: "Aragón"** 
   - Se muestran solo los campos relevantes para salidas de Aragón

2. Usuario selecciona **tratamiento_economico: "Baremo"**
   - Se ocultan campos solo relevantes para "Presupuesto"
   - Se muestran campos específicos para soluciones de baremo

3. Usuario selecciona **aparamenta_existente: "true"**
   - Se ocultan campos relacionados con nuevas instalaciones
   - Se muestran solo opciones compatibles con aparamenta existente

## Mantenimiento y extensión

Para añadir nuevos campos o reglas:
1. **Añadir campo a `entradas.json`** (sin necesidad de especificar si es obligatorio)
2. **Añadir reglas a `reglas.json`** que usen el nuevo campo
3. **El sistema automáticamente** determinará si el campo es obligatorio y cuándo mostrarlo

No es necesario modificar código JavaScript para cambios de configuración básicos.

## Estructura del proyecto

```
asistente-de-selección-de-soluciones/
├── index.html              # Página principal
├── script.js               # Lógica principal del sistema (versión simplificada)
├── script_original.js      # Backup del script original
├── style.css               # Estilos visuales (con mejoras para sistema simplificado)
├── entradas.json          # Configuración de variables de entrada (sin campo obligatoria)
├── salidas.json           # Definición de soluciones posibles
├── reglas.json            # Reglas de negocio del sistema
├── README.md              # Esta documentación
└── NUEVAS_FUNCIONALIDADES.md    # Log de cambios
```

## Configuración del sistema

### entradas.json (SIMPLIFICADO)
Define las variables de entrada del sistema:

```json
{
  "nombre": "variable_name",
  "tipo": "texto|booleano|numero",
  "opciones": ["opcion1", "opcion2"]  // Solo para tipo "texto"
}
```

**Nota**: Se eliminó el campo `obligatoria` - ahora se calcula automáticamente.

### salidas.json
Sin cambios respecto a la versión original:

```json
{
  "nombre": "Solution_Name", 
  "descripcion": "Descripción detallada de la solución"
}
```

### reglas.json
Sin cambios respecto a la versión original:

```json
{
  "Solution_Name": {
    "condiciones_obligatorias": {
      "variable": "valor_esperado"
    },
    "reglas_inclusion": [
      "variable == 'valor'",
      "otra_variable > 50"
    ],
    "reglas_exclusion": [
      "variable_excluyente == true"
    ],
    "reglas_blandas": [
      {
        "variable": "variable_name",
        "condicion": "variable == 'valor_preferido'",
        "apoyo": 0.2
      }
    ]
  }
}
```

## Debugging

Para activar el modo debug:
```javascript
window.DEBUG_MODE = true; // En script.js línea 8
```

Esto mostrará en la consola:
- Campos obligatorios identificados
- Salidas posibles en cada momento
- Campos relevantes para las salidas posibles
- Valores actualizados

## Migración desde la versión anterior

Si tienes una versión anterior del sistema:

1. **Respaldar archivos**: Los archivos originales se mantienen como `script_original.js`
2. **Actualizar entradas.json**: Eliminar el campo `"obligatoria"` de todas las entradas
3. **Probar funcionamiento**: El sistema debería funcionar igual pero con mejor UX
4. **Ajustar estilos**: Los nuevos estilos CSS proporcionan mejor feedback visual

## Troubleshooting

### Problema: No se muestran campos
- **Verificar**: Que las reglas en `reglas.json` referencien correctamente los nombres de campos
- **Verificar**: Que al menos una salida sea posible con los valores actuales

### Problema: Campos obligatorios incorrectos
- **Verificar**: Que las reglas en `reglas.json` estén bien formadas
- **Debug**: Activar `DEBUG_MODE` y revisar consola para ver campos obligatorios detectados

### Problema: Campos no se ocultan
- **Verificar**: Que el campo no tenga un valor ya introducido (los campos con valor no se auto-ocultan)
- **Verificar**: Que el campo no sea necesario para ninguna salida posible

## Ventajas técnicas

1. **Menos líneas de código**: ~800 líneas vs ~1200 líneas originales
2. **Lógica más directa**: Eliminación de algoritmos complejos de evaluación de impacto
3. **Mejor performance**: Menos cálculos en cada actualización
4. **Mantenimiento más simple**: Lógica más fácil de entender y modificar
5. **Configuración automática**: No hay que especificar manualmente qué campos son obligatorios
