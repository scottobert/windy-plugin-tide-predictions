import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Fetch tide stations from NOAA API for a bounding box
 */
export const fetchStationsInBounds = async (
  bounds: { north: number; south: number; east: number; west: number }
): Promise<any[]> => {
  try {
    const url = `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?` +
      `latlonBBox=${bounds.south},${bounds.west},${bounds.north},${bounds.east}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.stations || [];
  } catch (error) {
    console.error('Error fetching stations:', error);
    return [];
  }
};

/**
 * Fetch tide predictions for a station
 */
export const fetchTidePredictions = async (
  stationId: string,
  beginDate: string,
  endDate: string
): Promise<any[]> => {
  try {
    const url = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?` +
      `product=predictions&application=NOS.COOPS.TAC.WL&` +
      `begin_date=${beginDate}&end_date=${endDate}&` +
      `datum=MLLW&station=${stationId}&time_zone=lst_ldt&` +
      `units=english&interval=hilo&format=json`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.predictions || [];
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return [];
  }
};

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
