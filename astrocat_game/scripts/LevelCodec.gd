# res://scripts/LevelCodec.gd
class_name LevelCodec
extends Object

## Utilidades para codificar/decodificar niveles a formato compacto
## para compartir en Reddit, copiar al portapapeles, etc.

## Codifica un LevelData a base64 (compacto para compartir)
static func encode_level(level: LevelData) -> String:
	var json_str = level.to_json()
	var bytes = json_str.to_utf8_buffer()
	return Marshalls.raw_to_base64(bytes)

## Decodifica un string base64 a LevelData
static func decode_level(encoded: String) -> LevelData:
	var bytes = Marshalls.base64_to_raw(encoded)
	var json_str = bytes.get_string_from_utf8()
	return LevelData.from_json(json_str)

## Guarda un nivel en el localStorage (ConfigFile)
static func save_level_local(level: LevelData, slot: int = 0) -> Error:
	var config = ConfigFile.new()
	var section = "level_%d" % slot
	
	config.set_value(section, "data", level.to_json())
	config.set_value(section, "name", level.level_name)
	config.set_value(section, "timestamp", Time.get_unix_time_from_system())
	
	return config.save("user://levels.cfg")

## Carga un nivel desde localStorage
static func load_level_local(slot: int = 0) -> LevelData:
	var config = ConfigFile.new()
	var err = config.load("user://levels.cfg")
	if err != OK:
		return null
	
	var section = "level_%d" % slot
	if not config.has_section(section):
		return null
	
	var json_str = config.get_value(section, "data", "")
	return LevelData.from_json(json_str)

## Lista todos los niveles guardados localmente
static func list_local_levels() -> Array[Dictionary]:
	var config = ConfigFile.new()
	var err = config.load("user://levels.cfg")
	if err != OK:
		return []
	
	var levels: Array[Dictionary] = []
	for section in config.get_sections():
		if section.begins_with("level_"):
			var slot = section.substr(6).to_int()
			levels.append({
				"slot": slot,
				"name": config.get_value(section, "name", "Untitled"),
				"timestamp": config.get_value(section, "timestamp", 0)
			})
	
	return levels

## Copia texto al portapapeles
static func copy_to_clipboard(text: String):
	DisplayServer.clipboard_set(text)

## Obtiene texto del portapapeles
static func get_from_clipboard() -> String:
	return DisplayServer.clipboard_get()

## Genera un código corto legible para compartir (8 caracteres)
## Nota: esto es solo un hash, no contiene el nivel completo
static func generate_share_code(level: LevelData) -> String:
	var json_str = level.to_json()
	var level_hash = json_str.hash()
	return "%08X" % level_hash

## Crea un nivel de ejemplo para testing
static func create_example_level() -> LevelData:
	var level = LevelData.new()
	level.level_name = "Tutorial Level"
	level.rows = 5
	level.cols = 5
	level.author = "AstroCat Team"
	
	# Crear grid pequeño con todos los tiles activos
	level.init_empty_grid()
	for r in level.rows:
		for c in range(level.tiles[r].size()):
			level.tiles[r][c] = 1  # Todos activos
	
	# Spawn en la punta
	level.start_row = 0
	level.start_col = 0
	
	# Un enemigo de patrulla
	var enemy = LevelData.EnemyInfo.new(LevelData.EnemyKind.PATROL, 2, 1)
	enemy.patrol_pattern = [[2, 0], [2, 1], [2, 2]]
	level.enemies.append(enemy)
	
	return level
