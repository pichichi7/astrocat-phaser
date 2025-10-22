import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { EditorScene } from './scenes/EditorScene.js';
import { LevelSelectScene } from './scenes/LevelSelectScene.js';

const config = {
    type: Phaser.AUTO,
    title: 'AstroCat - Isometric Puzzle Game',
    description: 'Q*bert style isometric puzzle game with AstroCat',
    parent: 'game-container',
    width: 1280,
    height: 720,
    backgroundColor: '#040218',
    pixelArt: true,
    scene: [
        MenuScene,
        GameScene,
        EditorScene,
        LevelSelectScene
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
}

new Phaser.Game(config);