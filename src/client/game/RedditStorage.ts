/**
 * RedditStorage.ts
 * Sistema de almacenamiento para niveles customizados
 * Funciona con localStorage (dev) y Devvit API (production)
 */

import type { LevelData } from './LevelFormat';

// Interface para comunicación con el servidor Devvit
interface DevvitAPI {
    saveLevel(levelData: LevelData): Promise<void>;
    getAllLevels(): Promise<LevelData[]>;
    getLevel(name: string): Promise<LevelData | null>;
    deleteLevel(name: string): Promise<void>;
}

// Modo de storage actual
let storageMode: 'devvit' | 'localStorage' = 'localStorage';
let devvitAPI: DevvitAPI | null = null;

/**
 * Clase principal de almacenamiento
 */
export class RedditStorage {
    private static readonly STORAGE_KEY = 'astrocat_custom_levels';
    private static readonly MAX_LEVELS = 50;

    /**
     * Inicializa con la API de Devvit
     */
    static setDevvitAPI(api: DevvitAPI): void {
        devvitAPI = api;
        storageMode = 'devvit';
        console.log('RedditStorage: Using Devvit API mode');
    }

    /**
     * Fuerza el uso de localStorage (para desarrollo)
     */
    static enableLocalStorage(): void {
        storageMode = 'localStorage';
        console.log('RedditStorage: Using localStorage mode');
    }

    /**
     * Guarda un nivel
     */
    static async saveLevel(levelData: LevelData): Promise<void> {
        if (storageMode === 'devvit' && devvitAPI) {
            return devvitAPI.saveLevel(levelData);
        }

        // Modo localStorage
        return this.saveLevelLocal(levelData);
    }

    /**
     * Obtiene todos los niveles
     */
    static async getAllLevels(): Promise<LevelData[]> {
        if (storageMode === 'devvit' && devvitAPI) {
            return devvitAPI.getAllLevels();
        }

        // Modo localStorage
        return this.getAllLevelsLocal();
    }

    /**
     * Obtiene un nivel por nombre
     */
    static async getLevel(name: string): Promise<LevelData | null> {
        if (storageMode === 'devvit' && devvitAPI) {
            return devvitAPI.getLevel(name);
        }

        // Modo localStorage
        return this.getLevelLocal(name);
    }

    /**
     * Elimina un nivel
     */
    static async deleteLevel(name: string): Promise<void> {
        if (storageMode === 'devvit' && devvitAPI) {
            return devvitAPI.deleteLevel(name);
        }

        // Modo localStorage
        return this.deleteLevelLocal(name);
    }

    /**
     * Guarda nivel en localStorage
     */
    private static saveLevelLocal(levelData: LevelData): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const levels = this.getAllLevelsLocalSync();

                // Buscar si ya existe
                const existingIndex = levels.findIndex(l => l.name === levelData.name);

                if (existingIndex >= 0) {
                    levels[existingIndex] = levelData;
                } else {
                    if (levels.length >= this.MAX_LEVELS) {
                        reject(new Error(`Cannot save more than ${this.MAX_LEVELS} levels`));
                        return;
                    }
                    levels.push(levelData);
                }

                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(levels));
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Obtiene todos los niveles de localStorage
     */
    private static getAllLevelsLocal(): Promise<LevelData[]> {
        return Promise.resolve(this.getAllLevelsLocalSync());
    }

    private static getAllLevelsLocalSync(): LevelData[] {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (!stored) return [];

            const parsed = JSON.parse(stored);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error('Error loading levels from localStorage:', error);
            return [];
        }
    }

    /**
     * Obtiene un nivel de localStorage
     */
    private static getLevelLocal(name: string): Promise<LevelData | null> {
        return new Promise((resolve) => {
            const levels = this.getAllLevelsLocalSync();
            const level = levels.find(l => l.name === name);
            resolve(level || null);
        });
    }

    /**
     * Elimina un nivel de localStorage
     */
    private static deleteLevelLocal(name: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const levels = this.getAllLevelsLocalSync();
                const filtered = levels.filter(l => l.name !== name);
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
}

/**
 * Clase de compatibilidad con código legacy
 */
export class LevelStorage {
    static async saveLevel(levelData: LevelData): Promise<void> {
        return RedditStorage.saveLevel(levelData);
    }

    static async getAllLevels(): Promise<LevelData[]> {
        return RedditStorage.getAllLevels();
    }

    static async getLevel(name: string): Promise<LevelData | null> {
        return RedditStorage.getLevel(name);
    }

    static async deleteLevel(name: string): Promise<void> {
        return RedditStorage.deleteLevel(name);
    }

    static async getStatistics() {
        const levels = await RedditStorage.getAllLevels();
        return {
            totalLevels: levels.length,
            levels: levels.map(level => ({
                name: level.name,
                rows: level.rows,
                blocks: Object.keys(level.blocks).length,
                difficulty: level.difficulty || 'normal'
            }))
        };
    }
}
