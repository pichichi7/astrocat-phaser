/**
 * BrowseLevelsScene
 * Browse and play community-shared levels
 */
import Phaser from 'phaser';
import { LevelSharingClient } from '../services/LevelSharingClient';
import { LevelFormat, type LevelData } from '../LevelFormat';

interface LevelListItem {
  id: string;
  name: string;
  creator: string;
  difficulty: string;
  playCount: number;
  rating: number;
  createdAt: number;
  postUrl: string;
}

export class BrowseLevelsScene extends Phaser.Scene {
  private levels: LevelListItem[] = [];
  private selectedIndex: number = 0;
  private levelElements: Phaser.GameObjects.Container[] = [];
  private scrollOffset: number = 0;
  private isLoading: boolean = false;

  constructor() {
    super({ key: 'BrowseLevelsScene' });
  }

  preload(): void {
    this.load.image('space', '/assets/space.png');
    
    // Error handling
    this.load.on('loaderror', (file: any) => {
      console.error('❌ [BrowseLevelsScene] Failed to load:', file.key, file.src);
    });
  }

  create(): void {
    // Background
    this.add.tileSprite(640, 360, 1280, 720, 'space');

    // Title
    this.add.text(640, 40, '🌐 Community Levels', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#00ffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Loading message
    const loadingText = this.add.text(640, 360, '⏳ Loading levels...', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Load levels from server
    this.loadLevels().then(() => {
      loadingText.destroy();
      this.displayLevels();
    });

    // Back button
    this.createBackButton();

    // Refresh button
    this.createRefreshButton();

    // Auto-refresh every 10 seconds
    this.time.addEvent({
      delay: 10000,
      callback: () => this.refreshLevels(),
      loop: true,
    });
  }

  private async loadLevels(): Promise<void> {
    if (this.isLoading) return;
    
    this.isLoading = true;

    try {
      const response = await fetch('/api/levels/all?limit=50');
      const data = await response.json();

      if (data.success && data.levels) {
        this.levels = data.levels;
        console.log(`Loaded ${this.levels.length} community levels`);
      } else {
        console.error('Failed to load levels:', data.error);
        this.levels = [];
      }
    } catch (error) {
      console.error('Error loading levels:', error);
      this.levels = [];
    } finally {
      this.isLoading = false;
    }
  }

  private async refreshLevels(): Promise<void> {
    await this.loadLevels();
    this.clearLevelDisplay();
    this.displayLevels();
  }

  private clearLevelDisplay(): void {
    for (const element of this.levelElements) {
      element.destroy();
    }
    this.levelElements = [];
  }

  private displayLevels(): void {
    if (this.levels.length === 0) {
      this.add.text(640, 360, 'No levels shared yet!\n\nCreate and share a level in the editor.', {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#888888',
        align: 'center',
        lineSpacing: 8,
      }).setOrigin(0.5);
      return;
    }

    const startY = 120;
    const itemHeight = 120;
    const visibleItems = Math.min(5, this.levels.length);

    for (let i = 0; i < visibleItems; i++) {
      const level = this.levels[i];
      if (!level) continue;

      const y = startY + i * itemHeight;
      const container = this.createLevelItem(level, 640, y, i);
      this.levelElements.push(container);
    }

    // Show total count
    this.add.text(640, 680, `${this.levels.length} level${this.levels.length !== 1 ? 's' : ''} available`, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#888888',
    }).setOrigin(0.5);
  }

  private createLevelItem(level: LevelListItem, x: number, y: number, index: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // Background
    const bg = this.add.rectangle(0, 0, 800, 100, 0x16213e, 1);
    bg.setStrokeStyle(2, 0x00ffff, 0.5);
    container.add(bg);

    // Level name
    const nameText = this.add.text(-380, -30, level.name, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#00ffff',
      fontStyle: 'bold',
    });
    container.add(nameText);

    // Creator
    const creatorText = this.add.text(-380, 0, `by ${level.creator}`, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#888888',
    });
    container.add(creatorText);

    // Difficulty
    const diffColor = level.difficulty === 'easy' ? '#4ade80' :
                      level.difficulty === 'hard' ? '#ef4444' : '#fbbf24';
    const diffText = this.add.text(-380, 25, `Difficulty: ${level.difficulty}`, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: diffColor,
    });
    container.add(diffText);

    // Stats
    const statsText = this.add.text(200, 0, `▶️ ${level.playCount} plays`, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#666666',
    });
    container.add(statsText);

    // Play button
    const playButton = this.add.rectangle(350, 0, 100, 40, 0x00aa00, 1);
    const playText = this.add.text(350, 0, 'PLAY', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    playButton.setInteractive({ useHandCursor: true });
    playButton.on('pointerover', () => {
      playButton.setFillStyle(0x00ff00);
      playText.setScale(1.1);
    });
    playButton.on('pointerout', () => {
      playButton.setFillStyle(0x00aa00);
      playText.setScale(1.0);
    });
    playButton.on('pointerdown', () => this.playLevel(level.id));

    container.add(playButton);
    container.add(playText);

    return container;
  }

  private async playLevel(levelId: string): Promise<void> {
    console.log('Loading level:', levelId);

    try {
      const response = await LevelSharingClient.getSharedLevel(levelId);

      if (response.success && response.level) {
        const levelData = LevelFormat.deserializeLevel(response.level.levelData);

        if (levelData) {
          console.log('Starting level:', levelData.name);
          this.scene.start('GameScene', { 
            customLevel: levelData,
            fromCommunity: true,
            levelId: levelId,
          });
        } else {
          this.showError('Failed to parse level data');
        }
      } else {
        this.showError(response.error || 'Failed to load level');
      }
    } catch (error) {
      console.error('Error loading level:', error);
      this.showError('Network error loading level');
    }
  }

  private showError(message: string): void {
    const errorBg = this.add.graphics();
    errorBg.fillStyle(0x110011, 0.95);
    errorBg.fillRoundedRect(340, 300, 600, 120, 15);
    errorBg.lineStyle(4, 0xff0000, 1);
    errorBg.strokeRoundedRect(340, 300, 600, 120, 15);
    errorBg.setDepth(2000);

    const errorText = this.add.text(640, 360, `❌ ${message}`, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ff6666',
      align: 'center',
    }).setOrigin(0.5).setDepth(2001);

    this.time.delayedCall(3000, () => {
      errorBg.destroy();
      errorText.destroy();
    });
  }

  private createBackButton(): void {
    const button = this.add.rectangle(100, 680, 160, 50, 0xaa0000, 1);
    const text = this.add.text(100, 680, '← BACK', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    button.setInteractive({ useHandCursor: true });
    button.on('pointerover', () => {
      button.setFillStyle(0xff0000);
      text.setScale(1.1);
    });
    button.on('pointerout', () => {
      button.setFillStyle(0xaa0000);
      text.setScale(1.0);
    });
    button.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }

  private createRefreshButton(): void {
    const button = this.add.rectangle(1180, 680, 160, 50, 0x0088ff, 1);
    const text = this.add.text(1180, 680, '🔄 REFRESH', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    button.setInteractive({ useHandCursor: true });
    button.on('pointerover', () => {
      button.setFillStyle(0x00aaff);
      text.setScale(1.1);
    });
    button.on('pointerout', () => {
      button.setFillStyle(0x0088ff);
      text.setScale(1.0);
    });
    button.on('pointerdown', () => {
      text.setText('⏳ Loading...');
      this.refreshLevels().then(() => {
        text.setText('🔄 REFRESH');
      });
    });
  }
}
