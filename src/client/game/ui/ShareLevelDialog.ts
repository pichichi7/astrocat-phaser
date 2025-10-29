/**
 * ShareLevelDialog
 * UI component for sharing levels to Reddit
 */
import Phaser from 'phaser';
import { LevelSharingClient } from '../services/LevelSharingClient';
import { LevelFormat } from '../LevelFormat';
import type { LevelData } from '../LevelFormat';
import type { ShareLevelRequest } from '../../../shared/types/level-sharing';

export class ShareLevelDialog {
  private scene: Phaser.Scene;
  private container?: Phaser.GameObjects.Container | undefined;
  private levelData: LevelData;
  private onComplete?: ((success: boolean, postUrl?: string) => void) | undefined;

  constructor(scene: Phaser.Scene, levelData: LevelData) {
    this.scene = scene;
    this.levelData = levelData;
  }

  /**
   * Show the share dialog
   */
  show(onComplete?: (success: boolean, postUrl?: string) => void): void {
    this.onComplete = onComplete;

    // Create container
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(3000);

    // Semi-transparent background overlay
    const overlay = this.scene.add.rectangle(640, 360, 1280, 720, 0x000000, 0.8);
    overlay.setInteractive();
    this.container.add(overlay);

    // Dialog background
    const dialogBg = this.scene.add.graphics();
    dialogBg.fillStyle(0x001133, 1);
    dialogBg.fillRoundedRect(240, 150, 800, 420, 15);
    dialogBg.lineStyle(4, 0x00ffff, 1);
    dialogBg.strokeRoundedRect(240, 150, 800, 420, 15);
    this.container.add(dialogBg);

    // Title
    const title = this.scene.add.text(640, 180, '📤 Share Level to Reddit', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#00ffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(title);

    // Level info
    const infoText = this.scene.add.text(640, 240, 
      `Level: ${this.levelData.name}\n` +
      `Blocks: ${Object.keys(this.levelData.blocks).length}\n` +
      `Difficulty: ${this.levelData.difficulty || 'normal'}`,
      {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 8,
      }
    ).setOrigin(0.5);
    this.container.add(infoText);

    // Subreddit input label
    const subredditLabel = this.scene.add.text(280, 340, 'Subreddit:', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffaa00',
      fontStyle: 'bold',
    });
    this.container.add(subredditLabel);

    // Description label
    const descLabel = this.scene.add.text(280, 390, 'Description (optional):', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffaa00',
      fontStyle: 'bold',
    });
    this.container.add(descLabel);

    // Info text about sharing
    const infoNote = this.scene.add.text(640, 450,
      '🌐 Your level will be posted to Reddit where others can play it!',
      {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#888888',
        align: 'center',
      }
    ).setOrigin(0.5);
    this.container.add(infoNote);

