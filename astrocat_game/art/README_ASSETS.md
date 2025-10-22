# Assets de Arte para AstroCat

## 🎨 Assets Necesarios

Este proyecto necesita los siguientes assets de arte. Por ahora, puedes usar placeholders simples hasta tener los assets finales.

### 1. cube_top.png
- **Ubicación**: `res://art/cube_top.png`
- **Tamaño recomendado**: 96x56 píxeles (o proporcional)
- **Descripción**: Sprite de un cubo/rombo isométrico visto desde arriba
- **Formato**: PNG con transparencia
- **Colores**: El script cambiará el tint, así que usa un color neutro (blanco/gris claro)

**Cómo crear un placeholder simple:**
- Abre cualquier editor de imágenes (GIMP, Photoshop, Paint.NET, etc.)
- Crea una imagen de 96x56 píxeles
- Dibuja un rombo/diamante que ocupe el espacio
- Rellénalo de gris claro o blanco
- Guárdalo como PNG con fondo transparente

### 2. astrocat.png
- **Ubicación**: `res://art/astrocat.png`
- **Tamaño recomendado**: 64x64 píxeles (o similar)
- **Descripción**: Sprite del personaje principal (el gato astronauta)
- **Formato**: PNG con transparencia
- **Estilo**: Pixel art o dibujo simple

**Cómo crear un placeholder simple:**
- Crea una imagen de 64x64 píxeles
- Dibuja un círculo o cuadrado simple con orejas de gato
- Añade ojos y quizás un casco de astronauta
- O simplemente usa un emoji de gato 🐱 como placeholder

## 📦 Estructura de Archivos

```
art/
├── cube_top.png        # Cubo isométrico
├── astrocat.png        # Personaje jugador
└── (futuros assets)    # Enemigos, power-ups, etc.
```

## 🎯 Para Empezar Rápido

Si quieres probar el juego inmediatamente sin crear assets:

1. **Opción A: Usar formas geométricas simples**
   - Crea un cuadrado de 96x56 píxeles gris claro para el cubo
   - Crea un círculo de 48x48 píxeles de cualquier color para el jugador

2. **Opción B: Descargar assets gratuitos**
   - Busca "isometric cube sprite" en sitios como OpenGameArt.org o itch.io
   - Busca "cat sprite" o "character sprite" para el jugador

3. **Opción C: Usar colores sólidos temporalmente**
   - El juego funcionará incluso con sprites muy simples
   - El sistema de tinting cambiará los colores automáticamente

## 🔮 Assets Futuros (Roadmap)

Para las siguientes fases del desarrollo, necesitarás:

- **enemy_ball.png**: Bola roja que baja por la pirámide
- **enemy_coily.png**: Serpiente enemiga (sprite animado)
- **disc.png**: Disco de escape/teletransporte
- **particles/**: Efectos de partículas para saltos, caídas, etc.
- **ui/**: Iconos para vidas, progreso, etc.

## 💡 Recomendaciones de Estilo

- **Pixel Art**: Mantén un tamaño de píxel consistente (2x2 o 3x3)
- **Paleta de Colores**: Usa una paleta limitada para mantener coherencia
- **Transparencia**: Siempre usa fondos transparentes (alpha channel)
- **Escala**: Mantén proporciones similares entre todos los sprites

## 📐 Tamaños Recomendados

| Asset | Tamaño Base | Uso |
|-------|------------|-----|
| cube_top.png | 96x56 | Cubos del tablero |
| astrocat.png | 48-64 | Jugador |
| enemy_ball.png | 32-48 | Enemigo bola |
| enemy_coily.png | 48-64 | Enemigo serpiente |
| disc.png | 64x32 | Disco de escape |

## 🚀 Comenzar a Jugar

Una vez que tengas al menos los dos assets básicos (cube_top.png y astrocat.png):

1. Colócalos en la carpeta `art/`
2. Abre el proyecto en Godot
3. ¡El juego debería funcionar!

El script automáticamente aplicará los colores según el estado de cada cubo.
