# Sistema de Sprites para Enemigos

## Resumen
Los enemigos ahora tienen dos sprites diferentes para estados idle y movimiento, similar al sistema del jugador.

## Assets Agregados
- **water_enemy.png** - Sprite para estado idle (enemigo quieto)
- **water_enemy_move.png** - Sprite para movimiento (durante animación)

## Archivos Modificados

### 1. Main.tscn
- Agregado `ExtResource("9_water_enemy")` - uid://ey455lvjaypq
- Agregado `ExtResource("10_water_enemy_move")` - uid://bdkli1kkcw7o0
- Actualizado `load_steps` de 9 a 11
- Configurado `enemy_texture` y `enemy_move_texture` en EnemyManager

### 2. EnemyManager.gd
**Nuevas propiedades exportadas:**
```gdscript
@export var enemy_texture: Texture2D        # Sprite idle
@export var enemy_move_texture: Texture2D   # Sprite de movimiento
```

**Función _create_enemy() actualizada:**
```gdscript
# Pasar ambas texturas a cada enemigo
enemy.idle_texture = enemy_texture
enemy.move_texture = enemy_move_texture
```

### 3. Enemy.gd
**Nuevas variables:**
```gdscript
var idle_texture: Texture2D = null
var move_texture: Texture2D = null
```

**Inicialización en _ready():**
```gdscript
# Configurar textura inicial
if idle_texture:
    texture = idle_texture
```

**Cambio de sprite durante movimiento en _move_to():**
```gdscript
# Al iniciar movimiento
if move_texture:
    texture = move_texture

# [Animación de movimiento con tween]

# Al terminar movimiento
if idle_texture:
    texture = idle_texture
```

## Funcionamiento

1. **Estado Idle**: El enemigo muestra `water_enemy.png` cuando está quieto esperando su próximo movimiento
2. **Estado Movimiento**: Durante la animación de desplazamiento (0.2s), el sprite cambia a `water_enemy_move.png`
3. **Transición Suave**: El cambio es instantáneo pero el movimiento con tween hace que se vea fluido

## Diferencias con el Sistema del Jugador

| Característica | Player | Enemy |
|----------------|--------|-------|
| Textura Idle | astrocat.png | water_enemy.png |
| Textura Movimiento | astrocat_jump.png | water_enemy_move.png |
| Duración Movimiento | 0.18s (4 fases) | 0.2s (simple) |
| Transición | Con fade | Instantánea |
| Sprite Flipping | Sí (flip_h) | No implementado |

## Posibles Mejoras Futuras

1. **Sprite Flipping**: Agregar `flip_h` basado en dirección de movimiento
2. **Anticipación**: Agregar fase de anticipación como el jugador
3. **Fade Suave**: Transición con fade entre idle y move
4. **Animación Landing**: Efecto de "splash" al aterrizar
5. **Variaciones**: Diferentes sprites para diferentes tipos de enemigos

## Notas Técnicas

- Los enemigos mantienen `modulate = Color(1.0, 0.3, 0.3)` (tinte rojo) para diferenciarse visualmente
- La escala es `Vector2(0.065, 0.065)` igual que el jugador
- El `sprite_offset_y = 40.0` centra el sprite en los cubos isométricos
- Las texturas se asignan dinámicamente por EnemyManager, permitiendo fácil personalización

## Testing

Para probar:
1. Ejecutar el juego
2. Observar enemigos en estado idle (water_enemy.png)
3. Cuando se mueven, deberían cambiar a water_enemy_move.png brevemente
4. Al finalizar el movimiento, vuelven a water_enemy.png

---
*Última actualización: Sistema de sprites dual para enemigos implementado*
