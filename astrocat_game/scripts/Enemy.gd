# res://scripts/Enemy.gd
extends Sprite2D

## Referencias y configuración
@export var move_interval: float = 1.5  # Tiempo entre movimientos (segundos)
@export var move_duration: float = 0.2  # Duración de la animación de movimiento
@export var sprite_offset_y: float = 55.0  # Offset para centrar el sprite en el cubo (ajustada)
@export var patrol_pattern: Array = []  # Patrón de patrullaje: [[row, col], [row, col], ...]

## Texturas
var idle_texture: Texture2D = null
var move_texture: Texture2D = null

## Estado del enemigo
var board: Node = null  # Será asignado por EnemyManager
var row: int = 0
var col: int = 0
var busy: bool = false  # Si está ocupado moviéndose
var current_patrol_index: int = 0
var move_timer: float = 0.0
var player: Node = null

## Señales
signal hit_player()

func _ready():
	# Añadir al grupo "enemy" para detección de colisiones
	add_to_group("enemy")
	
	# Encontrar al jugador
	player = get_tree().get_first_node_in_group("player")
	
	# Color original (sin tinte) - los enemigos tienen su propio sprite distintivo
	modulate = Color(1.0, 1.0, 1.0)
	
	# Configurar textura inicial
	if idle_texture:
		texture = idle_texture
	
	# Si hay patrón de patrullaje, iniciar en la primera posición
	if patrol_pattern.size() > 0:
		var start_pos = patrol_pattern[0]
		_place_at(start_pos[0], start_pos[1])
	
	move_timer = move_interval

func _process(delta):
	if busy or board == null:
		return
	
	move_timer -= delta
	if move_timer <= 0:
		move_timer = move_interval
		_do_move()

## Realiza el movimiento del enemigo
func _do_move():
	# Si hay patrón de patrullaje, seguirlo
	if patrol_pattern.size() > 0:
		_patrol_move()
	else:
		_random_move()

## Movimiento siguiendo un patrón de patrullaje
func _patrol_move():
	current_patrol_index = (current_patrol_index + 1) % patrol_pattern.size()
	var next_pos = patrol_pattern[current_patrol_index]
	_move_to(next_pos[0], next_pos[1])

## Movimiento aleatorio a una posición válida adyacente
func _random_move():
	var directions = [
		Vector2(-1, 0),  # diag_up_left
		Vector2(0, 1),   # diag_up_right
		Vector2(0, -1),  # diag_down_left
		Vector2(1, 0)    # diag_down_right
	]
	
	# Mezclar direcciones aleatoriamente
	directions.shuffle()
	
	# Intentar moverse en alguna dirección válida
	for dir in directions:
		var nr = row + int(dir.x)
		var nc = col + int(dir.y)
		
		if board.is_valid(nr, nc):
			_move_to(nr, nc)
			return
	
	# Si no hay movimientos válidos, quedarse quieto

## Mueve el enemigo a una posición específica con animación
func _move_to(target_row: int, target_col: int):
	if not board.is_valid(target_row, target_col):
		return
	
	busy = true
	
	# Cambiar a textura de movimiento
	if move_texture:
		texture = move_texture
	
	var dest: Vector2 = board.iso_to_screen(target_row, target_col)
	
	# Animación de movimiento
	var tween := create_tween()
	tween.set_parallel(true)
	
	# Movimiento suave
	tween.tween_property(self, "position:x", dest.x, move_duration).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_IN_OUT)
	tween.tween_property(self, "position:y", dest.y - sprite_offset_y, move_duration).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_IN_OUT)
	
	await tween.finished
	
	# Volver a textura idle
	if idle_texture:
		texture = idle_texture
	
	# Actualizar posición lógica
	row = target_row
	col = target_col
	
	# Verificar colisión con el jugador
	_check_collision_with_player()
	
	busy = false

## Coloca al enemigo en una posición específica (sin animación)
func _place_at(r: int, c: int):
	if board == null:
		return
	
	row = r
	col = c
	var p: Vector2 = board.iso_to_screen(r, c)
	position = Vector2(p.x, p.y - sprite_offset_y)

## Verifica si el enemigo está en la misma posición que el jugador
func _check_collision_with_player():
	if player and player.row == row and player.col == col:
		# Solo causar daño si el jugador no está busy (evita múltiples colisiones)
		if not player.busy and not player.game_over:
			emit_signal("hit_player")
			player._hit_by_enemy()

## Reinicia el enemigo a su posición inicial
func reset():
	if patrol_pattern.size() > 0:
		current_patrol_index = 0
		var start_pos = patrol_pattern[0]
		_place_at(start_pos[0], start_pos[1])
	move_timer = move_interval
	busy = false
