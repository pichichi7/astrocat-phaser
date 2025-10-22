# res://scripts/Cube.gd
extends Sprite2D

## Sistema de estados para cada cubo (0 = sin pisar, 1 = pisado una vez, 2 = objetivo cumplido)
@export_range(0, 2, 1) var state: int = 0
@export var max_state: int = 2

func _ready():
	_update_visual()

## Incrementa el estado del cubo al pisarlo
func bump_state():
	state = min(state + 1, max_state)
	_update_visual()

## Resetea el cubo a estado inicial
func reset_state():
	state = 0
	_update_visual()

## Actualiza el color/visual según el estado actual
func _update_visual():
	# Colores: Gris metálico (sin pisar), Azul espacial (pisado)
	# Con sprite blanco, modulate funciona perfectamente
	var colors := [
		Color(0.35, 0.35, 0.4),  # Estado 0: sin pisar - Gris azulado metálico
		Color(0.2, 0.3, 0.5),     # Estado 1: pisado una vez - Azul espacial
		Color(0.15, 0.4, 0.65)    # Estado 2: objetivo cumplido - Azul brillante
	]
	modulate = colors[state]

## Verifica si el cubo está en el estado objetivo
func is_complete() -> bool:
	return state >= 1  # Para el prototipo, estado 1 o más es "completo"
