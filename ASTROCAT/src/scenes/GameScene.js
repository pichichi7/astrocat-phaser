import { GameConfig, GameUtils } from '../config.js';

export class GameScene extends Phaser.Scene {    
    constructor() {
        super({ key: 'GameScene' });
        
        // Load configuration
        this.config = GameConfig;
        this.utils = GameUtils;
        
        // Game configuration from config file
        this.rows = this.config.GAMEPLAY.STARTING_ROWS;
        this.tileW = this.config.TILE_WIDTH;
        this.tileH = this.config.TILE_HEIGHT;
        this.origin = { x: this.config.ORIGIN_X, y: this.config.ORIGIN_Y };
        this.jumpDuration = this.config.JUMP_DURATION;
        this.jumpOffset = this.config.JUMP_OFFSET_Y;
        this.spriteOffsetY = this.config.SPRITE_OFFSET_Y;
          // Game state
        this.cubes = new Map();
        this.player = null;
        this.playerRow = 0;
        this.playerCol = 0;
        this.playerBusy = false;
        this.lives = this.config.GAMEPLAY.STARTING_LIVES;
        this.gameOver = false;
        this.level = 1;
        
        // UI elements
        this.livesText = null;
        this.levelText = null;
        this.progressText = null;
          // Touch controls
        this.touchStartPos = null;
        this.swipeMinDistance = 50;
          // Enemy system
        this.enemies = [];
        this.enemyMoveInterval = this.config.ENEMY.MOVE_INTERVAL;
        this.enemyMoveDuration = this.config.ENEMY.MOVE_DURATION;
        
        // Custom level support
        this.customLevel = null;
        this.fromEditor = false;
        this.levelCustomBlocks = {};
        this.levelCustomEnemies = [];
    }

    init(data) {
        // Handle custom levels from editor or level select
        if (data?.customLevel) {
            console.log('🎮 [GameScene] init() - Recibiendo nivel personalizado:', data.customLevel);
            this.customLevel = data.customLevel;
            this.fromEditor = data.fromEditor || false;
            console.log('   Desde Editor:', this.fromEditor);
        } else {
            console.log('🎮 [GameScene] init() - Sin datos personalizados');
        }
    }

    preload() {
        // Load game assets
        this.load.image('space', 'assets/space.png');
        this.load.image('astrocat', 'assets/astrocat.png');
        this.load.image('astrocat_jump', 'assets/astrocat_jump.png');
        this.load.image('cube', 'assets/cube_top.png');
        this.load.image('water_enemy', 'assets/water_enemy.png');
        this.load.image('water_enemy_move', 'assets/water_enemy_move.png');
        this.load.image('hud_bg', 'assets/hud_bg.png');
    }

    create() {
        // Usar nivel personalizado si existe, sino usar configuración por defecto
        if (this.customLevel) {
            console.log('🎮 [GameScene] create() - Usando nivel personalizado');
            this.rows = this.customLevel.rows;
            this.levelCustomBlocks = this.customLevel.blocks;
            this.levelCustomEnemies = this.customLevel.enemies || [];
            console.log('   Filas:', this.rows);
            console.log('   Bloques personalizados:', Object.keys(this.levelCustomBlocks).length);
            console.log('   Enemigos:', this.levelCustomEnemies.length);
        } else {
            console.log('🎮 [GameScene] create() - Usando nivel por defecto');
        }

        // Background - imagen de fondo fija sin corte
        const bg = this.add.image(640, 360, 'space');
        bg.setDepth(-1);
        bg.displayWidth = 1280;
        bg.displayHeight = 720;

        // Initialize input
        this.setupInput();
        
        // Generate pyramid
        this.generatePyramid();
        
        // Create player
        this.createPlayer();
          // Setup UI
        this.setupUI();
        
        // Setup touch controls
        this.setupTouchControls();
        
        // Create enemies
        this.createEnemies();
    }

    setupInput() {
        // Create cursor keys
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // WASD keys
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
    }

