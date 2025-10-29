import * as Phaser from 'phaser';
import { GameConfig } from '../config';
import { RedditUserService } from '../services/RedditUserService';
import type { RedditUser } from '../../../shared/types/reddit';
import { ResponsiveHelper, type DeviceInfo } from '../utils/ResponsiveHelper';

export class MenuScene extends Phaser.Scene {
    private currentUser: RedditUser | null = null;
    private userPanel?: Phaser.GameObjects.Graphics;
    private deviceInfo!: DeviceInfo;
    
    // UI elements for repositioning
    private uiElements: Phaser.GameObjects.GameObject[] = [];
    private background!: Phaser.GameObjects.TileSprite;
    private titleText!: Phaser.GameObjects.Text;
    private subtitleText!: Phaser.GameObjects.Text;
    private catSprite!: Phaser.GameObjects.Image;
    private instructionsText!: Phaser.GameObjects.Text;
    private buttons: {
        button: Phaser.GameObjects.Rectangle;
        text: Phaser.GameObjects.Text;
        label: string;
        action: () => void;
    }[] = [];

    constructor() {
        super({ key: 'MenuScene' });
    }

    preload(): void {
        // Load background and UI assets
        this.load.image('space', '/assets/space.png');
        this.load.image('astrocat', '/assets/astrocat.png');
        this.load.image('cube', '/assets/cube_top.png');
        this.load.image('menu_logo', '/assets/splash_astrocat.png');
        
        // Load new button assets
        this.load.image('btn_play', '/assets/play.png');
        this.load.image('btn_editor', '/assets/editor.png');
        this.load.image('btn_leaderboard', '/assets/leaderboard.png');
        this.load.image('btn_community', '/assets/community.png');
        this.load.image('btn_menu', '/assets/menu.png');
        
        // Error handling
        this.load.on('loaderror', (file: any) => {
            console.error('❌ Failed to load:', file.key, file.src);
        });
    }

    create(): void {
        // Get initial device info
        this.deviceInfo = ResponsiveHelper.getDeviceInfo(
            this.scale.width,
            this.scale.height
        );

        // Load user profile
        this.loadUserProfile();

        // Create all UI elements
        this.createUI();

        // Listen for resize events
        this.scale.on('resize', this.handleResize, this);
    }

    private createUI(): void {
        const device = this.deviceInfo;
        const centerX = ResponsiveHelper.getCenterX(device);
        const centerY = ResponsiveHelper.getCenterY(device);
        const safeArea = ResponsiveHelper.getSafeArea(device);

        // Background - always fills screen
        this.background = this.add.tileSprite(
            centerX,
            centerY,
            device.width,
            device.height,
            'space'
        );
        this.uiElements.push(this.background);

        // Calculate layout
        const titleSize = ResponsiveHelper.getTitleSize(device);
        const subtitleSize = ResponsiveHelper.getSubtitleSize(device);
        const titleY = safeArea.top + titleSize;

        // Title - Use logo image if available, otherwise text
        if (this.textures.exists('menu_logo')) {
            // Use SPLASH_ASTROCAT.png logo
            const logoScale = device.isMobile ? 0.4 : device.isTablet ? 0.5 : 0.6;
            this.titleText = this.add.image(centerX, titleY, 'menu_logo')
                .setScale(logoScale) as any;
        } else {
            // Fallback to text
            this.titleText = this.add.text(centerX, titleY, '🐱 ASTROCAT', {
                fontSize: `${titleSize}px`,
                fontFamily: 'Arial',
                color: '#00ffff',
                stroke: '#000000',
                strokeThickness: Math.max(2, titleSize / 18),
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#000000',
                    blur: 0,
                    stroke: false,
                    fill: true
                }
            }).setOrigin(0.5);
        }
        this.uiElements.push(this.titleText);

        // Subtitle - moved down when using logo
        const subtitleY = this.textures.exists('menu_logo') 
            ? titleY + 120  // More space when using logo
            : titleY + titleSize * 0.8;
        this.subtitleText = this.add.text(centerX, subtitleY, 'Isometric Puzzle Adventure', {
            fontSize: `${subtitleSize}px`,
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: Math.max(1, subtitleSize / 12)
        }).setOrigin(0.5);
        this.uiElements.push(this.subtitleText);

        // Cat sprite - only show if NOT using logo (to avoid overlap)
        if (!this.textures.exists('menu_logo')) {
            const catY = device.isMobile && device.isPortrait ? centerY - 100 : centerY - 50;
            const catScale = ResponsiveHelper.getSpriteScale(
                GameConfig.SCALES.MENU_CAT,
                device,
                0.4,
                1.2
            );
            
            this.catSprite = this.add.image(centerX, catY, 'astrocat').setScale(catScale);
            this.uiElements.push(this.catSprite);
            
            // Floating animation for the cat
            this.tweens.add({
                targets: this.catSprite,
                y: catY - 20,
                duration: 1500,
                ease: 'Sine.inOut',
                yoyo: true,
                repeat: -1
            });
        }

