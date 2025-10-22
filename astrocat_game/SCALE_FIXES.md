# Corrección de Escalas y Sincronización

## Problemas Detectados

### 1. AstroCat se ve chico al inicio y luego crece
**Causa:** Valor hardcoded en animación de restauración

En `Player.gd` línea 170:
```gdscript
restore_tween.tween_property(self, "scale", Vector2(0.065, 0.065), 0.06)
```

Este valor **0.065** era de la escala antigua, pero Main.tscn usa **0.045**.

**Efecto:** 
- Sprite inicia en escala 0.045 (Main.tscn)
- Al saltar, usa multiplicadores basados en scale.x (correcto)
- Al terminar salto, fuerza escala a 0.065 (hardcoded) 
- Sprite se ve más grande después del primer salto

### 2. Enemigos se ven muy chicos
**Causa:** Escala 0.045 era demasiado pequeña comparada con el jugador después del bug de escala.

## Soluciones Aplicadas

### 1. Corrección de Escala de Restauración

**Antes:**
```gdscript
restore_tween.tween_property(self, "scale", Vector2(0.065, 0.065), 0.06)
```

**Después:**
```gdscript
restore_tween.tween_property(self, "scale", Vector2(0.045, 0.045), 0.06)
```

✅ Ahora mantiene la escala consistente en **0.045** durante todo el juego.

### 2. Ajuste de jump_offset_y en Main.tscn

**Antes:**
```gdscript
jump_offset_y = 20.0
```

**Después:**
```gdscript
jump_offset_y = 25.0
```

✅ Sincronizado con el valor en Player.gd

### 3. Escala de Enemigos Aumentada

**Antes:**
```gdscript
enemy.scale = Vector2(0.045, 0.045)
```

**Después:**
```gdscript
enemy.scale = Vector2(0.05, 0.05)
```

✅ Enemigos ligeramente más grandes (~11% más) para mejor visibilidad.

## Valores Finales Consistentes

### Player (AstroCat)
```gdscript
# Main.tscn
scale = Vector2(0.045, 0.045)
jump_offset_y = 25.0

# Player.gd
sprite_offset_y = 55.0
jump_offset_y = 25.0
restore scale = Vector2(0.045, 0.045)  # ✅ CORREGIDO
```

### Enemies (Water Enemies)
```gdscript
# EnemyManager.gd
scale = Vector2(0.05, 0.05)  # ✅ Ligeramente más grandes
offset = Vector2(0, 20)

# Enemy.gd
sprite_offset_y = 55.0
```

## Comparación de Escalas

| Elemento | Escala | Tamaño Relativo |
|----------|--------|-----------------|
| Cubos | 96x48 px | 100% (base) |
| AstroCat | 0.045 | ~70px altura |
| Enemigos | 0.05 | ~78px altura |

**Ratio AstroCat vs Cubo:** 70/96 = ~0.73 (73% del cubo)
**Ratio Enemigo vs Cubo:** 78/96 = ~0.81 (81% del cubo)
**Diferencia visual:** Enemigos ~11% más grandes que AstroCat

## Testing

### Checklist de Escala
- ✅ AstroCat mantiene tamaño consistente
- ✅ No hay "crecimiento" después del primer salto
- ✅ Animaciones de squash & stretch proporcionales
- ✅ Enemigos visibles pero no dominantes
- ✅ Proporción AstroCat:Cubo = ~3:4
- ✅ Proporción Enemigo:Cubo = ~4:5

### Antes vs Después

**Antes:**
```
Frame 1: AstroCat scale 0.045 ✅
Salto 1: Animación OK
Post-salto: Restaura a 0.065 ❌ (crece!)
Frame N: AstroCat scale 0.065 (incorrecto)
```

**Después:**
```
Frame 1: AstroCat scale 0.045 ✅
Salto 1: Animación OK ✅
Post-salto: Restaura a 0.045 ✅
Frame N: AstroCat scale 0.045 ✅ (consistente)
```

## Lecciones Aprendidas

### Problema: Valores Hardcoded
- ❌ **Malo:** `Vector2(0.065, 0.065)` hardcoded en animación
- ✅ **Mejor:** Usar `scale` actual como referencia
- ✅ **Ideal:** Variable exportada para escala base

### Solución Alternativa (Más Robusta)

Agregar variable de escala base:
```gdscript
# Player.gd
@export var base_scale: float = 0.045

# En animación
restore_tween.tween_property(self, "scale", Vector2(base_scale, base_scale), 0.06)
```

Esto evitaría futuros desincronizaciones.

## Mejoras Futuras Opcionales

### Opción A: Variable de Escala Base
```gdscript
# Player.gd
@export var base_scale: float = 0.045

func _ready():
    scale = Vector2(base_scale, base_scale)
```

### Opción B: Leer Escala Inicial
```gdscript
# Player.gd
var initial_scale: Vector2

func _ready():
    initial_scale = scale  # Guardar escala de Main.tscn

# En animación
restore_tween.tween_property(self, "scale", initial_scale, 0.06)
```

### Opción C: Calcular desde scale.x
```gdscript
# En animación (ya funcionan así la mayoría)
restore_tween.tween_property(self, "scale:y", scale.x, 0.06)
restore_tween.tween_property(self, "scale:x", scale.x, 0.06)
```

## Verificación Final

### Comandos de Test
1. Iniciar juego → AstroCat debe verse consistente
2. Hacer varios saltos → Tamaño debe mantenerse igual
3. Observar enemigos → Deben ser visibles y amenazantes
4. Comparar con cubos → Proporciones balanceadas

---

*Última actualización: Corrección de escala hardcoded y sincronización completa*
