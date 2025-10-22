# res://scripts/Player.gd
extends Sprite2D

## Referencias y configuración
@export var board_path: NodePath  # Ruta al nodo Board
@export var jump_duration: float = 0.18  # Duración de la animación de salto (reducida para más agilidad)
@export var jump_offset_y: float = 25.0  # Altura del salto visual (ajustada para cubos más grandes)
@export var sprite_offset_y: float = 55.0  # Offset para centrar el sprite en el cubo (ajustada)
@export var lives: int = 3  # Vidas iniciales
@export var respawn_delay: float = 0.8  # Tiempo antes de respawn

## Texturas
@export var idle_texture: Texture2D  # Sprite estático (astrocat.png)
@export var jump_texture: Texture2D  # Sprite de salto (astrocat_jump.png)

## Estado del jugador
var board: Node
var row: int = 0
var col: int = 0
var busy: bool = false  # Si está ocupado (saltando, cayendo, etc)
var game_over: bool = false

## Para swipe móvil
var touch_start := Vector2.ZERO

## Señales
signal life_lost(lives_remaining: int)
signal game_over_signal()

func _ready():
	print("========================================")
	print("🚀 PLAYER _ready() CALLED")
	print("========================================")
	
	# Añadir al grupo "player" para que los enemigos puedan encontrarlo
	add_to_group("player")
	
	# Si no se configuró idle_texture, usar la textura actual
	if idle_texture == null:
		idle_texture = texture
		print("✓ Using current texture as idle_texture")
	
	# Verificar que board_path esté configurado
	if board_path.is_empty():
		push_error("Player: board_path is not set!")
		return
	
	print("✓ Board path: ", board_path)
	board = get_node(board_path)
	
	if not board:
		push_error("Player: Board not found at path: " + str(board_path))
		return
	
	print("✓ Board found successfully")
	_place_at(0, 0)
	print("✓ Player placed at (0, 0)")
	
	if board.has_signal("win"):
		board.connect("win", Callable(self, "_on_win"))
		print("✓ Connected to board 'win' signal")
	else:
		push_error("Player: Board doesn't have 'win' signal!")
	
	print("✓ Player initialization complete!")
	print("========================================")

func _physics_process(_dt):
	if busy or game_over:
		return
	
	var dir := _read_input()
	if dir != Vector2.ZERO:
		_try_move(dir)

## Lee el input del teclado y lo convierte a dirección diagonal isométrica
func _read_input() -> Vector2:
	# Mapeo de teclas a movimientos diagonales isométricos:
	# diag_up_left (-1, 0): mueve hacia arriba-izquierda (disminuye row)
	# diag_up_right (0, +1): mueve hacia arriba-derecha (aumenta col)
	# diag_down_left (0, -1): mueve hacia abajo-izquierda (disminuye col)
	# diag_down_right (+1, 0): mueve hacia abajo-derecha (aumenta row)
	
	if Input.is_action_just_pressed("diag_up_left"):
		return Vector2(-1, 0)
	if Input.is_action_just_pressed("diag_up_right"):
		return Vector2(0, 1)
	if Input.is_action_just_pressed("diag_down_left"):
		return Vector2(0, -1)
	if Input.is_action_just_pressed("diag_down_right"):
		return Vector2(1, 0)
	
	return Vector2.ZERO

