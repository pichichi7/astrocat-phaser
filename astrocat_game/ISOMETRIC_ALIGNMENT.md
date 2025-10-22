# Corrección de Alineación Isométrica

## Problema Identificado

Los cubos no estaban alineados correctamente porque:
1. **Sprite cuadrado (64x64)** no coincide naturalmente con proyección isométrica
2. **tile_w y tile_h anteriores** (96x56) no seguían proporción 2:1 isométrica estándar
3. **Escalado** causaba distorsión en la grilla

## Solución Aplicada

### 1. Ajuste de Dimensiones de Tile

**Antes:**
```gdscript
tile_w: 96.0
tile_h: 56.0
```

**Después:**
```gdscript
tile_w: 64.0   # Coincide con ancho del sprite
tile_h: 32.0   # Proporción 2:1 isométrica perfecta
```

### 2. Proporción Isométrica

La proyección isométrica estándar usa **2:1** (ancho:alto):
- **tile_w = 64** → Cada cubo ocupa 64px de ancho
- **tile_h = 32** → Cada cubo ocupa 32px de alto
- **Ratio: 64/32 = 2:1** ✅ Perfecto para isométrico

### 3. Ajuste del Origen

```gdscript
origin: Vector2(540, 200)  # Movido de 160 a 200 para mejor centrado
```

### 4. Escala Consistente

El sprite 64x64 ahora se escala 1:1 (scale_factor = 64/64 = 1.0), eliminando distorsiones.

## Fórmula de Conversión Isométrica

```gdscript
func iso_to_screen(row: int, col: int) -> Vector2:
    return Vector2(
        origin.x + (col - row) * (tile_w / 2.0),  # Desplazamiento horizontal
        origin.y + (col + row) * (tile_h / 2.0)   # Desplazamiento vertical
    )
```

Con **tile_w=64** y **tile_h=32**:
- Cada paso diagonal mueve **32px horizontalmente**
- Cada paso diagonal mueve **16px verticalmente**

## Matemática Isométrica

### Proyección Isométrica Estándar

En un grid isométrico 2:1:
- Los ejes X e Y del mundo 2D se proyectan a 45° y -45°
- La altura (profundidad Z) se proyecta verticalmente

### Cálculo de Posición

Para posición (row, col):
```
screen_x = origin_x + (col - row) * (tile_w / 2)
screen_y = origin_y + (col + row) * (tile_h / 2)
```

Ejemplo con (row=2, col=1):
```
x = 540 + (1 - 2) * 32 = 540 - 32 = 508
y = 200 + (1 + 2) * 16 = 200 + 48 = 248
```

## Resultado Visual

### Antes
- Cubos con diferentes alturas aparentes
- Grilla no uniforme
- Espaciado irregular

### Después
- ✅ Cubos perfectamente alineados
- ✅ Grilla isométrica uniforme
- ✅ Pirámide visualmente consistente
- ✅ Proporción 2:1 estándar

## Offsets de Sprites

Los offsets de personajes permanecen igual:
```gdscript
# Player.gd
sprite_offset_y: 40.0

# Enemy.gd  
sprite_offset_y: 40.0
```

Esto los centra verticalmente sobre los cubos de 64px de alto.

## Verificación

### Checklist de Alineación
- ✅ tile_w = 64 (ancho del sprite)
- ✅ tile_h = 32 (proporción 2:1)
- ✅ Ratio 2:1 = isométrico estándar
- ✅ cube.centered = true
- ✅ cube.offset = Vector2.ZERO
- ✅ Escala 1:1 sin distorsión

### Testing Visual
1. Los cubos forman una pirámide perfecta
2. Las líneas diagonales son rectas
3. El espaciado es uniforme
4. Los personajes están centrados en los cubos

## Alternativas Futuras

Si quieres ajustar la escala visual:

### Opción A: Cubos más grandes
```gdscript
tile_w: 96.0
tile_h: 48.0  # Mantener ratio 2:1
```

### Opción B: Cubos más pequeños
```gdscript
tile_w: 48.0
tile_h: 24.0  # Mantener ratio 2:1
```

**IMPORTANTE**: Siempre mantener **tile_w = 2 × tile_h** para isométrico correcto.

---

*Última actualización: Corrección de alineación isométrica con proporción 2:1*
