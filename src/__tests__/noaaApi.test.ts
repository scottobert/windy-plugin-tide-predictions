import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchStationsInBounds, fetchTidePredictions } from '../utils/noaaApi';

describe('NOAA API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchStationsInBounds', () => {
    it('should construct correct URL with bounds', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ stations: [] }),
      } as Response);

      const bounds = { north: 42.0, south: 40.0, east: -70.0, west: -72.0 };
      await fetchStationsInBounds(bounds);

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('40,-72,42,-70')
      );
    });

    it('should return stations from response', async () => {
      const mockStations = [
        { id: '1', name: 'Station A' },
        { id: '2', name: 'Station B' },
      ];

      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ stations: mockStations }),
      } as Response);

      const result = await fetchStationsInBounds({
        north: 42.0,
        south: 40.0,
        east: -70.0,
        west: -72.0,
      });

      expect(result).toEqual(mockStations);
    });

    it('should return empty array on API error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      const result = await fetchStationsInBounds({
        north: 42.0,
        south: 40.0,
        east: -70.0,
        west: -72.0,
      });

      expect(result).toEqual([]);
    });

    it('should return empty array on network error', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(
        new Error('Network error')
      );

      const result = await fetchStationsInBounds({
        north: 42.0,
        south: 40.0,
        east: -70.0,
        west: -72.0,
      });

      expect(result).toEqual([]);
    });
  });

  describe('fetchTidePredictions', () => {
    it('should construct correct prediction URL', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ predictions: [] }),
      } as Response);

      await fetchTidePredictions('8454000', '20251215', '20251220');

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('station=8454000')
      );
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('begin_date=20251215')
      );
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('end_date=20251220')
      );
    });

    it('should return predictions from response', async () => {
      const mockPredictions = [
        { t: '2025-12-15 08:00', v: '2.5', type: 'H' },
        { t: '2025-12-15 14:00', v: '-0.5', type: 'L' },
      ];

      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ predictions: mockPredictions }),
      } as Response);

      const result = await fetchTidePredictions('8454000', '20251215', '20251220');

      expect(result).toEqual(mockPredictions);
    });

    it('should return empty array on API error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      const result = await fetchTidePredictions('invalid', '20251215', '20251220');

      expect(result).toEqual([]);
    });
  });
});
