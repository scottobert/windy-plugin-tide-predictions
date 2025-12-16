# Testing Guide for Windy Plugin: NOAA Tides & Conditions

This project uses **Vitest** for unit and integration testing. Vitest is a blazing-fast unit test framework powered by Vite and offers a Jest-compatible API.

## Quick Start

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm test -- --watch

# Run tests with UI dashboard
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Project Structure

```
src/
├── __tests__/                          # Test files mirror source structure
│   ├── utils/
│   │   ├── formatters.test.ts         # Time formatting utilities
│   │   └── stationFavorites.test.ts   # Favorite management logic
│   ├── noaaApi.test.ts                # NOAA API integration tests
│   ├── stationFiltering.test.ts       # Station filtering logic
│   └── tideDataProcessing.test.ts     # Tide data parsing & processing
├── plugin.svelte                       # Main plugin component
├── TideChart.svelte                    # Chart component
└── pluginConfig.ts                     # Plugin configuration
```

## Test Coverage

### Current Test Suites

#### 1. **Formatters** (`formatters.test.ts`)
Tests time formatting utilities used throughout the plugin.

- ✅ Format ISO date strings correctly
- ✅ Handle different date/month combinations
- ✅ Proper minute formatting with leading zeros

**Run:** `npm test -- formatters`

#### 2. **Station Favorites** (`stationFavorites.test.ts`)
Tests localStorage-based favorite station management.

- ✅ Load favorites from localStorage
- ✅ Save favorites to localStorage
- ✅ Toggle stations in/out of favorites
- ✅ Check if a station is favorited
- ✅ Handle localStorage errors gracefully

**Run:** `npm test -- stationFavorites`

#### 3. **Station Filtering** (`stationFiltering.test.ts`)
Tests station filtering logic (primary, subordinate, favorites).

- ✅ Filter by station type (primary/subordinate)
- ✅ Filter by favorites
- ✅ Parse NOAA API responses
- ✅ Handle invalid data gracefully

**Run:** `npm test -- stationFiltering`

#### 4. **Tide Data Processing** (`tideDataProcessing.test.ts`)
Tests tide data parsing and calculations.

- ✅ Parse NOAA tide predictions
- ✅ Get next upcoming tides
- ✅ Calculate tide height ranges
- ✅ Filter past tides

**Run:** `npm test -- tideDataProcessing`

#### 5. **NOAA API Integration** (`noaaApi.test.ts`)
Tests API calls and error handling.

- ✅ Fetch stations within bounding box
- ✅ Fetch tide predictions for a station
- ✅ Handle API errors gracefully
- ✅ Handle network errors

**Run:** `npm test -- noaaApi`

## Writing New Tests

### Test File Naming

Test files should be placed in `src/__tests__/` and follow the naming convention:
- `*.test.ts` - For unit tests
- `*.test.svelte` - For Svelte component tests (future)

### Test Structure

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  it('should do something specific', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = myFunction(input);

    // Assert
    expect(result).toBe('expected');
  });
});
```

### Common Assertions

```typescript
// Equality
expect(value).toBe(expectedValue);
expect(value).toEqual({ prop: 'value' });

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();

// Arrays
expect(array).toHaveLength(3);
expect(array).toContain(item);

// Objects
expect(obj).toHaveProperty('prop');

// Functions
expect(fn).toHaveBeenCalled();
expect(fn).toHaveBeenCalledWith(arg);

// Strings
expect(str).toContain('substring');
expect(str).toMatch(/regex/);

// Numbers
expect(num).toBeGreaterThan(5);
expect(num).toBeLessThan(10);
```

## Mocking

### Mock Fetch Calls

```typescript
import { vi } from 'vitest';

vi.spyOn(global, 'fetch').mockResolvedValueOnce({
  ok: true,
  json: async () => ({ /* data */ }),
} as Response);
```

### Mock localStorage

```typescript
beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});
```

## Coverage Reports

Generate a coverage report:

```bash
npm run test:coverage
```

This creates an HTML report in `coverage/` directory. Open `coverage/index.html` in your browser to view detailed coverage metrics.

**Coverage Goals:**
- Lines: > 80%
- Branches: > 75%
- Functions: > 80%
- Statements: > 80%

## Best Practices

1. **Test Behavior, Not Implementation**
   - Test what the function does, not how it does it
   - ❌ Don't: Test internal variable names
   - ✅ Do: Test the output given certain inputs

2. **Use Descriptive Test Names**
   ```typescript
   ✅ it('should return empty array when no favorites are stored')
   ❌ it('works')
   ```

3. **Keep Tests Isolated**
   - Each test should be independent
   - Use `beforeEach`/`afterEach` for setup/teardown
   - Don't rely on test execution order

4. **Test Edge Cases**
   ```typescript
   // Happy path
   it('should calculate range for valid data')
   
   // Edge cases
   it('should handle empty array')
   it('should handle single entry')
   it('should handle negative values')
   ```

5. **Mock External Dependencies**
   - Mock API calls (don't test against real NOAA API)
   - Mock localStorage
   - Mock timers if testing time-dependent logic

## Continuous Integration

Tests are run automatically on:
- Pull requests
- Commits to `main` branch
- Pre-commit hooks (if configured)

## Debugging Tests

### Run Single Test File
```bash
npm test -- formatters
```

### Run Tests Matching Pattern
```bash
npm test -- --grep "should return"
```

### Debug Mode
```bash
npm test -- --inspect-brk
```

Then open `chrome://inspect` in Chrome DevTools

### Watch Specific Files
```bash
npm test -- --watch --grep "stationFavorites"
```

## Adding Svelte Component Tests

For testing Svelte components, use `@testing-library/svelte`:

```typescript
import { render } from '@testing-library/svelte';
import TideChart from '../TideChart.svelte';

describe('TideChart.svelte', () => {
  it('should render without errors', () => {
    const { container } = render(TideChart, {
      props: {
        stationId: '8454000',
        stationName: 'Boston Harbor'
      }
    });
    expect(container).toBeDefined();
  });
});
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Svelte](https://testing-library.com/docs/svelte-testing-library/intro/)
- [Jest Matchers (compatible with Vitest)](https://jestjs.io/docs/expect)

## Common Issues

### Issue: Tests timeout
**Solution:** Increase timeout in vitest.config.ts or individual tests:
```typescript
it('slow test', async () => {
  // test code
}, 10000); // 10 second timeout
```

### Issue: localStorage not available
**Solution:** Already configured in vitest.config.ts with jsdom environment

### Issue: Fetch not mocked
**Solution:** Use `vi.spyOn(global, 'fetch')` to mock all fetch calls
