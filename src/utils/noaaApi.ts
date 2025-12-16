export interface Bounds {
    north: number;
    south: number;
    east: number;
    west: number;
}

export const fetchStationsInBounds = async (
    bounds: Bounds
): Promise<any[]> => {
    try {
        const url = `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?latlonBBox=${bounds.south},${bounds.west},${bounds.north},${bounds.east}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.stations || [];
    } catch (error) {
        // Return empty on error to keep UI resilient
        console.error('Error fetching stations:', error);
        return [];
    }
};

export const fetchTidePredictions = async (
    stationId: string,
    beginDate: string,
    endDate: string
): Promise<any[]> => {
    try {
        const url = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=NOS.COOPS.TAC.WL&begin_date=${beginDate}&end_date=${endDate}&datum=MLLW&station=${stationId}&time_zone=lst_ldt&units=english&interval=hilo&format=json`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.predictions || [];
    } catch (error) {
        console.error('Error fetching tide predictions:', error);
        return [];
    }
};
