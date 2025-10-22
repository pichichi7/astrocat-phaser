# Sistema de Enemigos - AstroCat Game

## Descripción
Se ha implementado un sistema de enemigos que patrullan el tablero isométrico, añadiendo dificultad al juego.

## Características

### Enemigos
- **Apariencia**: Usan el mismo sprite que AstroCat pero con un tinte rojo (modulación de color)
- **Movimiento**: Se mueven automáticamente por el tablero cada 1.5 segundos (con variación aleatoria)
- **Comportamiento**: Movimiento aleatorio a casillas adyacentes válidas
- **Z-index**: 100 (mismo nivel que el jugador)

### Colisiones
Cuando un enemigo toca al jugador:
- El jugador pierde una vida
- Efecto visual de parpadeo (daño)
- El jugador respawnea en la posición inicial (0, 0)
- Si se quedan sin vidas → Game Over

### Sistema de Gestión

#### EnemyManager.gd
Controla la generación y gestión de enemigos:
- **num_enemies**: Cantidad de enemigos (por defecto: 3)
- **enemy_move_interval**: Intervalo de movimiento en segundos (por defecto: 1.5)
- Posiciones aleatorias al inicio (evita la posición inicial del jugador)
- Cada enemigo tiene una velocidad ligeramente diferente

#### Enemy.gd
Script individual de cada enemigo:
- **Movimiento aleatorio**: Elige direcciones válidas aleatoriamente
- **Patrón de patrullaje**: Soporta movimiento por patrón (array de posiciones)
- **Detección de colisión**: Verifica si está en la misma posición que el jugador
- **Animación suave**: Transición visual entre casillas

### Scripts Modificados

#### Player.gd
Añadidos:
- Grupo "player" para que los enemigos lo encuentren
- Función `_hit_by_enemy()`: Maneja el daño recibido
- Efecto de parpadeo al recibir daño

## Configuración

### En el Inspector de Godot

**EnemyManager**:
- `Num Enemies`: Cantidad de enemigos (1-10 recomendado)
- `Enemy Move Interval`: Velocidad de los enemigos (1.0-3.0 segundos)

**Enemy** (individual):
- `Move Interval`: Velocidad específica del enemigo
- `Patrol Pattern`: Array de posiciones [[row, col], ...] para patrullaje fijo
- `Sprite Offset Y`: Ajuste vertical del sprite (40.0 por defecto)

## Modos de Movimiento

### 1. Movimiento Aleatorio (Por defecto)
```gdscript
enemy.patrol_pattern = []  # Array vacío
```
El enemigo se mueve aleatoriamente a casillas adyacentes válidas.

### 2. Patrón de Patrullaje
```gdscript
enemy.patrol_pattern = [[3, 0], [3, 1], [3, 2], [3, 3]]  # Ruta fija
```
El enemigo sigue una ruta predefinida en bucle.

## Mejoras Futuras Sugeridas

1. **Tipos de enemigos**:
   - Rápidos (move_interval bajo)
   - Lentos pero resistentes
   - Patrulleros (ruta fija)
   - Perseguidores (siguen al jugador)

2. **IA mejorada**:
   - Pathfinding hacia el jugador
   - Evitar esquinas
   - Coordinación entre enemigos

3. **Power-ups**:
   - Invencibilidad temporal
   - Congelar enemigos
   - Eliminar enemigos cercanos

4. **Efectos visuales**:
   - Sprites únicos para cada tipo de enemigo
   - Partículas al moverse
   - Indicadores de dirección

5. **Audio**:
   - Sonido al detectar al jugador
   - Sonido de movimiento
   - Alerta de peligro

## Balanceo Recomendado

### Fácil
- 2 enemigos
- Intervalo: 2.0 segundos
- Tablero: 5 filas

### Normal (Actual)
- 3 enemigos
- Intervalo: 1.5 segundos
- Tablero: 7 filas

### Difícil
- 5 enemigos
- Intervalo: 1.0 segundos
- Tablero: 7-9 filas

### Experto
- 7 enemigos
- Intervalo: 0.8 segundos
- Tablero: 9+ filas
- Algunos con patrón de patrullaje
