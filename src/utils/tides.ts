export interface TideData {
    type: 'H' | 'L';
    time: string;
    height: string;
}

export const parsePredictions = (response: any): TideData[] => {
    if (!response.predictions || !Array.isArray(response.predictions)) {
        return [];
    }

    return response.predictions.map((p: any) => ({
        type: p.type as 'H' | 'L',
        time: p.t,
        height: p.v,
    }));
};

export const getNextTides = (
    tideData: TideData[],
    count: number = 4
): TideData[] => {
    const now = new Date();
    return tideData
        .filter(tide => new Date(tide.time) >= now)
        .slice(0, count);
};

export const getTideRange = (tideData: TideData[]): { min: number; max: number } => {
    if (tideData.length === 0) {
        return { min: 0, max: 0 };
    }

    const heights = tideData.map(t => parseFloat(t.height));
    return {
        min: Math.min(...heights),
        max: Math.max(...heights),
    };
};
