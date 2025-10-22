# 🚀 Expansión Futura - Código de Ejemplo

Este documento contiene código de ejemplo para las próximas fases de desarrollo de AstroCat.

---

## 🔴 Fase 1: Enemigo Bola Roja

### EnemyBall.gd
```gdscript
# res://scripts/EnemyBall.gd
extends Sprite2D

@export var board_path: NodePath
@export var player_path: NodePath
@export var move_interval: float = 1.0  # Segundos entre movimientos
@export var spawn_row: int = 0
@export var spawn_col: int = 0

var board: Node
var player: Node
var row: int = 0
var col: int = 0
var move_timer: float = 0.0
var active: bool = false

func _ready():
	board = get_node(board_path)
	player = get_node(player_path)
	_spawn_at(spawn_row, spawn_col)

func _spawn_at(r: int, c: int):
	row = r
	col = c
	active = true
	position = board.iso_to_screen(row, col)
	modulate = Color.RED
	visible = true

func _process(delta):
	if not active:
		return
	
	move_timer += delta
	if move_timer >= move_interval:
		_move_down()
		move_timer = 0.0
	
	# Verificar colisión con jugador
	_check_player_collision()

func _move_down():
	# Elegir dirección aleatoria hacia abajo
	var directions = []
	
	# Abajo-Derecha (+1, 0)
	if board.is_valid(row + 1, col):
		directions.append(Vector2(1, 0))
	
	# Abajo-Izquierda (0, -1)
	if board.is_valid(row, col - 1):
		directions.append(Vector2(0, -1))
	
	if directions.is_empty():
		# Llegó al final, despawn
		_despawn()
		return
	
	# Elegir dirección aleatoria
	var dir = directions[randi() % directions.size()]
	row += int(dir.x)
	col += int(dir.y)
	
	# Animar movimiento
	var dest = board.iso_to_screen(row, col)
	var tween = create_tween()
	tween.tween_property(self, "position", dest, 0.3)

func _check_player_collision():
	if row == player.row and col == player.col:
		player.take_damage()
		_despawn()

func _despawn():
	active = false
	visible = false
	queue_free()
```

### Añadir a Player.gd
```gdscript
## Nuevo método para recibir daño de enemigos
func take_damage():
	if busy or game_over:
		return
	_fall_off()  # Reutiliza la lógica de caída
```

### Spawner de Enemigos (añadir a Main.tscn o Board.gd)
```gdscript
# res://scripts/EnemySpawner.gd
extends Node

@export var board_path: NodePath
@export var player_path: NodePath
@export var spawn_interval: float = 5.0
@export var enemy_scene: PackedScene

var spawn_timer: float = 0.0
var board: Node
var player: Node

func _ready():
	board = get_node(board_path)
	player = get_node(player_path)

func _process(delta):
	spawn_timer += delta
	if spawn_timer >= spawn_interval:
		_spawn_enemy()
		spawn_timer = 0.0

func _spawn_enemy():
	# Spawn en posición aleatoria de la fila superior
	var spawn_col = randi() % (board.rows + 1)
	
	var enemy = enemy_scene.instantiate()
	enemy.board_path = board_path
	enemy.player_path = player_path
	enemy.spawn_row = 0
	enemy.spawn_col = spawn_col
	
	get_parent().add_child(enemy)
```

---

## 🐍 Fase 2: Serpiente Coily (Enemigo Inteligente)

