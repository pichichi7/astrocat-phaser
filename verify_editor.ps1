# Verificacion de archivos del Editor de Niveles
Write-Host "=== VERIFICACION DE ARCHIVOS DEL EDITOR ===" -ForegroundColor Cyan

$baseDir = "c:\Users\sebiche\Desktop\AstroCat\astrocat_game"
$allOk = $true

# Lista de archivos críticos
$files = @(
    "scripts\LevelData.gd",
    "scripts\LevelCodec.gd",
    "scripts\LevelLoader.gd",
    "scripts\EditorScene.gd",
    "scripts\MenuScene.gd",
    "scripts\GameManager.gd",
    "scenes\Editor.tscn",
    "scenes\Menu.tscn"
)

foreach ($file in $files) {
    $fullPath = Join-Path $baseDir $file
    if (Test-Path $fullPath) {
        $size = (Get-Item $fullPath).Length
        Write-Host "[OK] $file ($size bytes)" -ForegroundColor Green
    } else {
        Write-Host "[FALTA] $file" -ForegroundColor Red
        $allOk = $false
    }
}

Write-Host ""
if ($allOk) {
    Write-Host "✅ Todos los archivos existen!" -ForegroundColor Green
    Write-Host "Ahora puedes abrir Godot y probar el editor." -ForegroundColor Yellow
} else {
    Write-Host "❌ Faltan archivos. Revisa los errores arriba." -ForegroundColor Red
}
