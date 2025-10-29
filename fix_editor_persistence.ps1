# Fix EditorScene persistence - Deep copy en init() y create()

$file = "src\client\game\scenes\EditorScene.ts"
$content = Get-Content $file -Raw -Encoding UTF8

# Fix 1: init() - DEEP COPY del nivel recibido
$content = $content -replace `
    "this\.editingLevel = data\?\.level \|\| null;", `
    "this.editingLevel = data?.level ? JSON.parse(JSON.stringify(data.level)) : null;"

# Fix 2: create() - DEEP COPY al restaurar blocks y enemies
$content = $content -replace `
    "this\.blocks = this\.editingLevel\.blocks;", `
    "this.blocks = JSON.parse(JSON.stringify(this.editingLevel.blocks));"

$content = $content -replace `
    "this\.enemies = this\.editingLevel\.enemies \|\| \[\];", `
    "this.enemies = JSON.parse(JSON.stringify(this.editingLevel.enemies || []));"

# Save
$content | Set-Content $file -Encoding UTF8 -NoNewline

Write-Host "✅ EditorScene persistence fixed!" -ForegroundColor Green
Write-Host "📝 Changes applied:" -ForegroundColor Cyan
Write-Host "   - init(): DEEP COPY of received level" -ForegroundColor White
Write-Host "   - create(): DEEP COPY of blocks and enemies" -ForegroundColor White
