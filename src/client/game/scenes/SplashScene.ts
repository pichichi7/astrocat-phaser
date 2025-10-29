import * as Phaser from 'phaser';

/**
 * SplashScene - Initial loading screen
 * Displays game logo with brand colors and auto-transitions to MenuScene
 */
export class SplashScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SplashScene' });
    }

    preload(): void {
        // Preload only critical assets needed for splash
        this.load.image('logo', '/assets/logo.png');
        this.load.image('astrocat', '/assets/astrocat.png');
        this.load.image('splashbackground', '/assets/splashbackground.png');
        this.load.image('splash_logo', '/assets/splash_astrocat.png');
        
        // 🎵 Background music disabled for hackathon deadline
        // this.load.audio('backgroundMusic', '/assets/backmusic.mp3');
        
        // Error handling
        this.load.on('loaderror', (file: any) => {
            console.error('❌ [SplashScene] Failed to load:', file.key, file.src);
        });
    }

    create(): void {
        // 🎵 Background music disabled for hackathon deadline
        // if (!this.sound.get('backgroundMusic')) {
        //     const music = this.sound.add('backgroundMusic', {
        //         loop: true,
        //         volume: 0.5
        //     });
        //     music.play();
        //     console.log('🎵 [SplashScene] Background music started');
        // }
        
        // Try to use background image if loaded
        if (this.textures.exists('splashbackground')) {
            const bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'splashbackground');
            bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
            bg.setDepth(-1);
        } else {
            console.warn('⚠️ [SplashScene] Background texture not found, using color');
        }
        
        // Fallback color if image doesn't load
        this.cameras.main.setBackgroundColor('#000033');

        // Game logo/title centered
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Main splash logo image (SPLASH_ASTROCAT.png)
        let titleElement: Phaser.GameObjects.Image | Phaser.GameObjects.Text;
        
        if (this.textures.exists('splash_logo')) {
            // Use splash logo image - smaller scale for better fit
            titleElement = this.add.image(centerX, centerY, 'splash_logo')
                .setScale(0.4)
                .setAlpha(0);
        } else {
            // Fallback to text if image not loaded
            console.warn('⚠️ [SplashScene] SPLASH_ASTROCAT.png not found, using text fallback');
            titleElement = this.add.text(centerX, centerY, '🐱 ASTROCAT', {
                fontSize: '84px',
                fontFamily: 'Arial, sans-serif',
                color: '#00ffff',
                fontStyle: 'bold',
                stroke: '#000066',
                strokeThickness: 6,
                shadow: {
                    offsetX: 4,
                    offsetY: 4,
                    color: '#000000',
                    blur: 8,
                    stroke: false,
                    fill: true
                }
            }).setOrigin(0.5).setAlpha(0);
        }

        // Logo image (small top logo - optional)
        const logo = this.add.image(centerX, centerY - 80, 'logo')
            .setScale(0.6)
            .setAlpha(0)
            .setVisible(false); // Hide small logo when using splash logo

        // Subtitle
        const subtitle = this.add.text(centerX, centerY + 140, 'Isometric Puzzle Adventure', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            color: '#66ccff',
            fontStyle: 'italic'
        }).setOrigin(0.5).setAlpha(0);

        // 🔥 NUEVO: Loading indicator
        const loadingText = this.add.text(centerX, centerY + 200, 'Loading...', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#66ccff'
        }).setOrigin(0.5).setAlpha(0);

        // Fade in animation (500ms) - staggered for visual appeal
        this.tweens.add({
            targets: titleElement,
            alpha: 1,
            duration: 500,
            ease: 'Power2'
        });

        this.tweens.add({
            targets: subtitle,
            alpha: 1,
            duration: 500,
            delay: 400,
            ease: 'Power2'
        });

        this.tweens.add({
            targets: loadingText,
            alpha: 1,
            duration: 500,
            delay: 600,
            ease: 'Power2'
        });

        // Pulsing glow effect on title
        this.tweens.add({
            targets: titleElement,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 1000,
            delay: 800,
            yoyo: true,
            repeat: 1,
            ease: 'Sine.easeInOut'
        });

        // 🔥 NUEVO: Esperar a que Devvit responda O timeout
        let hasTransitioned = false;
        
        // Check immediately if data is already in registry (from URL hash)
        const existingData = this.game.registry.get('sharedLevelData');
        if (existingData) {
            console.log('[SplashScene] ✅ Found existing shared level data immediately');
            hasTransitioned = true;
            this.time.delayedCall(2000, () => {
                this.transitionToNextScene();
            });
        } else {
            console.log('[SplashScene] ⏳ Waiting for Devvit data...');
            
            // 🔥 Listen for registry changes
            const checkInterval = this.time.addEvent({
                delay: 100, // Check every 100ms
                callback: () => {
                    if (hasTransitioned) return;
                    
                    const sharedLevelData = this.game.registry.get('sharedLevelData');
                    if (sharedLevelData) {
                        console.log('[SplashScene] ✅ Received shared level data!');
                        hasTransitioned = true;
                        checkInterval.remove();
                        
                        // Transition immediately
                        this.time.delayedCall(500, () => {
                            this.transitionToNextScene();
                        });
                    }
                },
                loop: true
            });
            
            // 🔥 Timeout after 5 seconds if no data arrives
            this.time.delayedCall(5000, () => {
                if (!hasTransitioned) {
                    console.log('[SplashScene] ⏱️ Timeout - no shared level detected, going to menu');
                    hasTransitioned = true;
                    checkInterval.remove();
                    this.transitionToNextScene();
                }
            });
        }

        // Optional: Allow skip on click/tap (but only after animations)
        this.time.delayedCall(1000, () => {
            this.input.once('pointerdown', () => {
                if (!hasTransitioned) {
                    console.log('[SplashScene] ⏭️ User skipped splash');
                    hasTransitioned = true;
                    this.cameras.main.fadeOut(200, 0, 0, 51);
                    this.time.delayedCall(200, () => {
                        this.transitionToNextScene();
                    });
                }
            });
        });
    }

    /**
     * Transition to next scene - checks for shared level first
     */
    private transitionToNextScene(): void {
        console.log('[SplashScene] Transitioning to next scene...');
        
        // Check if there's a shared level to load
        const sharedLevelData = this.game.registry.get('sharedLevelData');
        
        console.log('[SplashScene] Registry check:', {
            hasSharedLevel: !!sharedLevelData,
            data: sharedLevelData,
        });
        
        if (sharedLevelData) {
            console.log('[SplashScene] 🎮 Detected shared level, loading directly...');
            console.log('[SplashScene] Level info:', {
                levelName: sharedLevelData.levelName,
                creator: sharedLevelData.creator,
                fromCommunity: sharedLevelData.fromCommunity,
                hasLevelData: !!sharedLevelData.levelData,
            });
            
            // Smooth fade out before transition
            this.cameras.main.fadeOut(300, 0, 0, 51);
            
            this.cameras.main.once('camerafadeoutcomplete', () => {
                // Clear the registry entry so it doesn't auto-load again
                this.game.registry.remove('sharedLevelData');
                
                console.log('[SplashScene] → Starting GameScene with shared level');
                
                // Start game directly with the shared level
                this.scene.start('GameScene', {
                    customLevel: sharedLevelData.levelData,
                    fromCommunity: sharedLevelData.fromCommunity,
                    levelName: sharedLevelData.levelName,
                    creator: sharedLevelData.creator,
                });
            });
        } else {
            console.log('[SplashScene] ℹ️ No shared level, going to MenuScene');
            
            // Normal flow - go to MenuScene
            this.cameras.main.fadeOut(300, 0, 0, 51);
            
            this.cameras.main.once('camerafadeoutcomplete', () => {
                console.log('[SplashScene] → Starting MenuScene');
                this.scene.start('MenuScene');
            });
        }
    }
}
