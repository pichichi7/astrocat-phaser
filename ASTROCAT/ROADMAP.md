# 🗺️ ROADMAP - AstroCat Phaser

## 📍 Estado Actual: v1.0 - Editor de Niveles Completo

```
┌─────────────────────────────────────────────────────────────┐
│                     🎮 ASTROCAT PHASER                      │
│                                                              │
│  ✅ v0.5 - Juego Base          (Completado)                │
│  ├─ Isométrico Q*bert style                                 │
│  ├─ Movimiento y salto                                      │
│  ├─ Enemigos básicos                                        │
│  ├─ Cubos con estados                                       │
│  └─ Menú principal                                          │
│                                                              │
│  ✅ v1.0 - Editor de Niveles   (Completado) ← AQUÍ          │
│  ├─ 7 tipos de bloques especiales                           │
│  ├─ Editor visual interactivo                               │
│  ├─ Almacenamiento en localStorage                          │
│  ├─ Selector de niveles personalizados                      │
│  ├─ Integración con menú principal                          │
│  └─ Documentación completa                                  │
│                                                              │
│  ⏳ v1.5 - Efectos Especiales  (Próximo)                    │
│  ├─ Daño de Lava/Púa                                        │
│  ├─ Deslizamiento en Hielo                                  │
│  ├─ Salto extra en Trampolines                              │
│  ├─ Desaparición de Nubes                                   │
│  └─ Sistema de bonus (Diamantes)                            │
│                                                              │
│  ⏳ v2.0 - Gameplay Avanzado   (Futuro)                     │
│  ├─ Sistema de puntuación                                   │
│  ├─ Dificultad progresiva                                   │
│  ├─ Logros y medallas                                       │
│  ├─ Timing challenges                                       │
│  └─ Modos de juego alternativos                             │
│                                                              │
│  ⏳ v2.5 - Multiplayer         (Futuro)                     │
│  ├─ Compartir niveles vía código                            │
│  ├─ Cloud sync (opcional)                                   │
│  ├─ Leaderboard local                                       │
│  └─ Desafíos comunitarios                                   │
│                                                              │
│  ⏳ v3.0 - Campaña Completa    (Futuro)                     │
│  ├─ 50+ niveles diseñados                                   │
│  ├─ Historia de AstroCat                                    │
│  ├─ Boss fights                                             │
│  └─ Cinematics                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## ✅ v1.0 - Editor de Niveles (ACTUAL)

### ✨ Características Implementadas

- **7 Tipos de Bloques**
  - Normal (blanco) - Estándar
  - Lava (rojo) - Daña
  - Hielo (cyan) - Desliza
  - Trampolín (amarillo) - Salto extra
  - Púa (gris) - Daña
  - Nube (gris claro) - Inestable
  - Diamante (magenta) - Bonus

- **Editor Visual**
  - Interface intuitiva con panel de bloques
  - Click para colocar/eliminar
  - Cambio dinámico de tamaño de pirámide
  - Validación en tiempo real

- **Almacenamiento**
  - localStorage con 50 slots
  - Persistencia segura
  - Exportable a JSON

- **Integración**
  - Menú principal con 3 botones
  - Selector de niveles personalizado
  - Carga de niveles en GameScene

- **Documentación**
  - Guía completa (EDITOR_GUIDE.md)
  - Quick start (EDITOR_QUICKSTART.md)
  - Detalles técnicos (EDITOR_IMPLEMENTATION.md)

## ⏳ v1.5 - Efectos Especiales (TODO)

### Por Implementar

1. **Lava Block** 🔴
   - Detectar colisión jugador
   - Aplicar daño (-1 vida)
   - Efecto visual: sangrado

2. **Spike Block** ⚫
   - Similar a lava
   - Animación de púa
   - Sonido de daño

3. **Ice Block** 🔵
   - Fricción reducida
   - Velocidad aumentada de deslizamiento
   - Skid visual

4. **Trampoline Block** 🟡
   - Altura de salto aumentada (+50%)
   - Sonido de rebote
   - Animación de compresión

5. **Cloud Block** ⚪
   - Desaparece después de saltar
   - Transición visual: fade out
   - Aparición de aviso

6. **Diamond Block** 🟣
   - Coleccionable (no obligatorio)
   - +10 puntos
   - Efecto de brillo
   - HUD actualiza puntos

### Archivos a Modificar

- `GameScene.js` - Lógica de cubos especiales
- `config.js` - Parámetros de efectos
- `Player.js` - Manejo de colisiones especiales

## ⏳ v2.0 - Gameplay Avanzado (FUTURO)

### Sistema de Puntuación

```
Cubo Normal:      1 pt
Cubo Lava:        5 pt (evitar)
Cubo Hielo:      2 pt (difícil)
Trampolín:       3 pt (útil)
Púa:             5 pt (evitar)
Nube:            2 pt (temporal)
Diamante:       10 pt (bonus)

