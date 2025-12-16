export interface TideStation {
    id: string;
    name: string;
    lat: number;
    lon: number;
    stationType?: string;
}

export type StationFilter = 'all' | 'primary' | 'subordinate' | 'favorites';

export const filterStations = (
    stations: TideStation[],
    filterType: StationFilter,
    favorites: string[] = []
): TideStation[] => {
    switch (filterType) {
        case 'primary':
            return stations.filter(s => s.stationType === 'R');
        case 'subordinate':
            return stations.filter(s => s.stationType === 'S');
        case 'favorites':
            return stations.filter(s => favorites.includes(s.id));
        case 'all':
        default:
            return stations;
    }
};

export const parseStationsResponse = (response: any): TideStation[] => {
    if (!response.stations || !Array.isArray(response.stations)) {
        return [];
    }

    return response.stations.map((station: any) => ({
        id: station.id,
        name: station.name,
        lat: Number.parseFloat(station.lat),
        lon: Number.parseFloat(station.lng),
        stationType: station.type,
    }));
};