## Intenta mover al jugador en la dirección especificada
func _try_move(dir: Vector2):
	var nr := row + int(dir.x)
	var nc := col + int(dir.y)
	
	# Verificar si la posición destino es válida
	if not board.is_valid(nr, nc):
		_fall_off()
		return
	
	# Verificar si el cubo destino está activo (para niveles del editor)
	var target_cube = board.get_cube(nr, nc)
	if target_cube and target_cube.has_meta("active") and not target_cube.get_meta("active"):
		_fall_off()
		return
	
	# Actualizar dirección del sprite (flip horizontal)
	_update_sprite_direction(dir)
	
	# Realizar el salto animado
	busy = true
	var dest: Vector2 = board.iso_to_screen(nr, nc)
	
	# FASE 1: Anticipación (squash antes del salto) - MÁS RÁPIDA
	var anticipation_tween := create_tween()
	anticipation_tween.set_parallel(true)
	anticipation_tween.tween_property(self, "scale:y", scale.x * 0.85, 0.04).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	anticipation_tween.tween_property(self, "scale:x", scale.x * 1.15, 0.04).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	await anticipation_tween.finished
	
	# Cambiar a sprite de salto con fade suave - MÁS RÁPIDO
	if jump_texture:
		var fade_tween := create_tween()
		fade_tween.tween_property(self, "modulate:a", 0.8, 0.03)
		await fade_tween.finished
		texture = jump_texture
		fade_tween = create_tween()
		fade_tween.tween_property(self, "modulate:a", 1.0, 0.03)
	
	# FASE 2: Salto principal con stretch y rotación
	var tween := create_tween()
	tween.set_parallel(true)
	
	# Restaurar y aplicar stretch (estiramiento durante el salto)
	tween.tween_property(self, "scale:x", scale.x * 0.95, jump_duration * 0.3).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	tween.tween_property(self, "scale:y", scale.x * 1.1, jump_duration * 0.3).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	
	# Movimiento horizontal suave
	tween.tween_property(self, "position:x", dest.x, jump_duration).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_IN_OUT)
	
	# Rotación ligera durante el salto (solo si se mueve hacia arriba)
	var rotation_amount = deg_to_rad(8) if (dir.x < 0 or dir.y > 0) else deg_to_rad(-8)
	tween.tween_property(self, "rotation", rotation_amount, jump_duration * 0.5).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	
	# Movimiento vertical con arco (subida)
	tween.tween_property(self, "position:y", dest.y - sprite_offset_y - jump_offset_y * 2.2, jump_duration * 0.5).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	
	await tween.finished
	
	# FASE 3: Caída del salto
	var tween2 := create_tween()
	tween2.set_parallel(true)
	
	# Restaurar rotación
	tween2.tween_property(self, "rotation", 0.0, jump_duration * 0.5).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_IN)
	
	# Caída
	tween2.tween_property(self, "position:y", dest.y - sprite_offset_y, jump_duration * 0.5).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_IN)
	
	await tween2.finished
	
	# FASE 4: Aterrizaje con squash - MÁS RÁPIDO
	var landing_tween := create_tween()
	landing_tween.set_parallel(true)
	landing_tween.tween_property(self, "scale:y", scale.x * 0.9, 0.05).set_trans(Tween.TRANS_BOUNCE).set_ease(Tween.EASE_OUT)
	landing_tween.tween_property(self, "scale:x", scale.x * 1.1, 0.05).set_trans(Tween.TRANS_BOUNCE).set_ease(Tween.EASE_OUT)
	await landing_tween.finished
	
	# Volver a escala normal - MÁS RÁPIDO
	var restore_tween := create_tween()
	restore_tween.set_parallel(true)
	restore_tween.tween_property(self, "scale", Vector2(0.055, 0.055), 0.06).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	
	# Volver a sprite idle con fade suave - MÁS RÁPIDO
	if idle_texture:
		var fade_out := create_tween()
		fade_out.tween_property(self, "modulate:a", 0.8, 0.03)
		await fade_out.finished
		texture = idle_texture
		var fade_in := create_tween()
		fade_in.tween_property(self, "modulate:a", 1.0, 0.03)
	
	await restore_tween.finished
	
	# Actualizar posición lógica
	row = nr
	col = nc
	
	# Marcar el cubo como pisado
	board.step_on(row, col)
	
	busy = false
	
	# Verificar colisión con enemigos después de moverse
	_check_collision_with_enemies()

## Coloca al jugador en una posición específica (sin animación)
func _place_at(r: int, c: int):
	if not board:
		push_error("Player: Board is null in _place_at!")
		return
		
	row = r
	col = c
	var p: Vector2 = board.iso_to_screen(r, c)
	position = Vector2(p.x, p.y - sprite_offset_y)

## Se llama cuando el jugador se cae del tablero
func _fall_off():
	lives -= 1
	emit_signal("life_lost", lives)
	
	busy = true
	
	# Animación de caída
	var tween := create_tween()
	tween.set_parallel(true)
	tween.tween_property(self, "position:y", position.y + 400.0, 0.30).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_IN)
	tween.tween_property(self, "modulate:a", 0.0, 0.20)
	await tween.finished
	
	# Verificar game over
	if lives < 0:
		_game_over()
		return
	
	# Respawn
	await get_tree().create_timer(respawn_delay).timeout
	modulate.a = 1.0
	_place_at(0, 0)
	busy = false

