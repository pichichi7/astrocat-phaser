# Ajuste de Escala Visual - Balance Tablero/Sprites

## Problema Original
- **Cubos muy pequeños** (64x64 px en pantalla)
- **Sprites muy grandes** (escala 0.065 de imágenes ~1500px)
- **Proporción desbalanceada**: Los personajes dominaban la vista

## Solución Aplicada

### 1. Tablero Más Grande (Cubos)

**Antes:**
```gdscript
tile_w: 64.0
tile_h: 32.0
origin: Vector2(540, 200)
```

**Después:**
```gdscript
tile_w: 96.0   # +50% más ancho
tile_h: 48.0   # +50% más alto
origin: Vector2(540, 180)  # Reajustado para centrado
```

**Resultado:** Pirámide 50% más grande, más presencia visual.

### 2. Sprites Más Pequeños (Personajes)

**Antes:**
```gdscript
Player scale: Vector2(0.065, 0.065)
Enemy scale: Vector2(0.065, 0.065)
```

**Después:**
```gdscript
Player scale: Vector2(0.045, 0.045)  # ~30% más pequeño
Enemy scale: Vector2(0.045, 0.045)   # ~30% más pequeño
```

**Resultado:** Personajes proporcionales a los cubos.

### 3. Offsets Ajustados

**Antes:**
```gdscript
sprite_offset_y: 40.0
jump_offset_y: 18.0
```

**Después:**
```gdscript
sprite_offset_y: 55.0   # +37.5% para cubos más grandes
jump_offset_y: 25.0     # +38.9% para saltos proporcionales
```

**Resultado:** Sprites centrados correctamente en cubos más grandes.

## Comparación Visual

### Escala Anterior
```
Cubo: 64x32 px
Personaje: ~97px altura (0.065 × 1500)
Ratio: Personajes 3x más grandes que cubos ❌
```

### Escala Nueva
```
Cubo: 96x48 px
Personaje: ~67px altura (0.045 × 1500)
Ratio: Personajes 1.4x más grandes que cubos ✅
```

## Proporción 2:1 Mantenida

Todos los cambios mantienen la proporción isométrica:
- **tile_w / tile_h = 96 / 48 = 2.0** ✅
- Sin distorsión en la grilla
- Alineación perfecta

## Impacto en Mecánicas

### ✅ Mecánicas No Afectadas

| Mecánica | Estado |
|----------|--------|
| Movimiento diagonal | ✅ Funciona igual |
| Detección de colisiones | ✅ Basada en (row, col) lógicas |
| Sistema de enemigos | ✅ Sin cambios |
| Animaciones de salto | ✅ Proporcionales |
| Conteo de cubos | ✅ Igual |
| Sistema de vidas | ✅ Sin cambios |

**IMPORTANTE:** Los cambios son solo visuales (escala y posición en pantalla). La lógica del juego usa coordenadas (row, col) que son independientes del tamaño visual.

## Beneficios UX

1. **Mejor legibilidad**: Tablero más prominente
2. **Proporción balanceada**: Sprites no dominan la pantalla
3. **Más espacio visual**: Se aprecia mejor la pirámide completa
4. **Enfoque en gameplay**: El tablero es el protagonista
5. **Menos fatiga visual**: Elementos mejor distribuidos

## Ajustes Finos Opcionales

Si quieres experimentar más:

### Tablero Aún Más Grande
```gdscript
tile_w: 112.0
tile_h: 56.0
sprite scale: 0.04
```

### Sprites Más Pequeños
```gdscript
sprite scale: 0.035
sprite_offset_y: 50.0
```

### Tablero Más Compacto
```gdscript
tile_w: 80.0
tile_h: 40.0
sprite scale: 0.05
```

## Valores Finales Aplicados

```gdscript
# Board.gd
tile_w = 96.0
tile_h = 48.0
origin = Vector2(540, 180)

# Player.gd & Enemy.gd
sprite_offset_y = 55.0
jump_offset_y = 25.0 (solo Player)

# Main.tscn & EnemyManager.gd
scale = Vector2(0.045, 0.045)
```

## Testing

### Checklist Visual
- ✅ Pirámide visible y prominente
- ✅ Sprites proporcionales a cubos
- ✅ Personajes claramente visibles pero no dominantes
- ✅ Alineación isométrica perfecta
- ✅ Espacio visual balanceado

### Checklist Mecánicas
- ✅ Movimiento funciona igual
- ✅ Colisiones detectan correctamente
- ✅ Enemigos se mueven normalmente
- ✅ Saltos con altura apropiada
- ✅ Win/loss conditions funcionan

---

*Última actualización: Balance visual tablero/sprites optimizado sin afectar mecánicas*
