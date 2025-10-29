/**
 * EditorScene.ts - Level Editor with BFS Validation
 * Complete conversion with validation, block types, visual preview and improved UX
 */

import Phaser from 'phaser';
import { GameConfig, GameUtils } from '../config';
import { LevelStorage } from '../RedditStorage';
import { LevelData, EnemyData } from '../LevelFormat';
import { ShareLevelDialog } from '../ui/ShareLevelDialog';

// Block types for editor
export const EDITOR_BLOCK_TYPES = {
    NORMAL: 0,      // Normal cube (white → cyan → green)
    GOAL: 6,        // Goal/Diamond (magenta) - win objective
    TRAP: 1,        // Trap/Lava (red) - damages player
    TRAMPOLINE: 3,  // Trampoline (yellow) - jump boost
    VOID: -1        // Void - no cube here
} as const;

export const EDITOR_BLOCK_LABELS: Record<number, string> = {
    0: '⬜ Normal',
    6: '💎 Goal',
    1: '🔥 Trap',
    3: '⬆️ Trampoline',
    '-1': '❌ Void'
};

export const EDITOR_BLOCK_COLORS: Record<number, number> = {
    0: 0xffffff,    // Normal: white
    6: 0xff00ff,    // Goal: magenta
    1: 0xff0000,    // Trap: red
    3: 0xffff00,    // Trampoline: yellow
    '-1': 0x111111  // Void: almost black
};

interface EditorCube extends Phaser.GameObjects.Sprite {
    row: number;
    col: number;
}

interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings?: string[];
    reachableCount: number;
    goalCount: number;
    totalBlocks: number;
}

export class EditorScene extends Phaser.Scene {
    private editingLevel: LevelData | null = null;
    private currentRows: number = 7;
    private selectedBlockType: number = EDITOR_BLOCK_TYPES.NORMAL;
    private editMode: 'blocks' | 'enemies' = 'blocks';
    
    private hoverSprite: Phaser.GameObjects.Sprite | null = null;
    private lastHoverKey: string | null = null;
    
    private lastValidationState: ValidationResult | null = null;
    private validationIndicator: Phaser.GameObjects.Text | null = null;
    private validationTooltip: Phaser.GameObjects.Text | null = null;
    
    private blocks: Record<string, number> = {};
    private enemies: EnemyData[] = [];
    private blockSprites: Record<string, EditorCube> = {};
    private enemySprites: Record<number, Phaser.GameObjects.Sprite> = {};
    private levelName: string = '';
    private currentHighlight: Phaser.GameObjects.Graphics | null = null;
    private stars: Phaser.GameObjects.Arc[] = [];
    private levelSaved: boolean = false;
    
    private modeButtons!: { blocks: Phaser.GameObjects.Rectangle; enemies: Phaser.GameObjects.Rectangle };
    private rightPanel!: Phaser.GameObjects.Container;
    private sizeText!: Phaser.GameObjects.Text;
    private levelNameText?: Phaser.GameObjects.Text;

    // Responsive UI containers
    private uiContainers: Phaser.GameObjects.Container[] = [];
    private isMobile: boolean = false;
    private currentZoom: number = 1;
    private bgImage?: Phaser.GameObjects.Image;
    private worldContainer!: Phaser.GameObjects.Container;

    constructor() {
        super({ key: 'EditorScene' });
    }

