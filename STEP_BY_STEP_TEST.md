# 🚀 INSTRUCCIONES - Testear Fix de Persistencia

## 📌 Lo Que Se Arregló

**Problema:** Bloques desaparecían después del TEST  
**Solución:** Asegurar que bloques se recuperan al volver del juego  

---

## ⏱️ TIEMPO ESTIMADO: 5 MINUTOS

---

## 🎮 PASO A PASO

### 1️⃣ Prepara el Navegador

```
1. Abre: c:\Users\sebiche\Desktop\AstrocatPhaser\ASTROCAT\index.html
   (O simplemente abre index.html del folder ASTROCAT)

2. Presiona F12 para abrir Developer Tools
   (En Windows: F12 o Ctrl+Shift+I)

3. Haz clic en la pestaña "Console"
   (Es donde aparecen los mensajes)

4. Limpia la consola si hay mensajes previos
   (Icono 🗑️ arriba)
```

### 2️⃣ Ve al Editor

```
En el juego:
- Haz clic en "EDITOR" (botón naranja)

Deberías ver:
- Una pirámide de cubos grises
- Panel derecho con tipos de bloque
- Botones arriba: TEST, GUARDAR, etc.
```

### 3️⃣ Agrega Bloques Visibles

```
En panel derecho:
1. Haz clic en LAVA (rojo)
   Selecciona cualquier tipo (rojo es fácil de ver)

En la pirámide:
2. Click IZQUIERDO en 5-10 cubos
   Deberían cambiar a rojo

3. Verifica que ves cubos rojos en la pirámide

En console (abajo):
Deberías ver logs verdes como:
📝 [EditorScene] Cargando bloques guardados: X
```

### 4️⃣ TEST el Nivel

```
Presiona una de estas opciones:
A) Botón "TEST (T)" en pantalla (azul)
B) Tecla "T" en tu teclado

En Console deberías ver:
📝 [EditorScene] Enviando nivel a GameScene: 
   Bloques: 5-10 bloques
   Enemigos: 0 enemigos

🎮 [GameScene] init() - Recibiendo nivel personalizado: 
   Desde Editor: true

🎮 [GameScene] create() - Usando nivel personalizado
   Bloques personalizados: 5-10

🎮 Pirámide generada: 5-10 cubos creados, XX saltados
```

### 5️⃣ Juega el Nivel

```
El juego debe abrir con tus cubos rojos

Controles:
- Flechas ⬆️⬅️⬇️➡️ para mover
- O swipe en móvil

Objetivo:
- Pisa cada cubo
- Cubo blanco → Cubo cyan (cuando lo pisas)
- Todos cyan → Todos verde (cuando ganas)

Tarea: Pisa TODOS los cubos
```

### 6️⃣ Gana el Nivel

```
Cuando todos los cubos estén verdes:
- Nivel completado
- Vuelves al editor AUTOMÁTICAMENTE

En Console verás:
🎮 [GameScene] Volviendo a Editor con: 
   Bloques: 5-10 bloques
   Enemigos: 0 enemigos

📝 [EditorScene] init() - Recibiendo nivel editado: 
   Bloques: 5-10 bloques

📝 [EditorScene] Cargando bloques guardados: 5-10
```

### 7️⃣ ✅ VERIFICACIÓN CRÍTICA

```
Ahora en EditorScene (de vuelta en editor):

¿VES LOS MISMOS CUBOS ROJOS?
✅ SÍ → FUNCIONA CORRECTAMENTE ✅
❌ NO → Algo no funcionó

Si VES los cubos:
- Deben estar en la MISMA POSICIÓN que los pusiste
- Deben ser del MISMO COLOR (rojo/lava)
- Deben ser la MISMA CANTIDAD (5-10)
```

### 8️⃣ TEST DE NUEVO

```
Si los bloques están ahí:

Presiona T de nuevo
El juego debe iniciar NUEVAMENTE con los mismos cubos

Si funciona → ✅ ARREGLADO
Si no funciona → Revisar consola para errores
```

---

## 📊 CONSOLA - QUÉ ESPERAR

### Logs Correctos (Verde = Bien)

```
📝 = Mensaje de EditorScene (naranja)
🎮 = Mensaje de GameScene (azul)
```

### Consola - Línea por Línea

