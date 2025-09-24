# Funcionalidad de Entradas Dependientes

Esta documentación describe la nueva funcionalidad que permite crear entradas que dependen de la selección previa de otras entradas.

## Concepto

Las entradas dependientes son campos de formulario cuyas opciones disponibles cambian dinámicamente basándose en la selección previa de otro campo. Por ejemplo:

- **Campo padre**: `zona` → Opciones: ["Aragón", "Cataluña", "Valencia"]
- **Campo hijo**: `subzona` → Opciones dependen de la zona seleccionada:
  - Si zona = "Aragón" → subzona puede ser ["Zaragoza", "Huesca", "Teruel"]
  - Si zona = "Cataluña" → subzona puede ser ["Barcelona", "Girona", "Lleida", "Tarragona"]

## Formato JSON

### Estructura de una entrada dependiente

```json
{
  "nombre": "subzona",
  "tipo": "texto",
  "dependeDe": "zona",
  "opcionesDependientes": {
    "Aragón": ["Zaragoza", "Huesca", "Teruel"],
    "Cataluña": ["Barcelona", "Girona", "Lleida", "Tarragona"],
    "Valencia": ["Valencia", "Castellón", "Alicante"]
  }
}
```

### Propiedades nuevas

- **`dependeDe`**: (string) Nombre del campo del cual depende esta entrada
- **`opcionesDependientes`**: (object) Mapa que asocia cada valor del campo padre con sus opciones correspondientes

### Ejemplo completo

```json
[
  {
    "nombre": "zona",
    "tipo": "texto",
    "opciones": ["Aragón", "Cataluña", "Valencia"]
  },
  {
    "nombre": "subzona",
    "tipo": "texto",
    "dependeDe": "zona",
    "opcionesDependientes": {
      "Aragón": ["Zaragoza", "Huesca", "Teruel"],
      "Cataluña": ["Barcelona", "Girona", "Lleida", "Tarragona"],
      "Valencia": ["Valencia", "Castellón", "Alicante"]
    }
  },
  {
    "nombre": "pueblo",
    "tipo": "texto",
    "dependeDe": "subzona",
    "opcionesDependientes": {
      "Zaragoza": ["Zaragoza", "Calatayud", "Ejea de los Caballeros"],
      "Barcelona": ["Barcelona", "Hospitalet de Llobregat", "Badalona"]
      // ... más opciones para cada subzona
    }
  }
]
```

## Comportamiento

### Inicialización

- Los campos dependientes se muestran deshabilitados hasta que se seleccione su campo padre
- Solo se muestran las opciones "-- Seleccionar --" cuando no hay valor padre

### Selección de valor padre

1. Cuando se selecciona un valor en el campo padre
2. Se habilita el campo dependiente
3. Se cargan dinámicamente las opciones correspondientes
4. Se limpia cualquier valor previo del campo dependiente

### Cascada de dependencias

- Los campos pueden tener múltiples niveles de dependencia (zona → subzona → pueblo)
- Cuando cambia un campo padre, todos sus descendientes se reinician
- La cascada se propaga automáticamente hacia abajo

### Validación

- Los valores se validan considerando las opciones disponibles según el valor padre
- Se proporciona retroalimentación clara cuando faltan campos padre

## Implementación técnica

### Componentes modificados

1. **FormGenerator**:

   - Manejo de dependencias entre campos
   - Actualización dinámica de opciones
   - Control de habilitación/deshabilitación

2. **InputValidator**:

   - Validación considerando dependencias
   - Mensajes de error contextuales

3. **App principal**:
   - Integración del sistema de dependencias
   - Propagación de cambios

### Métodos principales

- `_construirMapaDependencias()`: Construye mapa de relaciones padre-hijo
- `_actualizarCamposDependientes()`: Actualiza campos cuando cambia un padre
- `_poblarOpcionesSelect()`: Carga opciones dinámicamente
- `validarTextoConDependencias()`: Validación considerando dependencias

## Casos de uso

### Localización geográfica

```
País → Región → Provincia → Ciudad → Código postal
```

### Categorización de productos

```
Categoría → Subcategoría → Tipo → Modelo
```

### Clasificación técnica

```
Tipo equipo → Marca → Modelo → Versión
```

## Beneficios

1. **UX mejorada**: Los usuarios solo ven opciones relevantes
2. **Consistencia**: Previene selecciones inválidas
3. **Escalabilidad**: Fácil agregar nuevas opciones y niveles
4. **Mantenibilidad**: Configuración centralizada en JSON
5. **Performance**: Carga eficiente de opciones bajo demanda

## Consideraciones

- Las dependencias deben ser acíclicas (no puede haber bucles)
- Todos los valores padre deben tener opciones definidas
- Los cambios en el JSON requieren validar la consistencia de datos
- Se recomienda mantener un número razonable de niveles de dependencia (máximo 4-5)

---

Resumen de la funcionalidad implementada:

✅ Funcionalidad Implementada
1. Formato JSON Actualizado
Se ha modificado entradas.json para soportar dependencias jerárquicas
Estructura nueva con dependeDe y opcionesDependientes
Ejemplo implementado: Zona → Subzona → Pueblo con datos reales de España
2. Componentes Actualizados
FormGenerator.js:

✅ Sistema de mapeo de dependencias
✅ Actualización dinámica de opciones
✅ Cascada automática de cambios
✅ Control de habilitación/deshabilitación de campos
InputValidator.js:

✅ Validación considerando dependencias
✅ Mensajes de error contextuales
✅ Soporte para opciones dependientes
App.js:

✅ Integración del sistema de dependencias
✅ Propagación correcta de cambios
3. Mejoras Visuales
✅ Estilos CSS para campos deshabilitados
✅ Indicadores visuales claros
✅ Transiciones suaves
4. Documentación Completa
✅ Guía técnica en ENTRADAS_DEPENDIENTES.md
✅ Ejemplos de uso
✅ Casos de uso prácticos
🎯 Beneficios Obtenidos
Experiencia de Usuario Mejorada: Solo se muestran opciones relevantes
Prevención de Errores: Imposible seleccionar combinaciones inválidas
Escalabilidad: Fácil agregar nuevas zonas, subzonas y pueblos
Flexibilidad: Soporta múltiples niveles de dependencias
Mantenibilidad: Configuración centralizada en JSON

---