# 🚀 GUÍA RÁPIDA - MCP Godot en VS Code

## ✅ Ya está configurado

El servidor MCP de Godot ya está **completamente instalado y configurado** para usar con **Cline en VS Code**.

## 📍 Ubicaciones

- **Servidor MCP**: `C:\Users\Sebiche\Desktop\AstroCat\godot-mcp\build\index.js`
- **Godot Engine**: `C:\Users\Sebiche\Downloads\Godot_v4.4.1-stable_win64.exe`
- **Configuración**: `C:\Users\Sebiche\AppData\Roaming\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`

## 🎯 Próximo paso: REINICIA VS CODE

Para que Cline cargue la configuración MCP:
1. **Cierra VS Code completamente**
2. **Abre VS Code nuevamente**

## 🔧 Cómo usar con Cline

### Paso 1: Abrir Cline
- Presiona `Ctrl + Shift + P`
- Escribe "Cline: Open In New Tab"
- O haz clic en el ícono de Cline en la barra lateral izquierda

### Paso 2: Verificar que el servidor esté cargado
- En la interfaz de Cline, verifica que el servidor "godot" esté disponible
- Deberías ver las herramientas MCP listadas

### Paso 3: ¡Úsalo!
Escribe prompts como:
```
"Get the Godot version"

"Launch Godot editor for my project"

"Create a new 2D scene with a Player node"

"List all Godot projects in C:\Users\Sebiche\Documents"

"Run my Godot project"
```

## 🛠️ Herramientas Disponibles

Las siguientes herramientas están pre-aprobadas (no pedirán confirmación):
- ✅ `launch_editor` - Lanzar editor de Godot
- ✅ `run_project` - Ejecutar proyecto
- ✅ `get_debug_output` - Ver salida de debug
- ✅ `stop_project` - Detener proyecto
- ✅ `get_godot_version` - Obtener versión de Godot
- ✅ `list_projects` - Listar proyectos
- ✅ `get_project_info` - Info del proyecto
- ✅ `create_scene` - Crear escenas
- ✅ `add_node` - Agregar nodos
- ✅ `load_sprite` - Cargar sprites
- ✅ `save_scene` - Guardar escenas
- Y más...

## 🔍 Verificar la instalación

Después de reiniciar VS Code:
1. Abre Cline
2. En el chat, pregunta: "What MCP tools are available?"
3. Deberías ver listadas las herramientas de Godot

## ❓ Si no funciona

### El servidor no aparece:
```powershell
# Verifica que el archivo existe
Get-Content "$env:APPDATA\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json"
```

### Reinicia VS Code completamente:
- Command Palette (`Ctrl + Shift + P`)
- "Developer: Reload Window"

## 💡 Ejemplo de uso completo

```
Tu: "I want to create a new Godot project for a 2D platformer"

Cline: [Usará las herramientas MCP para]:
- Crear una nueva escena
- Agregar un CharacterBody2D
- Configurar CollisionShape2D
- Agregar Sprite2D
- Guardar la escena
```

## 🎉 ¡Listo para usar!

Reinicia VS Code y comienza a desarrollar tu juego de Godot con la ayuda de IA.