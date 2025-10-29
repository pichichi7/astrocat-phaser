# Script to apply UX improvements to EditorScene.ts

$file = "c:\Users\sebiche\Desktop\AstrocatPhaser\src\client\game\scenes\EditorScene.ts"
$content = Get-Content $file -Encoding UTF8 -Raw

Write-Host "📝 Applying UX improvements to EditorScene.ts..." -ForegroundColor Cyan

# 1. Improve title text
$content = $content -replace "// Compact title\s+const title = this\.add\.text\(15, 8, '.+?', \{[^}]+\}\)\.setDepth\(100\)\.setScrollFactor\(0\);", @"
// Enhanced title with more info and readable text
        const title = this.createReadableText(20, 8, `🎮 LEVEL EDITOR - `${this.currentRows} Rows`, '20px', '#00ffff');
        title.setDepth(100).setScrollFactor(0);
"@

# 2. Improve level name text with save status
$content = $content -replace "// Level name \(compact\)\s+this\.levelNameText = this\.add\.text\(15, 30, `.+?`, \{[^}]+\}\)\.setDepth\(100\)\.setScrollFactor\(0\);", @"
// Level name with save status
        const saveStatusColor = this.levelSaved ? '#00ff00' : '#ffaa00';
        const saveStatusText = this.levelSaved ? '💾 Saved' : '⚠️ Unsaved';
        this.levelNameText = this.createReadableText(20, 30, `${this.levelName || 'Untitled'} - ${saveStatusText}`, '12px', saveStatusColor);
        this.levelNameText.setDepth(100).setScrollFactor(0);
"@

# 3. Improve hint text
$content = $content -replace "const hint = this\.add\.text\(15, height - 68,\s+'[^']+',\s+\{ fontSize: '11px', color: '#88ffff', fontStyle: 'italic' \}\)\.setDepth\(100\)\.setScrollFactor\(0\);", @"
const hint = this.createReadableText(15, height - 68,
            '💡 Click: Place | Right: Remove | S: Save | T: Test | M: Menu',
            '12px', '#88ffff');
        hint.setDepth(100).setScrollFactor(0);
"@

# 4. Improve size text
$content = $content -replace "this\.sizeText = this\.add\.text\(width - 200, height - bottomHeight \+ 12,\s+`.+?`,\s+\{ fontSize: '12px', color: '#ffffff', fontStyle: 'bold' \}\)\.setDepth\(100\)\.setScrollFactor\(0\);", @"
this.sizeText = this.createReadableText(width - 200, height - bottomHeight + 12,
            `📏 Rows: ${this.currentRows} | 👾 Enemies: ${this.enemies.length}/5`,
            '14px', '#ffffff');
        this.sizeText.setDepth(100).setScrollFactor(0);
"@

# Save the file
$content | Set-Content $file -Encoding UTF8

Write-Host "✅ UX improvements applied successfully!" -ForegroundColor Green
Write-Host "   - Enhanced title with row count" -ForegroundColor Gray
Write-Host "   - Added save status indicator" -ForegroundColor Gray
Write-Host "   - Improved text readability with stroke & shadow" -ForegroundColor Gray
Write-Host "   - Better visual hierarchy" -ForegroundColor Gray
