# Mejoras de Animación - AstroCat Game

## 🎬 Sistema de Animación Mejorado

### Cambios Implementados

#### 1. **Animación en 4 Fases**
El salto ahora tiene 4 fases distintas para mayor realismo:

##### Fase 1: Anticipación (0.06s)
- **Squash**: El sprite se aplasta antes de saltar
- `scale.y` → 85% (más bajo)
- `scale.x` → 115% (más ancho)
- **Efecto**: Crea anticipación visual, como si se agachara antes de saltar
- **Transición**: TRANS_BACK con EASE_OUT (rebote suave)

##### Fase 2: Salto Principal (jump_duration)
- **Stretch**: El sprite se estira durante el salto
- `scale.y` → 110% (más alto)
- `scale.x` → 95% (más delgado)
- **Rotación**: Gira ligeramente según la dirección (±8°)
- **Movimiento**: Arco suave con TRANS_CUBIC
- **Cambio de sprite**: Fade out → cambio a jump_texture → fade in

##### Fase 3: Caída (jump_duration * 0.5)
- **Rotación**: Vuelve a 0° suavemente
- **Gravedad**: Caída con TRANS_QUAD EASE_IN (acelera hacia abajo)

##### Fase 4: Aterrizaje (0.08s + 0.1s)
- **Impacto**: Squash al tocar el suelo
- `scale.y` → 90% (se aplasta)
- `scale.x` → 110% (se ensancha)
- **Recuperación**: Vuelve a escala normal (0.065, 0.065)
- **Cambio de sprite**: Fade out → cambio a idle_texture → fade in

#### 2. **Transiciones Suaves de Sprites**
En lugar de cambios instantáneos:
```gdscript
# Antes
texture = jump_texture

# Ahora
modulate.a → 0.7 (fade out)
texture = jump_texture
modulate.a → 1.0 (fade in)
```

#### 3. **Squash & Stretch**
Técnica clásica de animación que da vida al personaje:
- **Squash**: Se aplasta al anticipar y al aterrizar
- **Stretch**: Se estira durante el salto
- Mantiene el volumen aparente del personaje

#### 4. **Rotación Dinámica**
- Rota según la dirección del movimiento
- Movimientos hacia arriba: +8° (inclinación derecha)
- Movimientos hacia abajo: -8° (inclinación izquierda)
- Rotación suave con interpolación QUAD

#### 5. **Duración Ajustada**
- **Antes**: 0.14 segundos (muy rápido)
- **Ahora**: 0.25 segundos (más pausado y visible)
- Las fases adicionales hacen que el movimiento total sea ~0.45s

## 🎨 Tipos de Transiciones Usadas

### TRANS_BACK
- Crea un efecto de "rebote" o "overshoot"
- Perfecto para anticipación y recuperación
- Usado en: squash inicial, restauración final

### TRANS_CUBIC
- Transición muy suave y natural
- Usado en: movimiento horizontal

### TRANS_QUAD
- Aceleración/desaceleración suave
- Usado en: movimiento vertical, rotación

### TRANS_BOUNCE
- Efecto de rebote al final
- Usado en: aterrizaje (squash de impacto)

## 🎯 Curvas de Easing

### EASE_OUT
- Rápido al inicio, lento al final
- Usado en: anticipación, subida del salto

### EASE_IN
- Lento al inicio, rápido al final
- Usado en: caída (simula gravedad)

### EASE_IN_OUT
- Suave en ambos extremos
- Usado en: movimiento horizontal

## 📊 Timeline del Salto

```
0.00s - 0.06s: Anticipación (squash)
0.06s - 0.11s: Fade + cambio a jump sprite
0.11s - 0.36s: Salto (stretch + rotación + arco)
0.36s - 0.49s: Caída (restaurar rotación)
0.49s - 0.57s: Aterrizaje (squash de impacto)
0.57s - 0.67s: Recuperación + fade a idle sprite
---
Total: ~0.67 segundos por salto
```

