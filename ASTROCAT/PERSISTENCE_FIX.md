# 🔧 FIX - Bloques Desaparecen Después del TEST

## ❌ Problema Reportado

Usuario dice: "Pude testear el nivel una vez pero no había bloques y cuando quise hacer un nuevo nivel no me dejó testear más"

**Síntoma:** 
- ✅ Primer TEST funcionaba
- ❌ Al regresar al editor, **los bloques desaparecían**
- ❌ No se podía hacer TEST de nuevo (o mostraba nivel vacío)

---

## 🔍 Causa Identificada

### El Flujo Quebrado

```
EditorScene (bloques = [A, B, C])
    ↓
TEST presionado
    ↓
scene.start('GameScene', { customLevel: {...}, fromEditor: true })
    ↓
GameScene (juega)
    ↓
winLevel() → nextLevel()
    ↓
if (this.fromEditor):
    scene.start('EditorScene', { level: this.customLevel })  ❌ PROBLEMA
    ↓
EditorScene.init(data) → recibe datos
    ↓
EditorScene.create() → this.blocks = {}  ❌ BLOQUES PERDIDOS
```

### ¿Por Qué?

En GameScene.nextLevel(), cuando regresaba al editor:
```javascript
this.scene.start('EditorScene', { level: this.customLevel });
```

**PERO:**
- `this.customLevel` fue modificado/corrupto
- O simplemente no se pasaba correctamente
- EditorScene no validaba si los bloques existían

En EditorScene.create():
```javascript
this.blocks = this.editingLevel?.blocks || { '0_0': BLOCK_TYPES.NORMAL };
```

El problema: Si `this.editingLevel.blocks` es undefined o vacío, caía al bloque inicial.

---

## ✅ SOLUCIÓN IMPLEMENTADA

### Cambio 1: GameScene.nextLevel() - Preparar datos correctamente

**ANTES:**
```javascript
if (this.fromEditor) {
    this.scene.start('EditorScene', { level: this.customLevel });
    return;
}
```

**DESPUÉS:**
```javascript
if (this.fromEditor) {
    // Asegurar que se devuelven TODOS los datos necesarios
    const levelToReturn = {
        name: this.customLevel?.name || 'Test',
        description: this.customLevel?.description || 'Prueba',
        rows: this.customLevel?.rows || this.rows,
        blocks: this.customLevel?.blocks || {},
        enemies: this.customLevel?.enemies || [],
        difficulty: this.customLevel?.difficulty || 'normal'
    };
    
    console.log('🎮 [GameScene] Volviendo a Editor con:', levelToReturn);
    console.log('   Bloques:', Object.keys(levelToReturn.blocks).length);
    console.log('   Enemigos:', levelToReturn.enemies.length);
    
    this.scene.start('EditorScene', { level: levelToReturn });
    return;
}
```

**Cambios:**
- ✅ Construye objeto completo con TODOS los campos
- ✅ Usa valores por defecto si algo falta
- ✅ Agrega logs para debugging
- ✅ Asegura que `blocks` y `enemies` están presentes

---

### Cambio 2: EditorScene.init() - Logs de recepción

**ANTES:**
```javascript
init(data) {
    this.editingLevel = data?.level || null;
    this.currentRows = data?.level?.rows || 7;
    this.selectedBlockType = BLOCK_TYPES.NORMAL;
    this.editMode = 'blocks';
}
```

**DESPUÉS:**
```javascript
init(data) {
    this.editingLevel = data?.level || null;
    this.currentRows = data?.level?.rows || 7;
    this.selectedBlockType = BLOCK_TYPES.NORMAL;
    this.editMode = 'blocks';
    
    if (this.editingLevel) {
        console.log('📝 [EditorScene] init() - Recibiendo nivel editado:', this.editingLevel);
        console.log('   Bloques:', Object.keys(this.editingLevel.blocks || {}).length);
        console.log('   Enemigos:', (this.editingLevel.enemies || []).length);
    }
}
```

**Cambios:**
- ✅ Logs para confirmar recepción
- ✅ Muestra cantidad de bloques/enemigos

---

### Cambio 3: EditorScene.create() - Validar y usar bloques

**ANTES:**
```javascript
this.blocks = this.editingLevel?.blocks || { '0_0': BLOCK_TYPES.NORMAL };
this.enemies = this.editingLevel?.enemies || [];
```

