# ✅ Editor MVP - Verification Checklist

## 🔧 PASO 1: Recargar Godot (OBLIGATORIO)

Para eliminar el error "Could not resolve class LevelLoader", debes:

### Opción A: Recarga Completa (Recomendado)
```powershell
# 1. Cerrar Godot completamente
# 2. Eliminar caché en PowerShell:
cd "C:\Users\sebiche\Desktop\AstroCat\astrocat_game"
Remove-Item -Recurse -Force ".\.godot"
# 3. Reabrir proyecto en Godot
```

### Opción B: Recarga Rápida
1. En Godot: `Project > Reload Current Project`
2. Si persiste el error, usa Opción A

---

## 🎯 PASO 2: Verificación del Menú Principal

**Ejecutar:** Presiona `F5` en Godot

### ✅ Checklist Menú:
- [ ] Se muestra el menú principal con fondo oscuro
- [ ] Ves 4 botones centrados:
  - [ ] **PLAY** (jugar nivel predeterminado)
  - [ ] **LEVEL EDITOR** (abrir editor)
  - [ ] **LOAD LEVEL CODE** (importar código)
  - [ ] **QUIT** (salir)
- [ ] Los botones cambian de color al pasar el mouse
- [ ] Click en PLAY inicia el juego normal

---

## 🎨 PASO 3: Verificación del Editor

**Ejecutar:** Desde el menú, click en `LEVEL EDITOR`

### ✅ Checklist Interfaz:
- [ ] Se carga una pirámide de cubos (grid 7x7 isométrico)
- [ ] Panel lateral derecho visible con:
  - [ ] Título "🎨 LEVEL EDITOR"
  - [ ] Sección "📊 STATS" con contadores
  - [ ] Sección "🛠️ TOOLS" con 5 botones
  - [ ] Sección "⚙️ ACTIONS" con 5 botones
- [ ] Consola muestra: `🎨 EDITOR SCENE LOADED`

### ✅ Checklist Paleta (Teclas 0-4):
Presiona cada tecla y verifica el mensaje en consola:

| Tecla | Herramienta | Mensaje Esperado |
|-------|-------------|------------------|
| `0` | Vacío | Selected: Empty |
| `1` | Tile | Selected: Tile |
| `2` | Spawn | Selected: Spawn Point |
| `3` | Enemigo Patrulla | Selected: Enemy Patrol |
| `4` | Enemigo Random | Selected: Enemy Random |

- [ ] Teclas cambian la herramienta seleccionada
- [ ] Label "Selected:" se actualiza en el panel

### ✅ Checklist Pintura:
1. Presiona `1` (tile normal)
2. Haz click en un cubo → debe volverse gris oscuro
3. Mantén click y arrastra → debe pintar múltiples cubos
4. Presiona `0` (vacío)
5. Click en un cubo pintado → debe volverse semi-transparente

**Verificar:**
- [ ] Click pinta tiles individuales
- [ ] Click + drag pinta múltiples tiles
- [ ] No se repinta el mismo tile dos veces seguidas
- [ ] Los colores son correctos:
  - Vacío: Gris muy oscuro semi-transparente
  - Tile: Gris medio oscuro
  - Spawn: Azul
  - Enemigos: Rojo

### ✅ Checklist Spawn Point:
1. Presiona `2` (spawn)
2. Click en un tile → debe volverse azul
3. Stats panel debe mostrar: `✅ Has Spawn: Yes`
4. Click en otro tile → el spawn anterior vuelve a ser tile normal
5. Solo debe haber 1 spawn a la vez

**Verificar:**
- [ ] Solo existe 1 spawn point a la vez
- [ ] Spawn se marca en azul
- [ ] Contador "Has Spawn" se actualiza

### ✅ Checklist Enemigos:
1. Presiona `3` (enemigo patrulla)
2. Click en 3 tiles diferentes → deben volverse rojos
3. Stats panel debe mostrar: `👾 Enemies: 3/10`
4. Presiona `4` (enemigo random)
5. Click en 2 tiles más → también rojos, total 5 enemigos
6. Stats panel: `👾 Enemies: 5/10`

