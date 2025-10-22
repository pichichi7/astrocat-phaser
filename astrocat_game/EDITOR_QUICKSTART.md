# 🚀 Quick Start - Editor de Niveles

## Abrir el Editor

1. Ejecuta el juego en Godot (F5)
2. En el menú principal, click en **"🎨 Level Editor"**

## Crear tu Primer Nivel (2 minutos)

### Paso 1: Pintar Tiles
```
Presiona tecla 1
Click y arrastra en el grid para pintar tiles azules
```

### Paso 2: Colocar Spawn
```
Presiona tecla 2 o S
Click en un tile para colocar el punto de inicio (verde)
```

### Paso 3: (Opcional) Añadir Enemigos
```
Presiona tecla 3 para enemigo patrulla (rojo)
Click en uno o dos tiles para colocar enemigos
```

### Paso 4: Validar
```
Mira el panel lateral:
✅ "Ready to play!" = ¡Perfecto!
❌ Error específico = Corrige lo que falta
```

### Paso 5: Probar
```
Click en "▶️ Test Level"
¡Juega tu nivel!
```

## Controles Básicos

| Acción | Control |
|--------|---------|
| Pintar tile | Tecla `1` + Click |
| Borrar tile | Tecla `0` + Click |
| Colocar spawn | Tecla `2` o `S` + Click |
| Enemigo patrulla | Tecla `3` + Click |
| Enemigo random | Tecla `4` + Click |
| Mover cámara | Click derecho + Drag |
| Pintar continuo | Mantener click + Drag |

## Compartir tu Nivel

1. Click en **"📤 Export (Copy)"**
2. El código se copia automáticamente
3. Pégalo en Reddit, Discord o un archivo

Ejemplo de post en Reddit:
```markdown
[AstroCat] Mi Primer Nivel!

Code: eyJpZCI6IiIsIm5hbWUiOiJNeSBMZXZlbCIsInJvd3MiOjcsImNvb...

Dificultad: ⭐⭐⭐ (Medio)
Enemigos: 2
```

## Importar un Nivel

1. Copia un código base64 de otro usuario
2. Click en **"📥 Import (Paste)"**
3. ¡El nivel se carga automáticamente!

## Tips para Principiantes

### ✅ DO
- Empieza con pocos tiles (5-10)
- Prueba frecuentemente con "Test Level"
- Asegúrate de que el spawn esté sobre un tile activo
- Guarda tus niveles (Export) antes de cerrar

### ❌ DON'T
- No hagas niveles imposibles (sin tiles alcanzables)
- No pongas más de 5 enemigos (límite del editor)
- No olvides colocar el spawn
- No cierres sin exportar tu nivel

## Solución de Problemas Comunes

### "No hay tiles jugables"
→ Presiona `1` y pinta al menos un tile

### "Falta el punto de inicio"
→ Presiona `2` y click en un tile

### "Start no está sobre un tile"
→ Asegúrate de que el spawn (verde) esté sobre un tile activo (azul)

### "Demasiados enemigos"
→ Máximo 5 enemigos por nivel

## Ejemplos de Niveles

### Nivel Tutorial (Fácil)
```
Filas: 5
Tiles: Todos activos
Spawn: Fila 0
Enemigos: 1 enemigo patrulla
```

### Nivel Desafío (Medio)
```
Filas: 7
Tiles: 50% activos (patrón de cruz)
Spawn: Centro
Enemigos: 3 enemigos (2 patrulla, 1 random)
```

### Nivel Experto (Difícil)
```
Filas: 8
Tiles: 30% activos (camino estrecho)
Spawn: Esquina
Enemigos: 5 enemigos estratégicamente colocados
```

## Recursos Adicionales

- **Guía completa**: Lee `EDITOR_GUIDE.md`
- **Documentación técnica**: Lee `EDITOR_MVP_README.md`
- **Estado del proyecto**: Lee `EDITOR_STATUS.md`

## ¿Necesitas Ayuda?

Si tienes problemas:
1. Revisa la consola de Godot (Output panel)
2. Lee los mensajes de error en el panel del editor
3. Consulta `EDITOR_GUIDE.md` para detalles

---

**¡Diviértete creando niveles! 🐱🎮✨**
