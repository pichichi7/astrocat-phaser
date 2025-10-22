# Astrocat Phaser + Level Editor

Juego isométrico estilo Q*bert hecho con Phaser, con Editor de Niveles en el navegador. El juego vive en `ASTROCAT/` y puede publicarse directo en GitHub Pages sin build.

## Estructura rápida
- `ASTROCAT/` — juego web (index.html, assets y `src/`)
- `godot-mcp/` — proyecto aparte (Node/TS) no requerido para ejecutar el juego
- `.github/workflows/deploy-pages.yml` — despliegue automático a GitHub Pages desde `ASTROCAT/`

## Ejecutar localmente
Opción 1: VS Code Live Server (recomendado). Abre `ASTROCAT/index.html`.

Opción 2 (opcional): servidor estático simple.

```powershell
# Opcional si tienes Node
npx http-server ASTROCAT -p 8080
# Navega a http://localhost:8080
```

## Subir a GitHub y publicar en Pages
1) Crea un repo en GitHub (por ejemplo `astrocat-phaser`).
2) Inicializa git, haz commit y sube. Esto crea el historial y dispara el workflow de Pages.

```powershell
# Opcional: desde la carpeta del proyecto
git init
git add .
git commit -m "Initial commit: Astrocat + editor"
# Sustituye TU_USUARIO y REPO
git branch -M main
git remote add origin https://github.com/TU_USUARIO/REPO.git
git push -u origin main
```

3) En GitHub → Settings → Pages, selecciona “Source: GitHub Actions”.
4) El workflow `Deploy Astrocat to GitHub Pages` publicará `ASTROCAT/`. La URL queda en el job output o en la sección Pages del repositorio.

## Notas
- No hay paso de build: se sirve estático desde `ASTROCAT/`.
- La acción ignora todo lo demás y sólo sube el contenido de `ASTROCAT/`.
- Si cambias la carpeta del juego, actualiza `path:` en `.github/workflows/deploy-pages.yml`.

## Licencia
Consulta `LICENSE` si aplica o añade una licencia a la raíz del repo.