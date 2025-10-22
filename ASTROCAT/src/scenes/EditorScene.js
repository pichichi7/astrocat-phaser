/**
 * EditorScene.js - Editor de Niveles Mejorado
 * Con soporte para enemigos y preview del nivel
 */

import { GameConfig, GameUtils } from '../config.js';
import { LevelFormat, BLOCK_TYPES, BLOCK_LABELS, BLOCK_COLORS } from '../LevelFormat.js';
import { LevelStorage } from '../LevelStorage.js';

export class EditorScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EditorScene' });
    }

    init(data) {
        this.editingLevel = data?.level || null;
        this.currentRows = data?.level?.rows || 7;
        this.selectedBlockType = BLOCK_TYPES.NORMAL;
        this.editMode = 'blocks'; // 'blocks' o 'enemies'
        
        if (this.editingLevel) {
            console.log('📝 [EditorScene] init() - Recibiendo nivel editado:', this.editingLevel);
            console.log('   Bloques:', Object.keys(this.editingLevel.blocks || {}).length);
            console.log('   Enemigos:', (this.editingLevel.enemies || []).length);
        }
    }

    preload() {
        this.load.image('space', 'assets/space.png');
        this.load.image('cube', 'assets/cube_top.png');
        this.load.image('hud_bg', 'assets/hud_bg.png');
        this.load.image('water_enemy', 'assets/water_enemy.png');
    }

    create() {
        // Background
        const bg = this.add.image(640, 360, 'space');
        bg.setDepth(-1);
        bg.displayWidth = 1280;
        bg.displayHeight = 720;

        // Datos del nivel
        // Si editingLevel tiene bloques, usarlos. Sino, usar bloque inicial
        if (this.editingLevel?.blocks && Object.keys(this.editingLevel.blocks).length > 0) {
            this.blocks = this.editingLevel.blocks;
            this.enemies = this.editingLevel.enemies || [];
            console.log('📝 [EditorScene] Cargando bloques guardados:', Object.keys(this.blocks).length);
        } else {
            this.blocks = { '0_0': BLOCK_TYPES.NORMAL };
            this.enemies = [];
            console.log('📝 [EditorScene] Iniciando con bloque base (no hay datos guardados)');
        }
        
        this.blockSprites = {};
        this.enemySprites = {};
        this.levelName = this.editingLevel?.name || '';

        // Crear interfaz
        this.createEditorUI();
        this.drawPyramid();

        // Input
        this.input.keyboard.on('keydown', this.handleKeypress, this);
    }

    createEditorUI() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Título
        this.add.text(10, 10, 'EDITOR DE NIVELES', {
            fontSize: '18px',
            fill: '#00ffff',
            fontStyle: 'bold'
        }).setDepth(100);

        // Nombre del nivel
        this.add.text(10, 35, `Nivel: ${this.levelName || 'Nuevo'}`, {
            fontSize: '14px',
            fill: '#ffffff'
        }).setDepth(100);

        // Panel derecho
        const panelBg = this.add.rectangle(1180, 360, 200, 720, 0x000000, 0.7);
        panelBg.setDepth(99);

        this.add.text(1080, 10, 'BLOQUES | ENEMIGOS', {
            fontSize: '12px',
            fill: '#00ffff',
            fontStyle: 'bold'
        }).setDepth(100);

        // Botones de modo
        const blocksModeBtn = this.add.rectangle(1120, 35, 60, 25, 0x0088ff, 1);
        blocksModeBtn.setDepth(100);
        blocksModeBtn.setInteractive();
        blocksModeBtn.on('pointerdown', () => {
            this.editMode = 'blocks';
            this.updateModeDisplay();
        });
        this.add.text(1120, 35, 'Bloques', { fontSize: '10px', fill: '#fff' }).setOrigin(0.5).setDepth(101);

        const enemiesModeBtn = this.add.rectangle(1240, 35, 60, 25, 0x888888, 0.5);
        enemiesModeBtn.setDepth(100);
        enemiesModeBtn.setInteractive();
        enemiesModeBtn.on('pointerdown', () => {
            this.editMode = 'enemies';
            this.updateModeDisplay();
        });
        this.add.text(1240, 35, 'Enemigos', { fontSize: '10px', fill: '#fff' }).setOrigin(0.5).setDepth(101);

        this.modeButtons = { blocks: blocksModeBtn, enemies: enemiesModeBtn };

        // Panel de contenido dinámico
        this.rightPanel = this.add.container(1180, 75);
        this.rightPanel.setDepth(100);

        this.updateModeDisplay();

        // Panel inferior - Controles
        this.add.rectangle(640, height - 50, 1280, 100, 0x000000, 0.7).setDepth(99);

        this.add.text(20, height - 95,
            'BLOQUES: Click L=Poner | Click R=Quitar | ENEMIGOS: Click=Poner/Quitar\n' +
            'TECLADO: +/-=Filas | S=Guardar | T=Test | C=Limpiar | M=Menú',
            { fontSize: '12px', fill: '#00ff00' }
        ).setDepth(100);

        // Botones inferiores
        this.createButton(700, height - 40, 'TEST (T)', () => this.testLevel());
        this.createButton(820, height - 40, 'GUARDAR (S)', () => this.saveLevelDialog());
        this.createButton(940, height - 40, 'MENÚ (M)', () => this.goToMenu());
        this.createButton(1060, height - 40, 'LIMPIAR', () => this.clearLevel());

        // Info de tamaño y enemigos
        this.sizeText = this.add.text(width - 210, height - 95,
            `Filas: ${this.currentRows} | Enemigos: ${this.enemies.length}/5`,
            { fontSize: '14px', fill: '#ffffff' }
        ).setDepth(100);
    }

    updateModeDisplay() {
        // Actualizar botones
        this.modeButtons.blocks.setFillStyle(
            this.editMode === 'blocks' ? 0x0088ff : 0x444444,
            this.editMode === 'blocks' ? 1 : 0.5
        );
        this.modeButtons.enemies.setFillStyle(
            this.editMode === 'enemies' ? 0xff8800 : 0x444444,
            this.editMode === 'enemies' ? 1 : 0.5
        );

        // Limpiar panel derecho
        this.rightPanel.removeAll();

        if (this.editMode === 'blocks') {
            this.createBlocksPanel();
        } else {
            this.createEnemiesPanel();
        }
    }

    createBlocksPanel() {
        let yPos = 0;
        for (const [typeId, label] of Object.entries(BLOCK_LABELS)) {
            const typeNum = parseInt(typeId);
            const color = BLOCK_COLORS[typeNum];
            const isSelected = typeNum === this.selectedBlockType;

            const btn = this.add.rectangle(0, yPos + 15, 150, 28, color, isSelected ? 1 : 0.5);
            btn.setInteractive();
            btn.on('pointerdown', () => {
                this.selectedBlockType = typeNum;
                this.updateModeDisplay();
            });

            const btnText = this.add.text(0, yPos + 15, label, {
                fontSize: '12px',
                fill: '#000000',
                align: 'center'
            }).setOrigin(0.5);

            this.rightPanel.add([btn, btnText]);
            yPos += 35;
        }
    }

    createEnemiesPanel() {
        const infoText = this.add.text(0, 0, `Enemigos: ${this.enemies.length}/5`, {
            fontSize: '14px',
            fill: '#00ffff',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);

        const helpText = this.add.text(0, 40, 'Click en cubo\npara poner/quitar\nenemigo', {
            fontSize: '11px',
            fill: '#aaaaaa',
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
                fill: '#ffffff'
            }).setOrigin(0.5);

            this.rightPanel.add([clearBtn, clearText]);
        }
    }

    createButton(x, y, label, callback) {
        const btn = this.add.rectangle(x, y, 100, 30, 0x0088ff, 1);
        btn.setDepth(100);
        btn.setInteractive();
        btn.on('pointerdown', callback);
        btn.on('pointerover', () => btn.setFillStyle(0x00aaff));
        btn.on('pointerout', () => btn.setFillStyle(0x0088ff));

        const text = this.add.text(x, y, label, {
            fontSize: '12px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setDepth(101);

        return btn;
    }

    drawPyramid() {
        // Limpiar
        for (const sprite of Object.values(this.blockSprites)) {
            sprite.destroy();
        }
        this.blockSprites = {};

        // Dibujar cubos
        for (let row = 0; row < this.currentRows; row++) {
            for (let col = 0; col <= row; col++) {
                const key = `${row}_${col}`;
                const screenPos = GameUtils.isoToScreen(row, col);

                const cube = this.add.sprite(screenPos.x, screenPos.y, 'cube');
                cube.setScale(GameConfig.SCALES.CUBE);
                cube.setDepth(10 + row);
                cube.setInteractive();

                const blockType = this.blocks[key] || BLOCK_TYPES.NORMAL;
                cube.setTint(BLOCK_COLORS[blockType]);

                cube.row = row;
                cube.col = col;
                this.blockSprites[key] = cube;

                cube.on('pointerdown', (pointer) => {
                    if (this.editMode === 'blocks') {
                        if (pointer.button === 0) {
                            this.toggleBlock(key);
                        } else if (pointer.button === 2) {
                            this.removeBlock(key);
                        }
                    } else if (this.editMode === 'enemies') {
                        this.toggleEnemyAtCube(row, col);
                    }
                });

                cube.on('pointerover', () => cube.setScale(GameConfig.SCALES.CUBE * 1.1));
                cube.on('pointerout', () => cube.setScale(GameConfig.SCALES.CUBE));
            }
        }

        // Dibujar enemigos
        this.drawEnemies();

        // Deshabilitar click derecho
        this.input.mouse.disableContextMenu();
    }

    drawEnemies() {
        for (const sprite of Object.values(this.enemySprites)) {
            sprite.destroy();
        }
        this.enemySprites = {};

        for (let i = 0; i < this.enemies.length; i++) {
            const enemy = this.enemies[i];
            const screenPos = GameUtils.isoToScreen(enemy.row, enemy.col);

            const sprite = this.add.sprite(screenPos.x, screenPos.y - 10, 'water_enemy');
            sprite.setScale(GameConfig.SCALES.ENEMY);
            sprite.setDepth(15 + enemy.row);
            sprite.setTint(0xff6600); // Naranja para indicar editable
            sprite.setInteractive();

            sprite.on('pointerdown', () => {
                this.removeEnemyAt(i);
            });

            this.enemySprites[i] = sprite;
        }
    }

    toggleBlock(key) {
        if (!this.blockSprites[key]) return;

        if (this.blocks[key] === this.selectedBlockType) {
            delete this.blocks[key];
            this.blockSprites[key].setTint(BLOCK_COLORS[BLOCK_TYPES.NORMAL]);
        } else {
            this.blocks[key] = this.selectedBlockType;
            this.blockSprites[key].setTint(BLOCK_COLORS[this.selectedBlockType]);
        }
    }

    removeBlock(key) {
        delete this.blocks[key];
        this.blockSprites[key].setTint(BLOCK_COLORS[BLOCK_TYPES.NORMAL]);
    }

    toggleEnemyAtCube(row, col) {
        const exists = this.enemies.findIndex(e => e.row === row && e.col === col);

        if (exists >= 0) {
            this.removeEnemyAt(exists);
        } else if (this.enemies.length < 5) {
            this.enemies.push({ row, col, type: 0 });
            this.drawEnemies();
            this.updateSizeText();
            this.updateModeDisplay();
        } else {
            alert('Máximo 5 enemigos');
        }
    }

    removeEnemyAt(index) {
        this.enemies.splice(index, 1);
        this.drawEnemies();
        this.updateSizeText();
        this.updateModeDisplay();
    }

    updateSizeText() {
        this.sizeText.setText(`Filas: ${this.currentRows} | Enemigos: ${this.enemies.length}/5`);
    }

    handleKeypress(event) {
        const key = event.key.toUpperCase();

        if (key === 'S') this.saveLevelDialog();
        else if (key === 'M') this.goToMenu();
        else if (key === 'T') this.testLevel();
        else if (key === 'C') this.clearLevel();
        else if (key === '+' || key === '=') this.changeRows(1);
        else if (key === '-') this.changeRows(-1);
    }

    changeRows(delta) {
        const newRows = Math.max(3, Math.min(10, this.currentRows + delta));
        if (newRows !== this.currentRows) {
            this.currentRows = newRows;
            this.updateSizeText();
            this.drawPyramid();
        }
    }

    clearLevel() {
        if (confirm('¿Limpiar todos los bloques y enemigos?')) {
            this.blocks = { '0_0': BLOCK_TYPES.NORMAL };
            this.enemies = [];
            this.drawPyramid();
            this.updateSizeText();
        }
    }

    testLevel() {
        const validation = LevelFormat.validateLevel({
            name: 'Test',
            rows: this.currentRows,
            blocks: this.blocks,
            difficulty: 'normal'
        });

        if (!validation.valid) {
            alert('Errores:\n' + validation.errors.join('\n'));
            return;
        }

        const tempLevel = {
            name: this.levelName || 'Test',
            description: 'Prueba',
            rows: this.currentRows,
            blocks: this.blocks,
            enemies: this.enemies,
            difficulty: 'normal'
        };

        console.log('📝 [EditorScene] Enviando nivel a GameScene:', tempLevel);
        console.log('   Bloques:', Object.keys(tempLevel.blocks).length, 'bloques');
        console.log('   Enemigos:', tempLevel.enemies.length, 'enemigos');
        
        this.scene.start('GameScene', { customLevel: tempLevel, fromEditor: true });
    }

    saveLevelDialog() {
        const validation = LevelFormat.validateLevel({
            name: this.levelName,
            rows: this.currentRows,
            blocks: this.blocks,
            difficulty: 'normal'
        });

        if (!validation.valid) {
            alert('Errores:\n' + validation.errors.join('\n'));
            return;
        }

        const name = prompt('Nombre del nivel:', this.levelName || 'Mi Nivel');
        if (!name) return;

        const description = prompt('Descripción (opcional):', '');

        const levelData = {
            name,
            description,
            rows: this.currentRows,
            blocks: this.blocks,
            enemies: this.enemies,
            difficulty: 'normal'
        };

        if (LevelStorage.saveLevel(levelData)) {
            alert(`Nivel "${name}" guardado!`);
            this.levelName = name;
        } else {
            alert('Error al guardar');
        }
    }

    goToMenu() {
        if (confirm('¿Volver sin guardar?')) {
            this.scene.start('MenuScene');
        }
    }
}