    /**
     * Helper function to create readable text with stroke and shadow
     */
    private createReadableText(x: number, y: number, content: string, size: string = '16px', color: string = '#ffffff'): Phaser.GameObjects.Text {
        return this.add.text(x, y, content, {
            fontSize: size,
            fontFamily: 'Arial Black',
            color: color,
            stroke: '#000033',
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 5,
                fill: true
            }
        });
    }

    /**
     * Helper function to add consistent shadows
     */
    private addShadow(x: number, y: number, width: number, height: number, radius: number = 8): Phaser.GameObjects.Graphics {
        const shadow = this.add.graphics();
        shadow.fillStyle(0x000000, 0.4);
        shadow.fillRoundedRect(x + 3, y + 3, width, height, radius);
        shadow.setDepth(-1);
        shadow.setScrollFactor(0);
        return shadow;
    }

    /**
     * Add hover effects to interactive elements
     */
    private addHoverEffect(element: Phaser.GameObjects.GameObject & { scaleX?: number; scaleY?: number }): void {
        if (!element.input) return;
        
        element.on('pointerover', () => {
            this.tweens.add({
                targets: element,
                scaleX: (element.scaleX || 1) * 1.05,
                scaleY: (element.scaleY || 1) * 1.05,
                duration: 100,
                ease: 'Back.easeOut'
            });
            this.input.setDefaultCursor('pointer');
        });
        
        element.on('pointerout', () => {
            this.tweens.add({
                targets: element,
                scaleX: (element.scaleX || 1),
                scaleY: (element.scaleY || 1),
                duration: 100
            });
            this.input.setDefaultCursor('default');
        });
        
        element.on('pointerdown', () => {
            this.tweens.add({
                targets: element,
                scaleX: (element.scaleX || 1) * 0.95,
                scaleY: (element.scaleY || 1) * 0.95,
                duration: 50,
                yoyo: true
            });
        });
    }

    /**
     * Highlight cube with animated outline
     */
    private highlightCube(cube: Phaser.GameObjects.Sprite): void {
        // Limpiar highlight anterior
        if (this.currentHighlight) {
            this.currentHighlight.destroy();
        }
        
        // Crear outline brillante
        const outline = this.add.graphics();
        const cubeWidth = cube.displayWidth;
        const cubeHeight = cube.displayHeight;
        
        outline.lineStyle(3, 0x00ffff, 1);
        outline.strokeRect(
            cube.x - cubeWidth/2 - 2,
            cube.y - cubeHeight/2 - 2,
            cubeWidth + 4,
            cubeHeight + 4
        );
        outline.setDepth(999);
        
        // Agregar al worldContainer para que se mueva con la pir�mide
        this.worldContainer.add(outline);
        
        this.currentHighlight = outline;
        
        // Animaci�n pulsante
        this.tweens.add({
            targets: outline,
            alpha: { from: 1, to: 0.5 },
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * Get uniform scale for all cube types (ensures consistent sizing)
     * All blocks use the same scale regardless of texture
     */
    private getUniformCubeScale(): number {
        return GameConfig.SCALES.CUBE;
    }

    /**
     * Calculate correct scale for a cube sprite based on its texture
     * This ensures lava sprites match the size of normal cubes
     */
    private getCorrectCubeScale(textureKey: string): { scaleX: number; scaleY: number } {
        if (textureKey === 'lava_idle' && this.textures.exists('lava_idle')) {
            const cubeTexture = this.textures.get('cube');
            const lavaTexture = this.textures.get('lava_idle');
            
            const cubeWidth = cubeTexture.getSourceImage().width;
            const cubeHeight = cubeTexture.getSourceImage().height;
            const lavaWidth = lavaTexture.getSourceImage().width;
            const lavaHeight = lavaTexture.getSourceImage().height;
            
            return {
                scaleX: (cubeWidth / lavaWidth) * GameConfig.SCALES.CUBE,
                scaleY: (cubeHeight / lavaHeight) * GameConfig.SCALES.CUBE
            };
        }
        
        // Default cube scale
        return {
            scaleX: GameConfig.SCALES.CUBE,
            scaleY: GameConfig.SCALES.CUBE
        };
    }

    init(data?: { level?: LevelData }): void {
        console.log('📝 [EditorScene] init() called with data:', data);
        
        this.editingLevel = data?.level ? JSON.parse(JSON.stringify(data.level)) : null;
        this.currentRows = data?.level?.rows || 7;
        this.selectedBlockType = EDITOR_BLOCK_TYPES.NORMAL;
        this.editMode = 'blocks';
        
        this.hoverSprite = null;
        this.lastHoverKey = null;
        this.lastValidationState = null;
        this.validationIndicator = null;
        
        if (this.editingLevel) {
            console.log('📝 [EditorScene] init() - Editing level:', this.editingLevel);
            console.log('   Name:', this.editingLevel.name);
            console.log('   Rows:', this.editingLevel.rows);
            console.log('   Blocks:', Object.keys(this.editingLevel.blocks || {}).length);
            console.log('   Enemies:', (this.editingLevel.enemies || []).length);
            console.log('   Blocks content:', this.editingLevel.blocks);
        } else {
            console.log('📝 [EditorScene] init() - No editing level, starting fresh');
        }
    }

    preload(): void {
        this.load.image('space', '/assets/space.png');
        this.load.image('cube', '/assets/cube_top.png');
        this.load.image('hud_bg', '/assets/hud_bg.png');
        this.load.image('water_enemy', '/assets/water_enemy.png');
        this.load.image('lava_idle', '/assets/lava_idle.png');
        this.load.image('lava_on', '/assets/lava_on.png');
        
        // Error handling
        this.load.on('loaderror', (file: any) => {
            console.error('❌ [EditorScene] Failed to load:', file.key, file.src);
        });
    }

    create(): void {
        // Detect mobile
        this.updateDeviceType();

        // Background - responsive to viewport
        const vp = this.getViewportSize();
        this.bgImage = this.add.image(vp.width / 2, vp.height / 2, 'space');
        this.bgImage.setDepth(-1);
        this.bgImage.setOrigin(0.5, 0.5);
        this.bgImage.setScrollFactor(0); // Fixed background
        this.resizeBackground(vp.width, vp.height);

        // Enhanced background with animated stars
        this.enhanceBackground(vp.width, vp.height);

    // Container for the world (pyramid, enemies, effects)
    this.worldContainer = this.add.container(0, 0);
    this.worldContainer.setDepth(0);

        // Initialize level data
        if (this.editingLevel?.blocks && Object.keys(this.editingLevel.blocks).length > 0) {
            this.blocks = JSON.parse(JSON.stringify(this.editingLevel.blocks));
            this.enemies = JSON.parse(JSON.stringify(this.editingLevel.enemies || []));
            console.log('📝 [EditorScene] Loading saved blocks:', Object.keys(this.blocks).length);
        } else {
            this.blocks = { '0_0': EDITOR_BLOCK_TYPES.NORMAL };
            this.enemies = [];
            console.log('📝 [EditorScene] Starting with initial block at (0,0)');
        }
        
        this.blockSprites = {};
        this.enemySprites = {};
        this.levelName = this.editingLevel?.name || '';

    this.drawPyramid();
        this.createEditorUI();

        this.input.keyboard!.on('keydown', this.handleKeypress, this);
        
        this.autoValidate();

        // Initial layout of world
        this.layoutWorld(vp.width, vp.height);

        // Setup responsive resize
        this.scale.on('resize', this.handleResize, this);
        this.handleResize({ width: this.getViewportSize().width, height: this.getViewportSize().height });
    }

    /**
     * Detect device type based on canvas size and aspect ratio
     */
    private updateDeviceType(): void {
        const width = this.scale.width;
        const height = this.scale.height;
        const aspectRatio = width / height;
        
        // Detectar mobile por tama�o del canvas, no por window
        this.isMobile = width < 768 || aspectRatio < 1;
    }

    /**
     * Handle window resize - adjust camera zoom and UI layout
     */
    private handleResize(_gameSize: { width: number; height: number }): void {
        const wasMobile = this.isMobile;
        this.updateDeviceType();

        const vp = this.getViewportSize();
        
        // Layout world to fit available region (no camera zoom)
        this.layoutWorld(vp.width, vp.height);

        // Resize background to cover viewport
        this.resizeBackground(vp.width, vp.height);

        // Rebuild UI if device type changed or first time
        if (wasMobile !== this.isMobile || this.uiContainers.length === 0) {
            this.rebuildUI();
        }
    }

    /**
     * Compute world container scale and position to fit the pyramid inside the viewport
     * while leaving room for UI panels.
     */
    private layoutWorld(viewportWidth: number, viewportHeight: number): void {
        if (!this.worldContainer) return;

        // Dimensiones de UI m�s compactas
        const topUI = 50;
        const bottomUI = 70;
        const sideUI = this.isMobile ? 0 : 180; // Panel derecho m�s estrecho

        // Calcular el �rea disponible para el juego
        const availableWidth = viewportWidth - sideUI - 20; // 20px padding
        const availableHeight = viewportHeight - topUI - bottomUI - 20;

        // Calcular el centro de la pir�mide en coordenadas ISO
        // La pir�mide va de row 0 a currentRows-1
        const centerRow = (this.currentRows - 1) / 2;
        const centerCol = centerRow / 2; // Centro en la mitad de la fila central
        const pyramidCenter = GameUtils.isoToScreen(centerRow, centerCol);

        // Tama�o estimado de la pir�mide para el escalado
        const cubeSize = 80;
        const pyramidWidth = this.currentRows * cubeSize;
        const pyramidHeight = this.currentRows * cubeSize * 0.6;

        // Calcular escala para que quepa perfectamente
        const scaleX = availableWidth / pyramidWidth;
        const scaleY = availableHeight / pyramidHeight;
        const optimalScale = Math.min(scaleX, scaleY, 1.0); // Max 1.0x

        // Aplicar escala
        this.worldContainer.setScale(optimalScale);

        // Centrar en el espacio disponible
        const centerX = sideUI + (availableWidth / 2);
        const centerY = topUI + (availableHeight / 2);

        // Posicionar el container de forma que el centro de la pir�mide quede en centerX, centerY
        this.worldContainer.setPosition(
            centerX - (pyramidCenter.x * optimalScale),
            centerY - (pyramidCenter.y * optimalScale)
        );

        console.log(`World: center(${centerX}, ${centerY}), pyramidCenter(${pyramidCenter.x}, ${pyramidCenter.y}), scale: ${optimalScale}`);
    }

    /**
     * Return the current viewport size using Phaser's scale manager.
     */
    private getViewportSize(): { width: number; height: number } {
        // Usar las dimensiones del scale manager de Phaser en lugar de window
        return { 
            width: this.scale.width, 
            height: this.scale.height 
        };
    }

    /**
     * Resize background image to fully cover the viewport while keeping aspect.
     */
    private resizeBackground(viewportWidth: number, viewportHeight: number): void {
        if (!this.bgImage) return;
        
        // Asegurar que cubra TODA la pantalla
        this.bgImage.setPosition(0, 0);
        this.bgImage.setOrigin(0, 0);
        this.bgImage.setDisplaySize(viewportWidth, viewportHeight);
        this.bgImage.setScrollFactor(0);
        this.bgImage.setDepth(-100);
    }

    /**
     * Enhance background with animated stars
     */
    private enhanceBackground(width: number, height: number): void {
        // Clear existing stars
        this.stars.forEach(star => star.destroy());
        this.stars = [];

        // Add twinkling stars
        for (let i = 0; i < 100; i++) {
            const star = this.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                Phaser.Math.Between(1, 3),
                0xffffff
            );
            star.setDepth(-50);
            star.setScrollFactor(0);
            
            // Twinkling animation
            this.tweens.add({
                targets: star,
                alpha: { from: 0.2, to: 1 },
                duration: Phaser.Math.Between(1000, 3000),
                yoyo: true,
                repeat: -1,
                delay: Phaser.Math.Between(0, 2000)
            });
            
            this.stars.push(star);
        }
    }

    /**
     * Rebuild UI elements for current screen size
     */
    private rebuildUI(): void {
        // Clear existing UI containers
        this.uiContainers.forEach(container => container.destroy());
        this.uiContainers = [];

        // Recreate UI with responsive layout
        this.createEditorUI();
        this.autoValidate();
    }

    private createEditorUI(): void {
        const { width, height } = this.getViewportSize();

        // Clear existing UI if rebuilding
        if (this.validationIndicator) {
            this.validationIndicator.destroy();
            this.validationIndicator = null;
        }

        // Responsive layout: mobile uses bottom panel, desktop uses side panel
        if (this.isMobile) {
            this.createMobileUI(width, height);
        } else {
            this.createDesktopUI(width, height);
        }
    }

    private createDesktopUI(width: number, height: number): void {
        // Dimensiones de UI m�s compactas y fijas
        const topHeight = 50;
        const panelWidth = 180; // Panel derecho m�s estrecho
        const bottomHeight = 70;

        // Compact top bar
        const topPanel = this.add.graphics();
        topPanel.fillStyle(0x000000, 0.85);
        topPanel.fillRoundedRect(0, 0, width, topHeight, { tl: 0, tr: 0, bl: 8, br: 8 });
        topPanel.lineStyle(1, 0x00ffff, 0.3);
        topPanel.strokeRoundedRect(0, 0, width, topHeight, { tl: 0, tr: 0, bl: 8, br: 8 });
        topPanel.setDepth(98);
        topPanel.setScrollFactor(0);
        this.uiContainers.push(topPanel as any);

        // Compact title
        const title = this.add.text(15, 8, '✏️ EDITOR', {
            fontSize: '18px',
            color: '#00ffff',
            fontStyle: 'bold'
        }).setDepth(100).setScrollFactor(0);
        this.uiContainers.push(title as any);

        // Level name (compact)
        this.levelNameText = this.add.text(15, 30, `${this.levelName || 'Untitled'}`, {
            fontSize: '12px',
            color: '#aaaaaa'
        }).setDepth(100).setScrollFactor(0);
        this.uiContainers.push(this.levelNameText as any);

        // Validation indicator (top right)
        // Will be created by autoValidate

        // === PANEL DERECHO (m�s estrecho y pulido) ===
        const panelX = width - panelWidth;
        const panelHeight = height - topHeight;

        const panelBg = this.add.graphics();
        panelBg.fillStyle(0x1a1a2e, 0.9);
        panelBg.fillRect(panelX, topHeight, panelWidth, panelHeight);
        // Borde izquierdo con brillo
        panelBg.fillStyle(0x00ffff, 0.2);
        panelBg.fillRect(panelX, topHeight, 2, panelHeight);
        panelBg.setDepth(99);
        panelBg.setScrollFactor(0);
        this.uiContainers.push(panelBg as any);

        // Mode buttons (compact)
        this.createModeButtons(width - panelWidth / 2 - 5, topHeight + 25);

        // Dynamic content panel
        this.rightPanel = this.add.container(width - panelWidth / 2 - 5, topHeight + 65);
        this.rightPanel.setDepth(100);
        this.rightPanel.setScrollFactor(0);
        this.uiContainers.push(this.rightPanel);

        this.updateModeDisplay();

        // Bottom panel - ULTRA COMPACT
        const bottomPanel = this.add.graphics();
        bottomPanel.fillStyle(0x000000, 0.85);
        bottomPanel.fillRoundedRect(0, height - 80, width, 80, { tl: 8, tr: 8, bl: 0, br: 0 });
        bottomPanel.lineStyle(1, 0x00ffff, 0.3);
        bottomPanel.strokeRoundedRect(0, height - 80, width, 80, { tl: 8, tr: 8, bl: 0, br: 0 });
        bottomPanel.setDepth(99);
        bottomPanel.setScrollFactor(0);
        this.uiContainers.push(bottomPanel as any);

        // Compact hint (one line only)
        const hint = this.add.text(15, height - 68,
            '💡 Click: Place | Right: Remove | S: Save | T: Test | M: Menu',
            { fontSize: '11px', color: '#88ffff', fontStyle: 'italic' }
        ).setDepth(100).setScrollFactor(0);
        this.uiContainers.push(hint as any);

        // Bottom buttons - COMPACT
        const buttonY = height - 35;
        const buttonSpacing = 95;
        let buttonX = Math.max(15, (width - 480) / 2);
        
        this.createModernButton(buttonX, buttonY, '📤 SHARE', () => this.shareLevelDialog(), 'Share level');
        buttonX += buttonSpacing;
        this.createModernButton(buttonX, buttonY, '▶️ TEST', () => this.testLevel(), 'Test (T)');
        buttonX += buttonSpacing;
        this.createModernButton(buttonX, buttonY, '💾 SAVE', () => this.saveLevelDialog(), 'Save (S)');
        buttonX += buttonSpacing;
        this.createModernButton(buttonX, buttonY, '🏠 MENU', () => this.goToMenu(), 'Menu (M)');
        buttonX += buttonSpacing;
        this.createModernButton(buttonX, buttonY, '🗑️ CLEAR', () => this.clearLevel(), 'Clear');

        // Size info - COMPACT
        this.sizeText = this.add.text(width - 200, height - bottomHeight + 12,
            `Size: ${this.currentRows} rows | Enemies: ${this.enemies.length}/5`,
            { fontSize: '12px', color: '#ffffff', fontStyle: 'bold' }
        ).setDepth(100).setScrollFactor(0);
        this.uiContainers.push(this.sizeText as any);
    }

    private createMobileUI(width: number, height: number): void {
        // Ultra compact top bar
        const topPanel = this.add.graphics();
        topPanel.fillStyle(0x000000, 0.9);
        topPanel.fillRoundedRect(0, 0, width, 45, { tl: 0, tr: 0, bl: 6, br: 6 });
        topPanel.setDepth(98);
        topPanel.setScrollFactor(0);
        this.uiContainers.push(topPanel as any);

        const title = this.add.text(width / 2, 10, '✏️ EDITOR', {
            fontSize: '16px',
            color: '#00ffff',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0).setDepth(100).setScrollFactor(0);
        this.uiContainers.push(title as any);

        this.levelNameText = this.add.text(width / 2, 28, `${this.levelName || 'Untitled'}`, {
            fontSize: '10px',
            color: '#aaaaaa'
        }).setOrigin(0.5, 0).setDepth(100).setScrollFactor(0);
        this.uiContainers.push(this.levelNameText as any);

        // Bottom panel - ULTRA COMPACT for mobile
        const bottomHeight = 170;
        const bottomPanel = this.add.graphics();
        bottomPanel.fillStyle(0x000000, 0.95);
        bottomPanel.fillRoundedRect(0, height - bottomHeight, width, bottomHeight, { tl: 10, tr: 10, bl: 0, br: 0 });
        bottomPanel.setDepth(99);
        bottomPanel.setScrollFactor(0);
        this.uiContainers.push(bottomPanel as any);

        // Size text at top of bottom panel
        this.sizeText = this.add.text(width / 2, height - bottomHeight + 5,
            `${this.currentRows} Rows | ${this.enemies.length}/5 Enemies`,
            { fontSize: '11px', color: '#ffffff', fontStyle: 'bold' }
        ).setOrigin(0.5, 0).setDepth(100).setScrollFactor(0);
        this.uiContainers.push(this.sizeText as any);

        // Mode buttons (horizontal, compact)
        this.createModeButtons(width / 2, height - bottomHeight + 30);

        // Block selection panel (horizontal for mobile)
        this.rightPanel = this.add.container(width / 2, height - bottomHeight + 70);
        this.rightPanel.setDepth(100);
        this.rightPanel.setScrollFactor(0);
        this.uiContainers.push(this.rightPanel);

        this.updateModeDisplay();

        // Action buttons - 2 rows, compact
        const btnY1 = height - 65;
        const btnY2 = height - 30;
        const btnSpacing = width / 3;

        this.createModernButton(btnSpacing * 0.5, btnY1, '▶️ TEST', () => this.testLevel());
        this.createModernButton(btnSpacing * 1.5, btnY1, '💾 SAVE', () => this.saveLevelDialog());
        this.createModernButton(btnSpacing * 2.5, btnY1, '🏠 MENU', () => this.goToMenu());

        this.createModernButton(btnSpacing * 0.75, btnY2, '📤 SHARE', () => this.shareLevelDialog());
        this.createModernButton(btnSpacing * 2.25, btnY2, '🗑️ CLEAR', () => this.clearLevel());
    }
    
    /**
     * Creates the mode toggle buttons (Blocks / Enemies) at the given center position.
     */
    private createModeButtons(centerX: number, y: number): void {
        const blocksModeBtn = this.add.rectangle(centerX - 60, y, 90, 35, 0x0088ff, 0.8);
        blocksModeBtn.setDepth(100);
        blocksModeBtn.setScrollFactor(0);
        blocksModeBtn.setInteractive({ useHandCursor: true });
        blocksModeBtn.on('pointerdown', () => {
            this.editMode = 'blocks';
            this.updateModeDisplay();
        });
        this.uiContainers.push(blocksModeBtn as any);

        const blocksText = this.add.text(centerX - 60, y, 'BLOCKS', {
            fontSize: '12px',
            color: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(101).setScrollFactor(0);
        this.uiContainers.push(blocksText as any);

        const enemiesModeBtn = this.add.rectangle(centerX + 60, y, 90, 35, 0xff8800, 0.8);
        enemiesModeBtn.setDepth(100);
        enemiesModeBtn.setScrollFactor(0);
        enemiesModeBtn.setInteractive({ useHandCursor: true });
        enemiesModeBtn.on('pointerdown', () => {
            this.editMode = 'enemies';
            this.updateModeDisplay();
        });
        this.uiContainers.push(enemiesModeBtn as any);

        const enemiesText = this.add.text(centerX + 60, y, '👾 Enemies', {
            fontSize: '12px',
            color: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(101).setScrollFactor(0);
        this.uiContainers.push(enemiesText as any);

        this.modeButtons = { blocks: blocksModeBtn, enemies: enemiesModeBtn };
    }

    private updateModeDisplay(): void {
        // Update buttons
        this.modeButtons.blocks.setFillStyle(
            this.editMode === 'blocks' ? 0x0088ff : 0x444444,
            this.editMode === 'blocks' ? 1 : 0.5
        );
        this.modeButtons.enemies.setFillStyle(
            this.editMode === 'enemies' ? 0xff8800 : 0x444444,
            this.editMode === 'enemies' ? 1 : 0.5
        );

        // Clear right panel
        this.rightPanel.removeAll();

        if (this.editMode === 'blocks') {
            this.createBlocksPanel();
        } else {
            this.createEnemiesPanel();
        }
    }

    private createBlocksPanel(): void {
        let yPos = 0;
        
        const blockTypes = [
            { type: EDITOR_BLOCK_TYPES.NORMAL, icon: '⬜', label: 'Normal' },
            { type: EDITOR_BLOCK_TYPES.GOAL, icon: '💎', label: 'Goal' },
            { type: EDITOR_BLOCK_TYPES.TRAP, icon: '🔥', label: 'Trap' },
            { type: EDITOR_BLOCK_TYPES.TRAMPOLINE, icon: '⬆️', label: 'Jump' },
            { type: EDITOR_BLOCK_TYPES.VOID, icon: '❌', label: 'Void' }
        ];
        
        // Mobile: arrange horizontally, Desktop: arrange vertically
        if (this.isMobile) {
            const btnWidth = 70;
            const spacing = 80;
            let xPos = -(blockTypes.length - 1) * spacing / 2;
            
            for (const {type: typeNum, icon} of blockTypes) {
                const color = EDITOR_BLOCK_COLORS[typeNum];
                const isSelected = typeNum === this.selectedBlockType;

                const btn = this.add.rectangle(xPos, 0, btnWidth, 40, color, isSelected ? 0.95 : 0.7);
                btn.setStrokeStyle(isSelected ? 3 : 0, 0x00ffff, isSelected ? 1 : 0);
                btn.setInteractive({ useHandCursor: true });
                
                btn.on('pointerdown', () => {
                    this.selectedBlockType = typeNum;
                    this.updateModeDisplay();
                });

                const btnText = this.add.text(xPos, 0, icon, {
                    fontSize: '24px',
                    align: 'center'
                }).setOrigin(0.5);

                this.rightPanel.add([btn, btnText]);
                xPos += spacing;
            }
        } else {
            // Desktop: vertical list
            for (const {type: typeNum, icon, label} of blockTypes) {
                const color = EDITOR_BLOCK_COLORS[typeNum];
                const isSelected = typeNum === this.selectedBlockType;

                const btn = this.add.rectangle(0, yPos + 25, 240, 48, color, isSelected ? 0.95 : 0.7);
                btn.setStrokeStyle(isSelected ? 3 : 0, 0x00ffff, isSelected ? 1 : 0);
                btn.setInteractive({ useHandCursor: true });
                
                btn.on('pointerdown', () => {
                    this.selectedBlockType = typeNum;
                    this.updateModeDisplay();
                    console.log(`Selected block type: ${typeNum} (${label})`);
                });
                
                btn.on('pointerover', () => {
                    if (!isSelected) {
                        btn.setFillStyle(color, 0.9);
                        this.tweens.add({ targets: btn, scaleX: 1.05, scaleY: 1.05, duration: 150 });
                    }
                });
                
                btn.on('pointerout', () => {
                    if (!isSelected) {
                        btn.setFillStyle(color, 0.7);
                        this.tweens.add({ targets: btn, scaleX: 1, scaleY: 1, duration: 150 });
                    }
                });

                const btnText = this.add.text(0, yPos + 25, `${icon} ${label}`, {
                    fontSize: '20px',
                    color: typeNum === EDITOR_BLOCK_TYPES.VOID ? '#ffffff' : '#000000',
                    align: 'center',
                    fontStyle: isSelected ? 'bold' : 'normal'
                }).setOrigin(0.5);

                if (isSelected) {
                    this.tweens.add({
                        targets: [btn, btnText],
                        scaleX: 1.06,
                        scaleY: 1.06,
                        duration: 600,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                }

                this.rightPanel.add([btn, btnText]);
                yPos += 60;
            }
        }
    }

    private createEnemiesPanel(): void {
        const infoText = this.add.text(0, 0, `Enemigos: ${this.enemies.length}/5`, {
            fontSize: '14px',
            color: '#00ffff',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);

        const helpText = this.add.text(0, 40, 'Click en cubo\npara poner/quitar\nenemigo', {
            fontSize: '11px',
            color: '#aaaaaa',
            align: 'center'
        }).setOrigin(0.5, 0);

        this.rightPanel.add([infoText, helpText]);

        if (this.enemies.length > 0) {
            const clearBtn = this.add.rectangle(0, 110, 120, 30, 0xaa0000, 1);
            clearBtn.setInteractive();
            clearBtn.on('pointerdown', () => {
                this.enemies = [];
                this.drawEnemies();
                this.updateModeDisplay();
                this.updateSizeText();
            });

            const clearText = this.add.text(0, 110, 'Borrar Todos', {
                fontSize: '11px',
                color: '#ffffff'
            }).setOrigin(0.5);

            this.rightPanel.add([clearBtn, clearText]);
        }
    }

    private createModernButton(x: number, y: number, label: string, callback: () => void, tooltip?: string): Phaser.GameObjects.Rectangle {
        // Botones 25% m�s grandes
        const width = 125;
        const height = 44;
        
        // Colores vibrantes basados en el label
        const vibrantColors: Record<string, number> = {
            'TEST': 0x00ff41,    // Verde ne�n
            'SAVE': 0x00b4ff,    // Azul brillante
            'SHARE': 0xff00dd,   // Magenta vibrante
            'CLEAR': 0xff1744,   // Rojo intenso
            'MENU': 0xffaa00     // Naranja
        };
        
        // Extract key from label (remove emojis)
        const labelKey = label.replace(/[^\w\s]/g, '').trim();
        const baseColor = vibrantColors[labelKey] || 0x0066aa;
        
        // Sombra m�s pronunciada
        const shadow = this.add.graphics();
        shadow.fillStyle(0x000000, 0.6);
        shadow.fillRoundedRect(x - width/2 + 3, y - height/2 + 3, width, height, 10);
        shadow.setDepth(98);
        shadow.setScrollFactor(0);
        this.uiContainers.push(shadow as any);
        
        // Background m�s brillante
        const btn = this.add.rectangle(x, y, width, height, baseColor, 0.95);
        btn.setDepth(100);
        btn.setScrollFactor(0);
        btn.setInteractive({ useHandCursor: true });
        
        // Borde brillante m�s grueso
        const border = this.add.graphics();
        border.lineStyle(3, 0xffffff, 0.6);
        border.strokeRoundedRect(x - width/2, y - height/2, width, height, 10);
        border.setDepth(101);
        border.setScrollFactor(0);
        this.uiContainers.push(border as any);
        
        // Texto m�s grande con stroke
        const btnText = this.createReadableText(x, y, label, 
            this.isMobile ? '13px' : '16px', '#ffffff');
        btnText.setOrigin(0.5).setDepth(102).setScrollFactor(0);

        let tooltipText: Phaser.GameObjects.Text | null = null;

        btn.on('pointerdown', () => {
            // Efecto de "press"
            this.tweens.add({
                targets: [btn, btnText, border],
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 50,
                yoyo: true,
                onComplete: callback
            });
        });
        
        btn.on('pointerover', () => {
            btn.setFillStyle(baseColor, 1);
            this.tweens.add({
                targets: [btn, btnText, border, shadow],
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100,
                ease: 'Back.easeOut'
            });
            this.input.setDefaultCursor('pointer');

            if (tooltip && !this.isMobile) {
                tooltipText = this.createReadableText(x, y - 50, tooltip, '12px', '#ffffff');
                tooltipText.setOrigin(0.5).setDepth(200).setScrollFactor(0);
                tooltipText.setBackgroundColor('#000000');
                tooltipText.setPadding(8, 6, 8, 6);
            }
        });
        
        btn.on('pointerout', () => {
            btn.setFillStyle(baseColor, 0.95);
            this.tweens.add({
                targets: [btn, btnText, border, shadow],
                scaleX: 1,
                scaleY: 1,
                duration: 100
            });
            this.input.setDefaultCursor('default');

            if (tooltipText) {
                tooltipText.destroy();
                tooltipText = null;
            }
        });

        this.uiContainers.push(btn as any);
        this.uiContainers.push(btnText as any);

        return btn;
    }

    private drawPyramid(): void {
        // Clear existing sprites to prevent duplication
        for (const sprite of Object.values(this.blockSprites)) {
            sprite.destroy();
        }
        this.blockSprites = {};
        
        if (this.hoverSprite) {
            this.hoverSprite.destroy();
            this.hoverSprite = null;
        }

        // Clear world container (children are already destroyed above when needed)
        if (this.worldContainer) {
            this.worldContainer.removeAll(false);
        }

        // Draw all possible pyramid positions
        for (let row = 0; row < this.currentRows; row++) {
            for (let col = 0; col <= row; col++) {
                const key = `${row}_${col}`;
                const screenPos = GameUtils.isoToScreen(row, col);

                const blockType = this.blocks[key];
                
                // Always use 'cube' texture, apply tint for different types
                // TRAP blocks will use lava texture for visual variety
                let texture = 'cube';
                
                if (blockType === EDITOR_BLOCK_TYPES.TRAP && this.textures.exists('lava_idle')) {
                    texture = 'lava_idle';
                }

                const cube = this.add.sprite(screenPos.x, screenPos.y, texture) as EditorCube;
                
                // Get correct scale based on texture
                const scale = this.getCorrectCubeScale(texture);
                cube.setOrigin(0.5, 0.5);
                cube.setScale(scale.scaleX, scale.scaleY);
                
                cube.setDepth(10 + row);
                cube.setInteractive({ useHandCursor: true });

                // Add to world container
                this.worldContainer.add(cube);

                // Apply visual styling based on block type
                if (blockType === EDITOR_BLOCK_TYPES.VOID || blockType === undefined) {
                    cube.setAlpha(0.2);
                    cube.setTint(0x444444);
                } else {
                    cube.setAlpha(1.0);
                    
                    // Apply tint only for non-TRAP blocks (lava texture has its own colors)
                    if (blockType !== EDITOR_BLOCK_TYPES.TRAP) {
                        cube.setTint(EDITOR_BLOCK_COLORS[blockType]);
                    } else {
                        cube.clearTint();
                    }
                }

                // Mark start block (0,0)
                if (row === 0 && col === 0) {
                    const startMarker = this.add.circle(screenPos.x, screenPos.y - 35, 8, 0x00ff00);
                    startMarker.setDepth(15);
                    startMarker.setStrokeStyle(2, 0xffffff);
                    this.worldContainer.add(startMarker);
                    
                    this.tweens.add({
                        targets: startMarker,
                        scaleX: 1.3,
                        scaleY: 1.3,
                        alpha: 0.6,
                        duration: 800,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                }

                cube.row = row;
                cube.col = col;
                this.blockSprites[key] = cube;

                // Interaction events
                cube.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
                    if (this.editMode === 'blocks') {
                        if (pointer.button === 0) {
                            this.placeBlock(key);
                        } else if (pointer.button === 2) {
                            this.removeBlock(key);
                        }
                    } else if (this.editMode === 'enemies') {
                        this.toggleEnemyAtCube(row, col);
                    }
                });

                cube.on('pointerover', () => {
                    if (this.editMode === 'blocks') {
                        this.showHoverPreview(key, screenPos);
                    }
                    // Scale up uniformly (10% bigger)
                    const currentScaleX = cube.scaleX;
                    const currentScaleY = cube.scaleY;
                    cube.setScale(currentScaleX * 1.1, currentScaleY * 1.1);
                    
                    // Crear outline brillante animado
                    this.highlightCube(cube);
                    this.input.setDefaultCursor('pointer');
                });
                
                cube.on('pointerout', () => {
                    if (this.editMode === 'blocks') {
                        this.hideHoverPreview();
                    }
                    // Restore original scale based on texture
                    const blockType = this.blocks[key];
                    const texture = (blockType === EDITOR_BLOCK_TYPES.TRAP && this.textures.exists('lava_idle')) ? 'lava_idle' : 'cube';
                    const scale = this.getCorrectCubeScale(texture);
                    cube.setScale(scale.scaleX, scale.scaleY);
                    
                    // Remover highlight
                    if (this.currentHighlight) {
                        this.currentHighlight.destroy();
                        this.currentHighlight = null;
                    }
                    this.input.setDefaultCursor('default');
                });
            }
        }

        this.drawEnemies();
        this.input.mouse!.disableContextMenu();
    }

    private drawEnemies(): void {
        for (const sprite of Object.values(this.enemySprites)) {
            sprite.destroy();
        }
        this.enemySprites = {};

        for (let i = 0; i < this.enemies.length; i++) {
            const enemy = this.enemies[i]!;
            const screenPos = GameUtils.isoToScreen(enemy.row, enemy.col);

            const sprite = this.add.sprite(screenPos.x, screenPos.y - 10, 'water_enemy');
            sprite.setScale(GameConfig.SCALES.ENEMY);
            sprite.setDepth(15 + enemy.row);
            sprite.setTint(0xff6600);
            sprite.setInteractive();
            this.worldContainer.add(sprite);

            sprite.on('pointerdown', () => {
                this.removeEnemyAt(i);
            });

            this.enemySprites[i] = sprite;
        }
    }

    private showHoverPreview(key: string, screenPos: { x: number; y: number }): void {
        this.lastHoverKey = key;
        
        const uniformScale = this.getUniformCubeScale();
        
        if (!this.hoverSprite) {
            this.hoverSprite = this.add.sprite(screenPos.x, screenPos.y, 'cube');
            this.hoverSprite.setOrigin(0.5, 0.5);
            this.hoverSprite.setDepth(999);
            // IMPORTANTE: Agregar al worldContainer para que se mueva con �l
            this.worldContainer.add(this.hoverSprite);
        } else {
            this.hoverSprite.setPosition(screenPos.x, screenPos.y);
        }
        
        this.hoverSprite.setScale(uniformScale * 0.9);
        this.hoverSprite.setAlpha(0.6);
        this.hoverSprite.setTint(EDITOR_BLOCK_COLORS[this.selectedBlockType]);
        
        this.tweens.add({
            targets: this.hoverSprite,
            alpha: 0.8,
            duration: 300,
            yoyo: true,
            repeat: 0
        });
    }

    private hideHoverPreview(): void {
        if (this.hoverSprite) {
            this.hoverSprite.setAlpha(0);
        }
        this.lastHoverKey = null;
    }

    private placeBlock(key: string): void {
        if (key === '0_0') {
            this.showFlashMessage('❌ Cannot modify start block (0,0)!', 0xff0000);
            this.flashCubeRed(key);
            return;
        }

        this.blocks[key] = this.selectedBlockType;
        
        const cube = this.blockSprites[key];
        if (cube) {
            // Change texture based on block type
            const texture = (this.selectedBlockType === EDITOR_BLOCK_TYPES.TRAP && this.textures.exists('lava_idle')) 
                ? 'lava_idle' 
                : 'cube';
            
            cube.setTexture(texture);
            cube.setOrigin(0.5, 0.5);
            
            // Get correct scale for texture
            const scale = this.getCorrectCubeScale(texture);
            cube.setScale(scale.scaleX, scale.scaleY);
            
            if (this.selectedBlockType === EDITOR_BLOCK_TYPES.VOID) {
                cube.setAlpha(0.2);
                cube.setTint(0x444444);
            } else {
                cube.setAlpha(1.0);
                
                // Apply tint only for non-TRAP blocks
                if (this.selectedBlockType !== EDITOR_BLOCK_TYPES.TRAP) {
                    cube.setTint(EDITOR_BLOCK_COLORS[this.selectedBlockType]);
                } else {
                    cube.clearTint(); // Remove tint for lava texture
                }
            }
            
            // Animate placement
            cube.setScale(scale.scaleX * 1.3, scale.scaleY * 1.3);
            this.tweens.add({
                targets: cube,
                scaleX: scale.scaleX,
                scaleY: scale.scaleY,
                duration: 200,
                ease: 'Back.easeOut'
            });
            
            this.createPlacementParticles(cube.x, cube.y, EDITOR_BLOCK_COLORS[this.selectedBlockType] || 0xffffff);
        }
        
        this.autoValidate();
    }

    private removeBlock(key: string): void {
        if (key === '0_0') {
            this.showFlashMessage('❌ Cannot remove start block (0,0)!', 0xff0000);
            this.flashCubeRed(key);
            return;
        }

        this.blocks[key] = EDITOR_BLOCK_TYPES.VOID;
        
        const cube = this.blockSprites[key];
        if (cube) {
            // Reset to cube texture
            cube.setTexture('cube');
            cube.setOrigin(0.5, 0.5);
            
            // Get correct scale for cube texture
            const scale = this.getCorrectCubeScale('cube');
            cube.setScale(scale.scaleX, scale.scaleY);
            cube.setAlpha(0.2);
            cube.setTint(0x444444);
            
            this.tweens.add({
                targets: cube,
                scaleX: scale.scaleX * 0.7,
                scaleY: scale.scaleY * 0.7,
                alpha: 0.2,
                duration: 150,
                yoyo: true,
                ease: 'Quad.easeOut'
            });
        }
        
        this.autoValidate();
    }

    private flashCubeRed(key: string): void {
        const cube = this.blockSprites[key];
        if (cube) {
            const originalTint = cube.tintTopLeft;
            cube.setTint(0xff0000);
            this.tweens.add({
                targets: cube,
                alpha: 0.5,
                duration: 100,
                yoyo: true,
                repeat: 2,
                onComplete: () => {
                    cube.setTint(originalTint);
                    cube.setAlpha(1.0);
                }
            });
        }
    }

    private createPlacementParticles(x: number, y: number, color: number): void {
        for (let i = 0; i < 6; i++) {
            const particle = this.add.circle(x, y, 4, color);
            particle.setDepth(1500);
            this.worldContainer.add(particle);
            const angle = (i / 6) * Math.PI * 2;
            
            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * 30,
                y: y + Math.sin(angle) * 30,
                alpha: 0,
                duration: 400,
                ease: 'Quad.easeOut',
                onComplete: () => particle.destroy()
            });
        }
    }

    private toggleEnemyAtCube(row: number, col: number): void {
        const key = `${row}_${col}`;
        
        const blockType = this.blocks[key];
        if (blockType === EDITOR_BLOCK_TYPES.VOID || blockType === undefined) {
            this.showFlashMessage('❌ Cannot place enemy on void!', 0xff0000);
            return;
        }
        
        const exists = this.enemies.findIndex(e => e.row === row && e.col === col);

        if (exists >= 0) {
            this.removeEnemyAt(exists);
        } else if (this.enemies.length < 5) {
            this.enemies.push({ row, col, type: 0 });
            this.drawEnemies();
            this.updateSizeText();
            this.updateModeDisplay();
            this.showFlashMessage('👾 Enemy placed!', 0x00ff00);
        } else {
            this.showFlashMessage('❌ Maximum 5 enemies!', 0xff0000);
        }
        
        this.autoValidate();
    }

    private removeEnemyAt(index: number): void {
        this.enemies.splice(index, 1);
        this.drawEnemies();
        this.updateSizeText();
        this.updateModeDisplay();
        this.showFlashMessage('👾 Enemy removed', 0xffaa00);
        
        this.autoValidate();
    }

    private updateSizeText(): void {
        this.sizeText.setText(`📏 Rows: ${this.currentRows} | 👾 Enemies: ${this.enemies.length}/5`);
    }

    private handleKeypress(event: KeyboardEvent): void {
        const key = event.key.toUpperCase();

        if (key === 'S') this.saveLevelDialog();
        else if (key === 'M') this.goToMenu();
        else if (key === 'T') this.testLevel();
        else if (key === 'V') this.validateAndShowFeedback();
        else if (key === 'C') this.clearLevel();
        else if (key === '+' || key === '=') this.changeRows(1);
        else if (key === '-') this.changeRows(-1);
    }

    private changeRows(delta: number): void {
        const newRows = Math.max(3, Math.min(10, this.currentRows + delta));
        if (newRows !== this.currentRows) {
            this.currentRows = newRows;
            this.updateSizeText();
            this.drawPyramid();
            this.autoValidate();
            
            // Relayout world for new pyramid size
            const vp = this.getViewportSize();
            this.layoutWorld(vp.width, vp.height);
        }
    }

    private clearLevel(): void {
        if (confirm('🗑️ Clear all blocks and enemies?\n\nStart block (0,0) will be preserved.')) {
            this.blocks = { '0_0': EDITOR_BLOCK_TYPES.NORMAL };
            this.enemies = [];
            this.drawPyramid();
            this.updateSizeText();
            this.showFlashMessage('✅ Level cleared!', 0x00ff00);
            this.autoValidate();
        }
    }

    private autoValidate(): void {
        const validation = this.validateLevel();
        this.lastValidationState = validation;
        
        if (this.validationIndicator) {
            this.validationIndicator.destroy();
        }
        
        // Position relative to viewport
    const { width } = this.getViewportSize();
    const x = width - 20;
        const y = 15;
        const text = validation.valid ? '✓' : '✗';
        
        this.validationIndicator = this.add.text(x, y, text, {
            fontSize: '20px',
            color: validation.valid ? '#00ff00' : '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(1, 0).setDepth(150).setScrollFactor(0);
        
        this.validationIndicator.setInteractive({ useHandCursor: true });
        this.validationIndicator.on('pointerover', () => {
            const tooltip = validation.valid 
                ? `✅ Valid\n${validation.reachableCount} blocks\n${validation.goalCount} goals`
                : `❌ Invalid\n${validation.errors[0] || 'Unknown error'}`;
            
            if (this.validationTooltip) this.validationTooltip.destroy();
            this.validationTooltip = this.add.text(x - 10, y + 25, tooltip, {
                fontSize: '11px',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 8, y: 6 }
            }).setOrigin(1, 0).setDepth(151).setScrollFactor(0);
        });
        
        this.validationIndicator.on('pointerout', () => {
            if (this.validationTooltip) {
                this.validationTooltip.destroy();
                this.validationTooltip = null;
            }
        });
    }

    private validateLevel(): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];
        
        const SUPPORTED_TYPES = [
            EDITOR_BLOCK_TYPES.NORMAL,
            EDITOR_BLOCK_TYPES.GOAL,
            EDITOR_BLOCK_TYPES.TRAP,
            EDITOR_BLOCK_TYPES.TRAMPOLINE,
            EDITOR_BLOCK_TYPES.VOID
        ];
        
        // 1. Verify start block at (0,0)
        const startBlockType = this.blocks['0_0'];
        if (startBlockType === undefined || startBlockType === EDITOR_BLOCK_TYPES.VOID) {
            errors.push('❌ Missing start block at (0,0)');
        } else if (!SUPPORTED_TYPES.includes(startBlockType as any)) {
            errors.push(`❌ Unsupported block type (${startBlockType}) at start (0,0)`);
        }
        
        // 2. Check for unsupported block types
        const unsupportedBlocks: string[] = [];
        for (const [key, blockType] of Object.entries(this.blocks)) {
            if (blockType !== undefined && blockType !== EDITOR_BLOCK_TYPES.VOID && !SUPPORTED_TYPES.includes(blockType as any)) {
                unsupportedBlocks.push(`${key}:${blockType}`);
            }
        }
        if (unsupportedBlocks.length > 0) {
            errors.push(`❌ Unsupported block types found: ${unsupportedBlocks.join(', ')}`);
        }
        
        // 3. Verify at least one GOAL block
        const goalBlocks = Object.keys(this.blocks).filter(key => this.blocks[key] === EDITOR_BLOCK_TYPES.GOAL);
        if (goalBlocks.length === 0) {
            errors.push('❌ Level must have at least one GOAL block');
        }
        
        // 4. Check reachability with BFS
        const reachable = this.getReachableBlocks();
        
        const unreachableGoals = goalBlocks.filter(goalKey => !reachable.has(goalKey));
        if (unreachableGoals.length > 0) {
            errors.push(`❌ ${unreachableGoals.length} GOAL(s) unreachable: ${unreachableGoals.join(', ')}`);
        }
        
        // 5. Verify minimum playable blocks
        const validBlocks = Object.values(this.blocks).filter(
            type => type !== EDITOR_BLOCK_TYPES.VOID && type !== undefined && SUPPORTED_TYPES.includes(type as any)
        );
        if (validBlocks.length < 3) {
            errors.push(`❌ Level needs at least 3 playable blocks (found ${validBlocks.length})`);
        }
        
        // Warnings
        if (reachable.size < validBlocks.length) {
            warnings.push(`⚠️ ${validBlocks.length - reachable.size} block(s) unreachable from start`);
        }
        
        return {
            valid: errors.length === 0,
            errors,
            warnings,
            reachableCount: reachable.size,
            goalCount: goalBlocks.length,
            totalBlocks: validBlocks.length
        };
    }

    private getReachableBlocks(): Set<string> {
        const reachable = new Set<string>();
        const queue: string[] = ['0_0'];
        reachable.add('0_0');
        
        const adjacentDirections = [
            { row: -1, col: 0 },
            { row: 1, col: 0 },
            { row: 0, col: -1 },
            { row: 0, col: 1 }
        ];
        
        const trampolineJumps = [
            { row: -2, col: 0 },
            { row: 2, col: 0 },
            { row: 0, col: -2 },
            { row: 0, col: 2 },
            { row: -1, col: -1 },
            { row: -1, col: 1 },
            { row: 1, col: -1 },
            { row: 1, col: 1 }
        ];
        
        const isValidBlock = (key: string): boolean => {
            const blockType = this.blocks[key];
            return blockType !== EDITOR_BLOCK_TYPES.VOID && blockType !== undefined;
        };
        
        const isInBounds = (row: number, col: number): boolean => {
            return row >= 0 && row < this.currentRows && col >= 0 && col <= row;
        };
        
        while (queue.length > 0) {
            const current = queue.shift()!;
            const parts = current.split('_').map(Number);
            const row = parts[0]!;
            const col = parts[1]!;
            const currentBlockType = this.blocks[current];
            
            // Standard adjacent moves
            for (const dir of adjacentDirections) {
                const newRow = row + dir.row;
                const newCol = col + dir.col;
                const newKey = `${newRow}_${newCol}`;
                
                if (isInBounds(newRow, newCol) && isValidBlock(newKey) && !reachable.has(newKey)) {
                    reachable.add(newKey);
                    queue.push(newKey);
                }
            }
            
            // Extended trampoline jumps
            if (currentBlockType === EDITOR_BLOCK_TYPES.TRAMPOLINE) {
                for (const jump of trampolineJumps) {
                    const jumpRow = row + jump.row;
                    const jumpCol = col + jump.col;
                    const jumpKey = `${jumpRow}_${jumpCol}`;
                    
                    if (isInBounds(jumpRow, jumpCol) && isValidBlock(jumpKey) && !reachable.has(jumpKey)) {
                        reachable.add(jumpKey);
                        queue.push(jumpKey);
                    }
                }
            }
        }
        
        return reachable;
    }

    private validateAndShowFeedback(): void {
        const validation = this.validateLevel();
        
        if (validation.valid) {
            let message = `✅ LEVEL VALID!\n📊 ${validation.reachableCount}/${validation.totalBlocks} blocks reachable\n🎯 ${validation.goalCount} goal(s)`;
            
            if (validation.warnings && validation.warnings.length > 0) {
                message += `\n\n${validation.warnings.join('\n')}`;
            }
            
            this.showFlashMessage(message, 0x00ff00, 2500);
        } else {
            this.showFlashMessage(
                `❌ VALIDATION ERRORS:\n${validation.errors.join('\n')}`,
                0xff0000,
                3000
            );
        }
    }

    private testLevel(): void {
        const validation = this.validateLevel();

        if (!validation.valid) {
            this.showFlashMessage(
                `❌ Cannot test invalid level:\n${validation.errors.join('\n')}`,
                0xff0000,
                3000
            );
            return;
        }

        const tempLevel: LevelData = {
            name: this.levelName || 'Test Level',
            description: 'Testing from editor',
            rows: this.currentRows,
            blocks: this.blocks,
            enemies: this.enemies,
            difficulty: 'normal'
        };

        console.log('📝 [EditorScene] Testing level:', tempLevel);
        
        this.scene.start('GameScene', { customLevel: tempLevel, fromEditor: true });
    }

    private saveLevelDialog(): void {
        const validation = this.validateLevel();

        if (!validation.valid) {
            this.showFlashMessage(
                `❌ Cannot save invalid level:\n${validation.errors.join('\n')}`,
                0xff0000,
                3000
            );
            return;
        }

        const name = prompt('📝 Level name:', this.levelName || 'My Level');
        if (!name) return;

        const description = prompt('📄 Description (optional):', '');

        const levelData: LevelData = {
            name,
            description: description || '',
            rows: this.currentRows,
            blocks: this.blocks,
            enemies: this.enemies,
            difficulty: 'normal'
        };

        LevelStorage.saveLevel(levelData).then(() => {
            this.showFlashMessage(`✅ Level "${name}" saved!`, 0x00ff00);
            this.levelName = name;
            if (this.levelNameText) {
                this.levelNameText.setText(`📝 ${this.levelName}`);
            }
        }).catch(() => {
            this.showFlashMessage('❌ Error saving level', 0xff0000);
        });
    }

    private shareLevelDialog(): void {
        console.log('📤 [EditorScene] shareLevelDialog() called');
        console.log('   Current state:');
        console.log('   - levelName:', this.levelName);
        console.log('   - currentRows:', this.currentRows);
        console.log('   - blocks:', Object.keys(this.blocks).length, 'blocks');
        console.log('   - enemies:', this.enemies.length, 'enemies');
        console.log('   - blocks content:', this.blocks);
        console.log('   - enemies content:', this.enemies);
        
        const validation = this.validateLevel();

        if (!validation.valid) {
            console.log('❌ [EditorScene] Validation failed:', validation.errors);
            this.showFlashMessage(
                `❌ Cannot share invalid level:\n${validation.errors.join('\n')}`,
                0xff0000,
                3000
            );
            return;
        }

        // 🔥 CRITICAL: Deep copy to prevent mutations during sharing
        const levelData: LevelData = {
            name: this.levelName || 'My Astrocat Level',
            description: 'A custom level created in the Astrocat editor',
            rows: this.currentRows,
            blocks: JSON.parse(JSON.stringify(this.blocks)), // Deep copy
            enemies: JSON.parse(JSON.stringify(this.enemies)), // Deep copy
            difficulty: 'normal'
        };

        console.log('📤 [EditorScene] Prepared level data for sharing (deep copied):', levelData);

        // Create and show share dialog
        const shareDialog = new ShareLevelDialog(this, levelData);
        shareDialog.show((success, postUrl) => {
            if (success && postUrl) {
                console.log('✅ [EditorScene] Level shared successfully:', postUrl);
                this.showFlashMessage(
                    `✅ Level shared!\n🌐 ${postUrl}`,
                    0x00ff00,
                    4000
                );
            } else {
                console.log('❌ [EditorScene] Share failed or cancelled');
            }
            
            // 🔥 Verify state after sharing
            console.log('🔍 [EditorScene] State after share dialog closed:');
            console.log('   - blocks:', Object.keys(this.blocks).length);
            console.log('   - enemies:', this.enemies.length);
        });
    }

    private showFlashMessage(text: string, color: number, duration: number = 1500): void {
    const { width, height } = this.getViewportSize();
        const msgWidth = 600;
        const msgHeight = 100;
        const x = (width - msgWidth) / 2;
        const y = height - 170; // Bottom center position
        
        const msgBg = this.add.graphics();
        msgBg.fillStyle(0x000000, 0.92);
        msgBg.fillRoundedRect(x, y, msgWidth, msgHeight, 16);
        msgBg.lineStyle(3, color, 0.8);
        msgBg.strokeRoundedRect(x, y, msgWidth, msgHeight, 16);
        msgBg.setDepth(2000);
        msgBg.setAlpha(0);

        const msgText = this.add.text(x + msgWidth / 2, y + msgHeight / 2, text, {
            fontSize: '17px',
            color: color === 0xff0000 ? '#ff8888' : (color === 0x00ff00 ? '#88ff88' : '#ffbb77'),
            align: 'center',
            fontStyle: 'bold',
            lineSpacing: 6
        }).setOrigin(0.5).setDepth(2001).setAlpha(0);

        this.tweens.add({
            targets: [msgBg, msgText],
            alpha: 1,
            y: '-=10',
            duration: 250,
            ease: 'Back.easeOut'
        });

        this.time.delayedCall(duration, () => {
            this.tweens.add({
                targets: [msgBg, msgText],
                alpha: 0,
                y: '+=15',
                duration: 300,
                ease: 'Quad.easeIn',
                onComplete: () => {
                    msgBg.destroy();
                    msgText.destroy();
                }
            });
        });
    }

    private goToMenu(): void {
        if (confirm('🏠 Return to menu?\n\nUnsaved changes will be lost.')) {
            this.scene.start('MenuScene');
        }
    }
}