        // Instructions - adapted to device
        const instructionsY = device.height - safeArea.bottom - 180;
        const instructionsFontSize = device.isMobile ? 12 : device.isTablet ? 14 : 16;
        
        let instructionsText = 'GOAL: Step on all cubes!\n\n';
        
        if (device.isMobile) {
            instructionsText += 'Swipe diagonally to move';
        } else {
            instructionsText += 'WASD or Arrow Keys to move\n' +
                               'W/↑ = Up-Left    D/→ = Up-Right\n' +
                               'A/← = Down-Left  S/↓ = Down-Right';
        }

        this.instructionsText = this.add.text(centerX, instructionsY, instructionsText, {
            fontSize: `${instructionsFontSize}px`,
            fontFamily: 'Arial',
            color: '#cccccc',
            align: 'center',
            lineSpacing: 6
        }).setOrigin(0.5);
        this.uiElements.push(this.instructionsText);

        // Create buttons
        this.createButtons();

        // Create decorative floating cubes
        this.createFloatingCubes();
    }

    private createButtons(): void {
        const device = this.deviceInfo;
        const centerX = ResponsiveHelper.getCenterX(device);
        const buttonSize = ResponsiveHelper.getButtonSize(device);
        
        // Define buttons with their image keys and colors
        const buttonDefs = [
            { label: '🎮 JUGAR', imageKey: 'btn_play', color: 0x00ff00, action: () => this.scene.start('GameScene') },
            { label: '🏆 RANKING', imageKey: 'btn_leaderboard', color: 0xffd700, action: () => this.scene.start('LeaderboardScene') },
            { label: '🌐 COMMUNITY', imageKey: 'btn_community', color: 0x00aaff, action: () => this.scene.start('BrowseLevelsScene') },
            { label: '✏️ EDITOR', imageKey: 'btn_editor', color: 0xff8800, action: () => this.scene.start('EditorScene') }
        ];

        // Calculate vertical positions
        const { startY, spacing } = ResponsiveHelper.getButtonSpacing(device, buttonDefs.length);
        
        // Create each button
        buttonDefs.forEach((def, index) => {
            const yPos = startY + (buttonSize.height + spacing) * index + 
                        (device.isMobile && device.isPortrait ? 250 : 200);
            
            let buttonElement: Phaser.GameObjects.GameObject;
            
            // Check if texture exists and loaded correctly
            const textureExists = this.textures.exists(def.imageKey);
            
            if (textureExists) {
                // Use image button
                const buttonImg = this.add.image(centerX, yPos, def.imageKey);
                
                // Check if image loaded correctly (has valid dimensions)
                if (buttonImg.width > 1 && buttonImg.height > 1) {
                    // Scale button to fit desired size (increased 363% total)
                    const scaleX = buttonSize.width / buttonImg.width;
                    const scaleY = buttonSize.height / buttonImg.height;
                    buttonImg.setScale(Math.min(scaleX, scaleY) * 3.70989); // 363% larger than original
                    
                    // Make interactive
                    buttonImg.setInteractive({ useHandCursor: true });
                    
                    buttonImg.on('pointerdown', def.action);
                    
                    buttonImg.on('pointerover', () => {
                        buttonImg.setScale(buttonImg.scale * 1.1);
                    });
                    
                    buttonImg.on('pointerout', () => {
                        buttonImg.setScale(buttonImg.scale / 1.1);
                    });
                    
                    buttonElement = buttonImg;
                    this.buttons.push({ 
                        button: buttonImg as any, 
                        text: null as any, 
                        label: def.label, 
                        action: def.action 
                    });
                } else {
                    // Fallback to colored rectangle
                    buttonElement = this.createFallbackButton(centerX, yPos, buttonSize, def);
                }
            } else {
                // Fallback to colored rectangle
                console.warn(`⚠️ Texture ${def.imageKey} not found, using fallback`);
                buttonElement = this.createFallbackButton(centerX, yPos, buttonSize, def);
            }
            
            this.uiElements.push(buttonElement);
        });
    }

    private createFallbackButton(x: number, y: number, buttonSize: any, def: any): Phaser.GameObjects.GameObject {
        // Increase button size by 363.736% total (3.5672 * 1.3)
        const scaledWidth = buttonSize.width * 4.63736;
        const scaledHeight = buttonSize.height * 4.63736;
        const button = this.add.rectangle(x, y, scaledWidth, scaledHeight, def.color, 0.8);
        const text = this.add.text(x, y, def.label, {
            fontSize: `${Math.floor(buttonSize.fontSize * 4.63736)}px`,
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        button.setInteractive({ useHandCursor: true });
        
        button.on('pointerdown', def.action);
        
        button.on('pointerover', () => {
            button.setFillStyle(def.color, 1.0);
            text.setScale(1.1);
        });
        
        button.on('pointerout', () => {
            button.setFillStyle(def.color, 0.8);
            text.setScale(1.0);
        });

        this.buttons.push({ button, text, label: def.label, action: def.action });
        this.uiElements.push(text);
        
        return button;
    }

    private createFloatingCubes(): void {
        const device = this.deviceInfo;
        const cubeCount = device.isMobile ? 4 : 8;
        const cubeScale = ResponsiveHelper.getSpriteScale(
            GameConfig.SCALES.MENU_CUBES,
            device,
            0.2,
            0.6
        );

        for (let i = 0; i < cubeCount; i++) {
            const x = Phaser.Math.Between(50, device.width - 50);
            const y = Phaser.Math.Between(100, device.height - 100);
            const cube = this.add.image(x, y, 'cube')
                .setAlpha(0.3)
                .setScale(cubeScale);
            
            this.tweens.add({
                targets: cube,
                y: y - 20,
                duration: Phaser.Math.Between(2000, 4000),
                ease: 'Sine.inOut',
                yoyo: true,
                repeat: -1,
                delay: Phaser.Math.Between(0, 2000)
            });

            this.uiElements.push(cube);
        }
    }

    private handleResize(gameSize: Phaser.Structs.Size): void {
        const width = gameSize.width;
        const height = gameSize.height;

        // Update device info
        this.deviceInfo = ResponsiveHelper.getDeviceInfo(width, height);

        // Destroy all UI elements
        this.uiElements.forEach(element => element.destroy());
        this.uiElements = [];
        this.buttons = [];

        // Recreate UI with new dimensions
        this.createUI();
        
        // Reload user profile panel if it exists
        if (this.currentUser) {
            this.displayUserProfile(this.currentUser);
        }
    }

    /**
     * Load and display user profile
     */
    private async loadUserProfile(): Promise<void> {
        try {
            const user = await RedditUserService.getCurrentUser();
            
            if (user) {
                this.currentUser = user;
                this.displayUserProfile(user);
            } else {
                // Show guest mode
                this.displayGuestProfile();
            }
        } catch (error) {
            console.error('Failed to load user profile:', error);
            this.displayGuestProfile();
        }
    }

    /**
     * Display authenticated user profile
     */
    private displayUserProfile(user: RedditUser): void {
        // User panel background
        this.userPanel = this.add.graphics();
        this.userPanel.fillStyle(0x001133, 0.9);
        this.userPanel.fillRoundedRect(930, 20, 320, 80, 10);
        this.userPanel.lineStyle(2, 0x00ffff, 1);
        this.userPanel.strokeRoundedRect(930, 20, 320, 80, 10);

        // Username
        this.add.text(950, 35, `👤 ${user.username}`, {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#00ffff',
            fontStyle: 'bold'
        });

        // Karma (if available)
        if (user.karma !== undefined) {
            this.add.text(950, 60, `⭐ Karma: ${user.karma.toLocaleString()}`, {
                fontSize: '16px',
                fontFamily: 'Arial',
                color: '#ffd700'
            });
        }

        // Account age (if available)
        if (user.createdAt) {
            const accountAge = this.getAccountAge(user.createdAt);
            this.add.text(950, 80, `📅 ${accountAge}`, {
                fontSize: '14px',
                fontFamily: 'Arial',
                color: '#aaaaaa'
            });
        }
    }

    /**
     * Display guest profile
     */
    private displayGuestProfile(): void {
        this.userPanel = this.add.graphics();
        this.userPanel.fillStyle(0x331100, 0.9);
        this.userPanel.fillRoundedRect(930, 20, 320, 60, 10);
        this.userPanel.lineStyle(2, 0x888888, 1);
        this.userPanel.strokeRoundedRect(930, 20, 320, 60, 10);

        this.add.text(950, 35, '🎮 Guest Mode', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#888888',
            fontStyle: 'bold'
        });

        this.add.text(950, 60, 'Connect to save progress', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#666666'
        });
    }

    /**
     * Calculate account age from creation date
     */
    private getAccountAge(createdAt: number): string {
        const now = Date.now();
        const diffMs = now - createdAt;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays < 1) return 'New account';
        if (diffDays < 30) return `${diffDays} days old`;
        
        const diffMonths = Math.floor(diffDays / 30);
        if (diffMonths < 12) return `${diffMonths} months old`;
        
        const diffYears = Math.floor(diffMonths / 12);
        return `${diffYears} year${diffYears > 1 ? 's' : ''} old`;
    }
}
