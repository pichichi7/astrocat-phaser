# 🎮 EDITOR DE NIVELES - GUÍA DE USO

## ¿Qué es el Editor?

El Editor de Niveles permite crear **niveles personalizados** con diferentes tipos de bloques especiales. Tus niveles se guardan automáticamente en el navegador y pueden ser jugados después.

## 🚀 Cómo Acceder

1. En el **MENÚ PRINCIPAL**, haz clic en el botón **"EDITOR"**
2. Se abrirá el editor con una pirámide en blanco lista para diseñar

## 📝 Interfaz del Editor

```
┌─────────────────────────────────────┐
│  EDITOR DE NIVELES                  │
│  Nivel: Mi Primer Nivel             │
│                                      │
│  ┌──────────────┐                   │
│  │   PIRÁMIDE   │    PANEL BLOQUES  │
│  │  (clickeable)│    ├─ Normal      │
│  │              │    ├─ Lava        │
│  │              │    ├─ Hielo       │
│  │              │    ├─ Trampolín   │
│  │              │    ├─ Púa         │
│  │              │    ├─ Nube        │
│  │              │    └─ Diamante    │
│  └──────────────┘                   │
│                                      │
│  [GUARDAR] [MENÚ] [LIMPIAR]   Filas: 7
└─────────────────────────────────────┘
```

## 🎨 Tipos de Bloques

### 1. **Normal** (Blanco)
- Cubo estándar del juego
- El jugador lo pisa para cambiar color
- Blanco → Cyan → Verde

### 2. **Lava** (Rojo)
- ⚠️ **Daña al jugador**
- Si el jugador lo pisa, pierde una vida
- Añade dificultad

### 3. **Hielo** (Cyan)
- Sin fricción / deslizante
- El jugador puede resbalar
- Desafía la precisión

### 4. **Trampolín** (Amarillo)
- 🚀 **Salto extra**
- El jugador salta más alto/lejos
- Permite alcanzar áreas difíciles

### 5. **Púa** (Gris oscuro)
- ⚠️ **Daña al jugador**
- Similar a la lava
- Decorativo vs funcional

### 6. **Nube** (Gris claro)
- ☁️ **Inestable**
- Desaparece después de que el jugador salta
- Añade reto temporal

### 7. **Diamante** (Magenta)
- ✨ **Bonus de puntos**
- Coleccionable, no obligatorio
- Aumenta la puntuación

## ⌨️ Controles

| Acción | Control |
|--------|---------|
| **Colocar/Cambiar bloque** | Click izquierdo en cubo |
| **Eliminar bloque** | Click derecho en cubo |
| **Seleccionar tipo** | Click en panel derecho |
| **Aumentar filas** | Tecla `+` |
| **Disminuir filas** | Tecla `-` |
| **Limpiar todo** | Tecla `C` |
| **Guardar nivel** | Tecla `S` o botón |
| **Ir al menú** | Tecla `M` o botón |

## 🛠️ Flujo de Creación

### Paso 1: Seleccionar tipo de bloque
En el **panel derecho**, haz clic en el tipo de bloque que quieres colocar. Se iluminará.

### Paso 2: Colocar bloques
**Haz click izquierdo** en los cubos de la pirámide para colocar bloques del tipo seleccionado.

### Paso 3: Eliminar bloques
**Haz click derecho** (o vuelve a clickear izquierdo) para eliminar un bloque.

### Paso 4: Ajustar tamaño
Usa las teclas `+` y `-` para **aumentar/disminuir las filas** de la pirámide.

Máximo: 10 filas | Mínimo: 3 filas

### Paso 5: Guardar
Presiona `S` o haz clic en **GUARDAR**.
- Te pedirá un **nombre** para el nivel
- Opcionalmente, agrega una **descripción**
- Se guardará automáticamente en tu navegador

## 🎯 Reglas de Niveles Válidos

Para que un nivel sea guardable:
- ✅ Debe tener un **nombre**
- ✅ Debe tener **al menos 1 bloque**
- ✅ Debe tener un **bloque central (0,0)**
- ✅ Filas entre **3 y 10**

Si falta algo, verás un **mensaje de error**.

## 📋 Mejores Prácticas

### ✅ Buen Nivel
```
- Mezcla bloques normales con especiales
- Coloca lava estratégicamente (no en el inicio)
- Usa trampolines para alcanzar areas altas
- Mantén desafío balanceado
```

### ❌ Nivel Difícil de Jugar
```
- Demasiada lava concentrada
- Bloques inaccesibles
- Muy fácil/muy difícil
- Sin punto de partida claro
```

## 💾 Gestión de Niveles

### Guardar
1. Presiona `S` o botón **GUARDAR**
2. Ingresa nombre del nivel
3. ¡Listo! Se guardará en localStorage

### Cargar
1. Desde el **MENÚ PRINCIPAL** → **MIS NIVELES**
2. Selecciona un nivel de la lista
3. Click en **JUGAR** para probarlo

### Editar
1. Carga un nivel desde **MIS NIVELES**
2. Entra al **EDITOR** nuevamente
3. Se abrirá con el nivel anterior
4. Realiza cambios y guarda con otro nombre o el mismo

### Eliminar
1. En **MIS NIVELES**
2. Haz clic en **BORRAR** junto al nivel
3. Confirma la acción

## 🎮 Probando tu Nivel

1. **Desde el editor**: Guarda el nivel y ve a **MIS NIVELES**
2. **Desde MIS NIVELES**: Haz clic en **JUGAR**
3. Prueba las mecánicas:
   - ¿Se puede completar?
   - ¿Es demasiado fácil/difícil?
   - ¿Es divertido?

## 📊 Consejos de Diseño

### Pirámide Pequeña (3-5 filas)
- Niveles rápidos y simples
- Perfectos para tutoriales

### Pirámide Mediana (6-7 filas)
- Balance entre simple y complejo
- **Recomendado para empezar**

### Pirámide Grande (8-10 filas)
- Niveles épicos y desafiantes
- Para jugadores experimentados

### Distribución de Bloques Especiales
```
- 20-30% Normal
- 10-15% Especiales (Lava, Hielo)
- 5-10% Bonus (Trampolín, Diamante)
- 5-10% Obstáculos (Púa, Nube)
```

## ⚡ Limitaciones Técnicas

- **Máximo 50 niveles** guardados por navegador
- Los niveles se guardan en **localStorage** (no en servidor)
- Si limpias el caché del navegador, se **borran todos**
- Funciona **offline** una vez creado

## 🐛 Solución de Problemas

### "El nivel no se guarda"
- Verifica que tenga un **nombre** y al menos **1 bloque**
- Revisa que haya un bloque en la posición inicial (0,0)

### "Desapareció mi nivel"
- Probablemente limpiaste el caché del navegador
- Los niveles se guardan en localStorage local

### "No puedo crear más niveles"
- Alcanzaste el **límite de 50 niveles**
- Borra algunos para hacer espacio

## 🚀 Ideas para Niveles Creativos

1. **Túnel de Lava**: Usa bloques de lava en un patrón evasivo
2. **Pista de Hielo**: Llena una sección con bloques de hielo
3. **Camino del Trampolín**: Usa trampolines para crear rutas alternativas
4. **Nube Desafiante**: Mezcla nubes que desaparecen
5. **Búsqueda de Diamantes**: Distribuye diamantes como objetivos secundarios

---

¡Diviértete creando! 🎨✨

Para más info: Consulta el README.md principal
