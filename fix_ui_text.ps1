# Simple UI text cleanup script
$file = "src\client\game\scenes\EditorScene.ts"
$content = Get-Content $file -Raw -Encoding UTF8

# Replace emoji buttons with clean text
$content = $content.Replace("'âœï¸ EDITOR'", "'LEVEL EDITOR'")
$content = $content.Replace("'ðŸ"¤ SHARE'", "'SHARE'")
$content = $content.Replace("'â–¶ï¸ TEST'", "'TEST'")
$content = $content.Replace("'ðŸ'¾ SAVE'", "'SAVE'")
$content = $content.Replace("'ðŸ  MENU'", "'MENU'")
$content = $content.Replace("'ðŸ—'ï¸ CLEAR'", "'CLEAR'")
$content = $content.Replace("'ðŸ§± Blocks'", "'BLOCKS'")
$content = $content.Replace("'ðŸ'¾ Enemies'", "'ENEMIES'")
$content = $content.Replace("'ðŸ'¡ Click:", "'Click:")
$content = $content.Replace("``ðŸ" Rows:", "``Size:")

# Save with UTF8 encoding
$content | Set-Content $file -Encoding UTF8 -NoNewline

Write-Host "✓ UI text cleaned successfully!" -ForegroundColor Green
