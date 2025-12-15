<div class="plugin__mobile-header">
    { title }
</div>
<section class="plugin__content">
    <div
        class="plugin__title plugin__title--chevron-back"
        on:click={ () => bcast.emit('rqstOpen', 'menu') }
    >
    { title }
    </div>

    <div class="plugin__info size-s mb-20">
        Click a tide station marker on the map to view predictions.
    </div>

    <div class="mb-20">
        <button 
            class="button button--variant-orange size-s" 
            on:click={loadStationsInView}
            disabled={loadingStations}
        >
            {loadingStations ? 'Loading...' : 'Load Stations in View'}
        </button>
        
        <div class="mt-10">
            <label class="checkbox-label size-xs">
                <input 
                    type="checkbox" 
                    bind:checked={autoRefresh}
                    on:change={handleAutoRefreshToggle}
                />
                Auto-refresh on map move
            </label>
        </div>

        <div class="mt-10">
            <div class="size-xs mb-5">Station Type Filter: <span style="font-size: 10px; color: #999;">(⭐ = default)</span></div>
            <div class="filter-buttons">
                <button 
                    class="filter-btn size-xs {stationFilter === 'all' ? 'active' : ''}"
                    on:click={() => applyStationFilter('all')}
                    on:contextmenu|preventDefault={() => { applyStationFilter('all'); saveDefaultFilter(); }}
                    title="Right-click to set as default"
                >
                    All ({allStations.length}) {defaultFilter === 'all' ? '⭐' : ''}
                </button>
                <button 
                    class="filter-btn size-xs {stationFilter === 'primary' ? 'active' : ''}"
                    on:click={() => applyStationFilter('primary')}
                    on:contextmenu|preventDefault={() => { applyStationFilter('primary'); saveDefaultFilter(); }}
                    title="Right-click to set as default"
                >
                    Primary ({allStations.filter(s => s.stationType === 'R').length}) {defaultFilter === 'primary' ? '⭐' : ''}
                </button>
                <button
                    class="filter-btn size-xs {stationFilter === 'subordinate' ? 'active' : ''}"
                    on:click={() => applyStationFilter('subordinate')}
                    on:contextmenu|preventDefault={() => { applyStationFilter('subordinate'); saveDefaultFilter(); }}
                    title="Right-click to set as default"
                >
                    Subordinate ({allStations.filter(s => s.stationType === 'S').length}) {defaultFilter === 'subordinate' ? '⭐' : ''}
                </button>
                <button
                    class="filter-btn size-xs {stationFilter === 'favorites' ? 'active' : ''}"
                    on:click={() => applyStationFilter('favorites')}
                    on:contextmenu|preventDefault={() => { applyStationFilter('favorites'); saveDefaultFilter(); }}
                    title="Right-click to set as default"
                >
                    ⭐ Favorites ({favoriteStations.length}) {defaultFilter === 'favorites' ? '⭐' : ''}
                </button>
            </div>
        </div>

        {#if stationCount > 0}
            <div class="size-xs mt-5">
                Showing {stationCount} station{stationCount !== 1 ? 's' : ''}
            </div>
        {/if}
    </div>

    {#if loading}
        <div class="centered mt-30">
            <div class="size-l">Loading tide data...</div>
        </div>
    {:else if selectedStation}
        <div class="tide-station mb-20">
            <div class="tide-station__name size-l mb-10">
                {selectedStation.name}
            </div>
            <div class="tide-station__id size-xs mb-10">
                Station ID: {selectedStation.id}
                {#if selectedStation.stationType}
                    <span class="station-type-badge">
                        {selectedStation.stationType === 'R' ? '🔷 Primary' : '🔹 Subordinate'}
                    </span>
                {/if}
                <button 
                    class="favorite-btn size-xs"
                    on:click={() => toggleFavorite(selectedStation.id)}
                    title={isFavorite(selectedStation.id) ? 'Remove from favorites' : 'Add to favorites'}
                    key={selectedStation.id}
                >
                    {isFavorite(selectedStation.id) ? '⭐ Favorited' : '☆ Add to Favorites'}
                </button>
            </div>
            
            {#if stationMetadata}
                <div class="station-metadata mt-10">
                    {#if stationMetadata.state}
                        <div class="metadata-item size-xs">
                            📍 <strong>Location:</strong> {stationMetadata.state}
                        </div>
                    {/if}
                    {#if stationMetadata.timezone}
                        <div class="metadata-item size-xs">
                            🕐 <strong>Timezone:</strong> {stationMetadata.timezone}
                        </div>
                    {/if}
                    {#if stationMetadata.established}
                        <div class="metadata-item size-xs">
                            📅 <strong>Established:</strong> {stationMetadata.established}
                        </div>
                    {/if}
                    {#if stationMetadata.mean_tide_level}
                        <div class="metadata-item size-xs">
                            📊 <strong>Mean Tide:</strong> {stationMetadata.mean_tide_level} ft
                        </div>
                    {/if}
                    {#if stationMetadata.forecast === 'true'}
                        <div class="metadata-item size-xs">
                            ✅ <strong>Forecast Available</strong>
                        </div>
                    {/if}
                    {#if stationMetadata.stormsurge === 'true'}
                        <div class="metadata-item size-xs">
                            🌊 <strong>Storm Surge Data</strong>
                        </div>
                    {/if}
                </div>
            {/if}
        </div>

        <TideChart stationId={selectedStation.id} stationName={selectedStation.name} />

        {#if tideData.length > 0}
            <div class="tide-predictions">
                <div class="size-m mb-10 fg-orange">Upcoming Tides</div>
                {#each tideData as tide}
                    <div class="tide-entry mb-15">
                        <div class="tide-entry__type size-s">
                            {tide.type === 'H' ? '🔼 High Tide' : '🔽 Low Tide'}
                        </div>
                        <div class="tide-entry__time size-xs">
                            {formatTime(tide.time)}
                        </div>
                        <div class="tide-entry__height size-s">
                            Height: {tide.height} ft
                        </div>
                    </div>
                {/each}
            </div>
        {:else}
            <div class="size-s fg-red">
                No tide data available for this station.
            </div>
        {/if}
    {:else}
        <div class="centered mt-30 size-s fg-grey">
            No station selected
        </div>
    {/if}
</section>

<script lang="ts">
    import bcast from "@windy/broadcast";
    import { map } from '@windy/map';
    import { onDestroy, onMount } from 'svelte';
    import config from './pluginConfig';
    import TideChart from './TideChart.svelte';

    const { title } = config;

    interface TideStation {
        id: string;
        name: string;
        lat: number;
        lon: number;
        stationType?: string;
    }

    interface StationMetadata {
        state?: string;
        timezone?: string;
        timezonecorr?: string;
        observedst?: string;
        stormsurge?: string;
        nearby?: string;
        forecast?: string;
        overlays?: string;
        mean_tide_level?: string;
        established?: string;
    }

    interface CurrentConditions {
        waterLevel?: string;
        waterLevelTime?: string;
        waterTemp?: string;
        waterTempTime?: string;
        airTemp?: string;
        airTempTime?: string;
        currentSpeed?: string;
        currentDirection?: string;
        currentTime?: string;
        windSpeed?: string;
        windDirection?: string;
        windTime?: string;
    }

    interface TidePrediction {
        time: string;
        height: string;
        type: 'H' | 'L';
    }

    interface NOAAStationResponse {
        stations: Array<{
            id: string;
            name: string;
            lat: string;
            lng: string;
            type?: string;
        }>;
    }

    type StationFilter = 'all' | 'primary' | 'subordinate' | 'favorites';

    let markers: L.Marker[] = [];
    let selectedStation: TideStation | null = null;
    let stationMetadata: StationMetadata | null = null;
    let currentConditions: CurrentConditions | null = null;
    let tideData: TidePrediction[] = [];
    let nextHighTide: TidePrediction | null = null;
    let nextLowTide: TidePrediction | null = null;
    let loading = false;
    let loadingStations = false;
    let stationCount = 0;
    let openedPopup: L.Popup | null = null;
    let autoRefresh = true;
    let refreshTimeout: ReturnType<typeof setTimeout> | null = null;
    let stationFilter: StationFilter = 'all';
    let allStations: TideStation[] = [];
    let favoriteStations: string[] = [];
    let defaultFilter: StationFilter = 'all';

    const FAVORITES_STORAGE_KEY = 'windy-tide-favorites';
    const DEFAULT_FILTER_STORAGE_KEY = 'windy-tide-default-filter';

    const formatTime = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const loadFavorites = () => {
        try {
            const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
            if (stored) {
                favoriteStations = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
            favoriteStations = [];
        }
    };

    const loadDefaultFilter = () => {
        try {
            const stored = localStorage.getItem(DEFAULT_FILTER_STORAGE_KEY);
            if (stored) {
                defaultFilter = stored as StationFilter;
            }
        } catch (error) {
            console.error('Error loading default filter:', error);
            defaultFilter = 'all';
        }
    };

    const saveDefaultFilter = () => {
        try {
            localStorage.setItem(DEFAULT_FILTER_STORAGE_KEY, stationFilter);
            defaultFilter = stationFilter;
        } catch (error) {
            console.error('Error saving default filter:', error);
        }
    };

    const saveFavorites = () => {
        try {
            localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteStations));
        } catch (error) {
            console.error('Error saving favorites:', error);
        }
    };

    const updateStationMarker = (stationId: string) => {
        // Find the station
        const station = allStations.find(s => s.id === stationId);
        if (!station) return;
        
        // Find and update the marker for this station
        const markerIndex = markers.findIndex(m => {
            const ll = m.getLatLng();
            return ll.lat === station.lat && ll.lng === station.lon;
        });
        
        if (markerIndex !== -1) {
            // Remove old marker and create new one with updated icon
            markers[markerIndex].remove();
            const newMarker = createStationMarker(station);
            markers[markerIndex] = newMarker;
        }
    };

    const toggleFavorite = (stationId: string) => {
        if (favoriteStations.includes(stationId)) {
            favoriteStations = favoriteStations.filter(id => id !== stationId);
        } else {
            favoriteStations = [...favoriteStations, stationId];
        }
        
        // Force Svelte reactivity for both arrays
        favoriteStations = favoriteStations;
        if (selectedStation) {
            selectedStation = selectedStation;
        }
        
        saveFavorites();
        
        // Update marker icon immediately
        updateStationMarker(stationId);
        
        // Refresh markers if favorites filter is active
        if (stationFilter === 'favorites') {
            applyStationFilter('favorites');
        }
    };

    const isFavorite = (stationId: string): boolean => {
        return favoriteStations.includes(stationId);
    };

    const buildPopupContent = (stationName: string, conditions: CurrentConditions | null | undefined): string => {
        let html = `<div style="padding: 5px;"><strong style="color: #36a2eb; font-size: 14px;">${stationName}</strong>`;
        
        if (conditions && Object.keys(conditions).length > 0) {
            html += '<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.1);">';
            html += '<div style="font-weight: bold; margin-bottom: 5px; color: #ff9500;">📊 Current Conditions</div>';
            
            if (conditions.waterLevel) {
                html += `<div style="font-size: 12px; margin: 3px 0;">🌊 <strong>Water Level:</strong> ${conditions.waterLevel} ft`;
                if (conditions.waterLevelTime) {
                    html += ` <span style="color: #666; font-size: 10px;">(${conditions.waterLevelTime})</span>`;
                }
                html += '</div>';
            }
            
            if (conditions.waterTemp) {
                html += `<div style="font-size: 12px; margin: 3px 0;">🌡️ <strong>Water Temp:</strong> ${conditions.waterTemp}°F`;
                if (conditions.waterTempTime) {
                    html += ` <span style="color: #666; font-size: 10px;">(${conditions.waterTempTime})</span>`;
                }
                html += '</div>';
            }
            
            if (conditions.airTemp) {
                html += `<div style="font-size: 12px; margin: 3px 0;">🌤️ <strong>Air Temp:</strong> ${conditions.airTemp}°F`;
                if (conditions.airTempTime) {
                    html += ` <span style="color: #666; font-size: 10px;">(${conditions.airTempTime})</span>`;
                }
                html += '</div>';
            }
            
            if (conditions.currentSpeed) {
                html += `<div style="font-size: 12px; margin: 3px 0;">🌀 <strong>Current:</strong> ${conditions.currentSpeed} kt`;
                if (conditions.currentDirection) {
                    html += ` from ${conditions.currentDirection}°`;
                }
                if (conditions.currentTime) {
                    html += ` <span style="color: #666; font-size: 10px;">(${conditions.currentTime})</span>`;
                }
                html += '</div>';
            }
            
            if (conditions.windSpeed) {
                html += `<div style="font-size: 12px; margin: 3px 0;">💨 <strong>Wind:</strong> ${conditions.windSpeed} kt`;
                if (conditions.windDirection) {
                    html += ` from ${conditions.windDirection}°`;
                }
                if (conditions.windTime) {
                    html += ` <span style="color: #666; font-size: 10px;">(${conditions.windTime})</span>`;
                }
                html += '</div>';
            }
            
            html += '</div>';
        } else if (conditions === null) {
            html += '<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.1);">';
            html += '<div style="font-size: 11px; color: #999; font-style: italic;">⚠️ Current conditions unavailable for this station</div>';
            html += '</div>';
        } else {
            html += '<div style="margin-top: 5px; font-size: 11px; color: #666;">Loading conditions...</div>';
        }
        
        // Add next tides
        if (nextHighTide || nextLowTide) {
            html += '<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.1);">';
            html += '<div style="font-weight: bold; margin-bottom: 5px; color: #36a2eb;">⏭️ Next Tides</div>';
            
            if (nextHighTide) {
                html += `<div style="font-size: 12px; margin: 3px 0;">🔼 <strong>High:</strong> ${nextHighTide.height} ft at ${formatTime(nextHighTide.time)}</div>`;
            }
            
            if (nextLowTide) {
                html += `<div style="font-size: 12px; margin: 3px 0;">🔽 <strong>Low:</strong> ${nextLowTide.height} ft at ${formatTime(nextLowTide.time)}</div>`;
            }
            
            html += '</div>';
        }
        
        html += '</div>';
        return html;
    };

    const updatePopupContent = () => {
        if (openedPopup && selectedStation) {
            openedPopup.setContent(buildPopupContent(selectedStation.name, currentConditions));
        }
    };

    const findNextTides = () => {
        const now = new Date();
        nextHighTide = null;
        nextLowTide = null;
        
        for (const tide of tideData) {
            const tideTime = new Date(tide.time);
            if (tideTime > now) {
                if (tide.type === 'H' && !nextHighTide) {
                    nextHighTide = tide;
                }
                if (tide.type === 'L' && !nextLowTide) {
                    nextLowTide = tide;
                }
                
                if (nextHighTide && nextLowTide) {
                    break;
                }
            }
        }
    };

    const fetchStationMetadata = async (stationId: string) => {
        try {
            const url = `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/${stationId}.json`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.stations && data.stations.length > 0) {
                const station = data.stations[0];
                stationMetadata = {
                    state: station.state,
                    timezone: station.timezone,
                    timezonecorr: station.timezonecorr,
                    observedst: station.observedst,
                    stormsurge: station.stormsurge,
                    nearby: station.nearby,
                    forecast: station.forecast,
                    overlays: station.overlays,
                    mean_tide_level: station.tidal_constituents?.mean_tide_level,
                    established: station.details?.established
                };
            }
        } catch (error) {
            console.error('Error fetching station metadata:', error);
            stationMetadata = null;
        }
    };

    const fetchCurrentConditions = async (stationId: string) => {
        try {
            // Use range parameter to get last 24 hours of data with GMT time zone
            // This is more reliable than begin_date/end_date with local time
            
            // Fetch water level
            const waterLevelUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?` +
                `product=water_level&application=NOS.COOPS.TAC.WL&` +
                `date=latest&` +
                `datum=MLLW&station=${stationId}&time_zone=gmt&` +
                `units=english&format=json`;

            // Fetch water temperature
            const waterTempUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?` +
                `product=water_temperature&application=NOS.COOPS.TAC.WL&` +
                `date=latest&` +
                `station=${stationId}&time_zone=gmt&` +
                `units=english&format=json`;

            // Fetch air temperature
            const airTempUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?` +
                `product=air_temperature&application=NOS.COOPS.TAC.WL&` +
                `date=latest&` +
                `station=${stationId}&time_zone=gmt&` +
                `units=english&format=json`;

            // Fetch water currents
            const currentsUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?` +
                `product=currents&application=NOS.COOPS.TAC.WL&` +
                `date=latest&` +
                `station=${stationId}&time_zone=gmt&` +
                `units=english&format=json`;

            // Fetch wind
            const windUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?` +
                `product=wind&application=NOS.COOPS.TAC.WL&` +
                `date=latest&` +
                `station=${stationId}&time_zone=gmt&` +
                `units=english&format=json`;

            const [waterLevelRes, waterTempRes, airTempRes, currentsRes, windRes] = await Promise.all([
                fetch(waterLevelUrl).catch(err => {
                    console.error('Water level fetch error:', err);
                    return null;
                }),
                fetch(waterTempUrl).catch(err => {
                    console.error('Water temp fetch error:', err);
                    return null;
                }),
                fetch(airTempUrl).catch(err => {
                    console.error('Air temp fetch error:', err);
                    return null;
                }),
                fetch(currentsUrl).catch(err => {
                    console.error('Currents fetch error:', err);
                    return null;
                }),
                fetch(windUrl).catch(err => {
                    console.error('Wind fetch error:', err);
                    return null;
                })
            ]);

            console.log('Current conditions API responses:', {
                waterLevel: waterLevelRes?.status,
                waterTemp: waterTempRes?.status,
                airTemp: airTempRes?.status,
                currents: currentsRes?.status,
                wind: windRes?.status
            });

            const conditions: CurrentConditions = {};

            // Parse water level
            if (waterLevelRes && waterLevelRes.ok) {
                const waterLevelData = await waterLevelRes.json();
                console.log('Water level data:', waterLevelData);
                if (!waterLevelData.error && waterLevelData.data && waterLevelData.data.length > 0) {
                    const latest = waterLevelData.data[waterLevelData.data.length - 1];
                    conditions.waterLevel = parseFloat(latest.v).toFixed(2);
                    // Parse GMT time and convert to local for display
                    const gmtTime = new Date(latest.t + ' GMT');
                    conditions.waterLevelTime = gmtTime.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                    });
                }
            }

            // Parse water temperature
            if (waterTempRes && waterTempRes.ok) {
                const waterTempData = await waterTempRes.json();
                console.log('Water temp data:', waterTempData);
                if (!waterTempData.error && waterTempData.data && waterTempData.data.length > 0) {
                    const latest = waterTempData.data[waterTempData.data.length - 1];
                    conditions.waterTemp = parseFloat(latest.v).toFixed(1);
                    const gmtTime = new Date(latest.t + ' GMT');
                    conditions.waterTempTime = gmtTime.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                    });
                }
            }

            // Parse air temperature
            if (airTempRes && airTempRes.ok) {
                const airTempData = await airTempRes.json();
                console.log('Air temp data:', airTempData);
                if (!airTempData.error && airTempData.data && airTempData.data.length > 0) {
                    const latest = airTempData.data[airTempData.data.length - 1];
                    conditions.airTemp = parseFloat(latest.v).toFixed(1);
                    const gmtTime = new Date(latest.t + ' GMT');
                    conditions.airTempTime = gmtTime.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                    });
                }
            }

            // Parse water currents
            if (currentsRes && currentsRes.ok) {
                const currentsData = await currentsRes.json();
                console.log('Currents data:', currentsData);
                if (!currentsData.error && currentsData.data && currentsData.data.length > 0) {
                    const latest = currentsData.data[currentsData.data.length - 1];
                    conditions.currentSpeed = parseFloat(latest.s).toFixed(2);
                    conditions.currentDirection = parseFloat(latest.d).toFixed(0);
                    const gmtTime = new Date(latest.t + ' GMT');
                    conditions.currentTime = gmtTime.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                    });
                }
            }

            // Parse wind
            if (windRes && windRes.ok) {
                const windData = await windRes.json();
                console.log('Wind data:', windData);
                if (!windData.error && windData.data && windData.data.length > 0) {
                    const latest = windData.data[windData.data.length - 1];
                    conditions.windSpeed = parseFloat(latest.s).toFixed(2);
                    conditions.windDirection = parseFloat(latest.d).toFixed(0);
                    const gmtTime = new Date(latest.t + ' GMT');
                    conditions.windTime = gmtTime.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                    });
                }
            }

            console.log('Final conditions object:', conditions);
            currentConditions = Object.keys(conditions).length > 0 ? conditions : null;
            console.log('currentConditions set to:', currentConditions);
            
            // Update popup with current conditions
            updatePopupContent();
        } catch (error) {
            console.error('Error fetching current conditions:', error);
            currentConditions = null;
            updatePopupContent();
        }
    };

    const fetchTideData = async (stationId: string) => {
        loading = true;
        tideData = [];
        stationMetadata = null;
        currentConditions = null;

        try {
            const today = new Date();
            const endDate = new Date(today);
            endDate.setDate(endDate.getDate() + 2);

            const beginDate = today.toISOString().split('T')[0].replace(/-/g, '');
            const end = endDate.toISOString().split('T')[0].replace(/-/g, '');

            const tideUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?` +
                `product=predictions&application=NOS.COOPS.TAC.WL&` +
                `begin_date=${beginDate}&end_date=${end}&` +
                `datum=MLLW&station=${stationId}&time_zone=lst_ldt&` +
                `units=english&interval=hilo&format=json`;

            const [tideResponse] = await Promise.all([
                fetch(tideUrl),
                fetchStationMetadata(stationId),
                fetchCurrentConditions(stationId)
            ]);

            const tideDataJson = await tideResponse.json();

            if (tideDataJson.predictions) {
                tideData = tideDataJson.predictions.map((p: any) => ({
                    time: p.t,
                    height: parseFloat(p.v).toFixed(2),
                    type: p.type
                }));
                
                // Find next upcoming tides and update popup
                findNextTides();
                updatePopupContent();
            }
        } catch (error) {
            console.error('Error fetching tide data:', error);
        } finally {
            loading = false;
        }
    };

    const createStationMarker = (station: TideStation) => {
        const isFav = isFavorite(station.id);
        const markerHtml = isFav 
            ? '<div class="tide-marker-icon favorite">⭐</div>'
            : '<div class="tide-marker-icon">🌊</div>';
        
        const icon = L.divIcon({
            className: 'tide-station-marker',
            html: markerHtml,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        const marker = L.marker([station.lat, station.lon], { icon, zIndexOffset: 1000 })
            .addTo(map)
            .on('click', () => {
                selectedStation = station;
                
                openedPopup?.remove();
                openedPopup = new L.Popup({ autoClose: false, closeOnClick: false, minWidth: 250 })
                    .setLatLng([station.lat, station.lon])
                    .setContent(buildPopupContent(station.name, undefined))
                    .openOn(map);
                
                fetchTideData(station.id);
            });

        return marker;
    };

    const clearMarkers = () => {
        markers.forEach(marker => marker.remove());
        markers = [];
        stationCount = 0;
    };

    const loadStationsInView = async () => {
        loadingStations = true;
        clearMarkers();

        try {
            const bounds = map.getBounds();
            const north = bounds.getNorth();
            const south = bounds.getSouth();
            const east = bounds.getEast();
            const west = bounds.getWest();

            const url = `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?` +
                `type=tidepredictions&units=english`;

            const response = await fetch(url);
            const data: NOAAStationResponse = await response.json();

            if (data.stations) {
                allStations = data.stations
                    .filter(station => {
                        const lat = parseFloat(station.lat);
                        const lon = parseFloat(station.lng);
                        return lat >= south && lat <= north && 
                               lon >= west && lon <= east;
                    })
                    .map(station => ({
                        id: station.id,
                        name: station.name,
                        lat: parseFloat(station.lat),
                        lon: parseFloat(station.lng),
                        stationType: station.type
                    }));

                applyStationFilter(stationFilter);
            }
        } catch (error) {
            console.error('Error loading stations:', error);
        } finally {
            loadingStations = false;
        }
    };

    const applyStationFilter = (filter: StationFilter) => {
        stationFilter = filter;
        clearMarkers();

        let filteredStations = allStations;

        if (filter === 'primary') {
            filteredStations = allStations.filter(s => s.stationType === 'R');
        } else if (filter === 'subordinate') {
            filteredStations = allStations.filter(s => s.stationType === 'S');
        } else if (filter === 'favorites') {
            filteredStations = allStations.filter(s => favoriteStations.includes(s.id));
        }

        markers = filteredStations.map(station => createStationMarker(station));
        stationCount = markers.length;
    };

    const onMapMoveEnd = () => {
        if (!autoRefresh) return;

        // Debounce the refresh to avoid too many API calls
        if (refreshTimeout) {
            clearTimeout(refreshTimeout);
        }

        refreshTimeout = setTimeout(() => {
            loadStationsInView();
        }, 500); // Wait 500ms after map stops moving
    };

    const handleAutoRefreshToggle = () => {
        if (autoRefresh) {
            map.on('moveend', onMapMoveEnd);
        } else {
            map.off('moveend', onMapMoveEnd);
        }
    };

    export const onopen = (_params: unknown) => {
        // Plugin opened
    };

    onMount(() => {
        loadFavorites();
        loadDefaultFilter();
        loadStationsInView();
        applyStationFilter(defaultFilter);
        
        // Set up auto-refresh listener
        if (autoRefresh) {
            map.on('moveend', onMapMoveEnd);
        }
    });

    onDestroy(() => {
        clearMarkers();
        openedPopup?.remove();
        
        // Clean up event listeners and timeouts
        map.off('moveend', onMapMoveEnd);
        if (refreshTimeout) {
            clearTimeout(refreshTimeout);
        }
    });
</script>

<style lang="less">
    .plugin__info {
        padding: 10px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
    }

    .tide-station {
        padding: 15px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        border-left: 3px solid #36a2eb;

        &__name {
            font-weight: bold;
            color: #36a2eb;
        }

        &__id {
            color: rgba(255, 255, 255, 0.6);
        }
    }

    .station-metadata {
        padding-top: 10px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .metadata-item {
        padding: 4px 0;
        color: rgba(255, 255, 255, 0.8);
        line-height: 1.6;

        strong {
            color: rgba(255, 255, 255, 0.9);
        }
    }

    .tide-predictions {
        max-height: 500px;
        overflow-y: auto;
    }

    .tide-entry {
        padding: 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
        border-left: 2px solid rgba(255, 165, 0, 0.5);

        &__type {
            font-weight: bold;
            margin-bottom: 4px;
        }

        &__time {
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 4px;
        }

        &__height {

    .current-conditions {
        padding: 10px;
        background: rgba(255, 165, 0, 0.1);
        border-radius: 4px;
        border-left: 3px solid #ff9500;
    }

    .condition-item {
        padding: 4px 0;
        color: rgba(255, 255, 255, 0.9);
        line-height: 1.6;

        strong {
            color: rgba(255, 255, 255, 1);
        }
    }

    .condition-time {
        color: rgba(255, 255, 255, 0.6);
        font-size: 10px;
        margin-left: 4px;
    }
            color: #36a2eb;
        }
    }

    :global(.tide-station-marker) {
        background: transparent;
        border: none;
    }

    :global(.tide-marker-icon) {
        font-size: 24px;
        text-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
        cursor: pointer;
        transition: transform 0.2s;

        &:hover {
            transform: scale(1.2);
        }

        &.favorite {
            font-size: 26px;
            animation: pulse 2s ease-in-out infinite;
        }
    }

    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.1);
        }
    }

    .centered {
        text-align: center;
    }

    .fg-orange {
        color: #ff9500;
    }

    .fg-grey {
        color: rgba(255, 255, 255, 0.5);
    }

    .fg-red {
        color: #ff6b6b;
    }

    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        user-select: none;

        input[type="checkbox"] {
            cursor: pointer;
        }
    }

    .filter-buttons {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }

    .filter-btn {
        padding: 6px 12px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
            background: rgba(255, 255, 255, 0.15);
            border-color: rgba(255, 255, 255, 0.3);
        }

        &.active {
            background: #36a2eb;
            border-color: #36a2eb;
            color: #fff;
            font-weight: bold;
        }

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    }

    .station-type-badge {
        display: inline-block;
        margin-left: 8px;
        padding: 2px 8px;
        background: rgba(54, 162, 235, 0.2);
        border-radius: 3px;
        font-size: 10px;
    }

    .favorite-btn {
        margin-left: 10px;
        padding: 4px 10px;
        background: rgba(255, 215, 0, 0.2);
        border: 1px solid rgba(255, 215, 0, 0.4);
        border-radius: 4px;
        color: #ffd700;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
            background: rgba(255, 215, 0, 0.3);
            border-color: rgba(255, 215, 0, 0.6);
            transform: scale(1.05);
        }

        &:active {
            transform: scale(0.95);
        }
    }
</style>

