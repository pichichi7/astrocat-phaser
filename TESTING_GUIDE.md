# 🧪 Guía de Testing del Editor

## Cambios Realizados

### 1. **GeneratePyramid() - Reordenado**
- ✅ Ahora verifica si un bloque existe ANTES de crear el sprite
- ✅ Evita crear sprites innecesarios que luego se ignoran
- ✅ Agrega logs para contar cubos creados vs saltados

### 2. **EditorScene - Bloque Inicial**
- ✅ Ahora inicia con al menos `{ '0_0': BLOCK_TYPES.NORMAL }`
- ✅ Asegura que siempre hay un punto de partida

### 3. **Debug Logs Agregados**
- 📝 EditorScene.testLevel(): Muestra nivel que se envía
- 🎮 GameScene.init(): Confirma recepción de datos
- 🎮 GameScene.create(): Muestra qué nivel se está usando
- 🎮 generatePyramid(): Cuenta cubos creados vs saltados

## Cómo Testear

### Paso 1: Abre la Consola de Navegador
```
F12 → Pestaña "Console"
```

### Paso 2: Ve al Editor
- Haz clic en "EDITOR" desde el menú
- Deberías ver la pirámide en gris

### Paso 3: Agrega Bloques (Modo BLOQUES)
1. Selecciona un tipo de bloque en el panel derecho (ej: LAVA - rojo)
2. Click izquierdo en un cubo para poner ese tipo
3. Click derecho para borrar
4. Observa que el cubo cambia de color

### Paso 4: Agrega Enemigos (Modo ENEMIGOS)
1. Cambia a pestaña "ENEMIGOS"
2. Click en un cubo para poner/quitar enemigo
3. Verás enemigos naranjas en la pirámide

### Paso 5: TEST
1. Presiona **T** o haz clic en **TEST**
2. **Abre la Consola (F12)** si no está abierta
3. **Observa los logs:**
   ```
   📝 [EditorScene] Enviando nivel a GameScene: {...}
   🎮 [GameScene] init() - Recibiendo nivel personalizado: {...}
   🎮 [GameScene] create() - Usando nivel personalizado
   🎮 Pirámide generada: X cubos creados, Y saltados
   ```
4. El juego debe mostrar SOLO los cubos que editaste

### Paso 6: Gana el Nivel
1. Pisa todos los cubos blancos
2. Al ganar, debe volver al editor automáticamente

## Qué Verificar

### ✅ El TEST debería:
1. Mostrar la pirámide con SOLO tus bloques (no toda la pirámide)
2. Mostrar tus enemigos en naranja
3. Permitir jugar normalmente
4. Volver al editor al ganar

### ❌ Si NO funciona:
1. **Abre F12 Console**
2. Busca los logs `📝`, `🎮`
3. Si NO ves logs → El scene.start() no se ejecutó
4. Si ves logs pero no aparece el juego → Error en create()
5. Copia los logs y muestralos

## Ejemplo de Logs Correctos

```
📝 [EditorScene] Enviando nivel a GameScene: 
   Object { name: "Test", description: "Prueba", rows: 5, blocks: {...}, enemies: Array(1) }
   Bloques: 8 bloques
   Enemigos: 1 enemigos

🎮 [GameScene] init() - Recibiendo nivel personalizado: 
   Object { name: "Test", description: "Prueba", rows: 5, blocks: {...}, enemies: Array(1) }
   Desde Editor: true

🎮 [GameScene] create() - Usando nivel personalizado
   Filas: 5
   Bloques personalizados: 8
   Enemigos: 1

🎮 Pirámide generada: 8 cubos creados, 7 saltados
```

## Notas Importantes

- 📋 Los bloques se guardan en diccionario: `{ '0_0': 0, '1_0': 1, '1_1': 2, ... }`
- 🔑 La clave es `row_col`
- 🎨 Los tipos: 0=NORMAL (blanco), 1=LAVA (rojo), 2=ICE (cian), etc.
- ⚠️ Si no ves cambios después de testear: **Hard refresh** (Ctrl+Shift+R)
- 💾 Los niveles se guardan en localStorage, no en servidor

## Comandos Útiles

```
S = Guardar nivel
T = Testear nivel
M = Menú
C = Limpiar nivel
+ = Agregar fila
- = Restar fila
```

---

**Próximo Paso:** Si los logs confirman que todo funciona, veremos cómo mejorar la UI y agregar efectos a los bloques especiales.
