import type { ExternalPluginConfig } from '@windy/interfaces';

const config: ExternalPluginConfig = {
    name: 'windy-plugin-tide-predictions',
    version: '0.1.0',
    icon: '🌊',
    title: 'NOAA Tides & Conditions',
    description: 'NOAA tide predictions with next highs/lows plus current water level, water/air temperature, currents, and wind.',
    author: 'Scott Obert',
    repository: 'https://github.com/scottobert/windy-plugin-tide-predictions',
    desktopUI: 'rhpane',
    mobileUI: 'small',
    desktopWidth: 300,
    routerPath: '/tide-predictions',
    private: false,
};

export default config;
