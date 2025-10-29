/**
 * WebView <-> Devvit Communication Bridge
 * Handles bidirectional postMessage between Phaser game and Devvit Blocks
 */

// Message types
export const MessageTypes = {
  // From WebView to Devvit
  SUBMIT_SCORE: 'SUBMIT_SCORE',
  OPEN_LEADERBOARD: 'OPEN_LEADERBOARD',
  SHARE_LEVEL: 'SHARE_LEVEL',
  BROWSE_LEVELS: 'BROWSE_LEVELS',
  BACK_TO_GAME: 'BACK_TO_GAME',
  
  // From Devvit to WebView
  LOAD_LEVEL: 'LOAD_LEVEL',
  USER_DATA: 'USER_DATA',
  INIT_COMPLETE: 'INIT_COMPLETE',
};

/**
 * Send message from WebView to Devvit
 */
export function sendToDevvit(type: string, data: any = {}): void {
  if (!window.parent) {
    console.error('sendToDevvit: No parent window found');
    return;
  }

  const message = {
    type,
    data,
    timestamp: Date.now(),
  };

  console.log('→ Sending to Devvit:', message);
  
  try {
    window.parent.postMessage(JSON.stringify(message), '*');
  } catch (error) {
    console.error('Failed to send message to Devvit:', error);
  }
}

/**
 * Listen for messages from Devvit
 */
export function initDevvitListener(handlers: {
  onLoadLevel?: (levelData: any) => void;
  onUserData?: (userData: any) => void;
  onInitComplete?: () => void;
}): void {
  window.addEventListener('message', (event) => {
    try {
      const message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      
      console.log('← Received from Devvit:', message);

      switch (message.type) {
        case MessageTypes.LOAD_LEVEL:
          handlers.onLoadLevel?.(message.data);
          break;

        case MessageTypes.USER_DATA:
          handlers.onUserData?.(message.data);
          break;

        case MessageTypes.INIT_COMPLETE:
          handlers.onInitComplete?.();
          break;

        default:
          console.warn('Unknown message type from Devvit:', message.type);
      }
    } catch (error) {
      console.error('Failed to parse message from Devvit:', error);
    }
  });

  console.log('Devvit listener initialized');
}

/**
 * Submit score to leaderboard
 */
export function submitScore(score: number, levelId?: string, timeMs?: number): void {
  sendToDevvit(MessageTypes.SUBMIT_SCORE, {
    score,
    levelId,
    timeMs,
  });
}

/**
 * Open leaderboard view
 */
export function openLeaderboard(): void {
  sendToDevvit(MessageTypes.OPEN_LEADERBOARD);
}

/**
 * Share level to Reddit
 */
export function shareLevel(levelData: string): void {
  sendToDevvit(MessageTypes.SHARE_LEVEL, {
    levelData,
  });
}

/**
 * Browse community levels
 */
export function browseLevels(): void {
  sendToDevvit(MessageTypes.BROWSE_LEVELS);
}

/**
 * Return to game view
 */
export function backToGame(): void {
  sendToDevvit(MessageTypes.BACK_TO_GAME);
}

// Make functions available globally for Phaser scenes
if (typeof window !== 'undefined') {
  (window as any).DevvitBridge = {
    submitScore,
    openLeaderboard,
    shareLevel,
    browseLevels,
    backToGame,
    initDevvitListener,
  };
}