    // Share button
    const shareButton = this.scene.add.rectangle(520, 510, 160, 45, 0x00aa00, 1);
    const shareText = this.scene.add.text(520, 510, '✅ Share', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    shareButton.setInteractive({ useHandCursor: true });
    shareButton.on('pointerover', () => {
      shareButton.setFillStyle(0x00ff00);
      shareText.setScale(1.1);
    });
    shareButton.on('pointerout', () => {
      shareButton.setFillStyle(0x00aa00);
      shareText.setScale(1.0);
    });
    shareButton.on('pointerdown', () => this.shareLevel());

    this.container.add(shareButton);
    this.container.add(shareText);

    // Cancel button
    const cancelButton = this.scene.add.rectangle(760, 510, 160, 45, 0xaa0000, 1);
    const cancelText = this.scene.add.text(760, 510, '❌ Cancel', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    
    cancelButton.setInteractive({ useHandCursor: true });
    cancelButton.on('pointerover', () => {
      cancelButton.setFillStyle(0xff0000);
      cancelText.setScale(1.1);
    });
    cancelButton.on('pointerout', () => {
      cancelButton.setFillStyle(0xaa0000);
      cancelText.setScale(1.0);
    });
    cancelButton.on('pointerdown', () => this.close());

    this.container.add(cancelButton);
    this.container.add(cancelText);
  }

  /**
   * Share the level to Reddit
   */
  private async shareLevel(): Promise<void> {
    // Show loading state
    this.showLoading();

    try {
      // Serialize level data
      const levelJson = LevelFormat.serializeLevel(this.levelData);

      // Get subreddit from user (use default for now)
      const subreddit = 'test'; // TODO: Get from input field

      // Prepare share request
      const request: ShareLevelRequest = {
        levelName: this.levelData.name,
        description: this.levelData.description || undefined,
        difficulty: this.levelData.difficulty || 'normal',
        levelData: levelJson,
        subreddit,
      };

      // Share to Reddit
      const response = await LevelSharingClient.shareLevel(request);

      if (response.success) {
        this.showSuccess(response.postUrl || 'Level shared successfully!');
        
        // Call completion callback
        if (this.onComplete) {
          this.onComplete(true, response.postUrl);
        }
      } else {
        this.showError(response.error || 'Failed to share level');
        
        if (this.onComplete) {
          this.onComplete(false);
        }
      }
    } catch (error) {
      console.error('Error sharing level:', error);
      this.showError('An unexpected error occurred');
      
      if (this.onComplete) {
        this.onComplete(false);
      }
    }
  }

  /**
   * Show loading state
   */
  private showLoading(): void {
    if (!this.container) return;

    // Clear container and show loading
    this.container.removeAll(true);

    const overlay = this.scene.add.rectangle(640, 360, 1280, 720, 0x000000, 0.8);
    this.container.add(overlay);

    const dialogBg = this.scene.add.graphics();
    dialogBg.fillStyle(0x001133, 1);
    dialogBg.fillRoundedRect(340, 280, 600, 160, 15);
    dialogBg.lineStyle(4, 0x00ffff, 1);
    dialogBg.strokeRoundedRect(340, 280, 600, 160, 15);
    this.container.add(dialogBg);

    const loadingText = this.scene.add.text(640, 360, '📤 Sharing to Reddit...', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#00ffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(loadingText);

    // Animate loading text
    this.scene.tweens.add({
      targets: loadingText,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
  }

  /**
   * Show success message
   */
  private showSuccess(message: string): void {
    if (!this.container) return;

    this.container.removeAll(true);

    const overlay = this.scene.add.rectangle(640, 360, 1280, 720, 0x000000, 0.8);
    this.container.add(overlay);

    const dialogBg = this.scene.add.graphics();
    dialogBg.fillStyle(0x001133, 1);
    dialogBg.fillRoundedRect(290, 250, 700, 220, 15);
    dialogBg.lineStyle(4, 0x00ff00, 1);
    dialogBg.strokeRoundedRect(290, 250, 700, 220, 15);
    this.container.add(dialogBg);

    const successText = this.scene.add.text(640, 310, '✅ Level Shared!', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#00ff00',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(successText);

    const urlText = this.scene.add.text(640, 360, message, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 650 },
    }).setOrigin(0.5);
    this.container.add(urlText);

    // OK button
    const okButton = this.scene.add.rectangle(640, 420, 140, 40, 0x00aa00, 1);
    const okText = this.scene.add.text(640, 420, 'OK', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    okButton.setInteractive({ useHandCursor: true });
    okButton.on('pointerover', () => {
      okButton.setFillStyle(0x00ff00);
      okText.setScale(1.1);
    });
    okButton.on('pointerout', () => {
      okButton.setFillStyle(0x00aa00);
      okText.setScale(1.0);
    });
    okButton.on('pointerdown', () => this.close());

    this.container.add(okButton);
    this.container.add(okText);

    // Auto-close after 3 seconds
    this.scene.time.delayedCall(3000, () => this.close());
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    if (!this.container) return;

    this.container.removeAll(true);

    const overlay = this.scene.add.rectangle(640, 360, 1280, 720, 0x000000, 0.8);
    this.container.add(overlay);

    const dialogBg = this.scene.add.graphics();
    dialogBg.fillStyle(0x110011, 1);
    dialogBg.fillRoundedRect(290, 250, 700, 220, 15);
    dialogBg.lineStyle(4, 0xff0000, 1);
    dialogBg.strokeRoundedRect(290, 250, 700, 220, 15);
    this.container.add(dialogBg);

    const errorText = this.scene.add.text(640, 310, '❌ Error', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ff0000',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(errorText);

    const messageText = this.scene.add.text(640, 360, message, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ff6666',
      align: 'center',
      wordWrap: { width: 650 },
    }).setOrigin(0.5);
    this.container.add(messageText);

    // OK button
    const okButton = this.scene.add.rectangle(640, 420, 140, 40, 0xaa0000, 1);
    const okText = this.scene.add.text(640, 420, 'OK', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    okButton.setInteractive({ useHandCursor: true });
    okButton.on('pointerover', () => {
      okButton.setFillStyle(0xff0000);
      okText.setScale(1.1);
    });
    okButton.on('pointerout', () => {
      okButton.setFillStyle(0xaa0000);
      okText.setScale(1.0);
    });
    okButton.on('pointerdown', () => this.close());

    this.container.add(okButton);
    this.container.add(okText);
  }

  /**
   * Close the dialog
   */
  close(): void {
    if (this.container) {
      this.container.destroy();
      this.container = undefined;
    }
  }
}
