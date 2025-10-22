import { GameConfig } from '../config.js';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        // Load background and UI assets
        this.load.image('space', 'assets/space.png');
        this.load.image('astrocat', 'assets/astrocat.png');
        this.load.image('cube', 'assets/cube_top.png');
        
        // Create simple colored rectangles for buttons if we don't have button assets
        this.load.image('button', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    }

    create() {
        // Background
        this.add.tileSprite(640, 360, 1280, 720, 'space');

        // Title
        const titleText = this.add.text(640, 150, '🐱 ASTROCAT', {
            fontSize: '72px',
            fontFamily: 'Arial',
            color: '#00ffff',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#000000',
                blur: 0,
                stroke: false,
                fill: true
            }
        }).setOrigin(0.5);

        // Subtitle
        const subtitleText = this.add.text(640, 220, 'Isometric Puzzle Adventure', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);        // Cat sprite in the middle
        const catSprite = this.add.image(640, 350, 'astrocat').setScale(GameConfig.SCALES.MENU_CAT);
        
        // Floating animation for the cat
        this.tweens.add({
            targets: catSprite,
            y: 330,
            duration: 1500,
            ease: 'Sine.inOut',
            yoyo: true,
            repeat: -1
        });

        // Game instructions
        const instructionsText = this.add.text(640, 480, 
            'GOAL: Step on all cubes to change their color!\n\n' +
            'CONTROLS:\n' +
            'W/↑ - Move Up-Left     D/→ - Move Up-Right\n' +
            'A/← - Move Down-Left   S/↓ - Move Down-Right\n\n' +
            'Mobile: Swipe in diagonal directions', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#cccccc',
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5);

        // Start button
        const startButton = this.add.rectangle(250, 620, 180, 50, 0x00ff00, 0.8);
        const startText = this.add.text(250, 620, 'JUGAR', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        startButton.setInteractive();
        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        startButton.on('pointerover', () => {
            startButton.setFillStyle(0x00cc00);
            startText.setScale(1.1);
        });

        startButton.on('pointerout', () => {
            startButton.setFillStyle(0x00ff00);
            startText.setScale(1.0);
        });

        // Custom Levels button
        const levelsButton = this.add.rectangle(640, 620, 180, 50, 0x0088ff, 0.8);
        const levelsText = this.add.text(640, 620, 'MIS NIVELES', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        levelsButton.setInteractive();
        levelsButton.on('pointerdown', () => {
            this.scene.start('LevelSelectScene');
        });

        levelsButton.on('pointerover', () => {
            levelsButton.setFillStyle(0x00aaff);
            levelsText.setScale(1.1);
        });

        levelsButton.on('pointerout', () => {
            levelsButton.setFillStyle(0x0088ff);
            levelsText.setScale(1.0);
        });

        // Editor button
        const editorButton = this.add.rectangle(1030, 620, 180, 50, 0xff8800, 0.8);
        const editorText = this.add.text(1030, 620, 'EDITOR', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        editorButton.setInteractive();
        editorButton.on('pointerdown', () => {
            this.scene.start('EditorScene');
        });

        editorButton.on('pointerover', () => {
            editorButton.setFillStyle(0xffaa00);
            editorText.setScale(1.1);
        });

        editorButton.on('pointerout', () => {
            editorButton.setFillStyle(0xff8800);
            editorText.setScale(1.0);
        });        // Some floating cubes in background for decoration
        for (let i = 0; i < 8; i++) {
            const x = Phaser.Math.Between(100, 1180);
            const y = Phaser.Math.Between(100, 620);
            const cube = this.add.image(x, y, 'cube').setAlpha(0.3).setScale(GameConfig.SCALES.MENU_CUBES);
            
            this.tweens.add({
                targets: cube,
                y: y - 20,
                duration: Phaser.Math.Between(2000, 4000),
                ease: 'Sine.inOut',
                yoyo: true,
                repeat: -1,
                delay: Phaser.Math.Between(0, 2000)
            });
        }
    }
}
