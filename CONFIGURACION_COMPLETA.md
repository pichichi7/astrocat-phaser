# ✅ Configuración Completa del MCP de Godot para VS Code + Cline

## 🎯 Estado: LISTO PARA USAR

### 📍 Ubicaciones Importantes

#### Servidor MCP de Godot
- **Directorio**: `C:\Users\Sebiche\Desktop\AstroCat\godot-mcp\`
- **Ejecutable**: `C:\Users\Sebiche\Desktop\AstroCat\godot-mcp\build\index.js`

#### Godot Engine
- **Ejecutable**: `C:\Users\Sebiche\Downloads\Godot_v4.4.1-stable_win64.exe`
- **Versión**: 4.4.1 (stable)

#### Cline (VS Code)
- **Extensión**: Ya instalada ✅
- **Config**: `C:\Users\Sebiche\AppData\Roaming\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`

### 📄 Archivo de Configuración (Ya Configurado)

### 📄 Archivo de Configuración (Ya Configurado)

**Ubicación**: `C:\Users\Sebiche\AppData\Roaming\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`

```json
{
  "mcpServers": {
    "godot": {
      "command": "node",
      "args": ["C:\\Users\\Sebiche\\Desktop\\AstroCat\\godot-mcp\\build\\index.js"],
      "env": {
        "DEBUG": "true",
        "GODOT_PATH": "C:\\Users\\Sebiche\\Downloads\\Godot_v4.4.1-stable_win64.exe"
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

## 🚀 Cómo Usar en VS Code con Cline

### 1. Abrir Cline
- Presiona `Ctrl + Shift + P` (Command Palette)
- Escribe "Cline: Open In New Tab" y presiona Enter
- O haz clic en el ícono de Cline en la barra lateral

### 2. Verificar que el servidor MCP esté activo
- En la interfaz de Cline, busca el ícono de herramientas o settings
- Deberías ver el servidor "godot" listado
- Si no aparece, reinicia VS Code

### 3. ¡Usar el MCP!
- En el chat de Cline, puedes usar directamente los comandos
- Cline automáticamente usará las herramientas MCP cuando sea necesario

## 🎮 Funcionalidades Disponibles

### Gestión de Proyectos
- ✅ `launch_editor` - Lanzar el editor de Godot
- ✅ `run_project` - Ejecutar proyectos
- ✅ `stop_project` - Detener ejecución
- ✅ `get_godot_version` - Obtener versión de Godot
- ✅ `list_projects` - Listar proyectos
- ✅ `get_project_info` - Información del proyecto

### Gestión de Escenas
- ✅ `create_scene` - Crear nuevas escenas
- ✅ `add_node` - Agregar nodos a escenas
- ✅ `save_scene` - Guardar escenas
- ✅ `load_sprite` - Cargar sprites
- ✅ `export_mesh_library` - Exportar bibliotecas de mallas

### Depuración
- ✅ `get_debug_output` - Capturar salida de consola

### UIDs (Godot 4.4+)
- ✅ `get_uid` - Obtener UID de archivos
- ✅ `update_project_uids` - Actualizar referencias UID

## 💬 Ejemplos de Uso

Puedes usar estos prompts con Cursor:

```
"Launch the Godot editor for my project at C:\Users\Sebiche\Desktop\MiProyecto"

"Create a new 2D scene with a Player node"

"Add a Sprite2D node to the current scene"

"Run my Godot project and show me any errors"

"List all Godot projects in C:\Users\Sebiche\Documents"

"Get information about my current Godot project"

"Create a new scene with a CharacterBody2D and CollisionShape2D"

"Add a script to my Player node"
```

## 🔍 Verificación

### Checklist de Instalación
- ✅ Servidor MCP clonado y compilado
- ✅ Dependencias de Node.js instaladas
- ✅ Godot 4.4.1 ubicado y configurado
- ✅ Cline instalado en VS Code
- ✅ Archivo de configuración MCP actualizado
- ✅ Variable GODOT_PATH configurada

### Próximo Paso
**Reinicia VS Code** para que Cline cargue la nueva configuración MCP.

## 📝 Notas Importantes

1. **Permisos**: Asegúrate de que Godot tenga permisos de ejecución
2. **Debug Mode**: El modo DEBUG está activado para ver logs detallados
3. **Auto-Approve**: Las operaciones están pre-aprobadas para facilitar el uso
4. **Cursor Pro**: Algunas funcionalidades MCP requieren Cursor Pro o Business

## 🆘 Solución de Problemas

### El servidor no aparece en Cline
1. Verifica que el archivo de configuración existe y tiene el formato correcto
2. Reinicia VS Code completamente (cierra todas las ventanas)
3. Abre Cline y busca en la sección de herramientas/MCP servers

### Cline no muestra las herramientas MCP
1. Abre la Command Palette (`Ctrl + Shift + P`)
2. Escribe "Developer: Reload Window"
3. Espera a que VS Code se recargue completamente

### Error de permisos con Godot
1. Click derecho en el ejecutable de Godot
2. Propiedades > Seguridad
3. Asegúrate de tener permisos de lectura y ejecución

### El servidor no encuentra Godot
- La variable `GODOT_PATH` ya está configurada
- Si cambias la ubicación de Godot, actualiza el archivo de configuración

## 📝 Notas Importantes

1. **Editor**: Usando VS Code con extensión Cline
2. **Permisos**: Asegúrate de que Godot tenga permisos de ejecución
3. **Debug Mode**: El modo DEBUG está activado para ver logs detallados
4. **Auto-Approve**: Las operaciones están pre-aprobadas para facilitar el uso
5. **Cline**: Es necesario tener Cline instalado (ya lo tienes ✅)

## 🎉 ¡Todo Listo!

El servidor MCP de Godot está completamente configurado para VS Code con Cline.
**Reinicia VS Code** y comienza a crear tu juego con asistencia de IA.