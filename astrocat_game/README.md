# 🐱 AstroCat - Q*bert Style Isometric Puzzle Game

Un juego de puzzle isométrico inspirado en Q*bert, desarrollado en Godot 4.x.

## 🎮 Descripción

AstroCat es un juego de plataformas isométrico donde controlas a un gato astronauta que debe pisar todos los cubos de una pirámide para cambiar su color. ¡Cuidado con no caerte!

## ✨ Características

- ✅ **Movimiento Isométrico Diagonal**: Controles intuitivos en 4 direcciones
- ✅ **Sistema de Vidas**: 3 vidas para completar cada nivel
- ✅ **Animaciones Suaves**: Saltos con arco y caídas animadas
- ✅ **Sistema de Progreso**: Rastrea cubos completados vs totales
- ✅ **Soporte Móvil**: Controles táctiles con gestos de swipe
- ✅ **Pirámide Configurable**: Fácil de ajustar tamaño y dificultad

## 🕹️ Controles

### Teclado (PC)
```
W / ↑  →  Arriba-Izquierda (↖)
D / →  →  Arriba-Derecha (↗)
A / ←  →  Abajo-Izquierda (↙)
S / ↓  →  Abajo-Derecha (↘)
```

### Móvil
- **Swipe** en cualquier dirección diagonal para moverte
- El juego detecta automáticamente la dirección del swipe

### Gamepad
- **D-Pad**: Movimiento diagonal
- Compatible con controles estándar

## 🎯 Objetivo del Juego

1. Pisa todos los cubos de la pirámide
2. Cada cubo cambia de color al pisarlo (Blanco → Cyan → Verde)
3. Completa todos los cubos para ganar el nivel
4. No te caigas de la pirámide o perderás una vida
5. Completa el nivel antes de perder todas tus vidas

## 🚀 Instalación y Ejecución

### Requisitos
- **Godot 4.3+** o superior
- Sistema operativo: Windows, Linux, macOS, Android, iOS

### Pasos

1. **Clonar o descargar** este repositorio:
```bash
git clone https://github.com/tuusuario/astrocat.git
cd astrocat
```

2. **Añadir Assets** (temporal hasta tener los finales):
   - Coloca `cube_top.png` en `art/`
   - Coloca `astrocat.png` en `art/`
   - Ver `art/README_ASSETS.md` para más detalles

3. **Abrir en Godot**:
   - Abre Godot Engine
   - Selecciona "Import" y navega a la carpeta del proyecto
   - Selecciona `project.godot`

4. **Ejecutar**:
   - Presiona F5 o click en el botón "Play"
   - ¡Disfruta!

## 📁 Estructura del Proyecto

```
astrocat_game/
├── art/                    # Assets gráficos
│   ├── cube_top.png       # Sprite del cubo isométrico
│   ├── astrocat.png       # Sprite del jugador
│   └── README_ASSETS.md   # Guía de assets
├── scripts/               # Scripts GDScript
│   ├── Cube.gd           # Lógica de cada cubo
│   ├── Board.gd          # Generación de pirámide
│   ├── Player.gd         # Movimiento y lógica del jugador
│   └── UI.gd             # Interfaz de usuario
├── scenes/                # Escenas de Godot
│   └── Main.tscn         # Escena principal del juego
└── project.godot          # Configuración del proyecto
```

## 🔧 Configuración Avanzada

### Modificar el Tamaño de la Pirámide

En `Board.gd` o en el Inspector de Godot:
```gdscript
@export var rows: int = 7  # Cambia esto para más/menos filas
```

### Ajustar Dificultad

En `Player.gd`:
```gdscript
@export var lives: int = 3           # Número de vidas
@export var jump_duration: float = 0.14  # Velocidad de movimiento
```

### Cambiar Colores de Cubos

En `Cube.gd`, método `_update_visual()`:
```gdscript
var colors := [
    Color.WHITE,           # Estado 0
    Color8(125, 211, 252), # Estado 1
    Color8(52, 211, 153)   # Estado 2
]
```

## 🗺️ Roadmap - Próximas Características

### Fase 1: Enemigos Básicos ⏳
- [ ] **Bolas Rojas**: Enemigos que bajan aleatoriamente
- [ ] Colisión con el jugador
- [ ] Sistema de daño/muerte

### Fase 2: Enemigo Inteligente 🐍
- [ ] **Serpiente Coily**: Enemigo que persigue al jugador
- [ ] IA de pathfinding isométrico
- [ ] Animación de "eclosión" al llegar al fondo

### Fase 3: Power-ups y Mecánicas ⚡
- [ ] **Discos de Escape**: Teletransporte a niveles superiores
- [ ] Power-ups de congelamiento
- [ ] Sistema de puntos

### Fase 4: Niveles y Progresión 📈
- [ ] Sistema de niveles múltiples
- [ ] Incremento gradual de dificultad
- [ ] Diferentes patrones de pirámide
- [ ] Guardado de progreso

### Fase 5: Polish y Efectos ✨
- [ ] Partículas y efectos visuales
- [ ] Música y efectos de sonido
- [ ] Animaciones mejoradas
- [ ] Menú principal y pantalla de game over

### Fase 6: Multijugador (Opcional) 👥
- [ ] Modo cooperativo local
- [ ] Modo competitivo
- [ ] Leaderboards

## 🎨 Arte y Assets

Los assets actuales son placeholders. Para el juego final necesitarás:

- Sprites de cubo isométrico de alta calidad
- Sprite animado del gato astronauta
- Sprites de enemigos (bolas, serpiente)
- Efectos de partículas
- Iconos de UI
- Fondos y decoraciones

Ver `art/README_ASSETS.md` para especificaciones detalladas.

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si quieres mejorar AstroCat:

1. Fork el proyecto
2. Crea una branch para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

## 👨‍💻 Autor

Creado como proyecto de ejemplo para demostrar:
- Matemática isométrica en Godot
- Sistema de grid lógico
- Animaciones con Tweens
- Arquitectura de juego modular

## 🙏 Agradecimientos

- Inspirado en el clásico **Q*bert** (1982)
- Desarrollado con **Godot Engine 4.x**
- Documentación y tutoriales de la comunidad de Godot

## 📞 Contacto y Soporte

¿Tienes preguntas o sugerencias?
- Abre un Issue en GitHub
- Contacta al autor

---

**¡Disfruta jugando AstroCat!** 🐱🚀

```
     /\_/\  
    ( o.o ) 
     > ^ <  AstroCat
    /|   |\
   (_|   |_)
```
