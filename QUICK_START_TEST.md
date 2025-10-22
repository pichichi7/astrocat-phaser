# 🚀 QUICK START - TEST el Editor Ahora

## 1️⃣ Abre el Juego

Navega a este archivo en tu navegador:
```
file:///c:/Users/sebiche/Desktop/AstrocatPhaser/ASTROCAT/index.html
```

O si estás en la carpeta ASTROCAT, simplemente abre `index.html`

---

## 2️⃣ Abre la Consola

Presiona una de estas combinaciones:
```
Windows/Linux: F12 o Ctrl+Shift+I
Mac: Cmd+Option+I
```

Haz clic en la pestaña **"Console"**

---

## 3️⃣ Menú Inicial

Haz clic en: **EDITOR** (naranja)

---

## 4️⃣ En el Editor

### Ves una pirámide gris
Es normal. Los cubos están listos para editar.

### Panel Derecho
**BLOQUES** (está seleccionado):
- Blanco: Normal
- Rojo: Lava
- Cyan: Hielo
- Amarillo: Trampolín
- Gris oscuro: Púa
- Gris claro: Nube
- Magenta: Diamante

### Para Editar

**Click Izquierdo en un cubo:**
- Pone un bloque del tipo seleccionado
- El cubo cambia de color

**Click Derecho en un cubo:**
- Quita el bloque
- El cubo vuelve gris

**Seleccionar Tipo:**
- Haz clic en el color en el panel derecho
- Ahora todos tus clicks izquierdos ponen ese tipo

---

## 5️⃣ Agrega Enemigos

1. **Pestaña ENEMIGOS** (arriba a la derecha)
2. **Click en un cubo**: Pone/quita enemigo
3. Verás un sprite naranja en ese cubo

Máximo: 5 enemigos

---

## 6️⃣ TEST

### Opción A: Botón
Haz clic en **TEST (T)** (azul)

### Opción B: Atajo de Teclado
Presiona: **T**

---

## 7️⃣ Observa Consola (IMPORTANTE)

**En la ventana de Console (F12) deberías ver:**

```
📝 [EditorScene] Enviando nivel a GameScene: 
   Bloques: X bloques
   Enemigos: Y enemigos

🎮 [GameScene] init() - Recibiendo nivel personalizado: 
   Desde Editor: true

🎮 [GameScene] create() - Usando nivel personalizado
   Filas: 7
   Bloques personalizados: X
   Enemigos: Y

🎮 Pirámide generada: X cubos creados, Y saltados
```

Si **NO ves estos logs**, algo no funciona correctamente.

---

## 8️⃣ Juega

El juego se abre automáticamente con tus bloques.

1. **Selecciona personaje:** Click en cualquier lugar
2. **Movimiento:**
   - Flechas del teclado ⬆️⬅️⬇️➡️
   - O swipe en móvil
3. **Objetivo:** Pisa todos los cubos blancos
   - Cuando pisas: blanco → cyan
   - Cuando pisas todos: cyan → verde

---

## 9️⃣ Gana

Cuando todos los cubos estén verdes (pisados), ¡ganaste!

El juego te regresa automáticamente al editor.

---

## 🔟 Continúa Editando

Estás de vuelta en el editor. Puedes:
- **Editar más:** Agregar/quitar bloques
- **TEST de nuevo:** Presiona T
- **Guardar:** Presiona S

---

## 📋 Atajos de Teclado

| Tecla | Acción |
|-------|--------|
| **T** | TEST (jugar nivel) |
| **S** | GUARDAR (guardar en localStorage) |
| **M** | MENÚ (volver a menú) |
| **C** | LIMPIAR (borrar todos los bloques) |
| **+** | Agregar fila |
| **-** | Restar fila |

---

## ⚠️ Problemas Comunes

### "No veo los logs en Consola"
1. Abre F12
2. Haz clic en "Console" 
3. Presiona T nuevamente
4. Los logs deben aparecer

### "Solo aparecen bloques grises"
1. Selecciona tipo en panel derecho (ej: LAVA)
2. Click izquierdo en cubos
3. Deberían cambiar de color

### "El juego no inicia"
1. Abre F12 Console
2. Busca mensajes en rojo (errores)
3. Si hay error, cópialo y muestraló

### "Los cambios no se ven"
```
Presiona: Ctrl+Shift+R (limpia caché)
```

---

## ✅ Verificación

Cuando presiones TEST, en la consola deberías ver:

- ✅ `📝 [EditorScene]` - Editor envía datos
- ✅ `🎮 [GameScene] init()` - GameScene recibe datos
- ✅ `🎮 [GameScene] create()` - GameScene usa datos
- ✅ `🎮 Pirámide generada` - Se crean solo los cubos editados

Si ves los 4 logs, **¡está funcionando correctamente!**

---

## 📸 Pantalla Esperada

### Editor
```
Pirámide con cubos (algunos coloridos, otros grises)
Panel derecho con tipos de bloque
Botones arriba: TEST, GUARDAR, etc.
```

### Después de TEST
```
Juego en pantalla
Solo los cubos que editaste
Enemigos naranjas (si agregaste)
Personaje jugable
```

### Al Ganar
```
Atrás a editorScene automáticamente
Puedes editar más o TEST de nuevo
```

---

## 🎮 Ejemplo Mínimo para Testear

1. Abre Editor
2. En el panel derecho: selecciona LAVA (rojo)
3. Click izquierdo en cubo del medio
4. Ver que se pone rojo
5. Presiona T
6. Ver console logs
7. Juego inicia con 1 cubo rojo
8. Pisa el cubo
9. Vuelve al editor
10. ✅ FUNCIONA

---

## 🆘 Si Todo Falla

1. **Hard Refresh:** `Ctrl+Shift+R`
2. **Consola abierta:** `F12 → Console`
3. **Haz screenshot:** De los errores (si los hay)
4. **Revisa:** TESTING_GUIDE.md para más detalles

---

**Listo? Abre el HTML y ¡que comience el TEST!** 🚀

---

Archivo: `QUICK_START.md`  
Versión: 2.1  
Estado: ✅ Listo para usar
