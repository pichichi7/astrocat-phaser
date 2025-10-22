# res://scripts/EnemyManager.gd
extends Node2D

## Referencias
@export var board_path: NodePath
@export var player_path: NodePath
@export var enemy_texture: Texture2D
@export var enemy_move_texture: Texture2D

## Configuración de enemigos
@export var num_enemies: int = 3
@export var enemy_move_interval: float = 1.5

var board: Node
var player: Node
var enemies: Array = []

func _ready():
	print("========================================")
	print("👾 ENEMY MANAGER _ready() CALLED")
	print("========================================")
	
	board = get_node(board_path)
	player = get_node(player_path)
	
	# Verificar que board y player existan
	if not board or not player:
		push_error("EnemyManager: Board or Player not found!")
		return
	
	print("✓ Board and Player found")
	print("✓ Waiting for board to generate...")
	
	# Esperar un frame para que el tablero esté generado
	await get_tree().process_frame
	
	print("✓ Spawning ", num_enemies, " enemies")
	_spawn_enemies()
	print("✓ Enemy Manager initialization complete!")
	print("========================================")

## Genera enemigos en posiciones aleatorias del tablero
func _spawn_enemies():
	# Verificar que el board tenga la propiedad rows
	if not board or not board.has_method("is_valid"):
		push_error("EnemyManager: Board not ready!")
		return
	
	# Obtener todas las posiciones válidas del tablero
	var valid_positions: Array = []
	
	for r in board.rows:
		for c in r + 1:
			# Evitar la posición inicial del jugador (0, 0)
			if r == 0 and c == 0:
				continue
			# Evitar las esquinas y bordes lejanos para enemigos iniciales
			if r > 1:
				valid_positions.append([r, c])
	
	# Mezclar posiciones
	valid_positions.shuffle()
	
	# Crear enemigos
	for i in min(num_enemies, valid_positions.size()):
		var enemy_pos = valid_positions[i]
		_create_enemy(enemy_pos[0], enemy_pos[1])

## Crea un enemigo individual
func _create_enemy(start_row: int, start_col: int):
	var enemy := Sprite2D.new()
	enemy.texture = enemy_texture
	enemy.z_index = 100
	
	# Enemigos ligeramente más grandes (mobile gaming: presencia amenazante)
	enemy.scale = Vector2(0.06, 0.06)
	enemy.offset = Vector2(0, 20)
	
	# Asignar script
	enemy.set_script(load("res://scripts/Enemy.gd"))
	
	add_child(enemy)
	
	# Pasar referencia directa del board (no NodePath)
	enemy.board = board
	enemy.move_interval = enemy_move_interval + randf_range(-0.3, 0.3)  # Variar velocidad
	
	# Pasar texturas
	enemy.idle_texture = enemy_texture
	enemy.move_texture = enemy_move_texture
	
	# Patrón de patrullaje vacío para movimiento aleatorio
	enemy.patrol_pattern = []
	
	enemies.append(enemy)
	
	# Conectar señal de colisión
	enemy.connect("hit_player", Callable(self, "_on_enemy_hit_player"))
	
	# Colocar en posición inicial después de que esté listo
	await get_tree().process_frame
	enemy._place_at(start_row, start_col)

## Se llama cuando un enemigo golpea al jugador
func _on_enemy_hit_player():
	# El Player ya maneja la pérdida de vida
	pass

## Reinicia todos los enemigos
func reset_enemies():
	for enemy in enemies:
		enemy.reset()
