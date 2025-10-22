# 📐 Guía Visual de Matemática Isométrica

## 🎯 Vista de la Pirámide

```
        (0,0)                    Fila 0: 1 cubo
         /\
        /  \
       /____\
      (1,0)(1,1)                 Fila 1: 2 cubos
       /\  /\
      /  \/  \
     /__/\___\
    (2,0)(2,1)(2,2)              Fila 2: 3 cubos
     /\  /\  /\
    /  \/  \/  \
   /__/\__/\___\
  (3,0)(3,1)(3,2)(3,3)           Fila 3: 4 cubos
```

## 📊 Sistema de Coordenadas

### Coordenadas Lógicas (Grid)
```
(row, col)

row = Fila (0 = punta, aumenta hacia abajo)
col = Columna (0 = izquierda, aumenta hacia derecha)

Regla: 0 ≤ col ≤ row
```

### Ejemplo de Pirámide de 4 filas:
```
Fila 0: (0,0)
Fila 1: (1,0) (1,1)
Fila 2: (2,0) (2,1) (2,2)
Fila 3: (3,0) (3,1) (3,2) (3,3)
```

## 🔄 Proyección Isométrica

### Fórmula de Conversión
```gdscript
screen_x = origin_x + (col - row) * (tile_w / 2)
screen_y = origin_y + (col + row) * (tile_h / 2)
```

### Visualización:
```
               Y (pantalla)
               ↑
               |
    ←----------+----------→ X (pantalla)
               |
               ↓

Con tile_w = 96, tile_h = 56:

(0,0) → screen_x = origin_x + (0-0)*48 = origin_x + 0
        screen_y = origin_y + (0+0)*28 = origin_y + 0

(1,0) → screen_x = origin_x + (0-1)*48 = origin_x - 48
        screen_y = origin_y + (0+1)*28 = origin_y + 28

(1,1) → screen_x = origin_x + (1-1)*48 = origin_x + 0
        screen_y = origin_y + (1+1)*28 = origin_y + 56
```

## 🧭 Direcciones de Movimiento

### Vista Isométrica con Direcciones:
```
         ↖ (-1,0)
          \
           \
            \
(0,-1) ←----(·)----→ (0,+1)
          /
         /
        /
       ↙ (+1,0)
```

### Tabla de Movimientos:
```
┌─────────────┬──────────┬───────────┬────────────┐
│ Dirección   │ Vector   │ Δrow      │ Δcol       │
├─────────────┼──────────┼───────────┼────────────┤
│ ↖ Up-Left   │ (-1, 0)  │ row - 1   │ col + 0    │
│ ↗ Up-Right  │ (0, +1)  │ row + 0   │ col + 1    │
│ ↙ Down-Left │ (0, -1)  │ row + 0   │ col - 1    │
│ ↘ Down-Right│ (+1, 0)  │ row + 1   │ col + 0    │
└─────────────┴──────────┴───────────┴────────────┘
```

## 🎮 Mapeo de Controles

### Teclado WASD a Movimientos Iso:
```
    W (↖)
     |
A (↙)-+-D (↗)
     |
    S (↘)

W / ↑ → Vector2(-1, 0) → Arriba-Izquierda
D / → → Vector2(0, +1) → Arriba-Derecha
A / ← → Vector2(0, -1) → Abajo-Izquierda
S / ↓ → Vector2(+1, 0) → Abajo-Derecha
```

## 📏 Cálculo de Ejemplo Completo

### Pirámide de 7 filas con origin en (540, 160):
```gdscript
tile_w = 96.0
tile_h = 56.0
origin = Vector2(540, 160)

# Fila 0 (punta)
(0,0) → (540, 160)

# Fila 1
(1,0) → (540 + (0-1)*48, 160 + (0+1)*28) = (492, 188)
(1,1) → (540 + (1-1)*48, 160 + (1+1)*28) = (540, 216)

# Fila 2
(2,0) → (540 + (0-2)*48, 160 + (0+2)*28) = (444, 216)
(2,1) → (540 + (1-2)*48, 160 + (1+2)*28) = (492, 244)
(2,2) → (540 + (2-2)*48, 160 + (2+2)*28) = (540, 272)
```

## 🎨 Vista Superior vs Isométrica

### Vista Superior (2D Grid):
```
[0,0]
[1,0][1,1]
[2,0][2,1][2,2]
[3,0][3,1][3,2][3,3]
```

### Vista Isométrica (Proyección):
```
      [0,0]
     /    \
  [1,0]  [1,1]
   /  \  /  \
[2,0][2,1][2,2]
  /\  /\  /\
[3,0][3,1][3,2][3,3]
```

## 🔍 Validación de Posiciones

### Función is_valid():
```gdscript
func is_valid(row: int, col: int) -> bool:
    return row >= 0 and row < rows and col >= 0 and col <= row

# Ejemplos para pirámide de 7 filas:
is_valid(0, 0)  → true  ✓
is_valid(3, 2)  → true  ✓
is_valid(3, 4)  → false ✗ (col > row)
is_valid(7, 0)  → false ✗ (row >= rows)
is_valid(-1, 0) → false ✗ (row < 0)
is_valid(3, -1) → false ✗ (col < 0)
```

