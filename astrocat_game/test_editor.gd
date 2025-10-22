extends Node

# Script de prueba rápida del editor
# Ejecutar con: Godot → Script → Run

func _ready():
	print("=== VERIFICACIÓN DEL EDITOR ===")
	
	# 1. Verificar que LevelData existe
	var test_level = load("res://scripts/LevelData.gd").new()
	if test_level:
		print("✅ LevelData carga correctamente")
	else:
		print("❌ LevelData falló")
	
	# 2. Verificar que LevelCodec existe
	var codec = load("res://scripts/LevelCodec.gd")
	if codec:
		print("✅ LevelCodec carga correctamente")
	else:
		print("❌ LevelCodec falló")
	
	# 3. Verificar que EditorScene existe
	var editor_script = load("res://scripts/EditorScene.gd")
	if editor_script:
		print("✅ EditorScene script carga correctamente")
	else:
		print("❌ EditorScene script falló")
	
	# 4. Verificar que la escena Editor existe
	var editor_scene = load("res://scenes/Editor.tscn")
	if editor_scene:
		print("✅ Editor.tscn carga correctamente")
	else:
		print("❌ Editor.tscn falló")
	
	# 5. Verificar que Menu existe
	var menu_scene = load("res://scenes/Menu.tscn")
	if menu_scene:
		print("✅ Menu.tscn carga correctamente")
	else:
		print("❌ Menu.tscn falló")
	
	print("\n=== FIN DE VERIFICACIÓN ===")
	print("Si todos están ✅, el editor debería funcionar correctamente")
	
	# Salir después de la verificación
	await get_tree().create_timer(1.0).timeout
	get_tree().quit()