    setupTouchControls() {
        // Enable touch input
        this.input.on('pointerdown', (pointer) => {
            this.touchStartPos = { x: pointer.x, y: pointer.y };
        });

        this.input.on('pointerup', (pointer) => {
            if (this.touchStartPos && !this.playerBusy) {
                const dx = pointer.x - this.touchStartPos.x;
                const dy = pointer.y - this.touchStartPos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > this.swipeMinDistance) {
                    // Determine swipe direction
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

    getSwipeDirection(angle) {
        // Convert angle to degrees
        const degrees = (angle * 180 / Math.PI + 360) % 360;
        
        // Map swipe angles to isometric directions
        if (degrees >= 315 || degrees < 45) {
            return { row: 0, col: 1 }; // Right (up-right in iso)
        } else if (degrees >= 45 && degrees < 135) {
            return { row: 1, col: 0 }; // Down (down-right in iso)
        } else if (degrees >= 135 && degrees < 225) {
            return { row: 0, col: -1 }; // Left (down-left in iso)
        } else if (degrees >= 225 && degrees < 315) {
            return { row: -1, col: 0 }; // Up (up-left in iso)
        }
        return null;
    }

    generatePyramid() {
        this.cubes.clear();
        
        // Create cubes container
        this.cubesContainer = this.add.container(0, 0);
        
        let cubesCreated = 0;
        let cubesSkipped = 0;
        
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c <= r; c++) {
                const key = `${r}_${c}`;
                
                // Si hay bloques personalizados, ignorar este cubo si no está en el nivel
                if (this.levelCustomBlocks && Object.keys(this.levelCustomBlocks).length > 0) {
                    // IMPORTANTE: el tipo 0 (NORMAL) es válido pero es falsy en JS.
                    // Debemos verificar la existencia de la clave, no la veracidad del valor.
                    const hasKey = Object.prototype.hasOwnProperty.call(this.levelCustomBlocks, key);
                    if (!hasKey) {
                        // Este cubo no está en el nivel personalizado, no crear
                        cubesSkipped++;
                        continue;
                    }
                }
                
                const pos = this.isoToScreen(r, c);
                
                // Create cube sprite
                const cube = this.add.image(pos.x, pos.y, 'cube');
                cube.setDepth(10 + r + c * 0.1);
                
                // Set proper scale for cube
                cube.setScale(this.config.SCALES.CUBE);
                
                // Cube state: 0 = white, 1 = cyan, 2 = green (completed)
                cube.state = 0;
                cube.row = r;
                cube.col = c;
                
                this.updateCubeColor(cube);
                this.cubes.set(key, cube);
                this.cubesContainer.add(cube);
                cubesCreated++;
            }
        }
        
        console.log(`🎮 [GameScene] Pirámide generada: ${cubesCreated} cubos creados, ${cubesSkipped} saltados`);
    }

    updateCubeColor(cube) {
        switch (cube.state) {
            case 0:
                cube.setTint(this.config.COLORS.CUBE_WHITE);
                break;
            case 1:
                cube.setTint(this.config.COLORS.CUBE_CYAN);
                break;
            case 2:
                cube.setTint(this.config.COLORS.CUBE_GREEN);
                break;
        }
    }

    createPlayer() {
        const pos = this.isoToScreen(0, 0);
        
        // Create shadow (simple ellipse that will scale during jumps)
        this.playerShadow = this.add.ellipse(
            pos.x, 
            pos.y + this.config.SHADOW.OFFSET_Y, 
            this.config.SHADOW.WIDTH, 
            this.config.SHADOW.HEIGHT, 
            this.config.COLORS.SHADOW, 
            0.3
        );
        this.playerShadow.setDepth(5);
        
        this.player = this.add.image(pos.x, pos.y - this.spriteOffsetY, 'astrocat');
        this.player.setDepth(1000); // Always on top
        this.player.setScale(this.config.SCALES.PLAYER);
        
        this.playerRow = 0;
        this.playerCol = 0;
        this.playerBusy = false;
        
        // Step on initial cube
        this.stepOnCube(0, 0);
    }

    setupUI() {
        // HUD Background
        const hudBg = this.add.image(120, 70, 'hud_bg');
        hudBg.setScale(this.config.SCALES.HUD_BG);
        hudBg.setDepth(100);
        
        // Lives display
        this.livesText = this.add.text(30, 30, `Lives: ${this.lives}`, {
            fontSize: this.config.UI.FONT_SIZE_LARGE,
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setDepth(this.config.UI.HUD_DEPTH);
        
        // Level display
        this.levelText = this.add.text(30, 55, `Level: ${this.level}`, {
            fontSize: this.config.UI.FONT_SIZE_LARGE,
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setDepth(this.config.UI.HUD_DEPTH);

        // Progress display
        this.updateProgressDisplay();

        // Back to menu button
        const menuButton = this.add.rectangle(1200, 40, 120, 30, 0x333333, 0.9);
        menuButton.setStrokeStyle(2, 0xffffff);
        const menuText = this.add.text(1200, 40, 'MENU', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

        menuButton.setInteractive();
        menuButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });

        // Instructions
        this.add.text(640, 680, 'Use WASD or Arrow Keys to move | Touch/Swipe on mobile', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#cccccc',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);
    }

    updateProgressDisplay() {
        const totalCubes = this.getTotalCubes();
        const completedCubes = this.getCompletedCubes();
        
        if (this.progressText) {
            this.progressText.destroy();
        }
        
        this.progressText = this.add.text(30, 80, `Progress: ${completedCubes}/${totalCubes}`, {
            fontSize: this.config.UI.FONT_SIZE_LARGE,
            fontFamily: 'Arial',
            color: '#00ffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setDepth(this.config.UI.HUD_DEPTH);
    }

    getTotalCubes() {
        return this.cubes.size;
    }

    getCompletedCubes() {
        let completed = 0;
        this.cubes.forEach(cube => {
            if (cube.state === 2) completed++;
        });
        return completed;
    }

    isoToScreen(row, col) {
        return this.utils.isoToScreen(row, col, this.config);
    }

    isValidPosition(row, col) {
        // Cuando jugamos un nivel personalizado del editor, solo son válidas
        // las posiciones que tengan un cubo definido en ese nivel.
        if (this.levelCustomBlocks && Object.keys(this.levelCustomBlocks).length > 0) {
            const key = `${row}_${col}`;
            return Object.prototype.hasOwnProperty.call(this.levelCustomBlocks, key);
        }
        return this.utils.isValidPosition(row, col, this.rows);
    }

    update(time, delta) {
        if (this.gameOver) return;

        // Update enemies
        this.updateEnemies(delta);

        if (this.playerBusy) return;

        // Handle keyboard input
        const direction = this.readInput();
        if (direction) {
            this.tryMove(direction);
        }
    }

    readInput() {
        // Map keyboard input to isometric directions
        if (Phaser.Input.Keyboard.JustDown(this.wasd.W) || Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            return { row: -1, col: 0 }; // Up-left
        }
        if (Phaser.Input.Keyboard.JustDown(this.wasd.D) || Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
            return { row: 0, col: 1 }; // Up-right
        }
        if (Phaser.Input.Keyboard.JustDown(this.wasd.A) || Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
            return { row: 0, col: -1 }; // Down-left
        }
        if (Phaser.Input.Keyboard.JustDown(this.wasd.S) || Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
            return { row: 1, col: 0 }; // Down-right
        }
        return null;
    }

    tryMove(direction) {
        const newRow = this.playerRow + direction.row;
        const newCol = this.playerCol + direction.col;

        if (this.isValidPosition(newRow, newCol)) {
            this.movePlayer(newRow, newCol);
        } else {
            this.playerFall();
        }
    }

    async movePlayer(toRow, toCol) {
        // REPLICANDO LA LÓGICA DE Player.gd _try_move() CON 4 FASES
        this.playerBusy = true;
        
        const toPos = this.isoToScreen(toRow, toCol);
        
        // FASE 1: Anticipación (squash antes del salto) - 40ms
        await new Promise(resolve => {
            this.tweens.add({
                targets: this.player,
                scaleY: this.config.SCALES.PLAYER * 0.85,
                scaleX: this.config.SCALES.PLAYER * 1.15,
                duration: 40,
                ease: 'Back.easeOut',
                onComplete: resolve
            });
        });
        
        // Cambiar a sprite de salto con fade suave - 30ms fade out, texture, 30ms fade in
        const fadeOut = this.tweens.add({
            targets: this.player,
            alpha: 0.8,
            duration: 30
        });
        await new Promise(resolve => fadeOut.on('complete', resolve));
        
        this.player.setTexture('astrocat_jump');
        
        const fadeIn = this.tweens.add({
            targets: this.player,
            alpha: 1.0,
            duration: 30
        });
        await new Promise(resolve => fadeIn.on('complete', resolve));
        
        // FASE 2: Salto principal (subida) - 90ms
        await new Promise(resolve => {
            this.tweens.add({
                targets: this.player,
                x: toPos.x,
                y: toPos.y - this.spriteOffsetY - this.jumpOffset * 2.2,
                duration: this.jumpDuration * 0.5,
                ease: 'Quad.easeOut',
                onComplete: resolve
            });
        });
        
        // FASE 3: Caída - 90ms
        await new Promise(resolve => {
            this.tweens.add({
                targets: this.player,
                y: toPos.y - this.spriteOffsetY,
                duration: this.jumpDuration * 0.5,
                ease: 'Quad.easeIn',
                onComplete: resolve
            });
        });
        
        // FASE 4: Aterrizaje con squash - 50ms
        await new Promise(resolve => {
            this.tweens.add({
                targets: this.player,
                scaleY: this.config.SCALES.PLAYER * 0.9,
                scaleX: this.config.SCALES.PLAYER * 1.1,
                duration: 50,
                ease: 'Bounce.easeOut',
                onComplete: resolve
            });
        });
        
        // Restaurar escala - 60ms
        await new Promise(resolve => {
            this.tweens.add({
                targets: this.player,
                scaleX: this.config.SCALES.PLAYER,
                scaleY: this.config.SCALES.PLAYER,
                duration: 60,
                ease: 'Back.easeOut',
                onComplete: resolve
            });
        });
        
        // Volver a sprite idle con fade suave - 30ms fade out, texture, 30ms fade in
        const fadeOutJump = this.tweens.add({
            targets: this.player,
            alpha: 0.8,
            duration: 30
        });
        await new Promise(resolve => fadeOutJump.on('complete', resolve));
        
        this.player.setTexture('astrocat');
        
        const fadeInIdle = this.tweens.add({
            targets: this.player,
            alpha: 1.0,
            duration: 30
        });
        await new Promise(resolve => fadeInIdle.on('complete', resolve));
        
        // Actualizar posición lógica
        this.playerRow = toRow;
        this.playerCol = toCol;
        
        // Marcar el cubo como pisado
        this.stepOnCube(toRow, toCol);
        
        this.playerBusy = false;
        
        // Verificar colisión con enemigos
        this.checkEnemyPlayerCollision();
    }

    stepOnCube(row, col) {
        const cube = this.cubes.get(`${row}_${col}`);
        if (cube) {
            const oldState = cube.state;
            cube.state = Math.min(cube.state + 1, 2);
            this.updateCubeColor(cube);
            
            // Add visual feedback for stepping on cube
            if (oldState !== cube.state) {
                // Scale effect
                this.tweens.add({
                    targets: cube,
                    scaleX: cube.scaleX * 1.1,
                    scaleY: cube.scaleY * 1.1,
                    duration: 100,
                    yoyo: true
                });

                // Particle effect for completed cube
                if (cube.state === 2) {
                    this.createCompletionEffect(cube.x, cube.y);
                }
            }
            
            this.updateProgressDisplay();
            
            // Check win condition
            if (this.getCompletedCubes() === this.getTotalCubes()) {
                this.winLevel();
            }
        }
    }    createCompletionEffect(x, y) {
        // Create simple particle effect using colored circles
        for (let i = 0; i < this.config.UI.PARTICLE_COUNT; i++) {
            const particle = this.add.circle(x, y, this.config.UI.PARTICLE_SIZE, this.config.COLORS.PARTICLE);
            particle.setDepth(1500);
            
            const angle = (i / this.config.UI.PARTICLE_COUNT) * Math.PI * 2;
            const speed = this.config.UI.PARTICLE_SPEED;
            
            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                duration: 400,
                ease: 'Quad.easeOut',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }

    playerFall() {
        this.playerBusy = true;
        this.lives--;
        
        // Fall animation
        this.tweens.add({
            targets: this.player,
            y: this.player.y + 200,
            alpha: 0,
            duration: 800,
            ease: 'Quad.easeIn',
            onComplete: () => {
                if (this.lives <= 0) {
                    this.gameOver = true;
                    this.showGameOver();
                } else {
                    this.respawnPlayer();
                }
            }
        });
        
        this.livesText.setText(`Lives: ${this.lives}`);
    }    respawnPlayer() {
        // Reset player to start position
        const pos = this.isoToScreen(0, 0);
        this.player.setPosition(pos.x, pos.y - this.spriteOffsetY);
        this.player.setAlpha(1);
        this.player.setTexture('astrocat');        // Reset shadow
        this.playerShadow.setPosition(pos.x, pos.y + this.config.SHADOW.OFFSET_Y);
        this.playerShadow.setAlpha(0.3);
        this.playerShadow.setScale(1);
        
        this.playerRow = 0;
        this.playerCol = 0;
        this.playerBusy = false;
    }

    winLevel() {
        this.playerBusy = true;
        
        // Victory text
        const victoryText = this.add.text(640, 300, 'LEVEL COMPLETE!', {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(2000);

        // Flash animation
        this.tweens.add({
            targets: victoryText,
            alpha: 0.3,
            duration: 500,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                this.nextLevel();
            }
        });
    }

    nextLevel() {
        // Si venía del editor, volver al editor después de completar
        if (this.fromEditor) {
            // Asegurar que se devuelven todos los datos necesarios
            const levelToReturn = {
                name: this.customLevel?.name || 'Test',
                description: this.customLevel?.description || 'Prueba',
                rows: this.customLevel?.rows || this.rows,
                blocks: this.customLevel?.blocks || {},
                enemies: this.customLevel?.enemies || [],
                difficulty: this.customLevel?.difficulty || 'normal'
            };
            
            console.log('🎮 [GameScene] Volviendo a Editor con:', levelToReturn);
            console.log('   Bloques:', Object.keys(levelToReturn.blocks).length);
            console.log('   Enemigos:', levelToReturn.enemies.length);
            
            this.scene.start('EditorScene', { level: levelToReturn });
            return;
        }

        this.level++;
        this.lives = this.config.GAMEPLAY.STARTING_LIVES; // Reset lives for new level
        
        // Clear current level
        this.cubes.clear();
        if (this.cubesContainer) {
            this.cubesContainer.destroy();
        }
        
        // Clear enemies
        this.enemies.forEach(enemy => enemy.sprite.destroy());
        this.enemies = [];
          // Increase difficulty slightly
        if (this.level > 3) {
            this.rows = Math.min(this.rows + 1, this.config.GAMEPLAY.MAX_ROWS);
        }
        
        // Regenerate pyramid
        this.generatePyramid();
        
        // Reset player
        this.respawnPlayer();
        
        // Create new enemies
        this.createEnemies();
        
        // Update UI
        this.levelText.setText(`Level: ${this.level}`);
        this.livesText.setText(`Lives: ${this.lives}`);
        this.updateProgressDisplay();
        
        this.gameOver = false;
    }

    showGameOver() {
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
        }).setOrigin(0.5).setDepth(2000);        // Make screen clickable to restart
        this.input.once('pointerdown', () => {
            this.scene.restart();
        });
    }

    createEnemies() {
        // Clear existing enemies
        this.enemies.forEach(enemy => enemy.sprite.destroy());
        this.enemies = [];

        // Si hay nivel personalizado con enemigos, usarlos
        if (this.levelCustomEnemies && this.levelCustomEnemies.length > 0) {
            for (let i = 0; i < this.levelCustomEnemies.length; i++) {
                const enemyData = this.levelCustomEnemies[i];
                this.createEnemyAtPosition(enemyData.row, enemyData.col, i);
            }
        } else {
            // Crear enemigos automáticamente basado en el nivel
            const numEnemies = Math.min(1 + Math.floor(this.level / 2), this.config.ENEMY.MAX_ENEMIES);
            
            for (let i = 0; i < numEnemies; i++) {
                this.createEnemy(i);
            }
        }
    }

    createEnemyAtPosition(row, col, index) {
        // Crear enemigo en posición específica (para niveles del editor)
        const pos = this.isoToScreen(row, col);
        
        const enemySprite = this.add.image(pos.x, pos.y - this.spriteOffsetY, 'water_enemy');
        enemySprite.setScale(this.config.SCALES.ENEMY);
        enemySprite.setDepth(900);
        
        const enemy = {
            sprite: enemySprite,
            row: row,
            col: col,
            busy: false,
            moveTimer: this.enemyMoveInterval + (index * 300),
            patrolPattern: this.generatePatrolPattern(row, col),
            patrolIndex: 0
        };
        
        this.enemies.push(enemy);
    }

    createEnemy(index) {
        // Find valid positions for enemy spawn (not at player start)
        const validPositions = [];
        for (let r = 1; r < this.rows; r++) {
            for (let c = 0; c <= r; c++) {
                if (!(r === 0 && c === 0)) { // Not player start position
                    validPositions.push({row: r, col: c});
                }
            }
        }
        
        if (validPositions.length === 0) return;
        
        // Pick random position
        const spawnPos = validPositions[Math.floor(Math.random() * validPositions.length)];
        const pos = this.isoToScreen(spawnPos.row, spawnPos.col);
          // Create enemy sprite
        const enemySprite = this.add.image(pos.x, pos.y - this.spriteOffsetY, 'water_enemy');
        enemySprite.setScale(this.config.SCALES.ENEMY);
        enemySprite.setDepth(900); // Below player but above cubes
        
        // Create enemy object
        const enemy = {
            sprite: enemySprite,
            row: spawnPos.row,
            col: spawnPos.col,
            busy: false,
            moveTimer: this.enemyMoveInterval + (index * 300), // Stagger movement
            patrolPattern: this.generatePatrolPattern(spawnPos.row, spawnPos.col),
            patrolIndex: 0
        };
        
        this.enemies.push(enemy);
    }

    generatePatrolPattern(startRow, startCol) {
        // Generate a simple patrol pattern around the starting position
        const pattern = [{row: startRow, col: startCol}];
        const directions = [
            {row: -1, col: 0}, // up-left
            {row: 0, col: 1},  // up-right
            {row: 0, col: -1}, // down-left
            {row: 1, col: 0}   // down-right
        ];
        
        // Add 2-3 more valid positions
        for (let i = 0; i < 3; i++) {
            const lastPos = pattern[pattern.length - 1];
            const shuffledDirs = [...directions].sort(() => Math.random() - 0.5);
            
            for (const dir of shuffledDirs) {
                const newRow = lastPos.row + dir.row;
                const newCol = lastPos.col + dir.col;
                
                if (this.isValidPosition(newRow, newCol)) {
                    pattern.push({row: newRow, col: newCol});
                    break;
                }
            }
        }
        
        return pattern;
    }

    updateEnemies(delta) {
        this.enemies.forEach(enemy => {
            if (enemy.busy) return;
            
            enemy.moveTimer -= delta;
            if (enemy.moveTimer <= 0) {
                enemy.moveTimer = this.enemyMoveInterval;
                this.moveEnemy(enemy);
            }
        });
    }

    moveEnemy(enemy) {
        if (enemy.busy || enemy.patrolPattern.length === 0) return;
        
        enemy.busy = true;
        
        // Move to next position in patrol pattern
        enemy.patrolIndex = (enemy.patrolIndex + 1) % enemy.patrolPattern.length;
        const targetPos = enemy.patrolPattern[enemy.patrolIndex];
        
        const fromPos = this.isoToScreen(enemy.row, enemy.col);
        const toPos = this.isoToScreen(targetPos.row, targetPos.col);
        
        // Change to move texture
        enemy.sprite.setTexture('water_enemy_move');
        
        // Move animation
        this.tweens.add({
            targets: enemy.sprite,
            x: toPos.x,
            y: toPos.y - this.spriteOffsetY,
            duration: this.enemyMoveDuration,
            ease: 'Quad.easeInOut',
            onComplete: () => {
                enemy.sprite.setTexture('water_enemy');
                enemy.row = targetPos.row;
                enemy.col = targetPos.col;
                enemy.busy = false;
                
                // Check collision with player
                this.checkEnemyPlayerCollision();
            }
        });
    }

    checkEnemyPlayerCollision() {
        if (this.playerBusy || this.gameOver) return;
        
        for (let enemy of this.enemies) {
            if (enemy.row === this.playerRow && enemy.col === this.playerCol) {
                this.playerHitByEnemy();
                return;
            }
        }
    }

    playerHitByEnemy() {
        this.playerBusy = true;
        this.lives--;
        
        // Flash effect for player
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
        
        this.livesText.setText(`Lives: ${this.lives}`);
    }
}