**Verificar:**
- [ ] Se pueden colocar hasta 10 enemigos
- [ ] Enemigos se marcan en rojo
- [ ] Contador se actualiza correctamente
- [ ] Ambos tipos de enemigo funcionan

### ✅ Checklist Validaciones:
1. Borra todos los tiles (tecla `0` + click en todos)
2. Panel debe mostrar:
   - `🧱 Active Tiles: 0` (en rojo)
   - `⚠️ Validation: 2 issues` (en rojo)
3. Mensajes de validación:
   - "Missing spawn point"
   - "Not enough active tiles (min 3)"

**Verificar:**
- [ ] Sin spawn → mensaje de error
- [ ] Menos de 3 tiles → mensaje de error
- [ ] Más de 10 enemigos → mensaje de error (prueba añadir 11)
- [ ] Validación se actualiza en tiempo real

### ✅ Checklist Botones de Acción:

#### Botón "NEW LEVEL"
1. Crea un nivel con algunos tiles y enemigos
2. Click en "NEW LEVEL"
3. Debe mostrar ventana de confirmación
4. Click "OK" → nivel se resetea completamente

**Verificar:**
- [ ] Confirmación aparece antes de borrar
- [ ] Grid se limpia completamente
- [ ] Stats se resetean a 0

#### Botón "TEST LEVEL"
1. Crea un nivel válido:
   - Al menos 3 tiles activos
   - 1 spawn point
   - (Opcional) 2-3 enemigos
2. Click en "TEST LEVEL"
3. Debe cargar la escena Main.tscn
4. El nivel personalizado debe estar cargado
5. El gato debe aparecer en el spawn point

**Verificar:**
- [ ] Nivel se carga correctamente en el juego
- [ ] Tiles inactivos son semi-transparentes y no pisables
- [ ] Enemigos aparecen en sus posiciones
- [ ] El juego funciona normalmente

#### Botón "EXPORT CODE"
1. Crea un nivel válido
2. Click en "EXPORT CODE"
3. Debe aparecer ventana de confirmación: "Level code copied to clipboard!"
4. Abre un editor de texto (Notepad)
5. Pega (Ctrl+V) → debe aparecer un código base64 largo

**Formato esperado:**
```
AstroCat_v1_[muchas letras y números]=
```

**Verificar:**
- [ ] Código se copia al portapapeles automáticamente
- [ ] Código empieza con "AstroCat_v1_"
- [ ] Código termina con "="
- [ ] Es una sola línea de texto

#### Botón "IMPORT CODE"
1. Copia un código válido al portapapeles (ej: el que exportaste antes)
2. Click en "IMPORT CODE"
3. Debe aparecer input dialog para pegar el código
4. Pega el código y presiona OK
5. El nivel debe cargarse con todos los tiles y enemigos

**Verificar:**
- [ ] Dialog aparece solicitando el código
- [ ] Código válido se importa correctamente
- [ ] Tiles, spawn y enemigos se cargan
- [ ] Stats se actualizan correctamente
- [ ] Código inválido muestra mensaje de error

#### Botón "BACK TO MENU"
1. Click en "BACK TO MENU"
2. Debe regresar al menú principal

**Verificar:**
- [ ] Regresa al menú sin errores
- [ ] No se pierde el progreso (guardado temporal)

### ✅ Checklist Cámara:
1. Click derecho + drag → la cámara debe moverse
2. Suelta el botón → la cámara se queda en la nueva posición

**Verificar:**
- [ ] Click derecho permite mover la cámara
- [ ] Click izquierdo NO mueve la cámara (solo pinta)
- [ ] La cámara se puede mover libremente

---

## 🎮 PASO 4: Integración con el Juego

### Test Completo del Flujo:
1. Desde el **menú principal**, click en `LEVEL EDITOR`
2. Crea un nivel:
   ```
   - 10 tiles activos en forma de pirámide pequeña
   - 1 spawn en el centro
   - 2 enemigos patrulla
   - 1 enemigo random
   ```
