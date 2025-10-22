# 🎨 AstroCat Level Editor - Guía Completa

## Descripción

El Editor de Niveles MVP permite crear, editar y compartir niveles personalizados para AstroCat. Es completamente funcional y está diseñado para ser intuitivo y poderoso.

## Características Principales

### ✅ Grid Isométrico Editable
- **Mismo tamaño que el juego**: El editor usa el mismo sistema de grid que el juego
- **Pirámide configurable**: 3-10 filas
- **Click/Drag**: Pinta tiles continuamente mientras mantienes presionado el botón

### ✅ Sistema de Paleta (Teclas 0-4)

| Tecla | Contenido | Descripción |
|-------|-----------|-------------|
| **0** | Vacío | Borra tiles (los hace inactivos) |
| **1** | Tile Jugable | Tile normal donde el jugador puede caminar |
| **2** | Spawn | Punto de inicio del jugador (solo 1) |
| **3** | Enemigo Patrulla | Enemigo que sigue un patrón fijo |
| **4** | Enemigo Random | Enemigo con movimiento aleatorio |

**Atajos adicionales:**
- `E`: Alterna entre enemigo tipo A (patrulla) y tipo B (random)
- `S`: Acceso rápido a colocar spawn

### ✅ Barra Lateral - Panel de Control

**Información en tiempo real:**
- 📊 **Contador de Cubos Activos**: Muestra cuántos tiles están habilitados
- 👾 **Contador de Enemigos**: Total de enemigos en el nivel
- ✅/❌ **Estado del Spawn**: Indica si el spawn está correctamente colocado

**Herramientas:**
- 🖌️ **Pintar**: Coloca tiles del tipo seleccionado
- 🗑️ **Borrar**: Elimina tiles (tecla 0)
- 📍 **Spawn**: Coloca el punto de inicio
- 👾 **Enemigos**: Tipos patrol y random

**Configuración:**
- **Level Name**: Nombre de tu nivel
- **Rows**: Tamaño del grid (3-10 filas)

**Acciones:**
- 🆕 **Nuevo**: Crea un nivel en blanco
- ▶️ **Probar**: Carga el nivel en el juego
- 📤 **Exportar**: Copia código base64 al portapapeles
- 📥 **Importar**: Pega código desde portapapeles
- ⬅️ **Volver**: Regresa al menú principal

### ✅ Validaciones en Vivo

El editor valida automáticamente:

1. ✅ **Spawn obligatorio**: Debe existir exactamente 1 punto de inicio
2. ✅ **Tiles jugables**: Al menos 1 tile debe estar activo
3. ✅ **Límite de enemigos**: Máximo 5 enemigos por nivel
4. ✅ **Spawn en tile válido**: El spawn debe estar sobre un tile activo
5. ✅ **Enemigos en tiles válidos**: Los enemigos deben estar sobre tiles activos

El panel muestra:
- 🟢 **"✅ Ready to play!"** si todo está correcto
- 🔴 **Mensaje de error** si falta algo

### ✅ Preview Instantánea

**Botón "Probar nivel":**
- Guarda el nivel temporalmente
- Carga la escena de juego con tu nivel
- Sin recargar toda la app
- Permite iterar rápidamente en el diseño

### ✅ Export/Import

**Exportar:**
1. Presiona `📤 Export (Copy)`
2. El código base64 se copia automáticamente al portapapeles
3. Pégalo en Reddit, Discord, o guárdalo en un archivo

**Importar:**
1. Copia un código base64 de un nivel
2. Presiona `📥 Import (Paste)`
3. El nivel se carga automáticamente

**Formato del código:**
- Base64 compacto
- Seguro para URLs
- Fácil de compartir en Reddit/Discord

## Controles del Editor

### Mouse
- **Click Izquierdo**: Pintar/colocar según herramienta activa
- **Click + Drag**: Pintar continuamente (modo brocha)
- **Click Derecho + Drag**: Mover la cámara

### Teclado
- **0-4**: Cambiar tipo de contenido
- **E**: Toggle entre enemigo A/B
- **S**: Colocar spawn rápidamente

## Flujo de Trabajo Recomendado

1. **Crear estructura básica**:
   - Presiona `1` y pinta los tiles principales
   - Define la forma general del nivel

2. **Colocar spawn**:
   - Presiona `2` o `S`
   - Click en el tile de inicio