## Game Over
func _game_over():
	game_over = true
	emit_signal("game_over_signal")
	
	# Reiniciar después de un delay
	await get_tree().create_timer(2.0).timeout
	lives = 3
	game_over = false
	get_tree().reload_current_scene()

## Se llama cuando se completa el nivel (todos los cubos pisados)
func _on_win():
	busy = true
	
	# Pequeña celebración
	var tween := create_tween()
	tween.tween_property(self, "position:y", position.y - 50, 0.3).set_trans(Tween.TRANS_BOUNCE).set_ease(Tween.EASE_OUT)
	
	await get_tree().create_timer(1.5).timeout
	
	# Siguiente nivel (por ahora solo reinicia)
	get_tree().reload_current_scene()

## Input táctil para móviles (swipe)
func _unhandled_input(event):
	if busy or game_over:
		return
	
	# Detectar inicio del toque
	if event is InputEventScreenTouch and event.pressed:
		touch_start = event.position
	
	# Detectar fin del toque y calcular dirección del swipe
	elif event is InputEventScreenTouch and not event.pressed:
		var delta: Vector2 = event.position - touch_start
		
		# Ignorar toques muy pequeños
		if delta.length() < 12.0:
			return
		
		# Calcular ángulo del swipe y determinar dirección
		var ang := atan2(delta.y, delta.x)
		
		# Mapear ángulos a direcciones diagonales isométricas
		if ang > -2.35 and ang < -0.80:  # ↖ Arriba-Izquierda
			_try_move(Vector2(-1, 0))
		elif ang >= -0.80 and ang <= 0.80:  # ↗ Arriba-Derecha
			_try_move(Vector2(0, 1))
		elif ang > 0.80 and ang < 2.35:  # ↘ Abajo-Derecha
			_try_move(Vector2(1, 0))
		else:  # ↙ Abajo-Izquierda
			_try_move(Vector2(0, -1))

## Se llama cuando un enemigo golpea al jugador
func _hit_by_enemy():
	if busy or game_over:
		return
	
	lives -= 1
	emit_signal("life_lost", lives)
	
	busy = true
	
	# Efecto visual de daño (parpadeo)
	var tween := create_tween()
	tween.set_loops(3)
	tween.tween_property(self, "modulate:a", 0.3, 0.1)
	tween.tween_property(self, "modulate:a", 1.0, 0.1)
	await tween.finished
	
	# Verificar game over
	if lives < 0:
		_game_over()
		return
	
	# Respawn en posición inicial
	await get_tree().create_timer(respawn_delay).timeout
	_place_at(0, 0)
	busy = false
	
	# Verificar si hay un enemigo en la posición de respawn
	_check_collision_with_enemies()

## Actualiza la dirección del sprite según el movimiento
func _update_sprite_direction(dir: Vector2):
	# En movimiento isométrico:
	# diag_up_left (-1, 0): movimiento hacia arriba-izquierda
	# diag_up_right (0, +1): movimiento hacia arriba-derecha
	# diag_down_left (0, -1): movimiento hacia abajo-izquierda
	# diag_down_right (+1, 0): movimiento hacia abajo-derecha
	
	# Espejamos horizontalmente según la dirección
	# Mirando a la izquierda: diag_up_left y diag_down_left
	# Mirando a la derecha: diag_up_right y diag_down_right
	
	if dir.x == -1 or dir.y == -1:  # Movimiento hacia la izquierda
		flip_h = true
	elif dir.x == 1 or dir.y == 1:  # Movimiento hacia la derecha
		flip_h = false

## Verifica colisiones con todos los enemigos
func _check_collision_with_enemies():
	if game_over:
		return
	
	# Buscar todos los enemigos
	var enemies = get_tree().get_nodes_in_group("enemy")
	for enemy in enemies:
		if enemy.row == row and enemy.col == col:
			# Colisión detectada
			_hit_by_enemy()
			return
