# 🎮 EDITOR MEJORADO - Versión 2.0

## ✨ Nuevas Características

### 1. **Sistema de Enemigos** 🔴
- Coloca hasta **5 enemigos** por nivel
- Click en modo ENEMIGOS para agregar/quitar
- Los enemigos aparecen en **naranja** para diferenciarlos
- Se guardan con el nivel

### 2. **Preview/Test del Nivel** 🎮
- Botón **TEST (T)** para probar el nivel mientras lo editas
- Juega directamente desde el editor
- Al salir, vuelves al editor
- Valida el nivel antes de testear

### 3. **Modo Dual** 🔄
- **BLOQUES**: Coloca/elimina bloques especiales
- **ENEMIGOS**: Coloca/elimina enemigos
- Botones en panel derecho para cambiar modo
- Interfaz dinámica según el modo seleccionado

---

## 🎨 Interfaz del Editor

```
┌─────────────────────────────────────────┐
│  EDITOR DE NIVELES                      │
│  Nivel: Mi Nivel                        │
│                                          │
│  ┌──────────────┐  ┌──────────────┐    │
│  │   PIRÁMIDE   │  │ [BLOQUES] [ENEMIGOS]
│  │  (clickeable)│  │ ┌──────────┐ │    │
│  │              │  │ │ BLOQUES  │ │    │
│  │              │  │ ├─ Normal  │ │    │
│  │              │  │ ├─ Lava    │ │    │
│  │              │  │ ├─ Hielo   │ │    │
│  └──────────────┘  │ └──────────┘ │    │
│                    │ Filas: 7 x 5 │    │
│  ┌─ BOTONES ─────────────────────────┐ │
│  │ [TEST] [GUARDAR] [MENÚ] [LIMPIAR]│ │
│  └────────────────────────────────────┘ │
│  Filas: 7 | Enemigos: 2/5              │
└─────────────────────────────────────────┘
```

---

## ⌨️ Controles

### Teclado
```
S          → Guardar nivel
T          → Test/Probar nivel
M          → Volver al menú
C          → Limpiar todo
+/-        → Cambiar número de filas (3-10)
```

### Mouse - Modo BLOQUES
```
Click L    → Colocar bloque actual
Click R    → Eliminar bloque
```

### Mouse - Modo ENEMIGOS
```
Click L    → Agregar/quitar enemigo
Panel D    → Selecciona tipo de bloque
```

---

## 🎮 Cómo Usar - Guía Rápida

### Crear un Nivel

**PASO 1**: Abre el editor
```
MENÚ PRINCIPAL → EDITOR
```

**PASO 2**: Modo BLOQUES (por defecto)
```
Panel derecho → Selecciona tipo (ej: TRAMPOLÍN)
Pirámide      → Click L para colocar bloques
Pirámide      → Click R para eliminar
```

**PASO 3**: Cambiar a Modo ENEMIGOS
```
Panel derecho → Click en botón "ENEMIGOS"
Pirámide      → Click en cubos para poner/quitar enemigos
```

**PASO 4**: Probar el Nivel
```
Tecla T o botón TEST
→ Juegas el nivel actual
→ Al morir/ganar, vuelves al editor
```

**PASO 5**: Guardar
```
Tecla S o botón GUARDAR
→ Nombre del nivel
→ Descripción (opcional)
→ ¡Guardado!
```

---

## 💡 Tips de Diseño

### Equilibrio de Enemigos
- **Fácil**: 1-2 enemigos
- **Normal**: 2-3 enemigos
- **Difícil**: 4-5 enemigos

### Ejemplo Nivel Básico (2 min)

```
1. Panel derecho: Selecciona NORMAL (blanco)

2. Pirámide:
   Fila 0: Cliquea centro
   Fila 1: Cliquea los 2 cubos
   Fila 2: Cliquea los 3 cubos

3. Modo ENEMIGOS:
   Panel: Click en "ENEMIGOS"
   Fila 3: Click en un cubo

4. Test:
   Presiona T
   ¡Juega tu nivel!

5. Guardar:
   Presiona S
   Nombre: "Mi Primer Nivel"
```

---

## 🎯 Validación

Un nivel es válido si tiene:
- ✅ Nombre no vacío
- ✅ 3-10 filas
- ✅ Al menos 1 bloque
- ✅ Bloque central (0,0)

Si falta algo, no te deja guardar.

---

## 📊 Comparación: v1.0 vs v2.0

| Característica | v1.0 | v2.0 |
|---|---|---|
| Tipos de bloques | 7 | 7 |
| Enemigos colocables | ❌ | ✅ |
| Sistema de enemigos | ⏳ | ✅ |
| Test en editor | ❌ | ✅ |
| Modo dual | ❌ | ✅ |
| Validación | ✅ | ✅ |
| Almacenamiento | ✅ | ✅ |

---

## 🚀 Flujo Completo

```
MENÚ
  │
  ├─→ EDITOR
  │   │
  │   ├─ Modo BLOQUES: Coloca bloques
  │   ├─ Modo ENEMIGOS: Coloca enemigos
  │   ├─ Test (T): Prueba en vivo
  │   ├─ Guardar (S): Almacena en localStorage
  │   └─ Menú (M): Vuelve sin guardar
  │
  └─→ MIS NIVELES
      │
      ├─ JUGAR: Prueba nivel guardado
      └─ BORRAR: Elimina nivel
```

---

## 🐛 Solución de Problemas

**P: ¿El nivel no se guarda?**
R: Verifica nombre único y bloque en (0,0)

**P: ¿Máximo de enemigos?**
R: 5 enemigos por nivel. Click para quitar.

**P: ¿Cómo elimino un enemigo?**
R: Modo ENEMIGOS → Click en el enemigo (naranja)

**P: ¿Test no funciona?**
R: Valida que haya bloque en (0,0)

---

## 📖 Documentación

- **QUICK_REFERENCE.md** - Cheatsheet rápido
- **EDITOR_GUIDE.md** - Guía completa v1.0
- **ROADMAP.md** - Futuro del proyecto

---

**Versión**: 2.0 (Enemigos + Test)
**Estado**: ✅ Completamente funcional
**Próxima**: v2.5 (Exportar/Importar niveles)
