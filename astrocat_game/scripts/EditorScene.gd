# res://scripts/EditorScene.gd
extends Node2D

## Editor de niveles - MVP
## Permite crear, editar y probar niveles personalizados

## Preload de clases necesarias
const LevelDataClass = preload("res://scripts/LevelData.gd")
const LevelCodecClass = preload("res://scripts/LevelCodec.gd")

## Referencias a nodos
@onready var board: Node2D = $Board
@onready var ui_panel: Control = $EditorUI
@onready var camera: Camera2D = $Camera2D

## Estado del editor
var current_level = null  # LevelData
var selected_tool: String = "paint"  # paint, erase, spawn, enemy_patrol, enemy_random
var selected_content: int = 1  # 0=vacío, 1=tile, 2=spawn, 3=enemy_patrol, 4=enemy_random
var is_painting: bool = false
var last_painted_cell: Vector2i = Vector2i(-1, -1)

## Para camera drag
var camera_dragging: bool = false
var camera_drag_start: Vector2 = Vector2.ZERO

func _ready():
	print("========================================")
	print("🎨 EDITOR SCENE LOADED")
	print("========================================")
	
	# Crear nuevo nivel vacío
	current_level = LevelDataClass.new()
	current_level.level_name = "My Level"
	current_level.rows = 7
	current_level.init_empty_grid()
	
	# Aplicar nivel al board
	_apply_level_to_board()
	
	# Actualizar UI
	_update_ui()

func _process(_delta):
	# Detectar clicks en el board
	if Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT):
		if not is_painting and not camera_dragging:
			var mouse_pos = get_global_mouse_position()
			var cell = _screen_to_grid(mouse_pos)
			if cell != Vector2i(-1, -1):
				_handle_cell_click(cell)
				is_painting = true
				last_painted_cell = cell
		elif is_painting:
			var mouse_pos = get_global_mouse_position()
			var cell = _screen_to_grid(mouse_pos)
			if cell != last_painted_cell and cell != Vector2i(-1, -1):
				_handle_cell_click(cell)
				last_painted_cell = cell
	else:
		is_painting = false
		last_painted_cell = Vector2i(-1, -1)

func _input(event):
	# Teclas numéricas para cambiar contenido
	if event is InputEventKey and event.pressed:
		if event.keycode >= KEY_0 and event.keycode <= KEY_4:
			var num = event.keycode - KEY_0
			_set_content_type(num)
		elif event.keycode == KEY_E:
			# Alternar entre enemy patrol y random
			if selected_content == 3:
				_set_content_type(4)
			else:
				_set_content_type(3)
		elif event.keycode == KEY_S and not event.shift_pressed:
			_set_content_type(2)  # Spawn
	
	# Camera drag con botón derecho
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_RIGHT:
			if event.pressed:
				camera_dragging = true
				camera_drag_start = event.position
			else:
				camera_dragging = false
	
	if event is InputEventMouseMotion and camera_dragging:
		var delta = event.position - camera_drag_start
		camera.position -= delta / camera.zoom
		camera_drag_start = event.position

## Convierte posición de pantalla a coordenadas de grid
func _screen_to_grid(screen_pos: Vector2) -> Vector2i:
	# Detectar sobre qué cubo está el mouse
	for r in board.rows:
		for c in range(r + 1):
			var cube = board.get_cube(r, c)
			if cube:
				var cube_pos = cube.global_position
				var distance = screen_pos.distance_to(cube_pos)
				# Radio aproximado del cubo (mitad del ancho del tile)
				if distance < board.tile_w / 2:
					return Vector2i(r, c)
	return Vector2i(-1, -1)

## Maneja el click en una celda
func _handle_cell_click(cell: Vector2i):
	var r = cell.x
	var c = cell.y
	
	match selected_tool:
		"paint":
			_paint_cell(r, c, selected_content)
		"erase":
			_paint_cell(r, c, 0)
		"spawn":
			_place_spawn(r, c)
		"enemy_patrol", "enemy_random":
			_place_enemy(r, c, selected_tool == "enemy_patrol")