## 🎮 Parámetros Ajustables

### En el Inspector:
- **Jump Duration**: 0.25s (duración base del salto)
- **Jump Offset Y**: 18.0 (altura del salto)
- **Sprite Offset Y**: 40.0 (centrado vertical)

### En el Código:
```gdscript
# Anticipación
anticipation_duration: 0.06s
squash_scale_y: 0.85
squash_scale_x: 1.15

# Stretch durante salto
stretch_scale_y: 1.1
stretch_scale_x: 0.95

# Rotación
rotation_amount: ±8°

# Aterrizaje
landing_duration: 0.08s
landing_squash_y: 0.9
landing_squash_x: 1.1

# Restauración
restore_duration: 0.1s

# Fades
fade_duration: 0.05s
fade_alpha: 0.7
```

## 🔧 Personalización Avanzada

### Para saltos más rápidos:
```gdscript
jump_duration = 0.18
anticipation_duration = 0.04
landing_duration = 0.06
```

### Para saltos más dramáticos:
```gdscript
jump_offset_y = 25.0
rotation_amount = deg_to_rad(12)
squash_scale_y = 0.75
stretch_scale_y = 1.2
```

### Para movimiento más "cartoon":
```gdscript
# Usar TRANS_ELASTIC en lugar de TRANS_BACK
tween.tween_property(...).set_trans(Tween.TRANS_ELASTIC)

# Aumentar el overshoot
tween.tween_property(...).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
```

## 📝 Comparación Antes/Después

### Antes:
- Cambio instantáneo de sprites
- Movimiento lineal simple
- 2 fases (subida + caída)
- 0.28s total
- Sin efectos secundarios

### Después:
- Transiciones suaves con fade
- Squash & stretch animado
- 4 fases + subfases
- ~0.67s total (más expresivo)
- Rotación, deformación, anticipación

## 🎪 Técnicas de Animación Utilizadas

### 1. Squash & Stretch
Principio #1 de los 12 principios de animación de Disney
- Da peso y flexibilidad al personaje
- Hace que los movimientos sean más dinámicos

### 2. Anticipación
Principio #2 de animación
- Prepara al espectador para la acción
- Hace el movimiento más creíble

### 3. Arcos
Principio #5 de animación
- Los objetos se mueven en arcos naturales
- Implementado en el movimiento vertical

### 4. Ease In/Out
Principio #6 (Slow In/Out)
- Nada se mueve a velocidad constante
- Aceleración y desaceleración naturales

### 5. Secondary Action
Principio #9
- Rotación como acción secundaria al salto
- Cambio de sprite como acción secundaria

## 🚀 Mejoras Futuras Sugeridas

### 1. Trail/Estela
```gdscript
# Crear copias fantasma del sprite que se desvanecen
func create_trail():
    var ghost = Sprite2D.new()
    ghost.texture = texture
    ghost.modulate = Color(1, 1, 1, 0.5)
    # ... fade out y remove
```

### 2. Partículas al Saltar/Aterrizar
```gdscript
var particles = CPUParticles2D.new()
particles.emitting = true
particles.one_shot = true
```

### 3. Sombra Dinámica
```gdscript
var shadow = Sprite2D.new()
shadow.modulate = Color(0, 0, 0, 0.3)
# Escalar según altura del salto
```

### 4. Camera Shake al Aterrizar
```gdscript
func camera_shake(intensity: float):
    # Shake de la cámara proporcional a la altura de caída
```

### 5. Animación de Idle
```gdscript
# Bounce sutil cuando está quieto
tween.tween_property(self, "position:y", position.y + 2, 1.0)
tween.set_loops()
```

## 📚 Referencias

- **12 Principios de Animación**: Disney Animation
- **Godot Tween Documentation**: [docs.godotengine.org](https://docs.godotengine.org/en/stable/classes/class_tween.html)
- **Juice It or Lose It**: Talk sobre game feel
- **The Art of Screenshake**: Jan Willem Nijman