**Cuando presionas TEST:**
```
📝 [EditorScene] Enviando nivel a GameScene: 
   Object { name: "Test", description: "Prueba", rows: 7, blocks: {...} }
   Bloques: 8 bloques
   Enemigos: 0 enemigos
```

**Cuando GameScene inicia:**
```
🎮 [GameScene] init() - Recibiendo nivel personalizado: 
   Object { name: "Test", ... }
   Desde Editor: true

🎮 [GameScene] create() - Usando nivel personalizado
   Filas: 7
   Bloques personalizados: 8
   Enemigos: 0

🎮 Pirámide generada: 8 cubos creados, 20 saltados
```

**Cuando ganas:**
```
🎮 [GameScene] Volviendo a Editor con: 
   Object { name: "Test", rows: 7, blocks: {...}, enemies: [...] }
   Bloques: 8 bloques
   Enemigos: 0 enemigos

📝 [EditorScene] init() - Recibiendo nivel editado: 
   Object { name: "Test", rows: 7, blocks: {...} }
   Bloques: 8 bloques
   Enemigos: 0 enemigos

📝 [EditorScene] Cargando bloques guardados: 8
```

---

## ❌ Si ALGO SALE MAL

### Problema 1: No veo logs en Console

**Solución:**
1. Haz clic en Console (si no está abierta)
2. Presiona Ctrl+K para limpiar
3. Presiona T de nuevo
4. Deberían aparecer los logs

### Problema 2: Bloques NO aparecen después de ganar

**Solución:**
1. Abre F12 Console
2. Busca mensajes en ROJO (errores)
3. Si hay error, léelo cuidadosamente
4. Copia el error y compáralo con los logs esperados

### Problema 3: Juego no inicia

**Solución:**
1. Hard refresh: Presiona `Ctrl+Shift+R`
2. Abre F12 → Console
3. Presiona T
4. Mira qué error aparece

### Problema 4: "Consola limpia" pero luego TEST

**Solución:**
1. Presiona TEST
2. INMEDIATAMENTE mira console
3. Los logs aparecerán en tiempo real

---

## ✅ CHECKLIST FINAL

Marca cada paso conforme lo completes:

```
[ ] Abrí index.html
[ ] Abrí F12 Console
[ ] Fui a EDITOR
[ ] Agregué 5+ bloques de color diferente al gris
[ ] Presioné T
[ ] Vi logs en console (con "Bloques: X")
[ ] Juego inició con mis bloques
[ ] Pisé todos los cubos
[ ] Todos se pusieron verdes
[ ] Volví al editor automáticamente
[ ] ✅ VEO LOS MISMOS BLOQUES QUE PUSE
[ ] Presioné T de nuevo
[ ] Juego inició CON LOS MISMOS BLOQUES
[ ] Console mostró "Bloques: X" (mismo número)
```

**Si marcaste TODO:** ✅✅✅ **COMPLETAMENTE ARREGLADO** ✅✅✅

---

## 📸 PANTALLA ESPERADA

### Editor (inicio):
```
Pirámide gris con cubos
Panel derecho: tipos de bloque
Botones: TEST, GUARDAR, etc.
```

### Después de agregar bloques:
```
Pirámide MIXTA: gris y colores
(Los que editaste = colores, los demás = gris)
```

### Juego:
```
Pantalla negra con cubos rojos
Personaje jugable en el centro
```

### Al Ganar:
```
Vuelve a editor automáticamente
MISMOS BLOQUES ESTÁN PRESENTES
```

### Segundo TEST:
```
Juego inicia CON MISMOS BLOQUES
```

---

## 💡 NOTES TÉCNICAS

- Los bloques se guardan en un diccionario: `{ '0_0': tipo, '1_0': tipo, ... }`
- Los enemigos se guardan en un array: `[ { row, col, type }, ... ]`
- Todo se recupera al volver del juego
- Los logs te ayudan a ver qué está pasando

---

## 🎯 OBJETIVO

El TEST debe funcionar:
1. ✅ Primera vez
2. ✅ Luego vuelves con tus bloques
3. ✅ Segunda vez (TEST de nuevo)
4. ✅ Y así en bucle

---

**Versión:** 2.1.1  
**Tiempo:** ~5 minutos  
**Dificultad:** Muy simple  
**Estado:** ✅ Listo para testear  

---

¿LISTO? Abre `index.html` y comienza en Paso 1️⃣ 🚀
