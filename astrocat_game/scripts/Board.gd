# res://scripts/Board.gd
extends Node2D

## Configuración de la pirámide isométrica
@export var rows: int = 7  # Número de filas de la pirámide (fila 0 = punta)
@export var tile_w: float = 96.0  # Ancho del rombo isométrico (aumentado para mejor escala)
@export var tile_h: float = 48.0  # Alto del rombo isométrico (proporción 2:1 isométrica)
@export var origin: Vector2 = Vector2(540, 180)  # Posición de la punta de la pirámide
@export var cube_texture: Texture2D  # Textura para los cubos

## Diccionario que almacena todos los cubos: key "row_col" -> Node (Cube)
var cubes := {}
@onready var cubes_root: Node = $Cubes

## Señales para comunicar eventos
signal stepped_on(row: int, col: int, new_state: int)
signal win()

func _ready():
	print("========================================")
	print("🎲 BOARD _ready() CALLED")
	print("Rows: ", rows)
	print("========================================")
	_generate_pyramid()
	print("✓ Pyramid generated successfully")
	print("========================================")

## Convierte coordenadas lógicas (row, col) a coordenadas de pantalla isométricas
func iso_to_screen(row: int, col: int) -> Vector2:
	return Vector2(
		origin.x + (col - row) * (tile_w / 2.0),
		origin.y + (col + row) * (tile_h / 2.0)
	)

## Genera la clave única para acceder a un cubo en el diccionario
func _key(row: int, col: int) -> String:
	return "%d_%d" % [row, col]

## Verifica si una posición (row, col) es válida en la pirámide
func is_valid(row: int, col: int) -> bool:
	return row >= 0 and row < rows and col >= 0 and col <= row

## Obtiene el nodo cubo en la posición especificada
func get_cube(row: int, col: int) -> Node:
	return cubes.get(_key(row, col), null)

## Genera toda la pirámide de cubos
func _generate_pyramid():
	# Limpiar cubos anteriores si existen
	cubes.clear()
	if has_node("Cubes"):
		$Cubes.queue_free()
	
	# Crear nuevo contenedor de cubos
	var new_root := Node2D.new()
	new_root.name = "Cubes"
	add_child(new_root)
	cubes_root = new_root
	
	# Generar cada fila de la pirámide
	for r in rows:
		for c in r + 1:  # Cada fila tiene (r+1) cubos
			var pos := iso_to_screen(r, c)
			
			# Crear el cubo
			var cube := Sprite2D.new()
			cube.texture = cube_texture
			cube.position = pos
			cube.z_index = 10 + r  # Orden de dibujado: filas inferiores al frente
			
			# Asegurar que el sprite esté centrado para mejor alineación
			cube.centered = true
			cube.offset = Vector2.ZERO
			
			# Escalar el cubo para que coincida con tile_w
			# Sprite es 64x64, queremos que se vea en escala 1:1 para mejor alineación
			if cube_texture:
				var target_width = tile_w
				var actual_width = cube_texture.get_width()
				var scale_factor = target_width / actual_width
				cube.scale = Vector2(scale_factor, scale_factor)
			
			# Asignar script del cubo
			cube.set_script(load("res://scripts/Cube.gd"))
			
			cubes_root.add_child(cube)
			cubes[_key(r, c)] = cube

## Se llama cuando el jugador pisa un cubo
func step_on(row: int, col: int):
	var cube: Node = get_cube(row, col)
	if cube:
		# Verificar si el cubo está activo (usado por el editor)
		if cube.has_meta("active") and not cube.get_meta("active"):
			return  # No pisar cubos inactivos
		
		cube.bump_state()
		emit_signal("stepped_on", row, col, cube.state)
		_check_win()

## Verifica si todos los cubos están en el estado objetivo
func _check_win():
	# Objetivo: todos los cubos ACTIVOS deben tener estado >= 1
	for k in cubes.keys():
		var cb: Node = cubes[k]
		# Ignorar cubos inactivos en el conteo
		if cb.has_meta("active") and not cb.get_meta("active"):
			continue
		if not cb.is_complete():
			return
	
	# ¡Victoria! Todos los cubos están completos
	emit_signal("win")

## Resetea todos los cubos a su estado inicial
func reset_all_cubes():
	for k in cubes.keys():
		var cb: Node = cubes[k]
		cb.reset_state()

## Obtiene el número total de cubos en la pirámide (solo activos)
func get_total_cubes() -> int:
	var count := 0
	for k in cubes.keys():
		var cb: Node = cubes[k]
		# Contar solo cubos activos
		if not cb.has_meta("active") or cb.get_meta("active"):
			count += 1
	return count

## Obtiene el número de cubos completados
func get_completed_cubes() -> int:
	var count := 0
	for k in cubes.keys():
		var cb: Node = cubes[k]
		# Ignorar cubos inactivos
		if cb.has_meta("active") and not cb.get_meta("active"):
			continue
		if cb.is_complete():
			count += 1
	return count