## 📊 Z-Index para Orden de Dibujado

```
z_index = 10 + row

Fila 0 → z_index = 10  (se dibuja primero, atrás)
Fila 1 → z_index = 11
Fila 2 → z_index = 12
...
Fila 6 → z_index = 16  (se dibuja último, adelante)
```

### Visualización:
```
      (z=10)
       /  \
   (z=11)(z=11)
    /  \  /  \
  (z=12)(z=12)(z=12)    ← Filas inferiores
   /\  /\  /\            se dibujan sobre
                         las superiores
```

## 🚶 Ejemplo de Movimiento Paso a Paso

### Jugador en (2,1) quiere ir a (2,2):

```
Estado Inicial:
    (0,0)
   /    \
 (1,0) (1,1)
  /\   /\
(2,0)(2,1)(2,2)
      👾

Input: D (Arriba-Derecha)
Vector: (0, +1)
Nueva posición: (2, 1+1) = (2,2)

¿Es válida? 
- row=2 >= 0 ✓
- row=2 < 7 ✓
- col=2 >= 0 ✓
- col=2 <= row=2 ✓

¡Movimiento válido!

Estado Final:
    (0,0)
   /    \
 (1,0) (1,1)
  /\   /\
(2,0)(2,1)(2,2)
           👾
```

## 📐 Distancias en Grid Isométrico

### Distancia Manhattan:
```gdscript
func manhattan_distance(r1: int, c1: int, r2: int, c2: int) -> int:
    return abs(r2 - r1) + abs(c2 - c1)

# Ejemplo:
manhattan_distance(0, 0, 3, 2) = |3-0| + |2-0| = 5
```

### Distancia Euclidiana (en coordenadas de pantalla):
```gdscript
func euclidean_distance(pos1: Vector2, pos2: Vector2) -> float:
    return pos1.distance_to(pos2)
```

## 🎯 Pathfinding Básico

### Encontrar vecinos válidos:
```gdscript
func get_neighbors(row: int, col: int) -> Array:
    var neighbors = []
    var directions = [
        Vector2(-1, 0),  # ↖
        Vector2(0, 1),   # ↗
        Vector2(0, -1),  # ↙
        Vector2(1, 0)    # ↘
    ]
    
    for dir in directions:
        var nr = row + int(dir.x)
        var nc = col + int(dir.y)
        if is_valid(nr, nc):
            neighbors.append(Vector2(nr, nc))
    
    return neighbors
```

## 🔢 Cálculo de Total de Cubos

```
Para una pirámide de N filas:
Total de cubos = 1 + 2 + 3 + ... + N
               = N * (N + 1) / 2

Ejemplos:
5 filas → 5 * 6 / 2 = 15 cubos
7 filas → 7 * 8 / 2 = 28 cubos
9 filas → 9 * 10 / 2 = 45 cubos
```

## 🎨 Colores y Estados Visuales

```
Estado 0 (sin pisar):
┌─────┐
│     │ Color.WHITE
│     │ RGB(255, 255, 255)
└─────┘

Estado 1 (pisado una vez):
┌─────┐
│ ≈≈≈ │ Color8(125, 211, 252)
│ ≈≈≈ │ Cyan claro
└─────┘

Estado 2 (objetivo cumplido):
┌─────┐
│ ✓✓✓ │ Color8(52, 211, 153)
│ ✓✓✓ │ Verde esmeralda
└─────┘
```

## 📱 Detección de Swipe (Móvil)

```
Touch Angles para Direcciones:

       -0.8
        |
-2.35 --+-- +2.35
        |
       +0.8

↖ Up-Left:    -2.35 < angle < -0.80
↗ Up-Right:   -0.80 ≤ angle ≤ +0.80
↘ Down-Right: +0.80 < angle < +2.35
↙ Down-Left:  angle > +2.35 || angle < -2.35
```

## 🎮 Animación de Salto

```
Frame Progression:

Start:  (x, y)
  │
  ├─→ Peak:  (x', y - jump_offset * 2)  ← 50% del tiempo
  │
  └─→ Land:  (x', y')                    ← 50% del tiempo

Tween Easing:
- Subida: EASE_OUT (desacelera al llegar arriba)
- Bajada: EASE_IN  (acelera al caer)
```

## 📊 Resumen de Variables Clave

```gdscript
// Board.gd
rows: int = 7           // Número de filas
tile_w: float = 96.0    // Ancho del rombo
tile_h: float = 56.0    // Alto del rombo
origin: Vector2         // Posición de la punta

// Player.gd
row: int                // Posición lógica en fila
col: int                // Posición lógica en columna
jump_duration: float    // Duración del salto
jump_offset_y: float    // Altura visual del jugador
lives: int              // Vidas restantes

// Cube.gd
state: int (0-2)        // Estado del cubo
max_state: int = 2      // Estado máximo
```

---

**¡Con esta guía visual tienes toda la matemática necesaria!** 📐✨

```
     Fórmula Mágica:
     
     x = Ox + (c - r) × W/2
     y = Oy + (c + r) × H/2
     
     ¡Tan simple! 🎯
```