3. Click en `TEST LEVEL`
4. Verifica en el juego:
   - [ ] Gato aparece en el spawn
   - [ ] Solo los tiles activos son jugables
   - [ ] Enemigos aparecen y se mueven
   - [ ] Tiles inactivos son visibles pero no pisables
   - [ ] Si el gato cae de un tile inactivo, pierde vida
5. Presiona `ESC` o termina el nivel
6. Vuelve al editor
7. Click en `BACK TO MENU`
8. Click en `PLAY` → debe cargar el nivel predeterminado original

**Verificar:**
- [ ] Transición Editor → Juego funciona
- [ ] Niveles personalizados funcionan como esperado
- [ ] Juego predeterminado sigue funcionando

---

## 🌐 PASO 5: Sistema de Compartir (Export/Import)

### Test de Export:
1. En el editor, crea un nivel complejo
2. Click en `EXPORT CODE`
3. Copia el código que aparece en el portapapeles
4. Pégalo en un archivo .txt o en Reddit

### Test de Import:
1. Cierra y reabre Godot (o click en `NEW LEVEL`)
2. Click en `IMPORT CODE`
3. Pega el código que guardaste
4. Presiona OK

**Verificar:**
- [ ] El nivel importado es idéntico al exportado
- [ ] Todas las propiedades se preservan (tiles, spawn, enemigos)
- [ ] El código es portable (puedes compartirlo)

---

## 🐛 Troubleshooting

### Error: "Could not resolve class LevelLoader"
**Solución:** Recarga el proyecto (Paso 1)

### Error: "Cannot find Board or Player nodes"
**Causa:** La escena Main.tscn no tiene los nodos necesarios
**Solución:** Verifica que Main.tscn tenga nodos `Board` y `Player`

### El editor no abre / pantalla negra
**Solución:**
1. Verifica que Editor.tscn existe en `res://scenes/`
2. Verifica que EditorScene.gd está vinculado correctamente
3. Revisa la consola de Godot para errores

### Los tiles no se pintan
**Solución:**
1. Verifica que la cámara esté centrada en el board
2. Revisa la consola: debe mostrar "EDITOR SCENE LOADED"
3. Intenta presionar teclas 0-4 antes de hacer click

### El botón TEST LEVEL no funciona
**Causa:** Nivel inválido (sin spawn o menos de 3 tiles)
**Solución:** Asegúrate de tener un nivel válido antes de probar

---

## 📋 Resumen de Estado

### ✅ Archivos Creados (12):
- `scripts/LevelData.gd`
- `scripts/LevelCodec.gd`
- `scripts/LevelLoader.gd`
- `scripts/EditorScene.gd`
- `scripts/MenuScene.gd`
- `scripts/GameManager.gd`
- `scenes/Editor.tscn`
- `scenes/Menu.tscn`
- `EDITOR_GUIDE.md`
- `EDITOR_QUICKSTART.md`
- `EDITOR_STATUS.md`
- `VERIFICATION_CHECKLIST.md` (este archivo)

### ✅ Archivos Modificados (3):
- `scripts/Board.gd` (soporte tiles inactivos)
- `scripts/Player.gd` (validación tiles inactivos)
- `project.godot` (inicio en Menu.tscn)

### ✅ Correcciones Aplicadas (3):
1. Error de indentación en EditorScene.gd (línea 32)
2. UIDs faltantes en Editor.tscn y Menu.tscn
3. LevelLoader.gd recreado completamente

---

## 🎉 Próximos Pasos

Una vez completada la verificación:

1. **Si todo funciona:** ¡Editor MVP completado! 🎊
   - Puedes empezar a crear y compartir niveles
   - Documenta cualquier bug encontrado para mejoras futuras

2. **Si hay errores:**
   - Anota qué checklist items fallan
   - Revisa la consola de Godot para mensajes de error
   - Comparte el error para recibir ayuda

---

## 📚 Documentación Adicional

- **Guía Completa:** `EDITOR_GUIDE.md` (6000+ palabras)
- **Inicio Rápido:** `EDITOR_QUICKSTART.md` (2 minutos)
- **Estado Técnico:** `EDITOR_STATUS.md`

---

**Última Actualización:** [Generado automáticamente]
**Versión Editor:** MVP 1.0
**Estado:** ✅ Listo para verificación
