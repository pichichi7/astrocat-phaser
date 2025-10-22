# Configuración del Servidor MCP de Godot

## ✅ Instalación Completada

El servidor MCP de Godot se ha instalado correctamente en:
`C:\Users\Sebiche\Desktop\AstroCat\godot-mcp\`

## 📁 Archivos de Configuración Creados

### 1. Configuración General MCP
- **Archivo**: `C:\Users\Sebiche\Desktop\AstroCat\mcp_config.json`
- **Uso**: Configuración general que puedes usar como referencia

### 2. Configuración para Cursor (Proyecto específico)
- **Archivo**: `C:\Users\Sebiche\Desktop\AstroCat\.cursor\mcp.json`
- **Uso**: Configuración automática para Cursor en este proyecto

## 🔧 Configuración para Diferentes Editores

### Para Cursor:
1. La configuración ya está lista en `.cursor/mcp.json`
2. Reinicia Cursor para que detecte la configuración
3. Ve a **Cursor Settings** > **Features** > **MCP** para verificar que aparezca

### Para Cline en VS Code:
Agrega esto a tu archivo de configuración de Cline:
(`~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`)

```json
{
  "mcpServers": {
    "godot": {
      "command": "node",
      "args": ["C:\\Users\\Sebiche\\Desktop\\AstroCat\\godot-mcp\\build\\index.js"],
      "env": {
        "DEBUG": "true"
      },
      "disabled": false,
      "autoApprove": [
        "launch_editor",
        "run_project",
        "get_debug_output",
        "stop_project",
        "get_godot_version",
        "list_projects",
        "get_project_info",
        "create_scene",
        "add_node",
        "load_sprite",
        "export_mesh_library",
        "save_scene",
        "get_uid",
        "update_project_uids"
      ]
    }
  }
}
```

## 🎮 Requisitos

### ✅ Godot Engine Instalado
- **Ubicación**: `C:\Users\Sebiche\Downloads\Godot_v4.4.1-stable_win64.exe`
- **Versión**: Godot 4.4.1 (stable)
- **Estado**: La configuración MCP ya está actualizada con esta ruta

## 🚀 Ejemplos de Uso

Una vez configurado, puedes usar prompts como:

- "Launch the Godot editor for my project at /path/to/project"
- "Run my Godot project and show me any errors"
- "Create a new scene with a Player node in my Godot project"
- "Add a Sprite2D node to my player scene"
- "Get information about my Godot project structure"

## 🔍 Verificación

El servidor está funcionando correctamente. Puedes verificar que:
- ✅ El proyecto se compiló sin errores
- ✅ Los archivos de configuración se crearon
- ✅ El servidor responde (aunque muestre advertencias sobre Godot si no está instalado)

## 📝 Notas

- Las advertencias sobre la ruta de Godot son normales si no tienes Godot instalado
- Para usar todas las funcionalidades, necesitas tener Godot Engine instalado
- El servidor funciona con proyectos existentes de Godot