### Coily.gd
```gdscript
# res://scripts/Coily.gd
extends Sprite2D

@export var board_path: NodePath
@export var player_path: NodePath
@export var move_interval: float = 0.8
@export var hatch_at_row: int = 6  # Fila donde "nace"

var board: Node
var player: Node
var row: int = 0
var col: int = 0
var move_timer: float = 0.0
var is_hatched: bool = false
var active: bool = false

enum State { BALL, COILED }
var state: State = State.BALL

func _ready():
	board = get_node(board_path)
	player = get_node(player_path)
	_spawn_at(0, 0)

func _spawn_at(r: int, c: int):
	row = r
	col = c
	active = true
	state = State.BALL
	is_hatched = false
	position = board.iso_to_screen(row, col)
	modulate = Color.ORANGE
	visible = true

func _process(delta):
	if not active:
		return
	
	move_timer += delta
	if move_timer >= move_interval:
		if state == State.BALL:
			_move_ball()
		else:
			_move_coiled()
		move_timer = 0.0
	
	_check_player_collision()

func _move_ball():
	# Comportamiento de bola: baja aleatoriamente
	var directions = []
	
	if board.is_valid(row + 1, col):
		directions.append(Vector2(1, 0))
	if board.is_valid(row, col - 1):
		directions.append(Vector2(0, -1))
	
	if directions.is_empty() or row >= hatch_at_row:
		_hatch()
		return
	
	var dir = directions[randi() % directions.size()]
	row += int(dir.x)
	col += int(dir.y)
	
	_animate_move()

func _move_coiled():
	# IA que persigue al jugador
	var best_dir = _calculate_best_direction()
	
	if best_dir != Vector2.ZERO:
		row += int(best_dir.x)
		col += int(best_dir.y)
		_animate_move()

func _calculate_best_direction() -> Vector2:
	# Calcular distancia Manhattan al jugador
	var target_row = player.row
	var target_col = player.col
	
	var possible_moves = []
	var directions = [
		Vector2(-1, 0),  # Arriba-Izquierda
		Vector2(0, 1),   # Arriba-Derecha
		Vector2(0, -1),  # Abajo-Izquierda
		Vector2(1, 0)    # Abajo-Derecha
	]
	
	var best_distance = INF
	var best_dir = Vector2.ZERO
	
	for dir in directions:
		var new_row = row + int(dir.x)
		var new_col = col + int(dir.y)
		
		if not board.is_valid(new_row, new_col):
			continue
		
		# Calcular distancia Manhattan
		var distance = abs(new_row - target_row) + abs(new_col - target_col)
		
		if distance < best_distance:
			best_distance = distance
			best_dir = dir
	
	return best_dir

func _hatch():
	# Transformación de bola a serpiente
	state = State.COILED
	is_hatched = true
	modulate = Color.PURPLE
	
	# Animación de eclosión
	var tween = create_tween()
	tween.tween_property(self, "scale", Vector2(1.3, 1.3), 0.2)
	tween.tween_property(self, "scale", Vector2(1.0, 1.0), 0.2)

func _animate_move():
	var dest = board.iso_to_screen(row, col)
	var tween = create_tween()
	tween.tween_property(self, "position", dest, 0.3).set_trans(Tween.TRANS_QUAD)

func _check_player_collision():
	if row == player.row and col == player.col:
		player.take_damage()
```

---

## ⚡ Fase 3: Discos de Escape

### Disc.gd
```gdscript
# res://scripts/Disc.gd
extends Sprite2D

@export var board_path: NodePath
@export var player_path: NodePath
@export var disc_row: int = 1  # Fila donde está el disco
@export var disc_col: int = 0  # Columna (normalmente en los bordes)
@export var teleport_row: int = 0  # A dónde teletransporta
@export var teleport_col: int = 0

var board: Node
var player: Node
var active: bool = true

func _ready():
	board = get_node(board_path)
	player = get_node(player_path)
	position = board.iso_to_screen(disc_row, disc_col)
	modulate = Color.CYAN
	
	# Animación de rotación continua
	var tween = create_tween().set_loops()
	tween.tween_property(self, "rotation", TAU, 2.0)

func _process(_delta):
	if not active:
		return
	
	# Verificar si el jugador pisó el disco
	if player.row == disc_row and player.col == disc_col:
		_activate()

func _activate():
	if not active:
		return
	
	active = false
	
	# Efecto visual
	var tween = create_tween()
	tween.tween_property(self, "scale", Vector2(2.0, 2.0), 0.3)
	tween.tween_property(self, "modulate:a", 0.0, 0.2)
	
	# Teletransportar jugador
	player.teleport_to(teleport_row, teleport_col)
	
	# Resetear enemigos
	get_tree().call_group("enemies", "reset")
	
	await tween.finished
	queue_free()
```

