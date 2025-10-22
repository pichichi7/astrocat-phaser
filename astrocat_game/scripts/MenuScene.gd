# res://scripts/MenuScene.gd
extends Control

## Menú principal de AstroCat
## Permite elegir entre jugar o abrir el editor

func _ready():
	print("========================================")
	print("🌟 ASTROCAT - MAIN MENU")
	print("========================================")

func _on_play_button_pressed():
	# Cargar escena de juego
	get_tree().change_scene_to_file("res://scenes/Main.tscn")

func _on_editor_button_pressed():
	# Cargar escena de editor
	get_tree().change_scene_to_file("res://scenes/Editor.tscn")

func _on_load_level_button_pressed():
	# TODO: Implementar menú de carga de niveles guardados
	print("Load level menu - Coming soon!")

func _on_quit_button_pressed():
	get_tree().quit()
