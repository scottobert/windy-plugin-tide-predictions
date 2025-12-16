import { describe, it, expect } from 'vitest';
import { filterStations, parseStationsResponse, TideStation } from '../utils/stations';

describe('Station Filtering', () => {
  const mockStations: TideStation[] = [
    { id: '1', name: 'Station A', lat: 40.0, lon: -70.0, stationType: 'R' },
    { id: '2', name: 'Station B', lat: 41.0, lon: -71.0, stationType: 'S' },
    { id: '3', name: 'Station C', lat: 42.0, lon: -72.0, stationType: 'R' },
    { id: '4', name: 'Station D', lat: 43.0, lon: -73.0, stationType: 'S' },
  ];

  describe('filterStations', () => {
    it('should return all stations when filter is "all"', () => {
      const result = filterStations(mockStations, 'all');
      expect(result).toEqual(mockStations);
      expect(result.length).toBe(4);
    });

    it('should filter only primary stations', () => {
      const result = filterStations(mockStations, 'primary');
      expect(result.length).toBe(2);
      expect(result.every(s => s.stationType === 'R')).toBe(true);
      expect(result[0].name).toBe('Station A');
      expect(result[1].name).toBe('Station C');
    });

    it('should filter only subordinate stations', () => {
      const result = filterStations(mockStations, 'subordinate');
      expect(result.length).toBe(2);
      expect(result.every(s => s.stationType === 'S')).toBe(true);
      expect(result[0].name).toBe('Station B');
      expect(result[1].name).toBe('Station D');
    });

    it('should filter only favorite stations', () => {
      const favorites = ['1', '3'];
      const result = filterStations(mockStations, 'favorites', favorites);
      expect(result.length).toBe(2);
      expect(result.every(s => favorites.includes(s.id))).toBe(true);
    });

    it('should return empty array if no favorites match', () => {
      const favorites = ['99', '100'];
      const result = filterStations(mockStations, 'favorites', favorites);
      expect(result.length).toBe(0);
    });
  });

  describe('parseStationsResponse', () => {
    it('should parse valid NOAA response', () => {
      const response = {
        stations: [
          { id: '8454000', name: 'Boston Harbor', lat: '42.3585', lng: '-71.0552', type: 'R' },
          { id: '8457435', name: 'Cape Cod', lat: '41.6946', lng: '-70.0008', type: 'S' },
        ],
      };
      const result = parseStationsResponse(response);
      expect(result.length).toBe(2);
      expect(result[0]).toEqual({
        id: '8454000',
        name: 'Boston Harbor',
        lat: 42.3585,
        lon: -71.0552,
        stationType: 'R',
      });
    });

    it('should return empty array for invalid response', () => {
      expect(parseStationsResponse({})).toEqual([]);
      expect(parseStationsResponse({ stations: null })).toEqual([]);
      expect(parseStationsResponse({ stations: 'not-array' })).toEqual([]);
    });

    it('should handle string coordinates', () => {
      const response = {
        stations: [
          { id: '123', name: 'Test', lat: '40.5', lng: '-70.5', type: 'R' },
        ],
      };
      const result = parseStationsResponse(response);
      expect(result[0].lat).toBe(40.5);
      expect(result[0].lon).toBe(-70.5);
    });
  });
});
