import { SplashScene } from './scenes/SplashScene';
import { MenuScene } from './scenes/MenuScene';
import { LeaderboardScene } from './scenes/LeaderboardScene';
import { BrowseLevelsScene } from './scenes/BrowseLevelsScene';
import { GameScene } from './scenes/GameScene';
import { EditorScene } from './scenes/EditorScene';
import { LevelSelectScene } from './scenes/LevelSelectScene';
import * as Phaser from 'phaser';
import { Game } from 'phaser';
import { initDevvitListener, sendToDevvit } from './utils/DevvitBridge';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#0f0f0f',
  width: 1280,
  height: 720,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720,
    parent: 'game-container',
    expandParent: false,
    fullscreenTarget: 'game-container'
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [SplashScene, MenuScene, LeaderboardScene, BrowseLevelsScene, GameScene, EditorScene, LevelSelectScene],
};

const StartGame = (parent: string) => {
  const game = new Game({ ...config, parent });

  // Initialize Devvit communication bridge
  if (typeof window !== 'undefined') {
    console.log('Initializing Devvit Bridge...');
    
    initDevvitListener({
      onLoadLevel: (levelData) => {
        console.log('Received level from Devvit:', levelData);
        // Load level in GameScene
        const gameScene = game.scene.getScene('GameScene');
        if (gameScene) {
          game.scene.start('GameScene', { 
            customLevel: levelData,
            fromCommunity: true 
          });
        }
      },
      onUserData: (userData) => {
        console.log('Received user data from Devvit:', userData);
        // Store in global state if needed
      },
      onInitComplete: () => {
        console.log('Devvit initialization complete');
      },
    });

    // Check for initial postData (shared level)
    const checkForPostData = () => {
      console.log('[Game] 🔍 Starting checkForPostData...');
      console.log('[Game] Current URL:', window.location.href);
      console.log('[Game] URL hash:', window.location.hash);
      console.log('[Game] Hash length:', window.location.hash.length);
      
  // Check URL hash for postData (Devvit passes it this way)
  if (window.location.hash && window.location.hash.length > 1) {
    try {
      console.log('[Game] 🔍 Checking URL hash...');
      const hashData = decodeURIComponent(window.location.hash.substring(1));
      console.log('[Game] Decoded hash:', hashData);
      const devvitData = JSON.parse(hashData);
      console.log('[Game] 🎮 Found postData in URL hash:', devvitData);
      
      // 🔥 FIX: Devvit estructura es { postData: { developerData: {...} } }
      const postDataContent = devvitData.postData;
      console.log('[Game] 🔎 Extracted postData content:', postDataContent);
      
      // 🔥 FIX: Los datos están en postData.developerData
      const developerData = postDataContent?.developerData || postDataContent;
      console.log('[Game] 📦 Checking developerData:', developerData);
      
      if (developerData && typeof developerData === 'object') {
        console.log('[Game] 📦 Checking postData structure:', {
          hasType: 'type' in developerData,
          type: developerData.type,
          hasLevelData: 'levelData' in developerData,
          hasLevelName: 'levelName' in developerData,
        });
        
        // Verificar si es un nivel compartido
        if (developerData.type === 'shared-level' && developerData.levelData) {
          console.log('[Game] ✅ Valid shared level data found!');
          
          // Parsear levelData si viene como string
          const levelData = typeof developerData.levelData === 'string'
            ? JSON.parse(developerData.levelData)
            : developerData.levelData;
          
          console.log('[Game] 📊 Parsed level data:', {
            hasBlocks: !!levelData?.blocks,
            blockCount: levelData?.blocks?.length || 0,
            hasGoal: !!levelData?.goal,
          });
          
          // Guardar en registry
          game.registry.set('sharedLevelData', {
            levelData: levelData,
            levelName: developerData.levelName || 'Shared Level',
            creator: developerData.creator || 'Anonymous',
            fromCommunity: true,
          });
          
          console.log('[Game] ✅ Shared level stored in game registry');
          
          // 🔥 Emit event to notify scenes
          game.events.emit('sharedLevelReady', {
            levelName: developerData.levelName,
            creator: developerData.creator
          });
        } else {
          console.log('[Game] ℹ️ postData exists but not a shared level (type:', developerData.type, ')');
        }
      } else {
        console.log('[Game] ℹ️ No postData content in hash');
      }
    } catch (error) {
      console.log('[Game] ⚠️ Failed to parse URL hash:', error);
      console.error('[Game] Full error:', error);
    }
  } else {
    console.log('[Game] ℹ️ No URL hash found or hash is empty');
  }      // SECOND: Try postMessage if not in URL
      if (window.parent && window.parent !== window) {
        console.log('[Game] Running inside iframe, checking for postData via postMessage...');
        
        // Request initial data from Devvit using DevvitBridge
        console.log('[Game] → Sending GAME_READY to parent...');
        sendToDevvit('GAME_READY', { 
          timestamp: Date.now(),
          gameVersion: '2.1.1'
        });

        // Listen for initial postData
        const handleInitialData = (event: MessageEvent) => {
          try {
            const message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
            
            console.log('[Game] ← Received message from parent:', message);

            if (message.type === 'INIT_DATA' && message.data?.postData) {
              const postData = message.data.postData;
              console.log('[Game] 🎮 Received initial postData:', postData);

              // Check for sharedLevelData in postData (Devvit might nest it)
              const sharedLevelData = postData.sharedLevelData || postData;
              console.log('[Game] 🔎 Checking sharedLevelData:', sharedLevelData);

              // Check if this is a shared level post
              if (sharedLevelData.type === 'shared-level' && sharedLevelData.levelData) {
                console.log('[Game] ✅ Detected shared level post! Storing in game registry...');
                console.log('[Game] Level details:', {
                  name: sharedLevelData.levelName,
                  creator: sharedLevelData.creator,
                  difficulty: sharedLevelData.difficulty,
                  hasLevelData: !!sharedLevelData.levelData,
                });
                
                // Parse level data
                try {
                  const levelData = typeof sharedLevelData.levelData === 'string' 
                    ? JSON.parse(sharedLevelData.levelData) 
                    : sharedLevelData.levelData;

                  console.log('[Game] Parsed level data:', levelData);

                  // Store in game registry so SplashScene can access it
                  game.registry.set('sharedLevelData', {
                    levelData,
                    levelName: sharedLevelData.levelName,
                    creator: sharedLevelData.creator,
                    fromCommunity: true,
                  });

                  console.log('[Game] ✅ Shared level stored in game registry');
                  
                  // 🔥 NUEVO: Emit event to notify scenes
                  game.events.emit('sharedLevelReady', {
                    levelName: sharedLevelData.levelName,
                    creator: sharedLevelData.creator
                  });
                } catch (error) {
                  console.error('[Game] ❌ Failed to parse shared level data:', error);
                }
              } else {
                console.log('[Game] ℹ️ Not a shared level post (type:', sharedLevelData.type, ')');
              }
            } else {
              console.log('[Game] ℹ️ Message is not INIT_DATA or has no postData');
            }
          } catch (error) {
            console.error('[Game] ❌ Failed to process initial data:', error);
          }
        };

        window.addEventListener('message', handleInitialData);
        console.log('[Game] Message listener added, waiting for INIT_DATA...');
      } else {
        console.log('[Game] Not in iframe, running standalone');
      }
    };

    // Check immediately and also after game is ready
    checkForPostData();
    
    game.events.once('ready', () => {
      console.log('Game ready, checking for shared level...');
      // Give time for postMessage to arrive
      setTimeout(() => {
        const sharedLevel = game.registry.get('sharedLevelData');
        if (sharedLevel) {
          console.log('🎮 Found shared level in registry, will auto-load after splash');
        }
      }, 200);
    });
  }

  return game;
};

export default StartGame;
