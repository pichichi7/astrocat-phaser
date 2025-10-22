/**
 * LevelStorage.js
 * Gestiona el almacenamiento de niveles en localStorage
 */

import { LevelFormat } from './LevelFormat.js';

export class LevelStorage {
    static STORAGE_KEY = 'astrocat_levels';
    static MAX_LEVELS = 50;

    /**
     * Guarda un nivel en localStorage
     * @param {Object} levelData - Datos del nivel
     * @returns {boolean} true si se guardó exitosamente
     */
    static saveLevel(levelData) {
        try {
            const validation = LevelFormat.validateLevel(levelData);
            if (!validation.valid) {
                console.error('Level validation failed:', validation.errors);
                return false;
            }

            const levels = this.getAllLevels();
            const existingIndex = levels.findIndex(l => l.name === levelData.name);

            if (existingIndex >= 0) {
                // Actualizar nivel existente
                levels[existingIndex] = {
                    ...levelData,
                    timeModified: new Date().toISOString()
                };
            } else {
                // Crear nuevo nivel
                if (levels.length >= this.MAX_LEVELS) {
                    console.warn('Maximum levels reached');
                    return false;
                }
                levels.push({
                    ...levelData,
                    timeCreated: new Date().toISOString(),
                    timeModified: new Date().toISOString()
                });
            }

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(levels));
            return true;
        } catch (error) {
            console.error('Error saving level:', error);
            return false;
        }
    }

    /**
     * Carga un nivel específico
     * @param {string} levelName - Nombre del nivel
     * @returns {Object|null} Datos del nivel o null
     */
    static loadLevel(levelName) {
        try {
            const levels = this.getAllLevels();
            return levels.find(l => l.name === levelName) || null;
        } catch (error) {
            console.error('Error loading level:', error);
            return null;
        }
    }

    /**
     * Obtiene todos los niveles guardados
     * @returns {Array} Array de niveles
     */
    static getAllLevels() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error getting all levels:', error);
            return [];
        }
    }

    /**
     * Elimina un nivel
     * @param {string} levelName - Nombre del nivel
     * @returns {boolean} true si se eliminó exitosamente
     */
    static deleteLevel(levelName) {
        try {
            const levels = this.getAllLevels();
            const filtered = levels.filter(l => l.name !== levelName);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
            return true;
        } catch (error) {
            console.error('Error deleting level:', error);
            return false;
        }
    }

    /**
     * Limpia todos los niveles
     * @returns {boolean} true si se limpió exitosamente
     */
    static clearAllLevels() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            return true;
        } catch (error) {
            console.error('Error clearing levels:', error);
            return false;
        }
    }

    /**
     * Obtiene estadísticas de niveles
     * @returns {Object} Estadísticas
     */
    static getStatistics() {
        const levels = this.getAllLevels();
        return {
            totalLevels: levels.length,
            maxLevels: this.MAX_LEVELS,
            slotsAvailable: this.MAX_LEVELS - levels.length,
            levels: levels.map(l => ({
                name: l.name,
                rows: l.rows,
                blocks: Object.keys(l.blocks || {}).length,
                difficulty: l.difficulty,
                timeModified: l.timeModified
            }))
        };
    }
}
