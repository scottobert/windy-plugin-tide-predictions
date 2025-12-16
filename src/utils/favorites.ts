const FAVORITES_STORAGE_KEY = 'windy-tide-favorites';

export const loadFavorites = (): string[] => {
    try {
        const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        // Swallow parsing errors; return empty
        return [];
    }
};

export const saveFavorites = (favorites: string[]): void => {
    try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
        // Ignore storage errors in this context
    }
};

export const toggleFavorite = (stationId: string, favorites: string[]): string[] => {
    const index = favorites.indexOf(stationId);
    if (index > -1) {
        return favorites.filter(id => id !== stationId);
    }
    return [...favorites, stationId];
};

export const isFavorite = (stationId: string, favorites: string[]): boolean => favorites.includes(stationId);
