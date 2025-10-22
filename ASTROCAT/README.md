# AstroCat - Phaser Edition

¡Un juego de puzzle isométrico donde controlas a AstroCat saltando por cubos espaciales!

## 🎮 Menú Principal

El juego ahora tiene un **menú con 3 opciones**:

```
┌─────────────────────────────────────┐
│         🐱 ASTROCAT                 │
│                                      │
│  ┌──────────────────────────────┐  │
│  │  [JUGAR]  [MIS NIVELES]      │  │
│  │         [EDITOR]              │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Opciones

1. **JUGAR** (Verde)
   - Juega el juego estándar
   - 7 filas, bloques normales
   - Clásico AstroCat

2. **MIS NIVELES** (Azul)
   - Selecciona niveles personalizados que creaste
   - Vista de lista con paginación
   - Juega o elimina niveles

3. **EDITOR** (Naranja)
   - Crea tus propios niveles
   - 7 tipos de bloques especiales
   - Guarda y comparte tus creaciones

## 🎨 Editor de Niveles

### ¿Qué es?

Un editor visual para crear **niveles personalizados** con bloques especiales. Tus niveles se guardan en el navegador.

### Tipos de Bloques

```
⬜ Normal    (Blanco)   - Cubo estándar
🔴 Lava      (Rojo)     - ⚠️ Daña al jugador
🔵 Hielo     (Cyan)     - Deslizante
🟡 Trampolín (Amarillo) - 🚀 Salto extra
⚫ Púa       (Gris)     - ⚠️ Daña
⚪ Nube      (Claro)    - ☁️ Desaparece
🟣 Diamante  (Magenta)  - ✨ Bonus
```

### Controles del Editor

| Acción | Control |
|--------|---------|
| Colocar bloque | Click izquierdo |
| Eliminar bloque | Click derecho |
| Cambiar tamaño | Teclas `+` / `-` |
| Guardar | Tecla `S` |
| Menú | Tecla `M` |
| Limpiar todo | Tecla `C` |

### Flujo Rápido

1. **MENÚ** → Click en **"EDITOR"**
2. **Selecciona** tipo de bloque en panel derecho
3. **Click** en cubos para colocar
4. **Guarda** (tecla `S`)
5. **Prueba** → MIS NIVELES → JUGAR

Para guía completa: Ver `EDITOR_GUIDE.md`

## 🎮 Cómo Jugar

### Objetivo
- Salta sobre todos los cubos para cambiar su color
- Los cubos cambian de blanco → cyan → verde (completado)
- Completa todos los cubos para avanzar al siguiente nivel
- ¡Evita a los enemigos de agua!

### Controles
- **Teclado:**
  - W/↑ - Mover Arriba-Izquierda
  - D/→ - Mover Arriba-Derecha  
  - A/← - Mover Abajo-Izquierda
  - S/↓ - Mover Abajo-Derecha

- **Móvil/Tablet:**
  - Desliza en las direcciones diagonales para mover

### Mecánicas
- 3 vidas por nivel
- Los enemigos se mueven automáticamente
- Si tocas un enemigo o te caes del tablero, pierdes una vida
- El tablero crece en niveles avanzados

## 🚀 Cómo Ejecutar

1. **Opción 1: Servidor Web Local**
   ```bash
   cd ASTROCAT
   python -m http.server 8080
   ```
   Luego abre http://localhost:8080 en tu navegador

2. **Opción 2: Live Server (VS Code)**
   - Instala la extensión "Live Server" en VS Code
   - Haz clic derecho en `index.html` → "Open with Live Server"

3. **Opción 3: Navegador Directo**
   - Simplemente abre `index.html` en tu navegador
   - (Nota: algunos navegadores requieren servidor para assets)

## 🎨 Assets Incluidos

- ✅ AstroCat (estático y saltando)
- ✅ Cubos isométricos
- ✅ Enemigos de agua (estático y movimiento)
- ✅ Fondo espacial
- ✅ HUD con diseño temático

## 🔧 Estructura del Proyecto

```
ASTROCAT/
├── index.html          # Punto de entrada
├── phaser.js          # Librería Phaser
├── assets/            # Sprites y recursos
│   ├── astrocat.png
│   ├── astrocat_jump.png
│   ├── cube_top.png
│   ├── water_enemy.png
│   ├── water_enemy_move.png
│   └── ...
└── src/
    ├── main.js        # Configuración principal
    └── scenes/
        ├── MenuScene.js   # Pantalla de menú
        └── GameScene.js   # Lógica del juego
```

## 🌟 Características

- **Física isométrica** precisa
- **Sistema de enemigos** con IA de patrullaje
- **Controles táctiles** optimizados para móviles
- **Progresión de niveles** con dificultad creciente
- **UI responsive** con elementos temáticos
- **Animaciones fluidas** para movimientos y efectos

## 🎯 Diferencias con la Versión Godot

- Adaptado completamente a Phaser.js
- Optimizado para navegadores web
- Controles táctiles mejorados
- Sistema de assets simplificado
- Física de movimiento suavizada

¡Diviértete explorando el espacio con AstroCat! 🚀🐱
