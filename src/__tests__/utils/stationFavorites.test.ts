import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const FAVORITES_STORAGE_KEY = 'windy-tide-favorites';
const DEFAULT_FILTER_STORAGE_KEY = 'windy-tide-default-filter';

/**
 * Load favorite stations from localStorage
 */
export const loadFavorites = (): string[] => {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading favorites:', error);
    return [];
  }
};

/**
 * Save favorite stations to localStorage
 */
export const saveFavorites = (favorites: string[]): void => {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Error saving favorites:', error);
  }
};

/**
 * Toggle a station in favorites
 */
export const toggleFavorite = (stationId: string, favorites: string[]): string[] => {
  const index = favorites.indexOf(stationId);
  if (index > -1) {
    return favorites.filter(id => id !== stationId);
  } else {
    return [...favorites, stationId];
  }
};

/**
 * Check if a station is in favorites
 */
export const isFavorite = (stationId: string, favorites: string[]): boolean => {
  return favorites.includes(stationId);
};

describe('Favorites Management', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('loadFavorites', () => {
    it('should return empty array when no favorites are stored', () => {
      const result = loadFavorites();
      expect(result).toEqual([]);
    });

    it('should return stored favorites', () => {
      const favorites = ['8454000', '8457435'];
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
      const result = loadFavorites();
      expect(result).toEqual(favorites);
    });

    it('should handle invalid JSON gracefully', () => {
      localStorage.setItem(FAVORITES_STORAGE_KEY, 'invalid json');
      const result = loadFavorites();
      expect(result).toEqual([]);
    });
  });

  describe('saveFavorites', () => {
    it('should save favorites to localStorage', () => {
      const favorites = ['8454000'];
      saveFavorites(favorites);
      const stored = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) || '[]');
      expect(stored).toEqual(favorites);
    });

    it('should overwrite existing favorites', () => {
      saveFavorites(['8454000']);
      saveFavorites(['8457435', '8459881']);
      const stored = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) || '[]');
      expect(stored).toEqual(['8457435', '8459881']);
    });
  });

  describe('toggleFavorite', () => {
    it('should add station to favorites if not present', () => {
      const favorites = ['8454000'];
      const result = toggleFavorite('8457435', favorites);
      expect(result).toEqual(['8454000', '8457435']);
      expect(result.length).toBe(2);
    });

    it('should remove station from favorites if present', () => {
      const favorites = ['8454000', '8457435'];
      const result = toggleFavorite('8454000', favorites);
      expect(result).toEqual(['8457435']);
      expect(result.length).toBe(1);
    });

    it('should handle empty favorites array', () => {
      const result = toggleFavorite('8454000', []);
      expect(result).toEqual(['8454000']);
    });
  });

  describe('isFavorite', () => {
    it('should return true if station is in favorites', () => {
      const favorites = ['8454000', '8457435'];
      expect(isFavorite('8454000', favorites)).toBe(true);
    });

    it('should return false if station is not in favorites', () => {
      const favorites = ['8454000'];
      expect(isFavorite('8457435', favorites)).toBe(false);
    });

    it('should return false for empty favorites', () => {
      expect(isFavorite('8454000', [])).toBe(false);
    });
  });
});
