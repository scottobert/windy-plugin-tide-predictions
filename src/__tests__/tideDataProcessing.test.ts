import { describe, it, expect } from 'vitest';
import { getNextTides, getTideRange, parsePredictions, TideData } from '../utils/tides';

describe('Tide Data Processing', () => {
  describe('parsePredictions', () => {
    it('should parse valid NOAA predictions response', () => {
      const response = {
        predictions: [
          { t: '2025-12-15 08:00', v: '2.5', type: 'H' },
          { t: '2025-12-15 14:00', v: '-0.5', type: 'L' },
        ],
      };
      const result = parsePredictions(response);
      expect(result.length).toBe(2);
      expect(result[0]).toEqual({
        type: 'H',
        time: '2025-12-15 08:00',
        height: '2.5',
      });
    });

    it('should return empty array for invalid response', () => {
      expect(parsePredictions({})).toEqual([]);
      expect(parsePredictions({ predictions: null })).toEqual([]);
      expect(parsePredictions({ predictions: 'invalid' })).toEqual([]);
    });

    it('should preserve tide type (High/Low)', () => {
      const response = {
        predictions: [
          { t: '2025-12-15 08:00', v: '2.5', type: 'H' },
          { t: '2025-12-15 14:00', v: '-0.5', type: 'L' },
        ],
      };
      const result = parsePredictions(response);
      expect(result[0].type).toBe('H');
      expect(result[1].type).toBe('L');
    });
  });

  describe('getNextTides', () => {
    const now = new Date();
    const pastTime = new Date(now.getTime() - 1000 * 60 * 60).toISOString(); // 1 hour ago
    const futureTime1 = new Date(now.getTime() + 1000 * 60 * 60).toISOString(); // 1 hour from now
    const futureTime2 = new Date(now.getTime() + 2 * 1000 * 60 * 60).toISOString(); // 2 hours from now
    const futureTime3 = new Date(now.getTime() + 3 * 1000 * 60 * 60).toISOString(); // 3 hours from now
    const futureTime4 = new Date(now.getTime() + 4 * 1000 * 60 * 60).toISOString(); // 4 hours from now
    const futureTime5 = new Date(now.getTime() + 5 * 1000 * 60 * 60).toISOString(); // 5 hours from now

    const tideData: TideData[] = [
      { type: 'H', time: pastTime, height: '2.5' },
      { type: 'L', time: futureTime1, height: '-0.5' },
      { type: 'H', time: futureTime2, height: '2.8' },
      { type: 'L', time: futureTime3, height: '-0.3' },
      { type: 'H', time: futureTime4, height: '2.9' },
      { type: 'L', time: futureTime5, height: '0.0' },
    ];

    it('should filter out past tides', () => {
      const result = getNextTides(tideData);
      expect(result.length).toBe(4); // Default count
      expect(result.every(t => new Date(t.time) >= now)).toBe(true);
    });

    it('should return requested number of next tides', () => {
      const result = getNextTides(tideData, 2);
      expect(result.length).toBe(2);
    });

    it('should return empty array if no future tides', () => {
      const pastData: TideData[] = [
        { type: 'H', time: pastTime, height: '2.5' },
      ];
      const result = getNextTides(pastData);
      expect(result.length).toBe(0);
    });

    it('should return fewer tides than requested if not enough future tides', () => {
      const result = getNextTides(tideData, 10);
      expect(result.length).toBe(5);
    });
  });

  describe('getTideRange', () => {
    it('should calculate min and max tide heights', () => {
      const tideData: TideData[] = [
        { type: 'H', time: '2025-12-15 08:00', height: '2.5' },
        { type: 'L', time: '2025-12-15 14:00', height: '-0.5' },
        { type: 'H', time: '2025-12-15 20:00', height: '2.8' },
      ];
      const result = getTideRange(tideData);
      expect(result.min).toBe(-0.5);
      expect(result.max).toBe(2.8);
    });

    it('should handle empty tide data', () => {
      const result = getTideRange([]);
      expect(result).toEqual({ min: 0, max: 0 });
    });

    it('should handle single tide entry', () => {
      const tideData: TideData[] = [
        { type: 'H', time: '2025-12-15 08:00', height: '2.5' },
      ];
      const result = getTideRange(tideData);
      expect(result.min).toBe(2.5);
      expect(result.max).toBe(2.5);
    });

    it('should handle negative heights', () => {
      const tideData: TideData[] = [
        { type: 'L', time: '2025-12-15 08:00', height: '-1.5' },
        { type: 'L', time: '2025-12-15 14:00', height: '-2.0' },
      ];
      const result = getTideRange(tideData);
      expect(result.min).toBe(-2.0);
      expect(result.max).toBe(-1.5);
    });
  });
});
