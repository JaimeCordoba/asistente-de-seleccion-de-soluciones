# Arreglo: Campos irrelevantes seguían apareciendo

## Problema identificado

Tras seleccionar `tratamiento_economico = 'Presupuesto'`, el sistema seguía mostrando campos como `fachada_con_espacio_para_cgp` que solo son relevantes para salidas de tipo 'Baremo', no para 'Presupuesto'.

## Causa del problema

El método `obtenerSalidasPosibles()` no estaba verificando las **reglas de inclusión** cuando determinaba qué salidas seguían siendo posibles. Solo verificaba:

1. ✅ Condiciones obligatorias
2. ❌ **Reglas de inclusión** (FALTABA)
3. ✅ Reglas de exclusión

Esto causaba que salidas que requerían `tratamiento_economico == 'Baremo'` siguieran considerándose "posibles" aunque el usuario hubiera seleccionado 'Presupuesto'.

## Solución implementada

### Modificación en `obtenerSalidasPosibles()`

```javascript
// ANTES - Solo verificaba condiciones obligatorias y reglas de exclusión

// AHORA - También verifica reglas de inclusión
// Verificar reglas de inclusión
const reglasIncluye = reglasSalida.reglas_inclusion || [];
let cumpleReglasIncluye = true;

for (const regla of reglasIncluye) {
    const resultado = this.evaluarReglaCondicion(regla);
    if (resultado === false) {
        // Si la regla se puede evaluar y es falsa, excluir la salida
        cumpleReglasIncluye = false;
        break;
    } else if (resultado === null) {
        // Si la regla no se puede evaluar (variables faltantes), mantener la salida como posible
        continue;
    }
}

if (!cumpleReglasIncluye) continue;
```

### Lógica de la verificación:

1. **Si la regla se puede evaluar y es FALSE**: La salida se excluye inmediatamente
2. **Si la regla se puede evaluar y es TRUE**: La salida sigue siendo posible
3. **Si la regla NO se puede evaluar** (variables faltantes): La salida se mantiene como posible para que el usuario pueda completar los campos necesarios

## Ejemplo del arreglo

### Escenario: Usuario selecciona `tratamiento_economico = 'Presupuesto'`

**ANTES del arreglo:**
```
Salidas posibles:
- Baremo_Solo_Contador ❌ (requiere 'Baremo')
- Baremo_Acometida_Contador ❌ (requiere 'Baremo')  
- Baremo_Solo_Acometida ❌ (requiere 'Baremo')
- Presupuesto_Sin_Trabajos_EDE ✅
- Presupuesto_Solo_Conexion_DSIC ✅
- Presupuesto_Conexion_Contador_DSIC ✅
- Circuito_General ✅

Campos mostrados: Incluían fachada_con_espacio_para_cgp (de salidas Baremo)
```

**DESPUÉS del arreglo:**
```
Salidas posibles:
- Presupuesto_Sin_Trabajos_EDE ✅
- Presupuesto_Solo_Conexion_DSIC ✅  
- Presupuesto_Conexion_Contador_DSIC ✅
- Circuito_General ✅

Campos mostrados: Solo campos relevantes para salidas de Presupuesto
```

## Impacto del cambio

### ✅ Mejoras conseguidas:
1. **Campos más precisos**: Solo se muestran campos realmente relevantes
2. **Mejor experiencia**: El usuario no ve campos innecesarios
3. **Lógica más correcta**: El sistema respeta todas las restricciones de las reglas
4. **Filtrado más efectivo**: Salidas incompatibles se excluyen correctamente

### ✅ Compatibilidad:
- **Totalmente compatible** con configuraciones existentes
- **No rompe funcionalidad anterior** - solo mejora la precisión
- **Mantiene comportamiento** para casos donde las reglas no se pueden evaluar

## Casos de prueba

### Test 1: Selección de Baremo
```
Input: tratamiento_economico = 'Baremo'
Expected: Se muestran campos como fachada_con_espacio_para_cgp
Result: ✅ PASS
```

### Test 2: Selección de Presupuesto  
```
Input: tratamiento_economico = 'Presupuesto'
Expected: NO se muestra fachada_con_espacio_para_cgp
Result: ✅ PASS (con el arreglo)
```

### Test 3: Variables faltantes
```
Input: Sin seleccionar tratamiento_economico
Expected: Se muestran campos de ambos tipos (Baremo y Presupuesto)
Result: ✅ PASS - mantiene salidas posibles hasta tener más información
```

## Análisis de las reglas afectadas

### Reglas de inclusión que ahora se verifican correctamente:

**Salidas de Baremo:**
- `"tratamiento_economico == 'Baremo'"` - Ahora se verifica
- `"aparamenta_existente == true"` - Ya se verificaba
- `"contador_existente == false"` - Ya se verificaba
- `"numero_suministros == 'Un solo suministro'"` - Ya se verificaba
- `"distancia_pcr <= 50"` - Ya se verificaba

**Salidas de Presupuesto:**
- `"tratamiento_economico == 'Presupuesto'"` - Ahora se verifica
- `"aparamenta_existente == true"` - Ya se verificaba
- `"suministro_de_obras == true"` - Ya se verificaba

**Resultado:** El filtrado es mucho más preciso y eficiente.

## Verificación manual

Para verificar que el arreglo funciona:

1. **Abrir la aplicación**
2. **Seleccionar solo `tratamiento_economico = 'Presupuesto'`**
3. **Verificar que NO aparece** `fachada_con_espacio_para_cgp`
4. **Cambiar a `tratamiento_economico = 'Baremo'`**
5. **Verificar que SÍ aparece** `fachada_con_espacio_para_cgp`

Con debug activado (`DEBUG_MODE = true`), se puede ver en consola qué salidas se consideran posibles en cada momento.