## Pinta una celda con el contenido especificado
func _paint_cell(r: int, c: int, content: int):
	if r >= 0 and r < current_level.tiles.size():
		if c >= 0 and c < current_level.tiles[r].size():
			match content:
				0:  # Vacío
					current_level.tiles[r][c] = 0
					_update_cube_visual(r, c)
				1:  # Tile jugable
					current_level.tiles[r][c] = 1
					_update_cube_visual(r, c)
				2:  # Spawn
					_place_spawn(r, c)
				3, 4:  # Enemigos
					_place_enemy(r, c, content == 3)
			
			_update_ui()

## Coloca el spawn del jugador
func _place_spawn(r: int, c: int):
	# Asegurar que el tile esté activo
	if current_level.tiles[r][c] == 0:
		current_level.tiles[r][c] = 1
	
	current_level.start_row = r
	current_level.start_col = c
	
	_update_cube_visual(r, c)
	_update_spawn_indicator()
	_update_ui()

## Coloca un enemigo
func _place_enemy(r: int, c: int, is_patrol: bool):
	# Asegurar que el tile esté activo
	if current_level.tiles[r][c] == 0:
		current_level.tiles[r][c] = 1
		_update_cube_visual(r, c)
	
	# Verificar si ya hay un enemigo en esta posición
	for i in range(current_level.enemies.size() - 1, -1, -1):
		var e = current_level.enemies[i]
		if e.row == r and e.col == c:
			current_level.enemies.remove_at(i)
	
	# Añadir nuevo enemigo
	var kind = LevelDataClass.EnemyKind.PATROL if is_patrol else LevelDataClass.EnemyKind.RANDOM
	var enemy = LevelDataClass.EnemyInfo.new(kind, r, c)
	if is_patrol:
		# Patrón simple: mover en cruz
		enemy.patrol_pattern = [[r, c], [r, max(0, c-1)], [r, c], [r, min(r, c+1)]]
	current_level.enemies.append(enemy)
	
	_update_enemy_indicators()
	_update_ui()

## Actualiza el visual de un cubo
func _update_cube_visual(r: int, c: int):
	var cube = board.get_cube(r, c)
	if not cube:
		return
	
	var tile_value = current_level.tiles[r][c]
	
	if tile_value == 0:
		# Tile inactivo
		cube.modulate = Color(0.1, 0.1, 0.1, 0.3)
		cube.set_meta("active", false)
	else:
		# Tile activo
		cube.modulate = Color(0.35, 0.35, 0.4)
		cube.set_meta("active", true)
	
	# Indicador de spawn
	if r == current_level.start_row and c == current_level.start_col:
		cube.modulate = Color(0.3, 0.8, 0.3)  # Verde para spawn

## Actualiza el indicador visual del spawn
func _update_spawn_indicator():
	# Actualizar todos los cubos
	for r in board.rows:
		for c in range(r + 1):
			_update_cube_visual(r, c)

## Actualiza los indicadores de enemigos
func _update_enemy_indicators():
	# Actualizar todos los cubos para mostrar enemigos
	for r in board.rows:
		for c in range(r + 1):
			var cube = board.get_cube(r, c)
			if not cube:
				continue
			
			# Verificar si hay enemigo en esta posición
			var has_enemy = false
			for e in current_level.enemies:
				if e.row == r and e.col == c:
					has_enemy = true
					break
			
			if has_enemy:
				cube.modulate = Color(0.8, 0.3, 0.3)  # Rojo para enemigos
			elif r == current_level.start_row and c == current_level.start_col:
				cube.modulate = Color(0.3, 0.8, 0.3)  # Verde para spawn
			elif current_level.tiles[r][c] == 1:
				cube.modulate = Color(0.35, 0.35, 0.4)  # Normal
			else:
				cube.modulate = Color(0.1, 0.1, 0.1, 0.3)  # Inactivo

