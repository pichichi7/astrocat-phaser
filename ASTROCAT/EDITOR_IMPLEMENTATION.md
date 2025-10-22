# 📝 CAMBIOS - SISTEMA DE EDITOR DE NIVELES

## ✅ Implementado

### 1. **LevelFormat.js** - Sistema de Serialización
- 7 tipos de bloques especiales:
  - Normal (blanco)
  - Lava (rojo) - daña
  - Hielo (cyan) - sin fricción
  - Trampolín (amarillo) - salto extra
  - Púa (gris) - daña
  - Nube (gris claro) - inestable
  - Diamante (magenta) - bonus

- Métodos:
  - `serializeLevel()` - Convertir a JSON
  - `deserializeLevel()` - Cargar desde JSON
  - `exportLevel()` - Descargar como archivo
  - `importLevel()` - Cargar desde archivo
  - `validateLevel()` - Validar estructura

### 2. **LevelStorage.js** - Almacenamiento LocalStorage
- Guarda/carga niveles en el navegador
- Máximo 50 niveles por usuario
- Métodos:
  - `saveLevel()` - Guardar nuevo o actualizar
  - `loadLevel()` - Cargar por nombre
  - `getAllLevels()` - Lista todos
  - `deleteLevel()` - Eliminar
  - `clearAllLevels()` - Limpiar todo
  - `getStatistics()` - Info de niveles

### 3. **EditorScene.js** - Editor Visual Completo
- Interfaz visual intuitiva
- Panel derecho con tipos de bloques
- Panel inferior con controles
- Click para colocar/eliminar bloques
- Cambio dinámico de tamaño de pirámide (3-10 filas)
- Validación de niveles antes de guardar
- Keyboard shortcuts (S=Guardar, M=Menú, C=Limpiar, +/-)

#### Controles del Editor
```
CLICK IZQUIERDO   → Colocar/Cambiar bloque
CLICK DERECHO     → Eliminar bloque
+ / -             → Aumentar/Disminuir filas
S                 → Guardar nivel
M                 → Volver al menú
C                 → Limpiar todos los bloques
```

### 4. **LevelSelectScene.js** - Selector de Niveles
- Lista todos los niveles guardados
- Vista con paginación (9 niveles por página)
- Botones por nivel:
  - JUGAR - Cargar y jugar
  - BORRAR - Eliminar con confirmación
- Info de cada nivel (nombre, filas, bloques, dificultad)
- Volver al menú

### 5. **MenuScene.js** - Actualización
- Tres botones principales:
  - **JUGAR** (Verde) - Juego estándar
  - **MIS NIVELES** (Azul) - Selector de niveles personalizados
  - **EDITOR** (Naranja) - Crear/editar niveles

### 6. **main.js** - Registro de Escenas
- Importa EditorScene
- Importa LevelSelectScene
- Las agrega al config

## 🎮 Flujo de Uso

```
MENÚ PRINCIPAL
    ↓
    ├─→ JUGAR (GameScene estándar)
    │
    ├─→ MIS NIVELES (LevelSelectScene)
    │   ├─→ JUGAR nivel (GameScene + customLevel)
    │   └─→ BORRAR nivel
    │
    └─→ EDITOR (EditorScene)
        ├─ Crear nuevo nivel
        ├─ Colocar/eliminar bloques
        └─ GUARDAR → LevelStorage
```

## 📦 Archivos Creados

```
src/
├── LevelFormat.js        (nueva) - Serialización
├── LevelStorage.js       (nueva) - Almacenamiento
├── scenes/
│   ├── EditorScene.js    (nueva) - Editor visual
│   ├── LevelSelectScene.js (nueva) - Selector
│   └── MenuScene.js      (modificado) - Nuevos botones
└── main.js               (modificado) - Registro escenas
```

## 💾 Almacenamiento

- **Ubicación**: localStorage del navegador
- **Clave**: `astrocat_levels`
- **Formato**: JSON array con objetos nivel
- **Límite**: 50 niveles
- **Persistencia**: Se mantiene hasta que se limpie cache

## 🔧 Configuración de Bloques

```javascript
BLOCK_TYPES = {
    NORMAL: 0,      // Cubo normal
    LAVA: 1,        // Daña
    ICE: 2,         // Deslizante
    TRAMPOLINE: 3,  // Salto extra
    SPIKE: 4,       // Daña
    CLOUD: 5,       // Inestable
    DIAMOND: 6      // Bonus
}

BLOCK_COLORS = {
    0: 0xffffff,    // Blanco
    1: 0xff0000,    // Rojo
    2: 0x00ffff,    // Cyan
    3: 0xffff00,    // Amarillo
    4: 0x444444,    // Gris oscuro
    5: 0xcccccc,    // Gris claro
    6: 0xff00ff     // Magenta
}
```

## 📊 Estructura de Nivel Guardado

```json
{
  "name": "Mi Primer Nivel",
  "description": "Un nivel de prueba",
  "rows": 7,
  "difficulty": "normal",
  "blocks": [
    { "row": 0, "col": 0, "type": 0 },
    { "row": 1, "col": 0, "type": 1 },
    { "row": 2, "col": 1, "type": 3 }
  ],
  "enemies": [],
  "timeCreated": "2025-10-18T...",
  "version": 1
}
```

## 🚀 Próximas Características (Futuro)

- [ ] Importar/Exportar niveles como archivos
- [ ] Repositorio online de niveles
- [ ] Puntuación y ranking
- [ ] Efectos de bloques especiales en GameScene
- [ ] Animaciones de bloques al destruirse
- [ ] Música y sonidos ambientales
- [ ] Dificultad personalizada por nivel

## ⚠️ Notas Importantes

1. **Los bloques especiales aún NO tienen efecto de juego**
   - En EditorScene se pueden colocar visualmente
   - Pero en GameScene se tratan como bloques normales
   - Necesita implementación en GameScene.js

2. **Validación de Niveles**
   - Verifica que haya bloque central (0,0)
   - Verifica tamaño y nombre
   - No valida accesibilidad de cubos

3. **Performance**
   - Optimizado para hasta 50 niveles
   - localStorage tiene límite de ~5MB por dominio
   - Con 50 niveles complejos, usos ~200-500KB

---

**Estado**: ✅ EDITOR COMPLETO Y FUNCIONAL

Próximo paso: Implementar efectos de bloques especiales en GameScene.js