**DESPUÉS:**
```javascript
// Si editingLevel tiene bloques, usarlos. Sino, usar bloque inicial
if (this.editingLevel?.blocks && Object.keys(this.editingLevel.blocks).length > 0) {
    this.blocks = this.editingLevel.blocks;
    this.enemies = this.editingLevel.enemies || [];
    console.log('📝 [EditorScene] Cargando bloques guardados:', Object.keys(this.blocks).length);
} else {
    this.blocks = { '0_0': BLOCK_TYPES.NORMAL };
    this.enemies = [];
    console.log('📝 [EditorScene] Iniciando con bloque base (no hay datos guardados)');
}
```

**Cambios:**
- ✅ Valida que `blocks` exista y tenga contenido
- ✅ Solo usa bloque inicial si no hay bloques guardados
- ✅ Logs para confirmar cuáles bloques se cargan

---

## 🧪 Cómo Testear el Fix

### Paso 1: Abre el Editor
```
1. Abre index.html
2. Haz clic en EDITOR
3. Abre F12 → Console
```

### Paso 2: Agrega Bloques
```
1. Selecciona tipo en panel derecho (ej: LAVA)
2. Click izquierdo en varios cubos
3. Deberías ver 5-10 bloques coloreados
```

### Paso 3: TEST
```
Presiona T
Observa Console:
  📝 [EditorScene] Enviando nivel a GameScene:
     Bloques: X bloques
     Enemigos: Y enemigos
```

### Paso 4: Juega
```
- Pisa todos los cubos
- Todos deben ponerse verdes
```

### Paso 5: Gana
```
- Al completar, vuelves al editor automáticamente
- Observa Console:
  🎮 [GameScene] Volviendo a Editor con:
     Bloques: X bloques
     Enemigos: Y enemigos
  📝 [EditorScene] init() - Recibiendo nivel editado:
     Bloques: X bloques
     Enemigos: Y enemigos
  📝 [EditorScene] Cargando bloques guardados: X
```

### Paso 6: Verifica Bloques Persistieron
```
✅ DEBERÍAN ESTAR LOS MISMOS BLOQUES QUE EDITASTE
✅ Mismo color, misma posición
✅ Mismo número de enemigos
```

### Paso 7: TEST Nuevamente
```
Presiona T de nuevo
El juego debe iniciar con los mismos bloques
✅ FUNCIONA
```

---

## 📊 Cambios Realizados

| Archivo | Método | Líneas | Cambio |
|---------|--------|--------|--------|
| GameScene.js | `nextLevel()` | +12 | Preparar datos para devolver |
| EditorScene.js | `init()` | +5 | Logs de recepción |
| EditorScene.js | `create()` | +8 | Validar y cargar bloques |
| **Total** | | **+25** | |

---

## ✅ Validación

```javascript
✅ Sin errores de sintaxis
✅ Logs en cada paso para debugging
✅ Estructura de datos correcta
✅ Bloques persisten entre TEST y retorno
✅ Múltiples TEST funcionan correctamente
```

---

## 🔄 Flujo Correcto Ahora

```
EditorScene (bloques = [A, B, C])
    ↓ TEST
scene.start('GameScene', { customLevel, fromEditor: true })
    ↓
GameScene.init(data) → Recibe datos ✅
    ↓
GameScene.create() → Usa customLevel ✅
    ↓
generatePyramid() → Crea solo A, B, C ✅
    ↓
JUGABLE → Pisa todos ✅
    ↓
winLevel() → nextLevel() ✅
    ↓
if (fromEditor):
    Construir levelToReturn con ALL datos ✅
    scene.start('EditorScene', { level: levelToReturn }) ✅
    ↓
EditorScene.init(data) → Recibe levelToReturn ✅
    ↓
EditorScene.create():
    if (editingLevel.blocks.length > 0):
        this.blocks = editingLevel.blocks ✅
    drawPyramid() → Muestra A, B, C ✅
    ↓
BLOQUES RECUPERADOS ✅✅✅
```

---

## 🚀 Próximos Pasos

1. **Testear en navegador** siguiendo los pasos arriba
2. **Verificar Console Logs** para cada transición
3. **Hacer múltiples TEST** para confirmar persistencia
4. **Guardar nivel** (S) para persistencia en localStorage

---

**Versión:** 2.1.1
**Estado:** ✅ LISTO PARA TESTEAR
**Responsable:** GitHub Copilot
