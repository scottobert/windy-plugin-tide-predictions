# Windy Plugin: NOAA Tides & Conditions

A Windy.com plugin that displays NOAA tide predictions and current water conditions for tide stations across the United States. View tide predictions, water levels, temperatures, currents, and wind conditions directly on the Windy map.

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=scottobert_windy-plugin-tide-predictions&metric=alert_status)](https://sonarcloud.io/dashboard?id=scottobert_windy-plugin-tide-predictions)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=scottobert_windy-plugin-tide-predictions&metric=coverage)](https://sonarcloud.io/dashboard?id=scottobert_windy-plugin-tide-predictions)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=scottobert_windy-plugin-tide-predictions&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=scottobert_windy-plugin-tide-predictions)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=scottobert_windy-plugin-tide-predictions&metric=security_rating)](https://sonarcloud.io/dashboard?id=scottobert_windy-plugin-tide-predictions)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=scottobert_windy-plugin-tide-predictions&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=scottobert_windy-plugin-tide-predictions)

## Features

- 🌊 **Tide Predictions**: View upcoming high and low tide times and heights
- 📊 **Interactive Charts**: Visual tide predictions with D3.js charts showing 3-day forecasts
- 📍 **Station Markers**: Display tide stations on the map with real-time filtering
- 🌡️ **Current Conditions**: Water level, water/air temperature, currents, and wind data when available
- ⭐ **Favorites**: Save frequently used stations for quick access
- 🔍 **Smart Filtering**: Filter by primary/subordinate stations or favorites
- 🔄 **Auto-refresh**: Optional automatic station loading when the map moves
- 📱 **Responsive**: Works on both desktop and mobile Windy apps

## Data Source

This plugin uses the [NOAA CO-OPS Tides & Currents API](https://tidesandcurrents.noaa.gov/api/) to fetch:
- Tide predictions (high/low times and heights)
- Hourly water level predictions
- Current water conditions
- Station metadata

All tide data is provided by NOAA and is free for public use.

## Installation & Usage

### For Users

1. Load the plugin on Windy.com:
   ```javascript
   W.loadPlugin('https://unpkg.com/windy-plugin-tide-predictions@0.1.0/dist/plugin.min.js')
   ```
2. Open the plugin from the Windy menu or navigate to `/tide-predictions`
3. Click "Load Stations in View" to display tide stations in the current map viewport
4. Click any station marker to view tide predictions and current conditions
5. Use filters to show only primary stations, subordinate stations, or favorites

### For Developers

#### Prerequisites

- Node.js (v14 or higher)
- npm

#### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/scottobert/windy-plugin-tide-predictions.git
   cd windy-plugin-tide-predictions
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm start
   ```

4. Open Windy Plugin DevTools:
   - Navigate to https://windy.com/dev
   - The plugin will hot-reload as you make changes

#### Building

- **Windows**: `npm run build:win`
- **macOS/Linux**: `npm run build`
- Output: `dist/plugin.min.js` plus `package.json`

#### Testing

Run the test suite:
```bash
npm test              # Run all tests
npm run test:ui       # Run with UI dashboard
npm run test:coverage # Generate coverage report
```

See [TESTING.md](TESTING.md) for testing documentation and [COVERAGE.md](COVERAGE.md) for coverage reporting.

## User Guide

### Loading Stations

1. Click the **"Load Stations in View"** button to fetch all tide stations visible in the current map viewport
2. Enable **"Auto-refresh on map move"** to automatically reload stations when panning/zooming
3. Station markers will appear on the map (🔷 for primary stations, 🔹 for subordinate stations)

### Filtering Stations

Four filter options are available:
- **All**: Shows all stations (primary and subordinate)
- **Primary**: Shows only primary stations with direct measurements
- **Subordinate**: Shows only subordinate stations (predictions based on nearby primary stations)
- **Favorites**: Shows only stations you've marked as favorites

**Tip**: Right-click any filter button to set it as your default filter (marked with ⭐)

### Viewing Tide Data

1. Click a station marker on the map
2. The plugin displays:
   - Station name and ID
   - Station type (Primary or Subordinate)
   - Location, timezone, and metadata
   - Interactive 3-day tide chart
   - Upcoming high and low tides
   - Current conditions (when available):
     - Water level
     - Water temperature
     - Air temperature
     - Current speed and direction
     - Wind speed and direction

### Managing Favorites

- Click **"☆ Add to Favorites"** next to any station to save it
- Favorited stations show **"⭐ Favorited"** and can be filtered using the Favorites filter
- Favorites are saved in your browser's local storage

## Plugin Configuration

Key configuration in [`pluginConfig.ts`](src/pluginConfig.ts):

```typescript
{
  name: 'windy-plugin-tide-predictions',
  icon: '🌊',
  title: 'NOAA Tides & Conditions',
  description: 'NOAA tide predictions with current conditions',
  desktopUI: 'rhpane',  // Right-hand panel on desktop
  mobileUI: 'small',     // Small panel on mobile
  desktopWidth: 300,     // Panel width in pixels
  routerPath: '/tide-predictions'
}
```

## Technical Details

### Stack

- **Framework**: Svelte 3
- **Charting**: D3.js v7
- **Build Tool**: Rollup
- **Language**: TypeScript
- **API**: NOAA CO-OPS Tides & Currents API

### Key Components

- [`plugin.svelte`](src/plugin.svelte): Main plugin interface, station loading, and filtering
- [`TideChart.svelte`](src/TideChart.svelte): D3.js-powered tide prediction chart
- [`pluginConfig.ts`](src/pluginConfig.ts): Plugin metadata and configuration

### API Endpoints Used

1. **Tide Stations**: `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json`
2. **Tide Predictions**: `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions`
3. **Station Metadata**: `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/{id}.json`
4. **Current Conditions**: `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=water_level|water_temperature|air_temperature|currents|wind`

## Publishing

### NPM Publishing

Recommended for public distribution via unpkg:

1. Build the plugin:
   ```bash
   npm run build        # macOS/Linux
   npm run build:win    # Windows
   ```

2. Login to npm:
   ```bash
   npm login
   ```

3. Publish to npm:
   ```bash
   npm publish --access public
   ```

4. Test the published plugin:
   ```javascript
   // In Windy.com DevTools console:
   W.loadPlugin('https://unpkg.com/windy-plugin-tide-predictions@0.1.0/dist/plugin.min.js')
   ```

### GitHub Release Workflow

This repository includes a GitHub Actions workflow for automated publishing:

1. **Setup**: Add `NPM_TOKEN` to your GitHub repository secrets
2. **Version**: Update version using npm:
   ```bash
   npm version patch    # For bug fixes (0.1.0 → 0.1.1)
   npm version minor    # For new features (0.1.0 → 0.2.0)
   npm version major    # For breaking changes (0.1.0 → 1.0.0)
   ```
3. **Push**: Push tags to trigger the workflow:
   ```bash
   git push && git push --tags
   ```
4. **Automated**: The GitHub Action will:
   - Build the plugin
   - Publish to npm
   - Upload build artifacts

### Manual Distribution

You can also distribute the plugin by hosting the built `dist/plugin.min.js` file on any web server and loading it via:
```javascript
W.loadPlugin('https://your-domain.com/path/to/plugin.min.js')
```

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

### Development Guidelines

1. Follow the existing code style (TypeScript + Svelte)
2. Test changes using the Windy Plugin DevTools
3. Update documentation for new features
4. Ensure the plugin builds without errors

## License

ISC License - see LICENSE file for details

## Credits

- **Author**: Scott Obert
- **Data Provider**: NOAA Center for Operational Oceanographic Products and Services (CO-OPS)
- **Platform**: Windy.com
- **Libraries**: Svelte, D3.js, Windy Plugin DevTools

## Support

- **Issues**: [GitHub Issues](https://github.com/scottobert/windy-plugin-tide-predictions/issues)
- **Repository**: [GitHub](https://github.com/scottobert/windy-plugin-tide-predictions)
- **NOAA API**: [Tides & Currents API Documentation](https://tidesandcurrents.noaa.gov/api/)

## Disclaimer

This plugin provides tide predictions and current conditions data from NOAA. Always consult official navigation charts and local authorities for maritime navigation and safety decisions. Tide predictions may not account for weather conditions, storm surge, or other factors that can affect actual water levels.

