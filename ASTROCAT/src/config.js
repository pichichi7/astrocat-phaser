// Game Configuration - Replica de Godot (Board.gd + Player.gd)
export const GameConfig = {
    // Display settings
    GAME_WIDTH: 1280,
    GAME_HEIGHT: 720,

    // Isometric board settings (Q*bert-like) - MATCHING GODOT
    TILE_WIDTH: 96.0,    // tile_w de Godot
    TILE_HEIGHT: 48.0,   // tile_h de Godot (proporción 2:1)
    ORIGIN_X: 640,       // origin.x centrado
    ORIGIN_Y: 160,       // origin.y (punta de pirámide arriba)

    // Sprite scaling - PROPORCIONAL AL TAMAÑO DE GODOT
    SCALES: {
        CUBE: 1.5,           // Cubos en escala 1:1 con los tiles (como Godot)
        PLAYER: 0.09747,     // Jugador: 9.747% (5% más pequeño de 0.1026)
        ENEMY: 0.0893475,    // Enemigo: 8.93% (5% más pequeño de 0.09405)
        HUD_BG: 0.6,
        MENU_CAT: 0.8,
        MENU_CUBES: 0.4
    },

    // Movement and animation - REPLICANDO GODOT
    JUMP_DURATION: 180,        // jump_duration: 0.18s
    JUMP_OFFSET_Y: 25.0,       // jump_offset_y de Player.gd
    SPRITE_OFFSET_Y: 55.0,     // sprite_offset_y de Player.gd (centrar sprite en cubo)
    RESPAWN_DELAY: 800,        // respawn_delay en ms

    // Shadow settings
    SHADOW: {
        WIDTH: 28,
        HEIGHT: 12,
        OFFSET_Y: 10
    },

    // Enemy system
    ENEMY: {
        MOVE_INTERVAL: 1200, // Intervalo entre movimientos
        MOVE_DURATION: 180,  // Duración de cada salto
        MAX_ENEMIES: 5,      // Máximo de enemigos por nivel
        MAX_ENEMIES_EDITOR: 5 // Máximo en editor
    },

    // Game mechanics
    GAMEPLAY: {
        STARTING_LIVES: 3,
        STARTING_ROWS: 7,    // Pirámide de 7 filas (como Godot rows: 7)
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
};

// Utility functions for common calculations
export const GameUtils = {
    // Convert isometric coordinates to screen position
    isoToScreen(row, col, config = GameConfig) {
        return {
            x: config.ORIGIN_X + (col - row) * (config.TILE_WIDTH / 2),
            y: config.ORIGIN_Y + (col + row) * (config.TILE_HEIGHT / 2)
        };
    },

    // Check if position is valid on pyramid
    isValidPosition(row, col, maxRows = GameConfig.GAMEPLAY.STARTING_ROWS) {
        return row >= 0 && row < maxRows && col >= 0 && col <= row;
    },

    // Get random valid position on pyramid
    getRandomValidPosition(maxRows = GameConfig.GAMEPLAY.STARTING_ROWS, excludeOrigin = true) {
        const validPositions = [];
        for (let r = 0; r < maxRows; r++) {
            for (let c = 0; c <= r; c++) {
                if (!excludeOrigin || !(r === 0 && c === 0)) {
                    validPositions.push({row: r, col: c});
                }
            }
        }
        return validPositions[Math.floor(Math.random() * validPositions.length)];
    }
};