### Añadir a Player.gd
```gdscript
## Nuevo método para teletransporte
func teleport_to(target_row: int, target_col: int):
	busy = true
	
	# Efecto de desaparición
	var tween1 = create_tween()
	tween1.tween_property(self, "modulate:a", 0.0, 0.2)
	await tween1.finished
	
	# Cambiar posición
	_place_at(target_row, target_col)
	
	# Efecto de aparición
	var tween2 = create_tween()
	tween2.tween_property(self, "modulate:a", 1.0, 0.2)
	await tween2.finished
	
	busy = false
```

---

## 🎯 Fase 4: Sistema de Niveles

### LevelManager.gd
```gdscript
# res://scripts/LevelManager.gd
extends Node

@export var board_path: NodePath
@export var player_path: NodePath

var current_level: int = 1
var board: Node
var player: Node

# Configuración de niveles
var levels = [
	{"rows": 5, "enemies": 1, "speed": 1.0},
	{"rows": 6, "enemies": 2, "speed": 0.9},
	{"rows": 7, "enemies": 3, "speed": 0.8},
	{"rows": 8, "enemies": 4, "speed": 0.7},
	{"rows": 9, "enemies": 5, "speed": 0.6},
]

func _ready():
	board = get_node(board_path)
	player = get_node(player_path)
	
	board.connect("win", Callable(self, "_on_level_complete"))
	
	_setup_level(current_level)

func _setup_level(level_num: int):
	if level_num > levels.size():
		_show_game_complete()
		return
	
	var config = levels[level_num - 1]
	
	# Configurar tablero
	board.rows = config["rows"]
	board._generate_pyramid()
	
	# Configurar jugador
	player._place_at(0, 0)
	
	# Spawner de enemigos
	_setup_enemy_spawner(config["enemies"], config["speed"])

func _setup_enemy_spawner(count: int, speed: float):
	# Implementar spawning de enemigos según configuración
	pass

func _on_level_complete():
	current_level += 1
	
	# Delay antes de siguiente nivel
	await get_tree().create_timer(2.0).timeout
	
	_setup_level(current_level)

func _show_game_complete():
	print("¡JUEGO COMPLETADO!")
	# Mostrar pantalla de victoria final
```

---

## ✨ Fase 5: Efectos y Partículas

### JumpParticles (Scene)
```gdscript
# Crear GPUParticles2D en el editor
# Configuración básica:

Amount: 10
Lifetime: 0.5
One Shot: true
Explosiveness: 1.0

Process Material (ParticleProcessMaterial):
- Emission Shape: Sphere
- Sphere Radius: 5
- Direction: Vector3(0, -1, 0)
- Spread: 45
- Initial Velocity: 50-100
- Gravity: Vector3(0, 200, 0)
- Color: Blanco a transparente (gradient)
```

### Añadir a Player.gd
```gdscript
@onready var jump_particles = $JumpParticles

func _try_move(dir: Vector2):
	# ... código existente ...
	
	# Antes del salto
	jump_particles.emitting = true
	
	# ... resto del código de movimiento ...
```

---

## 🎵 Sistema de Audio