## Aplica el nivel actual al board
func _apply_level_to_board():
	board.rows = current_level.rows
	board._generate_pyramid()
	
	# Actualizar visuals de todos los cubos
	for r in board.rows:
		for c in range(r + 1):
			_update_cube_visual(r, c)
	
	_update_spawn_indicator()
	_update_enemy_indicators()

## Actualiza la UI del editor
func _update_ui():
	if not ui_panel:
		return
	
	# Contar tiles activos
	var active_tiles = 0
	for row_data in current_level.tiles:
		for tile in row_data:
			if tile == 1:
				active_tiles += 1
	
	# Actualizar labels
	var stats_label = ui_panel.get_node_or_null("StatsLabel")
	if stats_label:
		var has_spawn = "✅" if current_level.tiles[current_level.start_row][current_level.start_col] == 1 else "❌"
		stats_label.text = "Tiles: %d | Enemies: %d | Spawn: %s" % [
			active_tiles,
			current_level.enemies.size(),
			has_spawn
		]
	
	# Actualizar validación
	var validation_label = ui_panel.get_node_or_null("ValidationLabel")
	if validation_label:
		var errors = current_level.validate()
		if errors.size() == 0:
			validation_label.text = "✅ Ready to play!"
			validation_label.modulate = Color(0.3, 1.0, 0.3)
		else:
			validation_label.text = "❌ " + errors[0]
			validation_label.modulate = Color(1.0, 0.3, 0.3)

## Establece el tipo de contenido a pintar
func _set_content_type(type: int):
	selected_content = type
	match type:
		0:
			selected_tool = "erase"
		1:
			selected_tool = "paint"
		2:
			selected_tool = "spawn"
		3:
			selected_tool = "enemy_patrol"
		4:
			selected_tool = "enemy_random"
	
	var tool_label = ui_panel.get_node_or_null("ToolLabel")
	if tool_label:
		var tool_names = ["Erase", "Paint Tile", "Place Spawn", "Enemy (Patrol)", "Enemy (Random)"]
		tool_label.text = "Tool: " + tool_names[type]

## Botón: Nuevo nivel
func _on_new_level_pressed():
	current_level = LevelDataClass.new()
	current_level.level_name = "My Level"
	current_level.rows = 7
	current_level.init_empty_grid()
	_apply_level_to_board()
	_update_ui()

## Botón: Probar nivel
func _on_test_level_pressed():
	if not current_level.is_valid():
		print("Cannot test: level has errors")
		return
	
	# Guardar nivel temporal
	LevelCodecClass.save_level_local(current_level, 999)  # Slot 999 para test
	
	# Cambiar a escena de juego
	get_tree().change_scene_to_file("res://scenes/Main.tscn")

## Botón: Exportar
func _on_export_pressed():
	var encoded = LevelCodecClass.encode_level(current_level)
	LevelCodecClass.copy_to_clipboard(encoded)
	print("Level copied to clipboard!")
	
	var export_label = ui_panel.get_node_or_null("ExportLabel")
	if export_label:
		export_label.text = "✅ Copied to clipboard!"
		await get_tree().create_timer(2.0).timeout
		export_label.text = ""

## Botón: Importar
func _on_import_pressed():
	var encoded = LevelCodecClass.get_from_clipboard()
	var level = LevelCodecClass.decode_level(encoded)
	if level:
		current_level = level
		_apply_level_to_board()
		_update_ui()
		print("Level imported successfully!")
	else:
		print("Failed to import level from clipboard")

## Botón: Volver al menú
func _on_back_button_pressed():
	get_tree().change_scene_to_file("res://scenes/Menu.tscn")

## Cuando cambia el número de filas
func _on_rows_changed(value: int):
	current_level.rows = int(value)
	current_level.init_empty_grid()
	_apply_level_to_board()
	_update_ui()

## Cuando cambia el nombre del nivel
func _on_level_name_changed(new_text: String):
	current_level.level_name = new_text