Bonus por tiempo: +50 pts si completas < 2 min
Bonus sin daño:  +100 pts si no pierdes vidas
```

### Dificultad Progresiva

```
Nivel 1-3:   3 filas, 1 enemigo, sin bloques especiales
Nivel 4-7:   5 filas, 2 enemigos, hielo + trampolín
Nivel 8-10:  7 filas, 3 enemigos, lava + nubes
Nivel 11+:   9+ filas, 4+ enemigos, todo mixto
```

### Logros

- 🏅 Primer Nivel
- 🏅 Sin Daño
- 🏅 Speedrun (< 1 min)
- 🏅 Coleccionista (todos diamantes)
- 🏅 Especialista en Hielo
- 🏅 Maestro de Trampolines

## ⏳ v2.5 - Multiplayer (FUTURO)

### Compartir Niveles

```
Código de Nivel:
  astrocat://level/abc123def456...
  
Jugador copia → Pega en editor → ¡Carga!
```

### Cloud Sync (Opcional)

```
Login → Sincroniza niveles
→ Juega en otro dispositivo
→ Estadísticas en la nube
```

### Leaderboard

```
Puntos globales (si cloud está habilitado)
Top 100 jugadores por nivel
```

## ⏳ v3.0 - Campaña Completa (FUTURO)

### Niveles Diseñados

- **Capítulo 1: Planeta Azul** (Niveles 1-10)
  - Introducción suave
  - Primeros bloques especiales
  - Boss: Guardián de Hielo

- **Capítulo 2: Bosque Magma** (Niveles 11-20)
  - Mucha lava
  - Trampolines necesarios
  - Boss: Dragón de Lava

- **Capítulo 3: Torre Celestial** (Niveles 21-30)
  - Nubes flotantes
  - Diamantes esparcidos
  - Boss: Guardian del Cielo

- **Capítulo 4: Corazón de la Galaxia** (Niveles 31+)
  - Mezcla todo
  - Épico
  - Final Boss

### Historia

> AstroCat explora la galaxia buscando cristales mágicos...
> Cada planeta tiene guardianes especiales...
> ¿Logrará reunir todos los cristales?

## 📊 Comparativa de Versiones

| Característica | v1.0 | v1.5 | v2.0 | v2.5 | v3.0 |
|---|---|---|---|---|---|
| Juego Base | ✅ | ✅ | ✅ | ✅ | ✅ |
| Editor | ✅ | ✅ | ✅ | ✅ | ✅ |
| Bloques Base | ✅ | ✅ | ✅ | ✅ | ✅ |
| Efectos Especiales | ⏳ | ✅ | ✅ | ✅ | ✅ |
| Puntuación | ⏳ | ⏳ | ✅ | ✅ | ✅ |
| Logros | ⏳ | ⏳ | ✅ | ✅ | ✅ |
| Cloud Sync | ⏳ | ⏳ | ⏳ | ✅ | ✅ |
| Campaña | ⏳ | ⏳ | ⏳ | ⏳ | ✅ |

## 🎯 Próximos Pasos (Inmediatos)

### v1.5 - Efectos Especiales

1. **Semana 1**: Implementar Lava + Hielo
2. **Semana 2**: Trampolín + Nubes
3. **Semana 3**: Diamantes + Efectos visuales
4. **Semana 4**: Testing y balance

### Tiempo Estimado
- 3-4 semanas de desarrollo
- Focus en gameplay balance
- Testing con múltiples niveles

## 📈 Métricas de Éxito

- [ ] 50+ niveles jugables
- [ ] Puntuación funcional
- [ ] 5+ logros desbloqueables
- [ ] Tiempo de juego promedio 2-3 hrs
- [ ] Satisfacción de usuario > 4/5

---

**Última actualización**: 18 Oct 2025
**Versión Actual**: 1.0 (Editor Completo)
**Próxima Versión**: 1.5 (Efectos Especiales)
