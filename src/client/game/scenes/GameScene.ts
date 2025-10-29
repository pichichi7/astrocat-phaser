/**
 * GameScene.ts
 * Escena principal del juego - Q*bert style isometric puzzle
 * Convertido desde ASTROCAT/src/scenes/GameScene.js
 */

import * as Phaser from 'phaser';
import { GameConfig, GameUtils, type Position, type RowCol } from '../config';
import type { LevelData, EnemyData } from '../LevelFormat';
import { LeaderboardClient } from '../services/LeaderboardClient';

interface Enemy {
    sprite: Phaser.GameObjects.Image;
    row: number;
    col: number;
    busy: boolean;
    moveTimer: number;
    patrolPattern: RowCol[];
    patrolIndex: number;
}

interface CubeSprite extends Phaser.GameObjects.Image {
    state: number;
    row: number;
    col: number;
    blockType: number;
}

export class GameScene extends Phaser.Scene {
    // Configuration
    private rows!: number;
    private tileW!: number;
    private tileH!: number;
    private origin!: Position;
    private jumpDuration!: number;
    private jumpOffset!: number;
    private spriteOffsetY!: number;

    // Game state
    private cubes!: Map<string, CubeSprite>;
    private cubesContainer!: Phaser.GameObjects.Container;
    private player!: Phaser.GameObjects.Image;
    private playerShadow!: Phaser.GameObjects.Ellipse;
    private playerRow!: number;
    private playerCol!: number;
    private playerBusy!: boolean;
    private lives!: number;
    private gameOver!: boolean;
    private level!: number;
    private nextJumpIsDouble!: boolean; // Flag for trampoline mechanic

    // UI elements
    private livesText!: Phaser.GameObjects.Text;
    private levelText!: Phaser.GameObjects.Text;
    private progressText!: Phaser.GameObjects.Text;
    private hudPanel!: Phaser.GameObjects.Graphics;

    // Touch controls
    private touchStartPos: Position | null = null;
    private swipeMinDistance = 50;

    // Input
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: {
        W: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
    };

    // Enemy system
    private enemies: Enemy[] = [];
    private enemyMoveInterval!: number;
    private enemyMoveDuration!: number;

    // Custom level support
    private customLevel: LevelData | null = null;
    private fromEditor = false;
    private fromCommunity = false;
    private levelName: string | null = null;
    private creator: string | null = null;
    private levelCustomBlocks: { [key: string]: number } = {};
    private levelCustomEnemies: EnemyData[] = [];

    // Tutorial state
    private tutorialShown = false;
    private tutorialOverlay: any = null;

    // Victory text references
    private victoryElements: Phaser.GameObjects.GameObject[] = [];

    // Instructions
    private instructionsElements: any = null;
    private firstMoveDetected = false;

    // Time tracking for leaderboard
    private levelStartTime = 0;
    private levelElapsedTime = 0;

    constructor() {
        super({ key: 'GameScene' });

        // Initialize from config
        this.rows = GameConfig.GAMEPLAY.STARTING_ROWS;
        this.tileW = GameConfig.TILE_WIDTH;
        this.tileH = GameConfig.TILE_HEIGHT;
        this.origin = { x: GameConfig.ORIGIN_X, y: GameConfig.ORIGIN_Y };
        this.jumpDuration = GameConfig.JUMP_DURATION;
        this.jumpOffset = GameConfig.JUMP_OFFSET_Y;
        this.spriteOffsetY = GameConfig.SPRITE_OFFSET_Y;

        // Enemy system config
        this.enemyMoveInterval = GameConfig.ENEMY.MOVE_INTERVAL;
        this.enemyMoveDuration = GameConfig.ENEMY.MOVE_DURATION;

        // Game state
        this.cubes = new Map();
        this.playerRow = 0;
        this.playerCol = 0;
        this.playerBusy = false;
        this.lives = GameConfig.GAMEPLAY.STARTING_LIVES;
        this.gameOver = false;
        this.level = 1;
        this.nextJumpIsDouble = false;
        this.levelStartTime = 0;
        this.levelElapsedTime = 0;
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
        
        if (textureKey === 'lava_on' && this.textures.exists('lava_on')) {
            const cubeTexture = this.textures.get('cube');
            const lavaOnTexture = this.textures.get('lava_on');
            
            const cubeWidth = cubeTexture.getSourceImage().width;
            const cubeHeight = cubeTexture.getSourceImage().height;
            const lavaOnWidth = lavaOnTexture.getSourceImage().width;
            const lavaOnHeight = lavaOnTexture.getSourceImage().height;
            
            return {
                scaleX: (cubeWidth / lavaOnWidth) * GameConfig.SCALES.CUBE,
                scaleY: (cubeHeight / lavaOnHeight) * GameConfig.SCALES.CUBE
            };
        }
        
        // Default cube scale
        return {
            scaleX: GameConfig.SCALES.CUBE,
            scaleY: GameConfig.SCALES.CUBE
        };
    }

    init(data?: { 
        customLevel?: LevelData; 
        fromEditor?: boolean;
        fromCommunity?: boolean;
        levelName?: string;
        creator?: string;
    }): void {
        if (data?.customLevel) {
            console.log('🎮 [GameScene] init() - Recibiendo nivel personalizado:', data.customLevel);
            this.customLevel = data.customLevel;
            this.fromEditor = data.fromEditor || false;
            this.fromCommunity = data.fromCommunity || false;
            this.levelName = data.levelName || null;
            this.creator = data.creator || null;
            console.log('   Desde Editor:', this.fromEditor);
            console.log('   Desde Comunidad:', this.fromCommunity);
            if (this.levelName) console.log('   Nombre:', this.levelName);
            if (this.creator) console.log('   Creador:', this.creator);
        } else {
            console.log('🎮 [GameScene] init() - Sin datos personalizados');
        }

        this.tutorialShown = localStorage.getItem('astrocat_tutorial_shown') === 'true';
    }

    preload(): void {
        this.load.image('space', '/assets/space.png');
        this.load.image('astrocat', '/assets/astrocat.png');
        this.load.image('astrocat_jump', '/assets/astrocat_jump.png');
        this.load.image('cube', '/assets/cube_top.png');
        this.load.image('water_enemy', '/assets/water_enemy.png');
        this.load.image('water_enemy_move', '/assets/water_enemy.png');
        this.load.image('hud_bg', '/assets/hud_bg.png');
        
        // Lava trap sprites
        this.load.image('lava_idle', '/assets/lava_idle.png');
        this.load.image('lava_on', '/assets/lava_on.png');
        
        // Error handling
        this.load.on('loaderror', (file: any) => {
            console.error('❌ [GameScene] Failed to load:', file.key, file.src);
        });
    }

    create(): void {
        if (this.customLevel) {
            console.log('🎮 [GameScene] create() - Usando nivel personalizado');
            this.rows = this.customLevel.rows;
            
            // 🔥 Convert blocks array to dictionary format
            if (Array.isArray(this.customLevel.blocks)) {
                console.log('   📦 Converting blocks array to dictionary...');
                this.levelCustomBlocks = {};
                for (const block of this.customLevel.blocks) {
                    const key = `${block.row}_${block.col}`;
                    this.levelCustomBlocks[key] = block.type;
                }
                console.log('   ✅ Converted', this.customLevel.blocks.length, 'blocks to dictionary');
            } else {
                // Already in dictionary format
                this.levelCustomBlocks = this.customLevel.blocks;
            }
            
            this.levelCustomEnemies = this.customLevel.enemies || [];
            console.log('   Filas:', this.rows);
            console.log('   Bloques personalizados:', Object.keys(this.levelCustomBlocks).length);
            console.log('   Enemigos:', this.levelCustomEnemies.length);
            console.log('🐛 [DEBUG] Enemy data:', JSON.stringify(this.levelCustomEnemies));
        } else {
            console.log('🎮 [GameScene] create() - Usando nivel por defecto');
        }

        // Background
        const bg = this.add.image(640, 360, 'space');
        bg.setDepth(-1);
        bg.displayWidth = 1280;
        bg.displayHeight = 720;

        this.setupInput();
        this.generatePyramid();
        this.createPlayer();
        this.setupUI();
        this.setupTouchControls();
        this.createEnemies();

        if (!this.tutorialShown && !this.fromEditor) {
            this.time.delayedCall(500, () => this.showTutorial());
        }

        // Start level timer
        this.levelStartTime = Date.now();
        this.levelElapsedTime = 0;
    }

