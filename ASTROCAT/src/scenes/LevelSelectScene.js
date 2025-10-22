/**
 * LevelSelectScene.js
 * Permite seleccionar y cargar niveles personalizados guardados
 */

import { LevelStorage } from '../LevelStorage.js';

export class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelSelectScene' });
    }

    preload() {
        this.load.image('space', 'assets/space.png');
    }

    create() {
        // Background
        const bg = this.add.image(640, 360, 'space');
        bg.setDepth(-1);
        bg.displayWidth = 1280;
        bg.displayHeight = 720;

        // Título
        this.add.text(640, 40, 'SELECCIONAR NIVEL', {
            fontSize: '32px',
            fill: '#00ffff',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5).setDepth(10);

        // Obtener niveles
        const stats = LevelStorage.getStatistics();

        if (stats.totalLevels === 0) {
            this.add.text(640, 360, 'No hay niveles guardados\n\nCrea uno en el EDITOR', {
                fontSize: '24px',
                fill: '#ffffff',
                align: 'center'
            }).setOrigin(0.5).setDepth(10);

            this.createButton(640, 500, 'VOLVER', () => this.scene.start('MenuScene'));
            return;
        }

        // Mostrar lista de niveles
        let yPos = 100;
        const itemHeight = 60;
        const itemsPerPage = 9;
        let currentPage = 0;

        const displayLevels = () => {
            // Limpiar items anteriores
            this.children.list.forEach(child => {
                if (child.levelItem) child.destroy();
            });

            const startIdx = currentPage * itemsPerPage;
            const endIdx = Math.min(startIdx + itemsPerPage, stats.totalLevels);

            yPos = 100;
            for (let i = startIdx; i < endIdx; i++) {
                const level = stats.levels[i];
                this.createLevelItem(level, yPos);
                yPos += itemHeight;
            }

            // Botones de paginación
            if (stats.totalLevels > itemsPerPage) {
                if (currentPage > 0) {
                    this.createButton(300, 650, '◄ ANTERIOR', () => {
                        currentPage--;
                        displayLevels();
                    });
                }
                if (endIdx < stats.totalLevels) {
                    this.createButton(980, 650, 'SIGUIENTE ►', () => {
                        currentPage++;
                        displayLevels();
                    });
                }
            }

            const pageText = this.add.text(640, 650, `Página ${currentPage + 1}/${Math.ceil(stats.totalLevels / itemsPerPage)}`, {
                fontSize: '14px',
                fill: '#888888',
                align: 'center'
            }).setOrigin(0.5).setDepth(10);
            pageText.levelItem = true;
        };

        displayLevels();

        // Botón volver
        this.createButton(640, 700, 'VOLVER AL MENÚ', () => this.scene.start('MenuScene'));
    }

    createLevelItem(level, yPos) {
        // Background del item
        const itemBg = this.add.rectangle(640, yPos, 800, 50, 0x1a1a3a, 0.8);
        itemBg.setDepth(10);
        itemBg.setInteractive();
        itemBg.levelItem = true;

        itemBg.on('pointerover', () => itemBg.setFillStyle(0x2a2a5a, 0.9));
        itemBg.on('pointerout', () => itemBg.setFillStyle(0x1a1a3a, 0.8));

        itemBg.on('pointerdown', () => {
            this.loadLevel(level.name);
        });

        // Texto del nivel
        const titleText = this.add.text(100, yPos - 10, level.name, {
            fontSize: '16px',
            fill: '#00ffff',
            fontStyle: 'bold'
        }).setDepth(11);
        titleText.levelItem = true;

        // Info
        const infoText = this.add.text(100, yPos + 10, 
            `Filas: ${level.rows} | Bloques: ${level.blocks} | Dificultad: ${level.difficulty}`,
            {
                fontSize: '12px',
                fill: '#aaaaaa'
            }).setDepth(11);
        infoText.levelItem = true;

        // Botones de acción
        const playBtn = this.add.rectangle(1050, yPos, 80, 35, 0x00aa00, 1);
        playBtn.setDepth(11);
        playBtn.setInteractive();
        playBtn.levelItem = true;
        playBtn.on('pointerdown', (pointer) => {
            pointer.event.stopPropagation();
            this.loadLevel(level.name);
        });
        playBtn.on('pointerover', () => playBtn.setFillStyle(0x00cc00));
        playBtn.on('pointerout', () => playBtn.setFillStyle(0x00aa00));

        const playText = this.add.text(1050, yPos, 'JUGAR', {
            fontSize: '12px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setDepth(12);
        playText.levelItem = true;

        const deleteBtn = this.add.rectangle(1150, yPos, 80, 35, 0xaa0000, 1);
        deleteBtn.setDepth(11);
        deleteBtn.setInteractive();
        deleteBtn.levelItem = true;
        deleteBtn.on('pointerdown', (pointer) => {
            pointer.event.stopPropagation();
            this.deleteLevel(level.name);
        });
        deleteBtn.on('pointerover', () => deleteBtn.setFillStyle(0xcc0000));
        deleteBtn.on('pointerout', () => deleteBtn.setFillStyle(0xaa0000));

        const deleteText = this.add.text(1150, yPos, 'BORRAR', {
            fontSize: '12px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setDepth(12);
        deleteText.levelItem = true;
    }

    createButton(x, y, label, callback) {
        const btn = this.add.rectangle(x, y, 150, 40, 0x0088ff, 1);
        btn.setDepth(10);
        btn.setInteractive();
        btn.on('pointerdown', callback);
        btn.on('pointerover', () => btn.setFillStyle(0x00aaff));
        btn.on('pointerout', () => btn.setFillStyle(0x0088ff));

        const text = this.add.text(x, y, label, {
            fontSize: '14px',
            fill: '#ffffff',
            align: 'center'
        });
        text.setOrigin(0.5);
        text.setDepth(11);
    }

    loadLevel(levelName) {
        const level = LevelStorage.loadLevel(levelName);
        if (level) {
            this.scene.start('GameScene', { customLevel: level });
        } else {
            alert('Error al cargar el nivel');
        }
    }

    deleteLevel(levelName) {
        if (confirm(`¿Eliminar "${levelName}"?`)) {
            LevelStorage.deleteLevel(levelName);
            alert('Nivel eliminado');
            this.scene.restart();
        }
    }
}
