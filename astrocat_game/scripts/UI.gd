# res://scripts/UI.gd
extends CanvasLayer

@onready var lives_label: Label = $LivesLabel
@onready var progress_label: Label = $ProgressLabel
@onready var instructions: Label = $Instructions

var board: Node
var player: Node

func _ready():
	# Obtener referencias
	board = get_node("../Board")
	player = get_node("../Player")
	
	# Conectar señales
	if board:
		board.connect("stepped_on", Callable(self, "_on_stepped_on"))
		board.connect("win", Callable(self, "_on_win"))
	
	if player:
		player.connect("life_lost", Callable(self, "_on_life_lost"))
		player.connect("game_over_signal", Callable(self, "_on_game_over"))
	
	# Actualizar UI inicial
	_update_ui()

func _update_ui():
	if player:
		lives_label.text = "Lives: %d" % player.lives
	
	if board:
		var completed = board.get_completed_cubes()
		var total = board.get_total_cubes()
		progress_label.text = "Cubes: %d/%d" % [completed, total]

func _on_stepped_on(_row: int, _col: int, _state: int):
	_update_ui()

func _on_life_lost(lives_remaining: int):
	lives_label.text = "Lives: %d" % lives_remaining

func _on_win():
	instructions.text = "🎉 LEVEL COMPLETE! 🎉\nLoading next level..."
	instructions.modulate = Color.YELLOW

func _on_game_over():
	instructions.text = "💀 GAME OVER 💀\nRestarting..."
	instructions.modulate = Color.RED