    private setupInput(): void {
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.wasd = this.input.keyboard!.addKeys('W,S,A,D') as any;
    }

    private setupTouchControls(): void {
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.touchStartPos = { x: pointer.x, y: pointer.y };
        });

        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (this.touchStartPos && !this.playerBusy) {
                const dx = pointer.x - this.touchStartPos.x;
                const dy = pointer.y - this.touchStartPos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > this.swipeMinDistance) {
                    const angle = Math.atan2(dy, dx);
                    const direction = this.getSwipeDirection(angle);
                    if (direction) {
                        this.tryMove(direction);
                    }
                }
            }
            this.touchStartPos = null;
        });
    }

    private getSwipeDirection(angle: number): RowCol | null {
        const degrees = (angle * 180 / Math.PI + 360) % 360;

        if (degrees >= 315 || degrees < 45) {
            return { row: 0, col: 1 };
        } else if (degrees >= 45 && degrees < 135) {
            return { row: 1, col: 0 };
        } else if (degrees >= 135 && degrees < 225) {
            return { row: 0, col: -1 };
        } else if (degrees >= 225 && degrees < 315) {
            return { row: -1, col: 0 };
        }
        return null;
    }

    private generatePyramid(): void {
        this.cubes.clear();
        this.cubesContainer = this.add.container(0, 0);

        let cubesCreated = 0;
        let cubesSkipped = 0;

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c <= r; c++) {
                const key = `${r}_${c}`;

                if (this.levelCustomBlocks && Object.keys(this.levelCustomBlocks).length > 0) {
                    const hasKey = Object.prototype.hasOwnProperty.call(this.levelCustomBlocks, key);
                    if (!hasKey) {
                        cubesSkipped++;
                        continue;
                    }
                }

                const pos = this.isoToScreen(r, c);
                
                // Check block type to determine texture
                const blockType = this.levelCustomBlocks ? (this.levelCustomBlocks[key] ?? 0) : 0;
                const TRAP = 1;
                
                // Use lava texture for TRAP blocks if available, normal cube for others
                let texture = 'cube';
                if (blockType === TRAP && this.textures.exists('lava_idle')) {
                    texture = 'lava_idle';
                } else if (blockType === TRAP) {
                    console.warn('⚠️ [GameScene] lava_idle texture not found, using cube');
                }
                
                const cube = this.add.image(pos.x, pos.y, texture) as CubeSprite;
                
                cube.setDepth(10 + r + c * 0.1);
                
                // Apply correct scale based on texture
                const scale = this.getCorrectCubeScale(texture);
                cube.setScale(scale.scaleX, scale.scaleY);

                cube.state = 0;
                cube.row = r;
                cube.col = c;
                cube.blockType = blockType;

                this.updateCubeColor(cube);
                this.cubes.set(key, cube);
                this.cubesContainer.add(cube);
                cubesCreated++;
            }
        }

        console.log(`🎮 [GameScene] Pirámide generada: ${cubesCreated} cubos creados, ${cubesSkipped} saltados`);
    }

    private updateCubeColor(cube: CubeSprite): void {
        const GOAL = 6, TRAP = 1, TRAMPOLINE = 3;

        if (cube.blockType === GOAL) {
            switch (cube.state) {
                case 0: cube.setTint(0xff00ff); break;
                case 1: cube.setTint(0xff66ff); break;
                case 2: cube.setTint(GameConfig.COLORS.CUBE_GREEN); break;
            }
        } else if (cube.blockType === TRAP) {
            // TRAP cubes use lava sprites (no tint, texture changes on activation)
            // The texture was already set in creation to 'lava_idle'
            // When player steps on it, it's handled in playerHitByTrap()
            cube.clearTint(); // Keep original lava color
        } else if (cube.blockType === TRAMPOLINE) {
            switch (cube.state) {
                case 0: cube.setTint(0xffff00); break;
                case 1: cube.setTint(0xffff66); break;
                case 2: cube.setTint(GameConfig.COLORS.CUBE_GREEN); break;
            }
        } else {
            switch (cube.state) {
                case 0: cube.setTint(GameConfig.COLORS.CUBE_WHITE); break;
                case 1: cube.setTint(GameConfig.COLORS.CUBE_CYAN); break;
                case 2: cube.setTint(GameConfig.COLORS.CUBE_GREEN); break;
            }
        }
    }

    private createPlayer(): void {
        const pos = this.isoToScreen(0, 0);

        this.playerShadow = this.add.ellipse(
            pos.x,
            pos.y + GameConfig.SHADOW.OFFSET_Y,
            GameConfig.SHADOW.WIDTH,
            GameConfig.SHADOW.HEIGHT,
            GameConfig.COLORS.SHADOW,
            0.3
        );
        this.playerShadow.setDepth(5);

        this.player = this.add.image(pos.x, pos.y - this.spriteOffsetY, 'astrocat');
        this.player.setDepth(1000);
        this.player.setScale(GameConfig.SCALES.PLAYER);

        this.playerRow = 0;
        this.playerCol = 0;
        this.playerBusy = false;

        this.stepOnCube(0, 0);
    }

    private setupUI(): void {
        this.hudPanel = this.add.graphics();
        this.hudPanel.fillStyle(0x000033, 0.75);
        this.hudPanel.fillRoundedRect(10, 10, 260, 110, 12);
        this.hudPanel.lineStyle(3, 0x00ffff, 0.8);
        this.hudPanel.strokeRoundedRect(10, 10, 260, 110, 12);
        this.hudPanel.setDepth(99);

        this.livesText = this.add.text(30, 30, `❤️ Lives: ${this.lives}`, {
            fontSize: '22px',
            fontFamily: 'Arial',
            color: '#ff6b6b',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setDepth(GameConfig.UI.HUD_DEPTH);

        this.levelText = this.add.text(30, 60, `⭐ Level: ${this.level}`, {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffd93d',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setDepth(GameConfig.UI.HUD_DEPTH);

        this.updateProgressDisplay();

        const menuButton = this.add.graphics();
        menuButton.fillStyle(0x1a1a3a, 0.85);
        menuButton.fillRoundedRect(1130, 20, 130, 40, 8);
        menuButton.lineStyle(2, 0x00ffff, 0.9);
        menuButton.strokeRoundedRect(1130, 20, 130, 40, 8);
        menuButton.setDepth(100);

        const menuText = this.add.text(1195, 40, '🏠 MENU', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#00ffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(101);

        const menuHitArea = this.add.rectangle(1195, 40, 130, 40, 0x000000, 0.01);
        menuHitArea.setDepth(102);
        menuHitArea.setInteractive({ useHandCursor: true });
        menuHitArea.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
        menuHitArea.on('pointerover', () => {
            menuText.setScale(1.1);
        });
        menuHitArea.on('pointerout', () => {
            menuText.setScale(1.0);
        });

        if (this.level === 1) {
            const instrBg = this.add.graphics();
            instrBg.fillStyle(0x000000, 0.6);
            instrBg.fillRoundedRect(340, 660, 600, 40, 8);
            instrBg.setDepth(99);

            const instrText = this.add.text(640, 680, '⌨️ WASD / Arrow Keys  |  📱 Swipe to move', {
                fontSize: '16px',
                fontFamily: 'Arial',
                color: '#aaddff',
                stroke: '#000000',
                strokeThickness: 2,
                fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(100);

            this.instructionsElements = { bg: instrBg, text: instrText };

            this.time.delayedCall(10000, () => {
                this.hideInstructions();
            });
        }
    }

    private updateProgressDisplay(): void {
        const totalCubes = this.getTotalCubes();
        const completedCubes = this.getCompletedCubes();

        if (this.progressText) {
            this.progressText.destroy();
        }

        const progressColor = completedCubes === totalCubes ? '#00ff00' : '#00ffff';
        const progressIcon = completedCubes === totalCubes ? '✅' : '🎯';

        this.progressText = this.add.text(30, 90, `${progressIcon} Progress: ${completedCubes}/${totalCubes}`, {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: progressColor,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setDepth(GameConfig.UI.HUD_DEPTH);

        if (this.progressText) {
            this.tweens.add({
                targets: this.progressText,
                scaleX: 1.15,
                scaleY: 1.15,
                duration: 100,
                yoyo: true,
                ease: 'Quad.easeOut'
            });
        }
    }

    private getTotalCubes(): number {
        if (this.levelCustomBlocks) {
            let goalCount = 0;
            this.cubes.forEach(cube => {
                if (cube.blockType === 6) goalCount++;
            });
            if (goalCount > 0) return goalCount;
        }
        return this.cubes.size;
    }

    private getCompletedCubes(): number {
        if (this.levelCustomBlocks) {
            let completedGoals = 0;
            let hasGoals = false;
            this.cubes.forEach(cube => {
                if (cube.blockType === 6) {
                    hasGoals = true;
                    if (cube.state === 2) completedGoals++;
                }
            });
            if (hasGoals) return completedGoals;
        }

        let completed = 0;
        this.cubes.forEach(cube => {
            if (cube.state === 2) completed++;
        });
        return completed;
    }

    private isoToScreen(row: number, col: number): Position {
        return GameUtils.isoToScreen(row, col, GameConfig);
    }

    private isValidPosition(row: number, col: number): boolean {
        if (this.levelCustomBlocks && Object.keys(this.levelCustomBlocks).length > 0) {
            const key = `${row}_${col}`;
            return Object.prototype.hasOwnProperty.call(this.levelCustomBlocks, key);
        }
        return GameUtils.isValidPosition(row, col, this.rows);
    }

    override update(_time: number, delta: number): void {
        if (this.gameOver) return;

        // Update elapsed time
        if (this.levelStartTime > 0) {
            this.levelElapsedTime = Date.now() - this.levelStartTime;
        }

        // 🐛 DEBUG: Log enemy update
        if (this.enemies.length > 0 && Math.random() < 0.01) { // Log 1% of the time to avoid spam
            console.log(`🐛 [DEBUG] update() called, enemies: ${this.enemies.length}, delta: ${delta}`);
        }

        this.updateEnemies(delta);

        if (this.playerBusy) return;

        const direction = this.readInput();
        if (direction) {
            this.tryMove(direction);
        }
    }

    private readInput(): RowCol | null {
        if (Phaser.Input.Keyboard.JustDown(this.wasd.W) || Phaser.Input.Keyboard.JustDown(this.cursors.up!)) {
            return { row: -1, col: 0 };
        }
        if (Phaser.Input.Keyboard.JustDown(this.wasd.D) || Phaser.Input.Keyboard.JustDown(this.cursors.right!)) {
            return { row: 0, col: 1 };
        }
        if (Phaser.Input.Keyboard.JustDown(this.wasd.A) || Phaser.Input.Keyboard.JustDown(this.cursors.left!)) {
            return { row: 0, col: -1 };
        }
        if (Phaser.Input.Keyboard.JustDown(this.wasd.S) || Phaser.Input.Keyboard.JustDown(this.cursors.down!)) {
            return { row: 1, col: 0 };
        }
        return null;
    }

    private tryMove(direction: RowCol): void {
        // 🔥 TRAMPOLINE MECHANIC: Double jump distance
        let jumpMultiplier = 1;
        if (this.nextJumpIsDouble) {
            jumpMultiplier = 2;
            console.log('🟡 [GameScene] Using trampoline double jump!');
        }
        
        const newRow = this.playerRow + (direction.row * jumpMultiplier);
        const newCol = this.playerCol + (direction.col * jumpMultiplier);

        if (!this.firstMoveDetected) {
            this.firstMoveDetected = true;
            this.hideInstructions();
        }

        if (this.isValidPosition(newRow, newCol)) {
            this.movePlayer(newRow, newCol);
            // Reset trampoline flag after successful jump
            if (this.nextJumpIsDouble) {
                this.nextJumpIsDouble = false;
                console.log('🟡 [GameScene] Trampoline effect consumed');
            }
        } else {
            this.invalidMoveAttempt();
            // Reset trampoline flag even on failed jump
            if (this.nextJumpIsDouble) {
                this.nextJumpIsDouble = false;
                console.log('🟡 [GameScene] Trampoline effect wasted (invalid move)');
            }
        }
    }

    private invalidMoveAttempt(): void {
        this.playerBusy = true;

        this.player.setTint(0xff0000);

        const originalX = this.player.x;
        this.tweens.add({
            targets: this.player,
            x: originalX - 8,
            duration: 40,
            yoyo: true,
            repeat: 3,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                this.player.x = originalX;
                this.player.clearTint();
                this.playerBusy = false;
            }
        });

        for (let i = 0; i < 4; i++) {
            const particle = this.add.circle(this.player.x, this.player.y, 3, 0xff0000);
            particle.setDepth(1500);
            const angle = (i / 4) * Math.PI * 2;
            this.tweens.add({
                targets: particle,
                x: this.player.x + Math.cos(angle) * 20,
                y: this.player.y + Math.sin(angle) * 20,
                alpha: 0,
                duration: 300,
                ease: 'Quad.easeOut',
                onComplete: () => particle.destroy()
            });
        }
    }

    private async movePlayer(toRow: number, toCol: number): Promise<void> {
        this.playerBusy = true;

        const toPos = this.isoToScreen(toRow, toCol);
        const shadowEndPos = { x: toPos.x, y: toPos.y + GameConfig.SHADOW.OFFSET_Y };

        await new Promise<void>(resolve => {
            this.tweens.add({
                targets: this.player,
                scaleY: GameConfig.SCALES.PLAYER * 0.85,
                scaleX: GameConfig.SCALES.PLAYER * 1.15,
                duration: 40,
                ease: 'Back.easeOut',
                onComplete: () => resolve()
            });
        });

        const fadeOut = this.tweens.add({
            targets: this.player,
            alpha: 0.8,
            duration: 30
        });
        await new Promise<void>(resolve => fadeOut.on('complete', () => resolve()));

        this.player.setTexture('astrocat_jump');

        const fadeIn = this.tweens.add({
            targets: this.player,
            alpha: 1.0,
            duration: 30
        });
        await new Promise<void>(resolve => fadeIn.on('complete', () => resolve()));

        this.tweens.add({
            targets: this.playerShadow,
            scaleX: 0.6,
            scaleY: 0.6,
            alpha: 0.2,
            x: shadowEndPos.x,
            y: shadowEndPos.y,
            duration: this.jumpDuration * 0.5,
            ease: 'Quad.easeOut'
        });

        await new Promise<void>(resolve => {
            this.tweens.add({
                targets: this.player,
                x: toPos.x,
                y: toPos.y - this.spriteOffsetY - this.jumpOffset * 2.2,
                duration: this.jumpDuration * 0.5,
                ease: 'Quad.easeOut',
                onComplete: () => resolve()
            });
        });

        this.tweens.add({
            targets: this.playerShadow,
            scaleX: 1.0,
            scaleY: 1.0,
            alpha: 0.3,
            duration: this.jumpDuration * 0.5,
            ease: 'Quad.easeIn'
        });

        await new Promise<void>(resolve => {
            this.tweens.add({
                targets: this.player,
                y: toPos.y - this.spriteOffsetY,
                duration: this.jumpDuration * 0.5,
                ease: 'Quad.easeIn',
                onComplete: () => resolve()
            });
        });

        await new Promise<void>(resolve => {
            this.tweens.add({
                targets: this.player,
                scaleY: GameConfig.SCALES.PLAYER * 0.9,
                scaleX: GameConfig.SCALES.PLAYER * 1.1,
                duration: 50,
                ease: 'Bounce.easeOut',
                onComplete: () => resolve()
            });
        });

        await new Promise<void>(resolve => {
            this.tweens.add({
                targets: this.player,
                scaleX: GameConfig.SCALES.PLAYER,
                scaleY: GameConfig.SCALES.PLAYER,
                duration: 60,
                ease: 'Back.easeOut',
                onComplete: () => resolve()
            });
        });

        const fadeOutJump = this.tweens.add({
            targets: this.player,
            alpha: 0.8,
            duration: 30
        });
        await new Promise<void>(resolve => fadeOutJump.on('complete', () => resolve()));

        this.player.setTexture('astrocat');

        const fadeInIdle = this.tweens.add({
            targets: this.player,
            alpha: 1.0,
            duration: 30
        });
        await new Promise<void>(resolve => fadeInIdle.on('complete', () => resolve()));

        this.playerRow = toRow;
        this.playerCol = toCol;

        this.stepOnCube(toRow, toCol);
        this.playerBusy = false;
        this.checkEnemyPlayerCollision();
    }

    private stepOnCube(row: number, col: number): void {
        const cube = this.cubes.get(`${row}_${col}`);
        if (cube) {
            const TRAP = 1, TRAMPOLINE = 3;
            
            // 🔥 TRAP MECHANIC: Player loses a life
            if (cube.blockType === TRAP) {
                this.playerHitByTrap(cube);
                return; // Don't process normal cube behavior
            }
            
            // 🔥 TRAMPOLINE MECHANIC: Next jump will be double distance
            if (cube.blockType === TRAMPOLINE) {
                this.nextJumpIsDouble = true;
                this.showTrampolineEffect(cube);
                console.log('🟡 [GameScene] Trampoline activated! Next jump will be 2 cubes');
            }
            
            const oldState = cube.state;
            cube.state = Math.min(cube.state + 1, 2);
            this.updateCubeColor(cube);

            if (oldState !== cube.state) {
                const flash = this.add.circle(cube.x, cube.y, 50, 0xffffff, 0.8);
                flash.setDepth(1499);
                this.tweens.add({
                    targets: flash,
                    scaleX: 2.5,
                    scaleY: 2.5,
                    alpha: 0,
                    duration: 250,
                    ease: 'Quad.easeOut',
                    onComplete: () => flash.destroy()
                });

                this.tweens.add({
                    targets: cube,
                    scaleX: GameConfig.SCALES.CUBE * 1.2,
                    scaleY: GameConfig.SCALES.CUBE * 1.2,
                    duration: 150,
                    yoyo: true,
                    ease: 'Back.easeOut'
                });

                this.createLandingParticles(cube.x, cube.y, oldState);

                if (cube.state === 2) {
                    this.createCompletionEffect(cube.x, cube.y);
                }
            }

            this.updateProgressDisplay();

            if (this.getCompletedCubes() === this.getTotalCubes()) {
                this.winLevel();
            }
        }
    }

    private createLandingParticles(x: number, y: number, state: number): void {
        const colors = [0xffffff, 0x00ffff, 0x00ff00];
        const color = colors[state] || 0xffffff;

        for (let i = 0; i < 8; i++) {
            const particle = this.add.star(x, y, 5, 3, 6, color);
            particle.setDepth(1500);
            const angle = (i / 8) * Math.PI * 2;
            const speed = 40 + Math.random() * 20;

            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                angle: 360,
                alpha: 0,
                duration: 500,
                ease: 'Cubic.easeOut',
                onComplete: () => particle.destroy()
            });
        }
    }

    private createCompletionEffect(x: number, y: number): void {
        for (let i = 0; i < GameConfig.UI.PARTICLE_COUNT; i++) {
            const particle = this.add.circle(x, y, GameConfig.UI.PARTICLE_SIZE, GameConfig.COLORS.PARTICLE);
            particle.setDepth(1500);

            const angle = (i / GameConfig.UI.PARTICLE_COUNT) * Math.PI * 2;
            const speed = GameConfig.UI.PARTICLE_SPEED;

            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                duration: 400,
                ease: 'Quad.easeOut',
                onComplete: () => particle.destroy()
            });
        }
    }

    private respawnPlayer(): void {
        const pos = this.isoToScreen(0, 0);
        this.player.setPosition(pos.x, pos.y - this.spriteOffsetY);
        this.player.setAlpha(1);
        this.player.setTexture('astrocat');

        this.playerShadow.setPosition(pos.x, pos.y + GameConfig.SHADOW.OFFSET_Y);
        this.playerShadow.setAlpha(0.3);
        this.playerShadow.setScale(1);

        this.playerRow = 0;
        this.playerCol = 0;
        this.playerBusy = false;
    }

    private winLevel(): void {
        this.playerBusy = true;

        // Calculate score and submit to leaderboard
        this.submitScoreToLeaderboard();

        this.createCelebrationExplosion();

        const perfectText = this.add.text(640, 200, '✨ PERFECT! ✨', {
            fontSize: '72px',
            fontFamily: 'Arial',
            color: '#ffd700',
            fontStyle: 'bold',
            stroke: '#ff6b00',
            strokeThickness: 8
        }).setOrigin(0.5).setDepth(2001).setAlpha(0).setScale(0.5);

        this.tweens.add({
            targets: perfectText,
            alpha: 1,
            scale: 1.2,
            duration: 400,
            ease: 'Back.easeOut'
        });

        this.tweens.add({
            targets: perfectText,
            y: 180,
            duration: 400,
            ease: 'Bounce.easeOut',
            delay: 200
        });

        this.tweens.add({
            targets: perfectText,
            angle: -5,
            duration: 300,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: 600
        });

        const victoryText = this.add.text(640, 320, 'LEVEL COMPLETE!', {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(2000).setAlpha(0);

        this.tweens.add({
            targets: victoryText,
            alpha: 1,
            y: 300,
            duration: 500,
            ease: 'Back.easeOut',
            delay: 400
        });

        this.tweens.add({
            targets: victoryText,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 500,
            yoyo: true,
            repeat: 3,
            delay: 800,
            onComplete: () => {
                // 🔥 Si es nivel personalizado, mostrar victoria final
                if (this.customLevel || this.fromCommunity) {
                    this.showCustomLevelVictory();
                } else {
                    this.nextLevel();
                }
            }
        });

        this.victoryElements.push(perfectText, victoryText);
    }

    /**
     * Submit score to leaderboard
     */
    private async submitScoreToLeaderboard(): Promise<void> {
        // Don't submit scores for custom levels from editor
        if (this.fromEditor || this.customLevel) {
            console.log('Skipping leaderboard submission for custom level');
            return;
        }

        try {
            // Calculate score based on time and performance
            const timeInMs = this.levelElapsedTime;
            const timeBonus = Math.max(0, 60000 - timeInMs); // Bonus for completing under 1 minute
            const baseScore = 1000 * this.level; // More points for higher levels
            const totalScore = baseScore + Math.floor(timeBonus / 100);

            console.log(`Submitting score: Level ${this.level}, Time: ${timeInMs}ms, Score: ${totalScore}`);

            const result = await LeaderboardClient.submitScore(
                `level_${this.level}`,
                totalScore,
                timeInMs,
                true // Level completed
            );

            console.log('Score submitted:', result);

            // Show "New Best!" message if applicable
            if (result.newBest) {
                this.showNewBestMessage(result.rank);
            }
        } catch (error) {
            console.error('Failed to submit score to leaderboard:', error);
            // Don't block gameplay if leaderboard fails
        }
    }

    /**
     * Show "New Best!" message
     */
    private showNewBestMessage(rank: number): void {
        const newBestText = this.add.text(640, 400, `🎉 NEW BEST! Rank #${rank}`, {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#ffff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5).setDepth(2002).setAlpha(0);

        this.tweens.add({
            targets: newBestText,
            alpha: 1,
            y: 380,
            duration: 500,
            ease: 'Back.easeOut',
            delay: 1000,
        });

        this.tweens.add({
            targets: newBestText,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 400,
            yoyo: true,
            repeat: 2,
            delay: 1500,
        });

        this.victoryElements.push(newBestText);
    }

    private createCelebrationExplosion(): void {
        const centerX = 640;
        const centerY = 360;
        const confettiColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xffa500];

        for (let i = 0; i < 80; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 150 + Math.random() * 250;
            const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];

            const confetti = this.add.rectangle(
                centerX,
                centerY,
                8 + Math.random() * 8,
                15 + Math.random() * 15,
                color
            );
            confetti.setDepth(1998);

            const targetX = centerX + Math.cos(angle) * speed;
            const targetY = centerY + Math.sin(angle) * speed;

            this.tweens.add({
                targets: confetti,
                x: targetX,
                y: targetY,
                angle: Math.random() * 720 - 360,
                alpha: 0,
                duration: 1200 + Math.random() * 800,
                ease: 'Cubic.easeOut',
                onComplete: () => confetti.destroy()
            });
        }

        for (let ring = 0; ring < 3; ring++) {
            for (let i = 0; i < 12; i++) {
                this.time.delayedCall(ring * 150, () => {
                    const angle = (i / 12) * Math.PI * 2;
                    const distance = 100 + ring * 80;
                    const x = centerX + Math.cos(angle) * distance;
                    const y = centerY + Math.sin(angle) * distance;

                    const star = this.add.star(x, y, 5, 8, 16, 0xffd700);
                    star.setDepth(1999);

                    this.tweens.add({
                        targets: star,
                        scaleX: 2,
                        scaleY: 2,
                        alpha: 0,
                        angle: 180,
                        duration: 800,
                        ease: 'Quad.easeOut',
                        onComplete: () => star.destroy()
                    });
                });
            }
        }
    }

    /**
     * Show victory screen for custom/community levels
     */
    private showCustomLevelVictory(): void {
        console.log('🎉 [GameScene] Custom level completed!');
        
        // Create semi-transparent overlay
        const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.85);
        overlay.setDepth(3000);

        // Level completed title
        const title = this.add.text(640, 150, '🎉 LEVEL COMPLETED! 🎉', {
            fontSize: '56px',
            fontFamily: 'Arial',
            color: '#00ff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(3001).setAlpha(0);

        this.tweens.add({
            targets: title,
            alpha: 1,
            y: 140,
            duration: 600,
            ease: 'Back.easeOut'
        });

        // Level name if available
        if (this.levelName) {
            const levelNameText = this.add.text(640, 220, `📋 ${this.levelName}`, {
                fontSize: '32px',
                fontFamily: 'Arial',
                color: '#00ffff',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 4
            }).setOrigin(0.5).setDepth(3001).setAlpha(0);

            this.tweens.add({
                targets: levelNameText,
                alpha: 1,
                duration: 500,
                delay: 300
            });
        }

        // Creator if available
        if (this.creator) {
            const creatorText = this.add.text(640, 270, `👤 Created by: ${this.creator}`, {
                fontSize: '24px',
                fontFamily: 'Arial',
                color: '#ffff00',
                fontStyle: 'italic',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5).setDepth(3001).setAlpha(0);

            this.tweens.add({
                targets: creatorText,
                alpha: 1,
                duration: 500,
                delay: 500
            });
        }

        // Completion time
        const timeInSeconds = (this.levelElapsedTime / 1000).toFixed(2);
        const timeText = this.add.text(640, 340, `⏱️ Time: ${timeInSeconds}s`, {
            fontSize: '40px',
            fontFamily: 'Arial',
            color: '#ffd700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5).setDepth(3001).setAlpha(0);

        this.tweens.add({
            targets: timeText,
            alpha: 1,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 600,
            delay: 700,
            ease: 'Bounce.easeOut'
        });

        // Stats
        const stats = this.add.text(640, 420, 
            `✅ All blocks activated!\n💎 Level mastered!`, 
            {
                fontSize: '24px',
                fontFamily: 'Arial',
                color: '#ffffff',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5).setDepth(3001).setAlpha(0);

        this.tweens.add({
            targets: stats,
            alpha: 1,
            duration: 500,
            delay: 1000
        });

        // Buttons: Different layout if coming from editor
        if (this.fromEditor) {
            // SHARE LEVEL button (left)
            const shareBg = this.add.graphics();
            shareBg.fillStyle(0xff00dd, 0.95);
            shareBg.fillRoundedRect(240, 530, 280, 60, 12);
            shareBg.lineStyle(4, 0xffffff, 1);
            shareBg.strokeRoundedRect(240, 530, 280, 60, 12);
            shareBg.setDepth(3001).setAlpha(0);

            const shareButtonText = this.add.text(380, 560, '📤 SHARE LEVEL', {
                fontSize: '26px',
                fontFamily: 'Arial',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(3002).setAlpha(0);

            const shareHitArea = this.add.rectangle(380, 560, 280, 60, 0x000000, 0.01);
            shareHitArea.setDepth(3003).setInteractive({ useHandCursor: true });
            
            shareHitArea.on('pointerdown', () => {
                console.log('📤 Opening share dialog from victory screen...');
                // Import ShareLevelDialog
                import('../ui/ShareLevelDialog').then(({ ShareLevelDialog }) => {
                    const shareDialog = new ShareLevelDialog(this, this.customLevel!);
                    shareDialog.show((success, postUrl) => {
                        if (success && postUrl) {
                            console.log('✅ Level shared from victory screen:', postUrl);
                        }
                    });
                });
            });

            shareHitArea.on('pointerover', () => {
                shareButtonText.setScale(1.1);
                shareBg.clear();
                shareBg.fillStyle(0xff33ee, 0.95);
                shareBg.fillRoundedRect(240, 530, 280, 60, 12);
                shareBg.lineStyle(4, 0xffffff, 1);
                shareBg.strokeRoundedRect(240, 530, 280, 60, 12);
            });

            shareHitArea.on('pointerout', () => {
                shareButtonText.setScale(1.0);
                shareBg.clear();
                shareBg.fillStyle(0xff00dd, 0.95);
                shareBg.fillRoundedRect(240, 530, 280, 60, 12);
                shareBg.lineStyle(4, 0xffffff, 1);
                shareBg.strokeRoundedRect(240, 530, 280, 60, 12);
            });

            this.tweens.add({
                targets: [shareBg, shareButtonText],
                alpha: 1,
                duration: 500,
                delay: 1200
            });

            // RETURN TO EDITOR button (right)
            const editorBg = this.add.graphics();
            editorBg.fillStyle(0x1a1a3a, 0.95);
            editorBg.fillRoundedRect(540, 530, 320, 60, 12);
            editorBg.lineStyle(4, 0x00ff00, 1);
            editorBg.strokeRoundedRect(540, 530, 320, 60, 12);
            editorBg.setDepth(3001).setAlpha(0);

            const editorButtonText = this.add.text(700, 560, '✏️ RETURN TO EDITOR', {
                fontSize: '26px',
                fontFamily: 'Arial',
                color: '#00ff00',
                fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(3002).setAlpha(0);

            const editorHitArea = this.add.rectangle(700, 560, 320, 60, 0x000000, 0.01);
            editorHitArea.setDepth(3003).setInteractive({ useHandCursor: true });
            
            editorHitArea.on('pointerdown', () => {
                console.log('✏️ Returning to editor...');
                this.nextLevel(); // This already handles fromEditor case
            });

            editorHitArea.on('pointerover', () => {
                editorButtonText.setScale(1.1);
                editorBg.clear();
                editorBg.fillStyle(0x2a2a5a, 0.95);
                editorBg.fillRoundedRect(540, 530, 320, 60, 12);
                editorBg.lineStyle(4, 0x00ff00, 1);
                editorBg.strokeRoundedRect(540, 530, 320, 60, 12);
            });

            editorHitArea.on('pointerout', () => {
                editorButtonText.setScale(1.0);
                editorBg.clear();
                editorBg.fillStyle(0x1a1a3a, 0.95);
                editorBg.fillRoundedRect(540, 530, 320, 60, 12);
                editorBg.lineStyle(4, 0x00ff00, 1);
                editorBg.strokeRoundedRect(540, 530, 320, 60, 12);
            });

            this.tweens.add({
                targets: [editorBg, editorButtonText],
                alpha: 1,
                duration: 500,
                delay: 1200
            });

        } else {
            // RETURN TO MENU button (normal behavior)
            const buttonBg = this.add.graphics();
            buttonBg.fillStyle(0x1a1a3a, 0.95);
            buttonBg.fillRoundedRect(490, 530, 300, 60, 12);
            buttonBg.lineStyle(4, 0x00ff00, 1);
            buttonBg.strokeRoundedRect(490, 530, 300, 60, 12);
            buttonBg.setDepth(3001).setAlpha(0);

            const menuButtonText = this.add.text(640, 560, '🏠 RETURN TO MENU', {
                fontSize: '28px',
                fontFamily: 'Arial',
                color: '#00ff00',
                fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(3002).setAlpha(0);

            this.tweens.add({
                targets: [buttonBg, menuButtonText],
                alpha: 1,
                duration: 500,
                delay: 1200
            });

            const buttonHitArea = this.add.rectangle(640, 560, 300, 60, 0x000000, 0.01);
            buttonHitArea.setDepth(3003).setInteractive({ useHandCursor: true });
            
            buttonHitArea.on('pointerdown', () => {
                console.log('🏠 Returning to menu...');
                this.scene.start('MenuScene');
            });

            buttonHitArea.on('pointerover', () => {
                menuButtonText.setScale(1.1);
                buttonBg.clear();
                buttonBg.fillStyle(0x2a2a5a, 0.95);
                buttonBg.fillRoundedRect(490, 530, 300, 60, 12);
                buttonBg.lineStyle(4, 0x00ff00, 1);
                buttonBg.strokeRoundedRect(490, 530, 300, 60, 12);
            });

            buttonHitArea.on('pointerout', () => {
                menuButtonText.setScale(1.0);
                buttonBg.clear();
                buttonBg.fillStyle(0x1a1a3a, 0.95);
                buttonBg.fillRoundedRect(490, 530, 300, 60, 12);
                buttonBg.lineStyle(4, 0x00ff00, 1);
                buttonBg.strokeRoundedRect(490, 530, 300, 60, 12);
            });
        }

        // Celebration particles
        this.createCelebrationExplosion();
    }

    private nextLevel(): void {
        this.cleanupVictoryElements();

        if (this.fromEditor) {
            // 🔥 DEEP COPY para preservar el nivel al volver a EditorScene
            const levelToReturn: LevelData = {
                name: this.customLevel?.name || 'Test',
                description: this.customLevel?.description || 'Prueba',
                rows: this.customLevel?.rows || this.rows,
                blocks: JSON.parse(JSON.stringify(this.customLevel?.blocks || {})), // Deep copy
                enemies: JSON.parse(JSON.stringify(this.customLevel?.enemies || [])), // Deep copy
                difficulty: this.customLevel?.difficulty || 'normal'
            };

            console.log('🔙 [GameScene] Returning to EditorScene with DEEP COPY:');
            console.log('   📦 Blocks:', Object.keys(levelToReturn.blocks).length);
            console.log('   👾 Enemies:', levelToReturn.enemies.length);
            console.log('   📝 Name:', levelToReturn.name);
            console.log('   📊 Rows:', levelToReturn.rows);
            
            this.scene.start('EditorScene', { level: levelToReturn });
            return;
        }

        this.level++;
        this.lives = GameConfig.GAMEPLAY.STARTING_LIVES;

        this.cubes.clear();
        if (this.cubesContainer) {
            this.cubesContainer.destroy();
        }

        this.enemies.forEach(enemy => enemy.sprite.destroy());
        this.enemies = [];

        if (this.level > 3) {
            this.rows = Math.min(this.rows + 1, GameConfig.GAMEPLAY.MAX_ROWS);
        }

        this.generatePyramid();
        this.respawnPlayer();
        this.createEnemies();

        this.levelText.setText(`⭐ Level: ${this.level}`);
        this.livesText.setText(`❤️ Lives: ${this.lives}`);
        this.updateProgressDisplay();

        this.gameOver = false;
    }

    private cleanupVictoryElements(): void {
        this.victoryElements.forEach(element => {
            if (element && element.destroy) {
                element.destroy();
            }
        });
        this.victoryElements = [];
    }

    private hideInstructions(): void {
        if (this.instructionsElements) {
            this.tweens.add({
                targets: [this.instructionsElements.bg, this.instructionsElements.text],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    if (this.instructionsElements) {
                        this.instructionsElements.bg.destroy();
                        this.instructionsElements.text.destroy();
                        this.instructionsElements = null;
                    }
                }
            });
        }
    }

    private showGameOver(): void {
        const gameOverText = this.add.text(640, 300, 'GAME OVER', {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(2000);

        const restartText = this.add.text(640, 380, 'Click to restart', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(2000);

        this.input.once('pointerdown', () => {
            this.scene.restart();
        });
    }

    private createEnemies(): void {
        this.enemies.forEach(enemy => enemy.sprite.destroy());
        this.enemies = [];

        // 🔥 Si es nivel personalizado, SOLO usar enemigos del nivel (no random)
        if (this.customLevel) {
            if (this.levelCustomEnemies && this.levelCustomEnemies.length > 0) {
                console.log('🐛 [DEBUG] Creating', this.levelCustomEnemies.length, 'custom enemies');
                console.log('🐛 [DEBUG] Enemy data before creation:', this.levelCustomEnemies);
                for (let i = 0; i < this.levelCustomEnemies.length; i++) {
                    const enemyData = this.levelCustomEnemies[i];
                    if (enemyData) {
                        console.log(`🐛 [DEBUG] Creating enemy ${i} at row=${enemyData.row}, col=${enemyData.col}`);
                        this.createEnemyAtPosition(enemyData.row, enemyData.col, i);
                    }
                }
            } else {
                console.log('   No enemies in custom level');
            }
        } else {
            // Nivel normal: crear enemigos random basado en nivel
            const numEnemies = Math.min(1 + Math.floor(this.level / 2), GameConfig.ENEMY.MAX_ENEMIES);

            for (let i = 0; i < numEnemies; i++) {
                this.createEnemy(i);
            }
        }
    }

    private createEnemyAtPosition(row: number, col: number, index: number): void {
        console.log(`🐛 [DEBUG] createEnemyAtPosition called: row=${row}, col=${col}, index=${index}`);
        const pos = this.isoToScreen(row, col);
        console.log(`🐛 [DEBUG] Screen position: x=${pos.x}, y=${pos.y}`);

        const enemySprite = this.add.image(pos.x, pos.y - this.spriteOffsetY, 'water_enemy');
        enemySprite.setScale(GameConfig.SCALES.ENEMY);
        enemySprite.setDepth(900);

        const patrolPattern = this.generatePatrolPattern(row, col);
        console.log(`🐛 [DEBUG] Generated patrol pattern:`, patrolPattern);

        const enemy: Enemy = {
            sprite: enemySprite,
            row: row,
            col: col,
            busy: false,
            moveTimer: this.enemyMoveInterval + (index * 300),
            patrolPattern: patrolPattern,
            patrolIndex: 0
        };

        this.enemies.push(enemy);
        console.log(`🐛 [DEBUG] Enemy created. Total enemies:`, this.enemies.length);
    }

    private createEnemy(index: number): void {
        const validPositions: RowCol[] = [];
        for (let r = 1; r < this.rows; r++) {
            for (let c = 0; c <= r; c++) {
                if (!(r === 0 && c === 0)) {
                    validPositions.push({ row: r, col: c });
                }
            }
        }

        if (validPositions.length === 0) return;

        const spawnPos = validPositions[Math.floor(Math.random() * validPositions.length)]!;
        const pos = this.isoToScreen(spawnPos.row, spawnPos.col);

        const enemySprite = this.add.image(pos.x, pos.y - this.spriteOffsetY, 'water_enemy');
        enemySprite.setScale(GameConfig.SCALES.ENEMY);
        enemySprite.setDepth(900);

        const enemy: Enemy = {
            sprite: enemySprite,
            row: spawnPos.row,
            col: spawnPos.col,
            busy: false,
            moveTimer: this.enemyMoveInterval + (index * 300),
            patrolPattern: this.generatePatrolPattern(spawnPos.row, spawnPos.col),
            patrolIndex: 0
        };

        this.enemies.push(enemy);
    }

    private generatePatrolPattern(startRow: number, startCol: number): RowCol[] {
        const pattern: RowCol[] = [{ row: startRow, col: startCol }];
        const directions: RowCol[] = [
            { row: -1, col: 0 },
            { row: 0, col: 1 },
            { row: 0, col: -1 },
            { row: 1, col: 0 }
        ];

        console.log(`🐛 [DEBUG] generatePatrolPattern start=(${startRow},${startCol}), rows=${this.rows}`);

        for (let i = 0; i < 3; i++) {
            const lastPos = pattern[pattern.length - 1]!;
            const shuffledDirs = [...directions].sort(() => Math.random() - 0.5);

            let foundValid = false;
            for (const dir of shuffledDirs) {
                const newRow = lastPos.row + dir.row;
                const newCol = lastPos.col + dir.col;

                console.log(`🐛 [DEBUG]   Trying (${newRow},${newCol}) from (${lastPos.row},${lastPos.col})`);
                
                if (this.isValidPosition(newRow, newCol)) {
                    pattern.push({ row: newRow, col: newCol });
                    console.log(`🐛 [DEBUG]   ✅ Valid! Pattern now has ${pattern.length} positions`);
                    foundValid = true;
                    break;
                } else {
                    console.log(`🐛 [DEBUG]   ❌ Invalid position`);
                }
            }

            if (!foundValid) {
                console.log(`🐛 [DEBUG]   ⚠️ No valid direction found for step ${i}`);
            }
        }

        console.log(`🐛 [DEBUG] Final patrol pattern:`, pattern);
        return pattern;
    }

    private updateEnemies(delta: number): void {
        if (this.enemies.length === 0) return; // No hay enemigos
        
        this.enemies.forEach((enemy, index) => {
            if (enemy.busy) {
                console.log(`🐛 [DEBUG] Enemy ${index} is busy, skipping`);
                return;
            }

            enemy.moveTimer -= delta;
            
            // Log timer ocasionalmente
            if (index === 0 && Math.random() < 0.02) {
                console.log(`🐛 [DEBUG] Enemy 0 moveTimer: ${enemy.moveTimer.toFixed(0)}, interval: ${this.enemyMoveInterval}`);
            }
            
            if (enemy.moveTimer <= 0) {
                enemy.moveTimer = this.enemyMoveInterval;
                console.log(`🐛 [DEBUG] Moving enemy ${index} from (${enemy.row},${enemy.col})`);
                this.moveEnemy(enemy);
            }
        });
    }

    private async moveEnemy(enemy: Enemy): Promise<void> {
        if (enemy.busy || enemy.patrolPattern.length === 0) return;

        enemy.busy = true;

        enemy.patrolIndex = (enemy.patrolIndex + 1) % enemy.patrolPattern.length;
        const targetPos = enemy.patrolPattern[enemy.patrolIndex]!;

        const toPos = this.isoToScreen(targetPos.row, targetPos.col);
        const originalScale = GameConfig.SCALES.ENEMY;

        this.tweens.add({
            targets: enemy.sprite,
            scaleY: originalScale * 0.85,
            scaleX: originalScale * 1.15,
            duration: 60,
            ease: 'Back.easeOut'
        });

        await new Promise<void>(resolve => setTimeout(() => resolve(), 60));

        enemy.sprite.setTexture('water_enemy_move');

        this.tweens.add({
            targets: enemy.sprite,
            scaleY: originalScale * 1.1,
            scaleX: originalScale * 0.9,
            duration: 40,
            ease: 'Quad.easeOut'
        });

        this.tweens.add({
            targets: enemy.sprite,
            x: toPos.x,
            y: toPos.y - this.spriteOffsetY - 15,
            duration: this.enemyMoveDuration * 0.5,
            ease: 'Quad.easeOut',
            onComplete: () => {
                this.tweens.add({
                    targets: enemy.sprite,
                    y: toPos.y - this.spriteOffsetY,
                    scaleY: originalScale * 0.9,
                    scaleX: originalScale * 1.1,
                    duration: this.enemyMoveDuration * 0.3,
                    ease: 'Quad.easeIn',
                    onComplete: () => {
                        this.tweens.add({
                            targets: enemy.sprite,
                            scaleY: originalScale,
                            scaleX: originalScale,
                            duration: 80,
                            ease: 'Back.easeOut'
                        });

                        enemy.sprite.setTexture('water_enemy');
                        enemy.row = targetPos.row;
                        enemy.col = targetPos.col;
                        enemy.busy = false;

                        this.checkEnemyPlayerCollision();
                    }
                });
            }
        });
    }

    private checkEnemyPlayerCollision(): void {
        if (this.playerBusy || this.gameOver) return;

        for (const enemy of this.enemies) {
            if (enemy.row === this.playerRow && enemy.col === this.playerCol) {
                this.playerHitByEnemy();
                return;
            }
        }
    }

    private playerHitByEnemy(): void {
        this.playerBusy = true;
        this.lives--;

        this.tweens.add({
            targets: this.player,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                this.player.setAlpha(1);
                if (this.lives <= 0) {
                    this.gameOver = true;
                    this.showGameOver();
                } else {
                    this.respawnPlayer();
                }
            }
        });

        this.livesText.setText(`❤️ Lives: ${this.lives}`);
    }

    /**
     * 🔥 TRAP MECHANIC: Player steps on a trap cube and loses a life
     */
    private playerHitByTrap(cube: CubeSprite): void {
        console.log('🔴 [GameScene] Player hit TRAP! Losing a life...');
        this.playerBusy = true;
        this.lives--;

        // 🔥 Change lava texture to activated state (if texture exists)
        if (this.textures.exists('lava_on')) {
            cube.setTexture('lava_on');
            // Apply correct scale for lava_on texture
            const scale = this.getCorrectCubeScale('lava_on');
            cube.setScale(scale.scaleX, scale.scaleY);
        } else {
            // Fallback to red tint if texture doesn't exist
            cube.setTint(0xff0000);
        }

        // Red flash effect on the trap cube
        const flash = this.add.circle(cube.x, cube.y, 60, 0xff0000, 0.9);
        flash.setDepth(1499);
        this.tweens.add({
            targets: flash,
            scaleX: 3,
            scaleY: 3,
            alpha: 0,
            duration: 300,
            ease: 'Quad.easeOut',
            onComplete: () => flash.destroy()
        });

        // Shake the trap cube
        this.tweens.add({
            targets: cube,
            y: cube.y - 10,
            duration: 100,
            yoyo: true,
            ease: 'Quad.easeOut'
        });

        // Red particles explosion
        for (let i = 0; i < 12; i++) {
            const particle = this.add.circle(cube.x, cube.y, 4, 0xff0000);
            particle.setDepth(1500);
            const angle = (i / 12) * Math.PI * 2;
            const speed = 60 + Math.random() * 30;

            this.tweens.add({
                targets: particle,
                x: cube.x + Math.cos(angle) * speed,
                y: cube.y + Math.sin(angle) * speed,
                alpha: 0,
                duration: 600,
                ease: 'Cubic.easeOut',
                onComplete: () => particle.destroy()
            });
        }

        // Player damage animation (blink red)
        this.tweens.add({
            targets: this.player,
            tint: 0xff0000,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                this.player.clearTint();
                this.player.setAlpha(1);
                
                if (this.lives <= 0) {
                    this.gameOver = true;
                    this.showGameOver();
                } else {
                    this.respawnPlayer();
                }
            }
        });

        this.livesText.setText(`❤️ Lives: ${this.lives}`);
    }

    /**
     * 🔥 TRAMPOLINE MECHANIC: Show visual effect when activated
     */
    private showTrampolineEffect(cube: CubeSprite): void {
        // Yellow/gold flash effect
        const flash = this.add.circle(cube.x, cube.y, 60, 0xffff00, 0.8);
        flash.setDepth(1499);
        this.tweens.add({
            targets: flash,
            scaleX: 2.5,
            scaleY: 2.5,
            alpha: 0,
            duration: 300,
            ease: 'Quad.easeOut',
            onComplete: () => flash.destroy()
        });

        // Bounce effect on trampoline cube
        this.tweens.add({
            targets: cube,
            scaleX: GameConfig.SCALES.CUBE * 1.3,
            scaleY: GameConfig.SCALES.CUBE * 0.8,
            duration: 100,
            yoyo: true,
            ease: 'Bounce.easeOut',
            onComplete: () => {
                cube.setScale(GameConfig.SCALES.CUBE);
            }
        });

        // Yellow sparkle particles
        for (let i = 0; i < 16; i++) {
            const particle = this.add.star(cube.x, cube.y, 5, 4, 8, 0xffff00);
            particle.setDepth(1500);
            const angle = (i / 16) * Math.PI * 2;
            const speed = 50 + Math.random() * 25;

            this.tweens.add({
                targets: particle,
                x: cube.x + Math.cos(angle) * speed,
                y: cube.y + Math.sin(angle) * speed,
                angle: 360,
                alpha: 0,
                duration: 500,
                ease: 'Cubic.easeOut',
                onComplete: () => particle.destroy()
            });
        }

        // Visual indicator on player (yellow glow)
        const playerGlow = this.add.circle(this.player.x, this.player.y, 40, 0xffff00, 0.4);
        playerGlow.setDepth(this.player.depth - 1);
        this.tweens.add({
            targets: playerGlow,
            alpha: 0,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 800,
            ease: 'Quad.easeOut',
            onComplete: () => playerGlow.destroy()
        });
    }

    private showTutorial(): void {
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.8);
        overlay.fillRect(0, 0, 1280, 720);
        overlay.setDepth(3000);

        const panel = this.add.graphics();
        panel.fillStyle(0x1a1a3a, 0.95);
        panel.fillRoundedRect(240, 120, 800, 480, 20);
        panel.lineStyle(4, 0x00ffff, 1);
        panel.strokeRoundedRect(240, 120, 800, 480, 20);
        panel.setDepth(3001);

        const title = this.add.text(640, 170, '🐱 WELCOME TO ASTROCAT! 🚀', {
            fontSize: '36px',
            fontFamily: 'Arial',
            color: '#00ffff',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5).setDepth(3002);

        const instructions = this.add.text(640, 260,
            'HOW TO PLAY:\n\n' +
            '🎯 Goal: Step on all cubes to change their color!\n' +
            '   White → Cyan → Green ✓\n\n' +
            '⌨️ Controls:\n' +
            '   • Desktop: WASD or Arrow Keys\n' +
            '   • Mobile: Swipe in diagonal directions\n\n' +
            '⚠️ Avoid enemies and don\'t fall off the edge!\n' +
            '❤️ You have 3 lives - use them wisely!',
            {
                fontSize: '18px',
                fontFamily: 'Arial',
                color: '#ffffff',
                align: 'center',
                lineSpacing: 8
            }
        ).setOrigin(0.5).setDepth(3002);

        this.createDirectionArrows(640, 460, 3003);

        const startButton = this.add.graphics();
        startButton.fillStyle(0x00ff00, 1);
        startButton.fillRoundedRect(490, 520, 300, 60, 12);
        startButton.lineStyle(3, 0xffffff, 1);
        startButton.strokeRoundedRect(490, 520, 300, 60, 12);
        startButton.setDepth(3002);

        const startText = this.add.text(640, 550, '🎮 START PLAYING!', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(3003);

        const hitArea = this.add.rectangle(640, 550, 300, 60, 0x000000, 0.01);
        hitArea.setDepth(3004);
        hitArea.setInteractive({ useHandCursor: true });

        hitArea.on('pointerover', () => {
            startButton.clear();
            startButton.fillStyle(0x00cc00, 1);
            startButton.fillRoundedRect(490, 520, 300, 60, 12);
            startButton.lineStyle(3, 0xffffff, 1);
            startButton.strokeRoundedRect(490, 520, 300, 60, 12);
            startText.setScale(1.05);
        });

        hitArea.on('pointerout', () => {
            startButton.clear();
            startButton.fillStyle(0x00ff00, 1);
            startButton.fillRoundedRect(490, 520, 300, 60, 12);
            startButton.lineStyle(3, 0xffffff, 1);
            startButton.strokeRoundedRect(490, 520, 300, 60, 12);
            startText.setScale(1.0);
        });

        hitArea.on('pointerdown', () => {
            localStorage.setItem('astrocat_tutorial_shown', 'true');
            this.tutorialShown = true;

            this.tweens.add({
                targets: [overlay, panel, title, instructions, startButton, startText, hitArea],
                alpha: 0,
                duration: 300,
                onComplete: () => {
                    overlay.destroy();
                    panel.destroy();
                    title.destroy();
                    instructions.destroy();
                    startButton.destroy();
                    startText.destroy();
                    hitArea.destroy();

                    const startCube = this.cubes.get('0_0');
                    if (startCube) {
                        this.tweens.add({
                            targets: startCube,
                            scaleX: GameConfig.SCALES.CUBE * 1.3,
                            scaleY: GameConfig.SCALES.CUBE * 1.3,
                            duration: 400,
                            yoyo: true,
                            repeat: 2,
                            ease: 'Sine.easeInOut'
                        });
                    }
                }
            });
        });

        this.tutorialOverlay = { overlay, panel, title, instructions, startButton, startText, hitArea };
    }

    private createDirectionArrows(centerX: number, centerY: number, depth: number): void {
        const arrowDist = 80;
        const arrowColor = 0xffff00;

        const directions = [
            { x: 0, y: -arrowDist, angle: -90, label: 'W/↑' },
            { x: arrowDist, y: 0, angle: 0, label: 'D/→' },
            { x: 0, y: arrowDist, angle: 90, label: 'S/↓' },
            { x: -arrowDist, y: 0, angle: 180, label: 'A/←' }
        ];

        directions.forEach(dir => {
            const arrow = this.add.triangle(
                centerX + dir.x,
                centerY + dir.y,
                0, -10,
                -8, 10,
                8, 10,
                arrowColor
            );
            arrow.setAngle(dir.angle);
            arrow.setDepth(depth);

            this.tweens.add({
                targets: arrow,
                scaleX: 1.3,
                scaleY: 1.3,
                duration: 600,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            const label = this.add.text(
                centerX + dir.x,
                centerY + dir.y + 25,
                dir.label,
                {
                    fontSize: '14px',
                    fontFamily: 'Arial',
                    color: '#ffff00',
                    fontStyle: 'bold'
                }
            ).setOrigin(0.5).setDepth(depth);
        });
    }
}
