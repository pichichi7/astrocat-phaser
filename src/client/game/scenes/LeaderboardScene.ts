import * as Phaser from 'phaser';
import { LeaderboardClient, type LeaderboardEntry } from '../services/LeaderboardClient';
import { GameConfig } from '../config';

/**
 * LeaderboardScene
 * Displays global leaderboard with top 10 players
 */
export class LeaderboardScene extends Phaser.Scene {
  private leaderboardData: LeaderboardEntry[] = [];
  private currentPage = 0;
  private readonly ENTRIES_PER_PAGE = 10;
  private leaderboardContainer!: Phaser.GameObjects.Container;
  private loadingText!: Phaser.GameObjects.Text;
  private errorText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'LeaderboardScene' });
  }

  preload(): void {
    this.load.image('space', '/assets/space.png');
    
    // Error handling
    this.load.on('loaderror', (file: any) => {
      console.error('❌ [LeaderboardScene] Failed to load:', file.key, file.src);
    });
  }

  create(): void {
    // Background
    const bg = this.add.tileSprite(640, 360, 1280, 720, 'space');
    bg.setDepth(-1);

    // Title
    this.add.text(640, 60, '🏆 GLOBAL LEADERBOARD', {
      fontSize: '52px',
      fontFamily: 'Arial',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 5,
      fontStyle: 'bold',
      shadow: {
        offsetX: 3,
        offsetY: 3,
        color: '#000000',
        blur: 5,
        stroke: false,
        fill: true,
      },
    }).setOrigin(0.5).setDepth(10);

    // Subtitle
    this.add.text(640, 110, 'Top Players by Total Score', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#00ffff',
      fontStyle: 'italic',
    }).setOrigin(0.5).setDepth(10);

    // Loading indicator
    this.loadingText = this.add.text(640, 360, 'Loading leaderboard...', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(100);

    // Container for leaderboard entries
    this.leaderboardContainer = this.add.container(0, 0);
    this.leaderboardContainer.setDepth(5);

    // Back button
    this.createBackButton();

    // Load leaderboard data
    this.loadLeaderboard();
  }

  private async loadLeaderboard(): Promise<void> {
    try {
      const data = await LeaderboardClient.getGlobalLeaderboard(
        this.ENTRIES_PER_PAGE,
        this.currentPage * this.ENTRIES_PER_PAGE
      );

      this.leaderboardData = data.leaderboard;
      this.loadingText.setVisible(false);

      if (this.leaderboardData.length === 0) {
        this.showEmptyState();
      } else {
        this.displayLeaderboard(data);
      }

      // Show user rank if available
      if (data.userRank && data.userScore !== undefined) {
        this.displayUserRank(data.userRank, data.userScore);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      this.loadingText.setVisible(false);
      this.showError('Failed to load leaderboard. Please try again.');
    }
  }

  private showEmptyState(): void {
    this.add.text(640, 360, 'No scores yet!\nBe the first to play and set a record! 🎮', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#cccccc',
      align: 'center',
      lineSpacing: 10,
    }).setOrigin(0.5).setDepth(100);
  }

  private showError(message: string): void {
    this.errorText = this.add.text(640, 360, message, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ff6666',
      align: 'center',
    }).setOrigin(0.5).setDepth(100);
  }

  private displayLeaderboard(data: any): void {
    this.leaderboardContainer.removeAll(true);

    const startY = 160;
    const entryHeight = 52;

    // Header panel
    const headerPanel = this.add.graphics();
    headerPanel.fillStyle(0x1a1a3a, 0.95);
    headerPanel.fillRoundedRect(140, startY - 10, 1000, 45, 10);
    headerPanel.lineStyle(3, 0x00ffff, 0.9);
    headerPanel.strokeRoundedRect(140, startY - 10, 1000, 45, 10);
    this.leaderboardContainer.add(headerPanel);

    // Header text
    const headerTexts = [
      { text: 'RANK', x: 210, color: '#ffd700' },
      { text: 'PLAYER', x: 420, color: '#00ffff' },
      { text: 'SCORE', x: 750, color: '#00ff00' },
      { text: 'GAMES', x: 900, color: '#ffaa00' },
      { text: 'WINS', x: 1020, color: '#ff00ff' },
    ];

    headerTexts.forEach(({ text, x, color }) => {
      const txt = this.add.text(x, startY + 12, text, {
        fontSize: '18px',
        fontFamily: 'Arial',
        color,
        fontStyle: 'bold',
      }).setOrigin(0.5);
      this.leaderboardContainer.add(txt);
    });

    // Entries
    data.leaderboard.forEach((entry: LeaderboardEntry, index: number) => {
      const y = startY + 55 + index * entryHeight;
      this.createLeaderboardEntry(entry, y, index);
    });
  }

  private createLeaderboardEntry(entry: LeaderboardEntry, y: number, index: number): void {
    // Alternate background colors
    const bgColor = index % 2 === 0 ? 0x0a0a1a : 0x151530;
    const bg = this.add.graphics();
    bg.fillStyle(bgColor, 0.85);
    bg.fillRoundedRect(140, y - 22, 1000, 48, 8);
    this.leaderboardContainer.add(bg);

    // Highlight top 3
    if (entry.rank <= 3) {
      const highlightColor = entry.rank === 1 ? 0xffd700 : entry.rank === 2 ? 0xc0c0c0 : 0xcd7f32;
      bg.lineStyle(2, highlightColor, 0.8);
      bg.strokeRoundedRect(140, y - 22, 1000, 48, 8);
    }

    // Medal for top 3
    let rankDisplay = `${entry.rank}`;
    let rankColor = '#ffffff';

    if (entry.rank === 1) {
      rankDisplay = '🥇';
      rankColor = '#ffd700';
    } else if (entry.rank === 2) {
      rankDisplay = '🥈';
      rankColor = '#c0c0c0';
    } else if (entry.rank === 3) {
      rankDisplay = '🥉';
      rankColor = '#cd7f32';
    }

    // Rank
    const rank = this.add.text(210, y, rankDisplay, {
      fontSize: entry.rank <= 3 ? '26px' : '20px',
      fontFamily: 'Arial',
      color: rankColor,
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.leaderboardContainer.add(rank);

    // Username
    const maxLength = 20;
    const displayName = entry.username.length > maxLength
      ? entry.username.substring(0, maxLength) + '...'
      : entry.username;

    const username = this.add.text(420, y, displayName, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff',
    }).setOrigin(0.5);
    this.leaderboardContainer.add(username);

    // Score
    const scoreText = this.add.text(750, y, entry.score.toLocaleString(), {
      fontSize: '19px',
      fontFamily: 'Arial',
      color: '#00ff00',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.leaderboardContainer.add(scoreText);

    // Games played
    const games = this.add.text(900, y, `${entry.gamesPlayed || 0}`, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffaa00',
    }).setOrigin(0.5);
    this.leaderboardContainer.add(games);

    // Wins
    const wins = this.add.text(1020, y, `${entry.gamesWon || 0}`, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ff00ff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.leaderboardContainer.add(wins);

    // Add subtle animation on creation
    bg.setAlpha(0);
    rank.setAlpha(0);
    username.setAlpha(0);
    scoreText.setAlpha(0);
    games.setAlpha(0);
    wins.setAlpha(0);

    this.tweens.add({
      targets: [bg, rank, username, scoreText, games, wins],
      alpha: 1,
      duration: 300,
      delay: index * 50,
      ease: 'Power2',
    });
  }

  private displayUserRank(rank: number, score: number): void {
    // User stats panel at bottom
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a3a, 0.95);
    panel.fillRoundedRect(290, 640, 700, 65, 14);
    panel.lineStyle(4, 0x00ffff, 0.9);
    panel.strokeRoundedRect(290, 640, 700, 65, 14);
    panel.setDepth(100);

    const icon = this.add.text(340, 672, '👤', {
      fontSize: '32px',
    }).setOrigin(0.5).setDepth(101);

    const text = this.add.text(640, 672, `Your Rank: #${rank}  |  Your Score: ${score.toLocaleString()}`, {
      fontSize: '26px',
      fontFamily: 'Arial',
      color: '#00ffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(101);

    // Pulse animation
    this.tweens.add({
      targets: [icon, text],
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private createBackButton(): void {
    const btn = this.add.graphics();
    btn.fillStyle(0xff6600, 0.9);
    btn.fillRoundedRect(50, 50, 140, 55, 12);
    btn.lineStyle(3, 0xffffff, 0.8);
    btn.strokeRoundedRect(50, 50, 140, 55, 12);
    btn.setDepth(100);

    const text = this.add.text(120, 77, '← BACK', {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(101);

    const hitArea = this.add.rectangle(120, 77, 140, 55, 0x000000, 0.01);
    hitArea.setInteractive({ useHandCursor: true });
    hitArea.setDepth(102);

    hitArea.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    hitArea.on('pointerover', () => {
      btn.clear();
      btn.fillStyle(0xff8833, 1);
      btn.fillRoundedRect(50, 50, 140, 55, 12);
      btn.lineStyle(3, 0xffffff, 1);
      btn.strokeRoundedRect(50, 50, 140, 55, 12);
      text.setScale(1.08);
    });

    hitArea.on('pointerout', () => {
      btn.clear();
      btn.fillStyle(0xff6600, 0.9);
      btn.fillRoundedRect(50, 50, 140, 55, 12);
      btn.lineStyle(3, 0xffffff, 0.8);
      btn.strokeRoundedRect(50, 50, 140, 55, 12);
      text.setScale(1.0);
    });
  }
}