### AudioManager.gd
```gdscript
# res://scripts/AudioManager.gd
extends Node

# Sonidos
var jump_sound: AudioStreamPlayer
var land_sound: AudioStreamPlayer
var cube_hit_sound: AudioStreamPlayer
var fall_sound: AudioStreamPlayer
var victory_sound: AudioStreamPlayer
var damage_sound: AudioStreamPlayer

func _ready():
	_setup_audio_players()

func _setup_audio_players():
	jump_sound = _create_audio_player("res://audio/jump.wav")
	land_sound = _create_audio_player("res://audio/land.wav")
	cube_hit_sound = _create_audio_player("res://audio/cube_hit.wav")
	fall_sound = _create_audio_player("res://audio/fall.wav")
	victory_sound = _create_audio_player("res://audio/victory.wav")
	damage_sound = _create_audio_player("res://audio/damage.wav")

func _create_audio_player(path: String) -> AudioStreamPlayer:
	var player = AudioStreamPlayer.new()
	# player.stream = load(path)  # Cargar cuando exista
	add_child(player)
	return player

func play_jump():
	jump_sound.play()

func play_land():
	land_sound.play()

func play_cube_hit():
	cube_hit_sound.play()

func play_fall():
	fall_sound.play()

func play_victory():
	victory_sound.play()

func play_damage():
	damage_sound.play()
```

---

## 💾 Sistema de Guardado

### SaveManager.gd
```gdscript
# res://scripts/SaveManager.gd
extends Node

const SAVE_PATH = "user://astrocat_save.json"

var save_data = {
	"current_level": 1,
	"high_score": 0,
	"unlocked_levels": [1],
	"settings": {
		"music_volume": 1.0,
		"sfx_volume": 1.0
	}
}

func _ready():
	load_game()

func save_game():
	var file = FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if file:
		file.store_string(JSON.stringify(save_data))
		file.close()

func load_game():
	if not FileAccess.file_exists(SAVE_PATH):
		return
	
	var file = FileAccess.open(SAVE_PATH, FileAccess.READ)
	if file:
		var json_string = file.get_as_text()
		file.close()
		
		var json = JSON.new()
		var parse_result = json.parse(json_string)
		if parse_result == OK:
			save_data = json.get_data()

func update_level(level: int):
	save_data["current_level"] = level
	if level not in save_data["unlocked_levels"]:
		save_data["unlocked_levels"].append(level)
	save_game()

func update_high_score(score: int):
	if score > save_data["high_score"]:
		save_data["high_score"] = score
		save_game()
```

---

## 🎮 Menú Principal

### MainMenu.tscn (estructura básica)
```gdscript
# res://scripts/MainMenu.gd
extends Control

@onready var play_button = $VBoxContainer/PlayButton
@onready var options_button = $VBoxContainer/OptionsButton
@onready var quit_button = $VBoxContainer/QuitButton

func _ready():
	play_button.pressed.connect(_on_play_pressed)
	options_button.pressed.connect(_on_options_pressed)
	quit_button.pressed.connect(_on_quit_pressed)

func _on_play_pressed():
	get_tree().change_scene_to_file("res://scenes/Main.tscn")

func _on_options_pressed():
	# Abrir menú de opciones
	pass

func _on_quit_pressed():
	get_tree().quit()
```

---

## 📊 Sistema de Puntos

### ScoreManager.gd
```gdscript
# res://scripts/ScoreManager.gd
extends Node

var score: int = 0
var combo: int = 0
var combo_timer: float = 0.0
var combo_timeout: float = 2.0

signal score_changed(new_score: int)
signal combo_changed(new_combo: int)

func _process(delta):
	if combo > 0:
		combo_timer += delta
		if combo_timer >= combo_timeout:
			_reset_combo()

func add_cube_score():
	var points = 10 * (1 + combo)
	score += points
	combo += 1
	combo_timer = 0.0
	
	emit_signal("score_changed", score)
	emit_signal("combo_changed", combo)

func _reset_combo():
	combo = 0
	combo_timer = 0.0
	emit_signal("combo_changed", combo)

func reset_score():
	score = 0
	_reset_combo()
	emit_signal("score_changed", score)
```

---

¡Con estos ejemplos tienes todo lo necesario para expandir AstroCat! 🚀🐱
