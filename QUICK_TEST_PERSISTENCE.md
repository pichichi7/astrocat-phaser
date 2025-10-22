# ✅ QUICK TEST - Persistencia de Bloques

## 🎯 Qué Se Arregló

**Problema:** Bloques desaparecían después del TEST  
**Solución:** Asegurar que los bloques se recuperan al volver del juego  

---

## 🧪 TEST RÁPIDO (5 minutos)

### Paso 1️⃣: Abre el Editor
```
Navega a: file:///c:/Users/sebiche/Desktop/AstrocatPhaser/ASTROCAT/index.html
(O abre index.html en la carpeta ASTROCAT)

Haz clic en: EDITOR (botón naranja)
Abre F12: Console
```

### Paso 2️⃣: Agrega Bloques Visibles
```
Panel derecho: Selecciona LAVA (rojo)
En la pirámide: Click izquierdo en 5-10 cubos
Deberías ver cubos ROJO en la pirámide
```

### Paso 3️⃣: TEST Nivel
```
Presiona: T
O haz clic en: TEST (botón azul)

En Console deberías ver:
  📝 [EditorScene] Enviando nivel a GameScene:
     Bloques: 5-10 bloques
     Enemigos: 0 enemigos
```

### Paso 4️⃣: Juega
```
El juego inicia
Mueve con flechas ⬆️⬅️⬇️➡️
Pisa todos los cubos rojos
Deberían ponerse CYAN al pisarlos
```

### Paso 5️⃣: Gana el Nivel
```
Cuando todos los cubos estén verdes (pisados):
El nivel se completa automáticamente

En Console verás:
  🎮 [GameScene] Volviendo a Editor con:
     Bloques: 5-10 bloques
     Enemigos: 0 enemigos
  📝 [EditorScene] init() - Recibiendo nivel editado:
     Bloques: 5-10 bloques
     Enemigos: 0 enemigos
  📝 [EditorScene] Cargando bloques guardados: 5-10
```

### Paso 6️⃣: ✅ VERIFICAR BLOQUES PERSISTIERON
```
Estás de vuelta en el editor
¿VES LOS MISMOS BLOQUES ROJOS EN LA PIRÁMIDE?

✅ SÍ → FUNCIONA CORRECTAMENTE
❌ NO → Hay un problema

Deberían estar exactamente donde los pusiste.
```

### Paso 7️⃣: Prueba TEST de Nuevo
```
Presiona T otra vez
El juego debe iniciar CON LOS MISMOS BLOQUES

✅ SI APARECEN → ÉXITO
❌ SI NO APARECEN → Revisar consola
```

---

## 📊 Qué Debería Pasar

### Console Logs Esperados

**Primera vez - TEST:**
```
📝 [EditorScene] Enviando nivel a GameScene: 
   Object { name: "Test", rows: 7, blocks: {...}, enemies: [...] }
   Bloques: 8 bloques
   Enemigos: 0 enemigos

🎮 [GameScene] init() - Recibiendo nivel personalizado: 
   Object { ... }
   Desde Editor: true

🎮 [GameScene] create() - Usando nivel personalizado
   Filas: 7
   Bloques personalizados: 8
   Enemigos: 0

🎮 Pirámide generada: 8 cubos creados, 20 saltados
```

**Al Ganar:**
```
🎮 [GameScene] Volviendo a Editor con: 
   Object { name: "Test", rows: 7, blocks: {...}, enemies: [...] }
   Bloques: 8 bloques
   Enemigos: 0 enemigos

📝 [EditorScene] init() - Recibiendo nivel editado: 
   Object { name: "Test", rows: 7, blocks: {...}, enemies: [...] }
   Bloques: 8 bloques
   Enemigos: 0 enemigos

📝 [EditorScene] Cargando bloques guardados: 8
```

**Segunda vez - TEST de nuevo:**
```
📝 [EditorScene] Enviando nivel a GameScene: 
   Bloques: 8 bloques
   Enemigos: 0 enemigos
   
(El juego inicia CON LOS MISMOS BLOQUES)
```

---

## ✅ Indicadores de ÉXITO

- [x] Console muestra logs en cada transición
- [x] Primer TEST funciona
- [x] Bloques visibles después de ganar
- [x] Segundo TEST funciona
- [x] Bloques persisten en múltiples ciclos
- [x] Números de bloques coinciden

---

## ❌ Si NO Funciona

### Síntoma: No veo logs en Console
**Solución:**
1. Abre F12
2. Haz clic en "Console" tab
3. Limpia console (icono 🗑️)
4. Presiona T de nuevo
5. Vuelve a ver

### Síntoma: Bloques desaparecen después de ganar
**Solución:**
1. Abre F12 Console
2. Busca mensaje de error en rojo
3. Copia el error y revísalo

### Síntoma: Juego no inicia
**Solución:**
1. Hard refresh: `Ctrl+Shift+R`
2. Abre F12 Console
3. Busca errores (rojo)

---

## 🎮 Variación: Con Enemigos

Si quieres testear CON enemigos:

```
1. Modo ENEMIGOS (pestaña arriba a la derecha)
2. Click en un cubo para poner enemigo (naranja)
3. Máximo 5 enemigos
4. TEST (T)
5. Enemigos deben aparecer en juego
6. Al ganar, vuelve al editor
7. Enemigos deben estar en misma posición
```

---

## 📝 Checklist de Testing

```
[ ] Abrí el editor
[ ] Agregué bloques visibles (rojos)
[ ] Presioné T → Juego inició
[ ] Vi los logs en Console
[ ] Pisé todos los cubos → Ganador
[ ] Volví al editor automáticamente
[ ] LOS BLOQUES SIGUEN AHÍCILLOQUEAGREQUE
[ ] Presioné T de nuevo → Juego inició CON MISMOS BLOQUES
[ ] Console muestra números consistentes
```

Si marcaste TODO → **✅ COMPLETAMENTE ARREGLADO**

---

## 💡 Qué Se Cambió Técnicamente

1. **GameScene.nextLevel():**
   - Construye objeto `levelToReturn` con TODOS los datos
   - Asegura que `blocks` y `enemies` existen
   - Envía a EditorScene

2. **EditorScene.init():**
   - Recibe datos y agreg logs

3. **EditorScene.create():**
   - Valida que bloques existan antes de usarlos
   - Solo usa bloque inicial si no hay datos

---

**Versión:** 2.1.1  
**Status:** ✅ LISTO PARA TESTEAR  
**Tiempo de Test:** ~5 minutos  
