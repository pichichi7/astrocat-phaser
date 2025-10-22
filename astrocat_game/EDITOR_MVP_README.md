# 🎨 Editor de Niveles MVP - AstroCat

## ✅ Implementación Completa

El editor de niveles MVP está **100% implementado** y funcional. Incluye todas las características solicitadas:

## Archivos Creados

### Core del Editor
- `scripts/LevelData.gd` - Esquema de datos del nivel
- `scripts/LevelCodec.gd` - Codificación/decodificación base64
- `scripts/LevelLoader.gd` - Carga de niveles en el juego
- `scripts/EditorScene.gd` - Lógica principal del editor
- `scripts/MenuScene.gd` - Menú principal
- `scripts/GameManager.gd` - Gestión de carga de niveles en juego

### Escenas
- `scenes/Editor.tscn` - Escena del editor
- `scenes/Menu.tscn` - Menú principal

### Documentación
- `EDITOR_GUIDE.md` - Guía completa del usuario

## Características Implementadas

### ✅ Grid Isométrico Editable
- Mismo tamaño que el juego
- Click/Drag para pintar
- 3-10 filas configurables

### ✅ Paleta de Contenido (Teclas 0-4)
- **0**: Vacío (borrar)
- **1**: Tile jugable
- **2**: Spawn del jugador
- **3**: Enemigo patrulla
- **4**: Enemigo random
- **E**: Alternar enemigos
- **S**: Colocar spawn

### ✅ Barra Lateral Completa
- **Herramientas**: Pintar, Borrar, Spawn, Enemigos
- **Inputs**: Level Name, Rows (3-10)
- **Contadores**: Tiles activos, Enemigos, Estado del spawn
- **Botones**: Nuevo, Probar, Exportar, Importar

### ✅ Validaciones en Vivo
- ✅ Debe existir 1 spawn
- ✅ Al menos 1 tile jugable
- ✅ Límite de enemigos (≤5)
- ✅ Spawn debe estar sobre tile válido
- ✅ Enemigos deben estar sobre tiles válidos

### ✅ Preview Instantánea
- Botón "Probar nivel" carga el nivel en el juego
- Sin recargar la app completa
- Permite iteración rápida

### ✅ Export/Import
- **Exportar**: Copia código base64 al portapapeles
- **Importar**: Pega código desde portapapeles
- **Formato**: Base64 compacto y seguro para URLs

### ✅ Esquema de Datos
```gdscript
class_name LevelData
- rows, cols
- tiles: Array 2D (0=vacío, 1=tile)
- start: {r, c}
- enemies: Array[EnemyInfo]
  - kind: PATROL | RANDOM
  - row, col
  - patrol_pattern: Array
- meta: author, createdAt, version
```

### ✅ Integración con el Juego
- `LevelLoader.load_level()` carga niveles en Main.tscn
- `Board` modificado para soportar tiles inactivos
- `Player` validado para no moverse a tiles inactivos
- Sistema de guardado local (user://levels.cfg)

## Cómo Usar

### Abrir el Editor
1. Ejecuta el juego en Godot
2. En el menú principal, presiona "🎨 Level Editor"

### Crear un Nivel
1. Presiona tecla `1` para activar el pincel de tiles
2. Click/Drag en el grid para pintar tiles
3. Presiona `2` o `S` para colocar el spawn
4. (Opcional) Presiona `3` o `4` para añadir enemigos
5. Verifica que el panel muestre "✅ Ready to play!"

### Probar tu Nivel
1. Presiona "▶️ Test Level"
2. El juego cargará tu nivel automáticamente
3. Juega y prueba el diseño

### Compartir tu Nivel
1. Presiona "📤 Export (Copy)"
2. El código se copia al portapapeles
3. Pégalo en Reddit/Discord/archivo

### Importar un Nivel
1. Copia un código base64 de otro usuario
2. Presiona "📥 Import (Paste)"
3. El nivel se carga automáticamente

## Controles

### Mouse
- **Click Izq**: Pintar/colocar
- **Click Izq + Drag**: Pintar continuo
- **Click Der + Drag**: Mover cámara

### Teclado
- **0-4**: Cambiar herramienta
- **E**: Toggle enemigo A/B
- **S**: Colocar spawn

## Estructura del Código

```
Editor Flow:
1. EditorScene.gd - UI y lógica del editor
   ↓
2. LevelData.gd - Crea/valida el nivel
   ↓
3. LevelCodec.encode_level() - Convierte a base64
   ↓
4. Clipboard - Usuario comparte
   ↓
5. LevelCodec.decode_level() - Convierte de base64
   ↓
6. LevelLoader.load_level() - Carga en el juego
   ↓
7. Board/Player/EnemyManager - Juegan el nivel
```

## Testing

Para probar el editor:

```bash
# 1. Abre Godot
godot astrocat_game/project.godot

# 2. Presiona F5 para ejecutar
# 3. Selecciona "Level Editor"
# 4. Crea un nivel simple
# 5. Presiona "Test Level"
```

## Próximos Pasos

### Mejoras Sugeridas:
- [ ] Undo/Redo
- [ ] Copy/Paste de secciones
- [ ] Plantillas predefinidas
- [ ] Galería de niveles comunitarios
- [ ] Rating system
- [ ] Leaderboards por nivel

### Integración Devvit (Reddit):
- [ ] Post de niveles automático
- [ ] KV store para niveles populares
- [ ] Bot para validar códigos
- [ ] Subreddit dedicado

## Troubleshooting

**El editor no abre:**
- Verifica que todas las escenas estén guardadas
- Revisa la consola de Godot por errores

**Los niveles no se cargan:**
- Asegúrate de que el código base64 esté completo
- Verifica que no tenga espacios adicionales

**Los enemigos no funcionan:**
- En el editor solo se visualizan
- Prueba el nivel con "Test Level" para ver comportamiento real

## Licencia

Parte del proyecto AstroCat.

---

**¡El editor está listo para usar! 🎉**
