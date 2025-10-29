// Game Configuration - TypeScript version for Reddit/Devvit
export interface Position {
    x: number;
    y: number;
}

export interface RowCol {
    row: number;
    col: number;
}

// Mobile detection helper
export const isMobile = (): boolean => {
    return typeof window !== 'undefined' && window.innerWidth < 500;
};

// Get responsive game dimensions
export const getGameDimensions = () => {
    const mobile = isMobile();
    return {
        width: mobile ? 540 : 1280,
        height: mobile ? 960 : 720
    };
};

export const GameConfig = {
    // Display settings (base - will be overridden for mobile)
    GAME_WIDTH: 1280,
    GAME_HEIGHT: 720,

    // Isometric board settings (Q*bert-like)
    TILE_WIDTH: 96.0,
    TILE_HEIGHT: 48.0,
    ORIGIN_X: 640,
    ORIGIN_Y: 160,

    // Sprite scaling
    SCALES: {
        CUBE: 1.5,
        PLAYER: 0.09747,
        ENEMY: 0.0893475,
        HUD_BG: 0.6,
        MENU_CAT: 0.8,
        MENU_CUBES: 0.4
    },

    // Responsive scaling multipliers
    getResponsiveScale(): number {
        return isMobile() ? 1.5 : 1.0;
    },

    getButtonScale(): number {
        return isMobile() ? 1.2 : 1.0;
    },

    getFontSize(base: number): number {
        return Math.floor(base * (isMobile() ? 1.3 : 1.0));
    },

    // Movement and animation
    JUMP_DURATION: 180,
    JUMP_OFFSET_Y: 25.0,
    SPRITE_OFFSET_Y: 55.0,
    RESPAWN_DELAY: 800,

    // Shadow settings
    SHADOW: {
        WIDTH: 28,
        HEIGHT: 12,
        OFFSET_Y: 10
    },

    // Enemy system
    ENEMY: {
        MOVE_INTERVAL: 1200,
        MOVE_DURATION: 180,
        MAX_ENEMIES: 5,
        MAX_ENEMIES_EDITOR: 5
    },

    // Game mechanics
    GAMEPLAY: {
        STARTING_LIVES: 3,
        STARTING_ROWS: 7,
        MAX_ROWS: 10
    },

    // UI settings
    UI: {
        FONT_SIZE_LARGE: '20px',
        FONT_SIZE_MEDIUM: '16px',
        FONT_SIZE_SMALL: '14px',
        HUD_DEPTH: 101,
        PARTICLE_COUNT: 6,
        PARTICLE_SIZE: 2,
        PARTICLE_SPEED: 30
    },

    // Colors (hex format)
    COLORS: {
        CUBE_WHITE: 0xffffff,
        CUBE_CYAN: 0x00ffff,
        CUBE_GREEN: 0x00ff00,
        SHADOW: 0x000000,
        PARTICLE: 0x00ff00
    }
} as const;

// Utility functions for common calculations
export const GameUtils = {
    // Convert isometric coordinates to screen position
    isoToScreen(row: number, col: number, config = GameConfig): Position {
        return {
            x: config.ORIGIN_X + (col - row) * (config.TILE_WIDTH / 2),
            y: config.ORIGIN_Y + (col + row) * (config.TILE_HEIGHT / 2)
        };
    },

    // Check if position is valid on pyramid
    isValidPosition(row: number, col: number, maxRows: number = GameConfig.GAMEPLAY.STARTING_ROWS): boolean {
        return row >= 0 && row < maxRows && col >= 0 && col <= row;
    },

    // Get random valid position on pyramid
    getRandomValidPosition(maxRows: number = GameConfig.GAMEPLAY.STARTING_ROWS, excludeOrigin: boolean = true): RowCol {
        const validPositions: RowCol[] = [];
        for (let r = 0; r < maxRows; r++) {
            for (let c = 0; c <= r; c++) {
                if (!excludeOrigin || !(r === 0 && c === 0)) {
                    validPositions.push({row: r, col: c});
                }
            }
        }
        const randomIndex = Math.floor(Math.random() * validPositions.length);
        return validPositions[randomIndex] || { row: 0, col: 0 };
    }
};
