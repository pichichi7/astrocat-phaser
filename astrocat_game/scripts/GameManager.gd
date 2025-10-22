# res://scripts/GameManager.gd
extends Node

## Game Manager - Maneja la carga de niveles y estado del juego

const LevelCodecClass = preload("res://scripts/LevelCodec.gd")

@onready var main_scene: Node2D

func _ready():
	main_scene = get_parent()
	
	# Verificar si hay un nivel temporal del editor para cargar
	var test_level = LevelCodecClass.load_level_local(999)
	if test_level:
		print("Loading test level from editor...")
		_load_custom_level(test_level)
		# Limpiar el nivel temporal
		# (opcional: podrías dejarlo para poder volver a probarlo)
	else:
		print("Playing default level")

func _load_custom_level(level):
	if main_scene:
		var success = LevelLoader.load_level(main_scene, level)
		if success:
			print("✅ Custom level loaded successfully!")
		else:
			push_error("❌ Failed to load custom level")
