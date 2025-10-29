/**
 * LevelFormat.ts
 * Sistema de serialización y deserialización de niveles
 * TypeScript version for Reddit/Devvit
 */

export interface BlockData {
    row: number;
    col: number;
    type: number;
}

export interface EnemyData {
    row: number;
    col: number;
    type: number;
}

export interface SerializedLevel {
    name: string;
    description: string;
    rows: number;
    blocks: BlockData[];
    enemies: EnemyData[];
    difficulty: string;
    timeCreated: string;
    version: number;
}

export interface LevelData {
    name: string;
    description?: string;
    rows: number;
    blocks: { [key: string]: number };
    enemies: EnemyData[];
    difficulty?: string;
}

export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

export class LevelFormat {
    // Tipos de bloques disponibles
    static BLOCK_TYPES = {
        NORMAL: 0,      // Cubo normal (blanco -> cyan -> verde)
        LAVA: 1,        // Cubo de lava (rojo) - daña al jugador
        ICE: 2,         // Cubo de hielo (azul claro) - sin fricción
        TRAMPOLINE: 3,  // Trampolín (amarillo) - salto extra
        SPIKE: 4,       // Púa (gris oscuro) - daña al jugador
        CLOUD: 5,       // Nube (blanco/gris) - inestable
        DIAMOND: 6      // Diamante (magenta) - bonus de puntos
    } as const;

    // Descripción de tipos
    static BLOCK_LABELS: { [key: number]: string } = {
        0: 'Normal',
        1: 'Lava',
        2: 'Hielo',
        3: 'Trampolín',
        4: 'Púa',
        5: 'Nube',
        6: 'Diamante'
    };

    // Colores para el editor
    static BLOCK_COLORS: { [key: number]: number } = {
        0: 0xffffff,    // Normal: blanco
        1: 0xff0000,    // Lava: rojo
        2: 0x00ffff,    // Hielo: cyan
        3: 0xffff00,    // Trampolín: amarillo
        4: 0x444444,    // Púa: gris oscuro
        5: 0xcccccc,    // Nube: gris claro
        6: 0xff00ff     // Diamante: magenta
    };

    /**
     * Serializa un nivel a JSON
     */
    static serializeLevel(levelData: LevelData): string {
        const level: SerializedLevel = {
            name: levelData.name || 'Untitled Level',
            description: levelData.description || '',
            rows: levelData.rows || 7,
            blocks: [],
            enemies: levelData.enemies || [],
            difficulty: levelData.difficulty || 'normal',
            timeCreated: new Date().toISOString(),
            version: 1
        };

        // Serializar bloques
        if (levelData.blocks) {
            for (const [key, blockType] of Object.entries(levelData.blocks)) {
                const [row, col] = key.split('_').map(Number);
                level.blocks.push({
                    row,
                    col,
                    type: blockType
                });
            }
        }

        return JSON.stringify(level, null, 2);
    }

    /**
     * Deserializa un nivel desde JSON
     */
    static deserializeLevel(jsonStr: string): LevelData | null {
        try {
            const level = JSON.parse(jsonStr) as SerializedLevel;

            // Validar estructura mínima
            if (!level.name || !level.rows || !Array.isArray(level.blocks)) {
                throw new Error('Invalid level format');
            }

            // Convertir array de bloques a diccionario
            const blocks: { [key: string]: number } = {};
            for (const block of level.blocks) {
                const key = `${block.row}_${block.col}`;
                blocks[key] = block.type ?? 0;
            }

            return {
                name: level.name,
                description: level.description || '',
                rows: level.rows,
                blocks,
                enemies: level.enemies || [],
                difficulty: level.difficulty || 'normal'
            };
        } catch (error) {
            console.error('Error deserializing level:', error);
            return null;
        }
    }

    /**
     * Exporta un nivel como string descargable
     */
    static exportLevel(levelData: LevelData): Blob {
        const json = this.serializeLevel(levelData);
        return new Blob([json], { type: 'application/json' });
    }

    /**
     * Importa un nivel desde un Blob
     */
    static importLevel(blob: Blob): Promise<LevelData> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result;
                if (typeof result === 'string') {
                    const level = this.deserializeLevel(result);
                    if (level) {
                        resolve(level);
                    } else {
                        reject(new Error('Invalid level file'));
                    }
                } else {
                    reject(new Error('Invalid file content'));
                }
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsText(blob);
        });
    }

    /**
     * Valida si un nivel es jugable
     */
    static validateLevel(levelData: LevelData): ValidationResult {
        const errors: string[] = [];

        if (!levelData.name || levelData.name.trim() === '') {
            errors.push('Level name is required');
        }

        if (!levelData.rows || levelData.rows < 3 || levelData.rows > 10) {
            errors.push('Rows must be between 3 and 10');
        }

        if (!levelData.blocks || Object.keys(levelData.blocks).length === 0) {
            errors.push('Level must have at least one block');
        }

        // Verificar que el bloque central (0,0) sea accesible
        const hasCenter = levelData.blocks['0_0'] !== undefined;
        if (!hasCenter) {
            errors.push('Level must have a starting block at (0,0)');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}

// Exportar tipos para facilitar acceso
export const BLOCK_TYPES = LevelFormat.BLOCK_TYPES;
export const BLOCK_LABELS = LevelFormat.BLOCK_LABELS;
export const BLOCK_COLORS = LevelFormat.BLOCK_COLORS;
