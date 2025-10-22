# Sistema de Sprites y Animación - AstroCat Game

## 🎨 Sprites Implementados

### Texturas Actuales
1. **astrocat.png** - Sprite en reposo (idle)
2. **astrocat_jump.png** - Sprite durante el salto
3. **cube_top.png** - Textura de los cubos del tablero

## 🔄 Sistema de Espejamiento (Flip)

### ¿Qué es el Espejamiento?
El espejamiento (flip) permite usar **un solo sprite** y voltearlo horizontalmente según la dirección del movimiento, ahorrando tiempo y recursos.

### Implementación Actual

#### Propiedad utilizada: `flip_h`
- `flip_h = false` → Sprite mirando a la derecha
- `flip_h = true` → Sprite mirando a la izquierda

#### Lógica de Dirección
En el sistema isométrico del juego:

| Dirección | Vector | Flip |
|-----------|--------|------|
| Diagonal Arriba-Izquierda | (-1, 0) | `true` |
| Diagonal Arriba-Derecha | (0, +1) | `false` |
| Diagonal Abajo-Izquierda | (0, -1) | `true` |
| Diagonal Abajo-Derecha | (+1, 0) | `false` |

```gdscript
if dir.x == -1 or dir.y == -1:  # Hacia la izquierda
    flip_h = true
elif dir.x == 1 or dir.y == 1:  # Hacia la derecha
    flip_h = false
```

## 🎬 Sistema de Cambio de Sprites

### Cambio Dinámico Durante el Salto

**En _try_move():**
```gdscript
# Antes del salto
texture = jump_texture  # Cambia a sprite de salto

# Animación de salto...

# Después del aterrizaje
texture = idle_texture  # Vuelve a sprite en reposo
```

### Flujo de Animación
1. Jugador presiona tecla de movimiento
2. Se actualiza `flip_h` según la dirección
3. Se cambia a `jump_texture` (astrocat_jump.png)
4. Se ejecuta animación de salto con tweens
5. Se vuelve a `idle_texture` (astrocat.png)
6. El sprite queda orientado en la dirección correcta

## 📝 Configuración en el Inspector

### Nodo Player (Sprite2D)
- **Texture**: astrocat.png (sprite inicial)
- **Idle Texture**: astrocat.png (sprite en reposo)
- **Jump Texture**: astrocat_jump.png (sprite de salto)
- **Scale**: Vector2(0.065, 0.065)
- **Offset**: Vector2(0, 20)

## 🎯 Ventajas del Sistema Actual

✅ **Eficiente**: Solo 2 sprites para múltiples direcciones
✅ **Flexible**: Fácil agregar más sprites (caída, daño, etc.)
✅ **Automático**: El espejamiento se maneja en código
✅ **Consistente**: La orientación se mantiene entre movimientos

## 🚀 Mejoras Futuras Sugeridas

### 1. Más Sprites de Animación
- **astrocat_land.png**: Al aterrizar
- **astrocat_hurt.png**: Al recibir daño
- **astrocat_celebrate.png**: Al completar nivel
- **astrocat_fall.png**: Al caer del tablero

### 2. Animación por Frames (SpriteSheet)
Crear un spritesheet con múltiples frames:
```
[Idle_1] [Idle_2] [Idle_3] [Idle_4]
[Jump_1] [Jump_2] [Jump_3] [Jump_4]
[Land_1] [Land_2] [Walk_1]  [Walk_2]
```

### 3. AnimatedSprite2D
Usar nodo `AnimatedSprite2D` en lugar de `Sprite2D`:
- Permite animaciones suaves frame-por-frame
- Gestión automática de frames
- Transiciones entre animaciones

### 4. Partículas
Agregar efectos visuales:
- Polvo al aterrizar
- Estrellas al saltar
- Trail durante el movimiento

## 📖 Cómo Agregar Nuevos Sprites

### Paso 1: Agregar el archivo
Coloca el sprite en `art/` (ejemplo: `astrocat_hurt.png`)

### Paso 2: Crear variables en Player.gd
```gdscript
@export var hurt_texture: Texture2D
```

### Paso 3: Configurar en Main.tscn
```gdscript
hurt_texture = ExtResource("X_astrocat_hurt")
```

### Paso 4: Usar en el código
```gdscript
func _hit_by_enemy():
    texture = hurt_texture  # Cambiar a sprite de daño
    # ... animación de daño ...
    texture = idle_texture  # Volver a reposo
```

## 🔧 Propiedades Adicionales de Sprite2D

### Flip
- `flip_h`: Espejamiento horizontal
- `flip_v`: Espejamiento vertical

### Transform
- `rotation`: Rotación en radianes
- `scale`: Escala (Vector2)
- `skew`: Distorsión

### Visual
- `modulate`: Color/tinte (Color)
- `self_modulate`: Modulación sin afectar hijos
- `offset`: Desplazamiento del sprite
- `centered`: Centrar sprite en el pivot

### Ejemplo de Uso
```gdscript
# Hacer el sprite más grande y rojo
scale = Vector2(0.08, 0.08)
modulate = Color(1.0, 0.5, 0.5)

# Rotar ligeramente
rotation = deg_to_rad(15)
```

## 🎮 Otros Efectos Sin Sprites Adicionales

### Squash & Stretch
```gdscript
# Al aterrizar
scale.y = 0.06  # Aplastar
scale.x = 0.07  # Ensanchar
# ... animar de vuelta a 0.065 ...
```

### Rotación Durante Salto
```gdscript
tween.tween_property(self, "rotation", deg_to_rad(360), jump_duration)
```

### Efecto de Parpadeo (Ya implementado)
```gdscript
tween.tween_property(self, "modulate:a", 0.3, 0.1)
tween.tween_property(self, "modulate:a", 1.0, 0.1)
```

## 📚 Recursos Recomendados

### Para crear sprites:
- **Piskel**: Editor de pixel art online gratuito
- **Aseprite**: Software profesional de pixel art
- **GIMP**: Editor de imágenes gratuito

### Para animaciones:
- Buscar spritesheets gratuitos en itch.io
- OpenGameArt.org
- Kenney.nl (assets gratuitos)

### Tamaños Recomendados
Para el estilo actual (0.065 scale):
- Sprite original: ~1500x1500 px
- Sprite más pequeño: ~500x500 px (más eficiente)
- Animaciones: 64x64 o 128x128 por frame
