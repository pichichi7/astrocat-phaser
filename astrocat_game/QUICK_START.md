# 🚀 Guía Rápida de Desarrollo - AstroCat

## ⚡ Setup Rápido (5 minutos)

### 1. Requisitos
- Godot 4.3+ instalado
- Assets básicos (ver abajo)

### 2. Assets Mínimos

Crea dos imágenes simples y colócalas en `art/`:

#### cube_top.png (96x56 px)
```
Crea un rombo/diamante simple en tu editor favorito:
- Color: Gris claro o blanco
- Fondo: Transparente
- El script cambiará el color automáticamente
```

#### astrocat.png (48x64 px)
```
Cualquier sprite simple:
- Un círculo con orejas de gato
- O descarga un sprite de gato gratuito
- Fondo: Transparente
```

### 3. Abrir y Jugar
```bash
1. Abre Godot
2. Import → Selecciona el proyecto
3. Presiona F5
4. ¡Juega!
```

## 🎮 Controles del Juego

```
W / ↑  = Arriba-Izquierda (↖)
D / →  = Arriba-Derecha (↗)
A / ←  = Abajo-Izquierda (↙)
S / ↓  = Abajo-Derecha (↘)
```

## 🧩 Estructura del Código

### Cube.gd
- Sistema de 3 estados (0→1→2)
- Cambio de color automático por estado
- Método `bump_state()` al pisar

### Board.gd
- Genera pirámide de N filas
- Conversión iso_to_screen(row, col)
- Detecta victoria cuando todos los cubos están completados

### Player.gd
- Movimiento diagonal con Tweens
- Sistema de vidas
- Detección de caídas y respawn
- Soporte para swipe móvil

### UI.gd
- Actualiza vidas y progreso
- Mensajes de victoria/game over

## 🔧 Configuración Rápida

### Cambiar Tamaño de Pirámide
```gdscript
# En Board.gd o Inspector
rows = 5  # Pirámide pequeña (5 filas)
rows = 7  # Pirámide media (default)
rows = 9  # Pirámide grande
```

### Ajustar Dificultad
```gdscript
# En Player.gd
lives = 3              # Vidas iniciales
jump_duration = 0.14   # Velocidad (menor = más rápido)
```

### Cambiar Posición de la Pirámide
```gdscript
# En Board.gd
origin = Vector2(540, 160)  # Centro superior
```

## 📐 Matemática Isométrica

### Coordenadas Lógicas
```
Fila 0: 1 cubo   (col 0)
Fila 1: 2 cubos  (col 0, 1)
Fila 2: 3 cubos  (col 0, 1, 2)
...
Fila N: N+1 cubos
```

### Conversión a Pantalla
```gdscript
screen_x = origin_x + (col - row) * (tile_w / 2)
screen_y = origin_y + (col + row) * (tile_h / 2)
```

### Movimientos Diagonales
```
(-1, 0) = ↖ Arriba-Izquierda  (row--)
(0, +1) = ↗ Arriba-Derecha    (col++)
(0, -1) = ↙ Abajo-Izquierda   (col--)
(+1, 0) = ↘ Abajo-Derecha     (row++)
```

## 🎯 Roadmap de Desarrollo

### ✅ Fase 0: Prototipo Básico (COMPLETO)
- [x] Pirámide isométrica
- [x] Movimiento diagonal
- [x] Sistema de vidas
- [x] Detección de victoria
- [x] UI básica

### 🔄 Fase 1: Enemigos Básicos (SIGUIENTE)
```gdscript
# EnemyBall.gd - Bola que baja aleatoriamente
extends Sprite2D
var row: int = 0
var col: int = 0
var move_timer: float = 0.0

func _process(delta):
    move_timer += delta
    if move_timer >= 1.0:  # Mueve cada segundo
        _move_down()
        move_timer = 0.0

func _move_down():
    # Elegir diagonal aleatoria hacia abajo
    if randi() % 2 == 0:
        col -= 1  # ↙
    else:
        row += 1  # ↘
    
    # Actualizar posición visual
    position = board.iso_to_screen(row, col)
    
    # Verificar colisión con jugador
    if row == player.row and col == player.col:
        player.take_damage()
```

### 🐍 Fase 2: Serpiente Coily
```gdscript
# Coily.gd - Persigue al jugador
func _ai_move():
    var dr = player.row - row
    var dc = player.col - col
    
    # Elegir movimiento que reduce distancia
    if abs(dr) > abs(dc):
        if dr > 0:
            _move_to(row + 1, col)  # ↘
        else:
            _move_to(row - 1, col)  # ↖
    else:
        if dc > 0:
            _move_to(row, col + 1)  # ↗
        else:
            _move_to(row, col - 1)  # ↙
```

### ⚡ Fase 3: Power-ups
```gdscript
# Disco.gd - Teletransporte
func _on_player_stepped():
    # Teletransportar jugador arriba
    player.teleport_to(0, 0)
    # Resetear enemigos
    get_tree().call_group("enemies", "reset")
```

## 🐛 Debug y Testing

### Ver Coordenadas
```gdscript
# En Player.gd, añadir a _physics_process:
print("Player pos: ", row, ", ", col)
```

### Modo God (Sin Vidas)
```gdscript
# En Player.gd, comentar:
# func _fall_off():
#     lives -= 1
```

### Verificar Colisiones de Cubos
```gdscript
# En Board.gd
func _check_all_cubes():
    for k in cubes.keys():
        var cb = cubes[k]
        print(k, " - State: ", cb.state)
```

## 💡 Tips de Desarrollo

### 1. Usa Señales para Comunicación
```gdscript
# Board emite:
signal stepped_on(row, col, state)
signal win()

# Player escucha:
board.connect("win", Callable(self, "_on_win"))
```

### 2. Tweens para Animaciones
```gdscript
var tween = create_tween()
tween.tween_property(self, "position", dest, 0.3)
await tween.finished
```

### 3. Exporta Variables Clave
```gdscript
@export var speed: float = 1.0
@export var color: Color = Color.WHITE
# Aparecen en el Inspector!
```

## 📱 Build para Móvil

```bash
# Android
1. Project → Export
2. Add Android export preset
3. Configure signing
4. Export → Export Project

# iOS (requiere Mac)
1. Project → Export
2. Add iOS export preset
3. Export → Export Project
```

## 🎨 Mejoras Visuales Rápidas

### Partículas al Saltar
```gdscript
# Crear GPUParticles2D como hijo del Player
@onready var jump_particles = $JumpParticles

func _try_move(dir):
    jump_particles.emitting = true
    # ... resto del código
```

### Sombras
```gdscript
# Añadir Sprite2D hijo con modulate negro y alpha bajo
@onready var shadow = $Shadow
shadow.modulate = Color(0, 0, 0, 0.3)
shadow.position.y = 10  # Offset hacia abajo
```

## 🚀 Optimización

```gdscript
# Usa object pooling para enemigos
var enemy_pool = []

func get_enemy():
    if enemy_pool.is_empty():
        return EnemyBall.new()
    return enemy_pool.pop_back()

func return_enemy(enemy):
    enemy.visible = false
    enemy_pool.append(enemy)
```

## 📚 Recursos Útiles

- [Godot Docs](https://docs.godotengine.org/)
- [GDScript Reference](https://docs.godotengine.org/en/stable/classes/index.html)
- [Isometric Games Tutorial](https://www.youtube.com/results?search_query=godot+isometric)

---

¡Feliz desarrollo! 🎮✨
