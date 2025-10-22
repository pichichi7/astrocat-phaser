# res://scripts/LevelData.gd
class_name LevelData
extends Resource

## Esquema de datos para niveles personalizados
## Este recurso se puede serializar a JSON para compartir niveles

## Tipos de enemigos
enum EnemyKind {
	PATROL,    # Patrulla en un patrón fijo
	RANDOM     # Movimiento aleatorio
}

## Información de enemigo
class EnemyInfo:
	var kind: EnemyKind
	var row: int
	var col: int
	var patrol_pattern: Array = []  # Solo para PATROL: [[r,c], [r,c], ...]
	
	func _init(_kind: EnemyKind = EnemyKind.PATROL, _row: int = 0, _col: int = 0):
		kind = _kind
		row = _row
		col = _col
	
	func to_dict() -> Dictionary:
		return {
			"kind": "patrol" if kind == EnemyKind.PATROL else "random",
			"r": row,
			"c": col,
			"patrol": patrol_pattern
		}
	
	static func from_dict(d: Dictionary) -> EnemyInfo:
		var e = EnemyInfo.new()
		e.kind = EnemyKind.PATROL if d.get("kind", "patrol") == "patrol" else EnemyKind.RANDOM
		e.row = d.get("r", 0)
		e.col = d.get("c", 0)
		e.patrol_pattern = d.get("patrol", [])
		return e

## Propiedades del nivel
@export var level_id: String = ""
@export var level_name: String = "Untitled Level"
@export var rows: int = 7
@export var cols: int = 7
@export var tiles: Array = []  # Array 2D: 0 = vacío, 1 = tile jugable
@export var start_row: int = 0
@export var start_col: int = 0
@export var enemies: Array = []  # Array de EnemyInfo
@export var author: String = ""
@export var created_at: int = 0
@export var version: int = 1

func _init():
	level_id = ""
	level_name = "Untitled Level"
	rows = 7
	cols = 7
	tiles = []
	start_row = 0
	start_col = 0
	enemies = []
	author = ""
	created_at = int(Time.get_unix_time_from_system())
	version = 1

## Convierte el nivel a un diccionario para serialización
func to_dict() -> Dictionary:
	var enemies_array := []
	for e in enemies:
		if e is EnemyInfo:
			enemies_array.append(e.to_dict())
	
	return {
		"id": level_id,
		"name": level_name,
		"rows": rows,
		"cols": cols,
		"tiles": tiles,
		"start": {"r": start_row, "c": start_col},
		"enemies": enemies_array,
		"meta": {
			"author": author,
			"createdAt": created_at,
			"version": version
		}
	}

## Crea un LevelData desde un diccionario
static func from_dict(d: Dictionary) -> LevelData:
	var level = LevelData.new()
	level.level_id = d.get("id", "")
	level.level_name = d.get("name", "Untitled Level")
	level.rows = d.get("rows", 7)
	level.cols = d.get("cols", 7)
	level.tiles = d.get("tiles", [])
	
	var start_data = d.get("start", {"r": 0, "c": 0})
	level.start_row = start_data.get("r", 0)
	level.start_col = start_data.get("c", 0)
	
	level.enemies = []
	for enemy_dict in d.get("enemies", []):
		level.enemies.append(EnemyInfo.from_dict(enemy_dict))
	
	var meta = d.get("meta", {})
	level.author = meta.get("author", "")
	level.created_at = meta.get("createdAt", 0)
	level.version = meta.get("version", 1)
	
	return level

## Serializa a JSON
func to_json() -> String:
	return JSON.stringify(to_dict())

## Deserializa desde JSON
static func from_json(json_str: String) -> LevelData:
	var json = JSON.new()
	var error = json.parse(json_str)
	if error == OK:
		var data = json.data
		if data is Dictionary:
			return from_dict(data)
	return null

## Inicializa un grid vacío
func init_empty_grid():
	tiles = []
	for r in rows:
		var row_array := []
		for c in r + 1:  # Pirámide: cada fila tiene r+1 cubos
			row_array.append(0)
		tiles.append(row_array)

## Valida el nivel y retorna una lista de errores
func validate() -> Array[String]:
	var errors: Array[String] = []
	
	# Verificar que hay al menos un tile jugable
	var has_playable := false
	for row_data in tiles:
		for tile in row_data:
			if tile == 1:
				has_playable = true
				break
		if has_playable:
			break
	
	if not has_playable:
		errors.append("No hay tiles jugables (al menos uno debe estar activo)")
	
	# Verificar que el spawn está sobre un tile válido
	if start_row >= 0 and start_row < tiles.size():
		var row_tiles = tiles[start_row]
		if start_col >= 0 and start_col < row_tiles.size():
			if row_tiles[start_col] != 1:
				errors.append("El spawn debe estar sobre un tile jugable")
		else:
			errors.append("Posición de spawn inválida (columna fuera de rango)")
	else:
		errors.append("Posición de spawn inválida (fila fuera de rango)")
	
	# Verificar límite de enemigos
	if enemies.size() > 5:
		errors.append("Demasiados enemigos (máximo: 5)")
	
	# Verificar que los enemigos están en tiles válidos
	for i in enemies.size():
		var e = enemies[i]
		if e is EnemyInfo:
			if e.row >= 0 and e.row < tiles.size():
				var row_tiles = tiles[e.row]
				if e.col >= 0 and e.col < row_tiles.size():
					if row_tiles[e.col] != 1:
						errors.append("Enemigo %d no está sobre un tile jugable" % (i + 1))
				else:
					errors.append("Enemigo %d: columna fuera de rango" % (i + 1))
			else:
				errors.append("Enemigo %d: fila fuera de rango" % (i + 1))
	
	return errors

## Retorna true si el nivel es válido para jugar
func is_valid() -> bool:
	return validate().size() == 0