3. **Añadir enemigos** (opcional):
   - Presiona `3` para patrulla o `4` para random
   - Click en los tiles donde quieres enemigos

4. **Validar**:
   - Revisa el panel para asegurar que no hay errores
   - Debe mostrar "✅ Ready to play!"

5. **Probar**:
   - Presiona `▶️ Test Level`
   - Juega tu nivel

6. **Exportar y compartir**:
   - Presiona `📤 Export (Copy)`
   - Comparte el código en Reddit con formato:
     ```
     [AstroCat] Mi nivel épico!
     Code: <código_base64_aquí>
     ```

## Esquema de Datos del Nivel

Los niveles se guardan en formato JSON con este esquema:

```json
{
  "id": "nivel_123",
  "name": "Mi Nivel Épico",
  "rows": 7,
  "cols": 7,
  "tiles": [
    [1],
    [1, 1],
    [1, 1, 1],
    ...
  ],
  "start": { "r": 0, "c": 0 },
  "enemies": [
    {
      "kind": "patrol",
      "r": 2,
      "c": 1,
      "patrol": [[2,0], [2,1], [2,2]]
    }
  ],
  "meta": {
    "author": "u/tu_usuario",
    "createdAt": 1697500000,
    "version": 1
  }
}
```

## Integración con Reddit

### Para Jugadores:

**Compartir tu nivel:**
```markdown
[AstroCat Level] The Tower Challenge 🗼

Mi nivel más difícil! Requiere timing perfecto.

Code: eyJpZCI6IiIsIm5hbWUiOiJUaGUgVG93ZXIiLCJyb3dzI...

Difficulty: ⭐⭐⭐⭐⭐
Enemies: 5
```

**Cargar nivel de otro usuario:**
1. Copia el código base64 del post
2. Abre AstroCat → Level Editor
3. Presiona `📥 Import (Paste)`
4. Presiona `▶️ Test Level`

### Para Desarrolladores (Futuro):

Con Devvit se puede:
- Guardar niveles populares en KV store
- Crear leaderboard de niveles más jugados
- Sistema de rating/votos
- Galería de niveles destacados

## Guardado Local

Los niveles se guardan en:
```
user://levels.cfg
```

Puedes guardar hasta 1000 niveles localmente (slots 0-999).

El slot 999 es reservado para "Test Level" del editor.

## Tips y Trucos

### Diseño de Niveles

1. **Empieza simple**: Pocos tiles, 1-2 enemigos
2. **Prueba frecuentemente**: Usa `▶️ Test Level` constantemente
3. **Piensa en el camino**: El jugador debe poder llegar a todos los tiles
4. **Balance de dificultad**: Más enemigos ≠ más divertido
5. **Usa patrones**: Los enemigos de patrulla crean puzzles predecibles

### Performance

- Niveles de 7 filas son el óptimo
- Más de 5 enemigos puede causar lag
- Mantén el grid bajo 10 filas

### Compartir

- Incluye descripción del nivel
- Menciona la dificultad estimada
- Comparte screenshots si es posible
- Usa tags: `[AstroCat]` `[Easy]` `[Hard]` `[Puzzle]`

## Próximas Características (Roadmap)

- [ ] Sistema de undo/redo
- [ ] Copiar/pegar secciones del nivel
- [ ] Plantillas pre-diseñadas
- [ ] Galería de niveles de la comunidad
- [ ] Rating system
- [ ] Leaderboards por nivel
- [ ] Editor de patrones de enemigos personalizados
- [ ] Música/SFX personalizados
- [ ] Temas visuales alternativos

## Troubleshooting

**El nivel no se carga al probar:**
- Verifica que todas las validaciones están en verde
- Asegúrate de que el spawn está sobre un tile activo

**El código exportado no funciona:**
- Copia el código completo (puede ser largo)
- Verifica que no tenga espacios o saltos de línea

**Los enemigos no se mueven:**
- Esto es normal en el editor (solo visualización)
- Prueba el nivel con `▶️ Test Level` para ver el comportamiento

**La cámara se movió mucho:**
- Click derecho + drag para reposicionar
- O reinicia el editor

## Contribuir

¿Quieres mejorar el editor? Revisa el código en:
- `scripts/EditorScene.gd` - Lógica principal del editor
- `scripts/LevelData.gd` - Esquema de datos
- `scripts/LevelCodec.gd` - Serialización
- `scripts/LevelLoader.gd` - Carga de niveles

---

¡Diviértete creando niveles! 🐱🚀
