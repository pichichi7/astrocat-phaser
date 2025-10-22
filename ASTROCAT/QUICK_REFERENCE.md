# 🎮 QUICK REFERENCE - EDITOR DE NIVELES

## 🚀 En 10 Pasos

```
1. Abre http://localhost:8080
2. MENÚ → EDITOR
3. Panel derecho: Selecciona color de bloque
4. Pirámide: Click izquierdo = colocar
5. Pirámide: Click derecho = eliminar
6. +/- = Cambiar tamaño
7. S = Guardar
8. Nombre: Escribe nombre
9. MENÚ → MIS NIVELES
10. JUGAR → ¡Disfruta!
```

---

## ⌨️ Cheatsheet

```
┌──────────────────────────────────┐
│    CONTROLES EDITOR (RÁPIDO)     │
├──────────────────────────────────┤
│ Click L      → Colocar           │
│ Click R      → Eliminar          │
│ S            → Guardar           │
│ M            → Menú              │
│ C            → Limpiar           │
│ + / -        → Tamaño ↑/↓        │
│ Panel colores→ Seleccionar tipo  │
└──────────────────────────────────┘
```

---

## 🎨 Colores de Bloques

```
⬜ Blanco   = Normal
🔴 Rojo    = Lava
🔵 Cyan    = Hielo
🟡 Amarillo= Trampolín
⚫ Gris     = Púa
⚪ Claro   = Nube
🟣 Magenta = Diamante
```

---

## 📊 Límites

```
Mín/Máx filas:   3 - 10
Máx niveles:     50
Tamaño archivo:  ~5-10KB por nivel
Almacenamiento:  ~200-500KB total (50 niveles)
```

---

## 🔄 Flujo Rápido

```
START
  ↓
MENÚ
  ├→ JUGAR (juego normal)
  ├→ MIS NIVELES (cargar)
  └→ EDITOR
      ├→ DISEÑA
      ├→ GUARDA (S)
      ├→ REPITE o MENÚ (M)
      └→ (localStorage)
          ↓
         MIS NIVELES
          ├→ JUGAR ✓
          └→ BORRAR ✓
```

---

## 💡 Tips Rápidos

1. **Siempre mantén bloque en (0,0)**
   → Es el punto de inicio del jugador

2. **Usa +/- para ajustar tamaño**
   → 3-5: fácil | 6-7: normal | 8-10: difícil

3. **Guarda frecuentemente**
   → Presiona S cada 5 minutos

4. **Prueba tus niveles**
   → Ve a MIS NIVELES y click JUGAR

5. **Mezcla bloques**
   → No solo normales, agrega especiales

---

## 🎯 Ejemplo Nivel (60 segundos)

```
PASO 1: EDITOR
         Panel: Click en TRAMPOLÍN (amarillo)

PASO 2: Pirámide
         Click en cubos para colocar:
         Fila 0: Centro = Normal
         Fila 1: Izq+Der = Normal
         Fila 2: Centro = Trampolín
         
PASO 3: Tamaño
         Presiona + para 8 filas
         
PASO 4: Guardar
         Presiona S
         Nombre: "Mi Primer Nivel"
         
PASO 5: Juega
         MENÚ → MIS NIVELES → JUGAR
```

---

## 🐛 FAQ Rápido

**P: ¿Dónde se guardan los niveles?**
R: En localStorage del navegador (no en servidor)

**P: ¿Puedo compartir mis niveles?**
R: Sí, copia el JSON del nivel y comparte

**P: ¿Qué pasa si borro todos los niveles?**
R: Puedo recuperarlos desde localStorage si no limpias cache

**P: ¿Máximo de bloques?**
R: No hay límite, pero más de 50 bloques puede ralentizar

**P: ¿Bloques especiales funcionan?**
R: Aún no, v1.5 tendrá efectos (daño, deslizar, salto extra)

---

## 📱 En Móvil

El editor funciona en móvil pero es incómodo:
- Panel derecho: Scroll para seleccionar bloques
- Click: Toca para colocar
- Guardar: Botón en panel inferior

**Recomendado**: Usar PC/Tablet

---

## 🎊 Resumen Ultra-Rápido

```
CREAR:   MENÚ → EDITOR → Diseña → S (Guardar)
JUGAR:   MENÚ → MIS NIVELES → JUGAR
BORRAR:  MENÚ → MIS NIVELES → BORRAR
```

---

**Más detalles**: Ver EDITOR_GUIDE.md

¡CREA TU NIVEL AHORA! 🚀
