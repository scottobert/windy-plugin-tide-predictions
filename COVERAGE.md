# Code Coverage Guide

This document explains how to generate, view, and report code coverage for this project.

## Generating Coverage Reports

### Local Development

Generate coverage reports locally:

```bash
# Run tests with coverage
npm run test:coverage
```

This generates multiple report formats in the `coverage/` directory:
- **HTML Report**: `coverage/index.html` - Open in browser for interactive view
- **LCOV**: `coverage/lcov.info` - For CI/CD tools (SonarCloud, Codecov)
- **JSON**: `coverage/coverage-final.json` - Machine-readable format
- **Text**: Console output showing summary

### Viewing HTML Reports

After running coverage:

```bash
# Windows
start coverage/index.html

# macOS
open coverage/index.html

# Linux
xdg-open coverage/index.html
```

The HTML report shows:
- **Overall coverage percentages** (lines, branches, functions, statements)
- **Per-file coverage** - Click files to see line-by-line coverage
- **Uncovered lines** highlighted in red
- **Partially covered branches** highlighted in yellow

## Coverage Integration

### 1. SonarCloud Integration ✅

Coverage is automatically uploaded to SonarCloud on every push/PR:

1. **GitHub Action** runs tests with coverage
2. **Generates LCOV report** (`coverage/lcov.info`)
3. **SonarCloud scans** and imports coverage data
4. **View on SonarCloud**: https://sonarcloud.io/dashboard?id=scottobert_windy-plugin-tide-predictions

**SonarCloud Configuration** (`sonar-project.properties`):
```properties
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.coverage.exclusions=src/__tests__/**,**/*.test.ts
```

### 2. Codecov Integration (Optional)

To enable Codecov:

1. **Sign up**: https://codecov.io with your GitHub account
2. **Add repository**: Enable for `windy-plugin-tide-predictions`
3. **Add secret**: Add `CODECOV_TOKEN` to GitHub repository secrets
4. **Badge**: The workflow will automatically upload coverage

**Add Codecov badge to README:**
```markdown
[![codecov](https://codecov.io/gh/scottobert/windy-plugin-tide-predictions/branch/main/graph/badge.svg)](https://codecov.io/gh/scottobert/windy-plugin-tide-predictions)
```

### 3. GitHub Actions Artifacts

Coverage reports are saved as artifacts on every test run:
- Navigate to **Actions** → **Tests** workflow
- Download **coverage-report** artifact
- Extract and open `index.html`

## Coverage Thresholds

### Current Coverage Exclusions

The following are excluded from coverage:
- Test files: `src/__tests__/**`
- Configuration files: `**/*.config.ts`
- Example files: `examples/**`

### Recommended Thresholds

For production-ready code, aim for:
- **Lines**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Statements**: > 80%

### Setting Thresholds

Add to `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      thresholds: {
        lines: 80,
        branches: 75,
        functions: 80,
        statements: 80
      }
    }
  }
});
```

## Understanding Coverage Metrics

### Lines Coverage
Percentage of executable code lines that were run during tests.

### Branches Coverage
Percentage of decision branches (if/else, switch, ternary) that were executed.

### Functions Coverage
Percentage of functions/methods that were called during tests.

### Statements Coverage
Percentage of statements executed (similar to lines, but counts logical statements).

## Improving Coverage

### Identify Uncovered Code

1. **Run coverage report**:
   ```bash
   npm run test:coverage
   ```

2. **Open HTML report**: `coverage/index.html`

3. **Click on files** with low coverage

4. **Look for**:
   - Red lines (not executed)
   - Yellow lines (partially covered branches)

### Common Uncovered Areas

1. **Error Handling**: Often forgotten in tests
   ```typescript
   try {
     // ... code
   } catch (error) {
     // ❌ Uncovered - add test that triggers this
     console.error('Error:', error);
   }
   ```

2. **Edge Cases**: Boundary conditions
   ```typescript
   // Test with: null, undefined, empty array, large numbers
   if (data.length === 0) return;
   ```

3. **Async Error Paths**: Failed API calls
   ```typescript
   // Test with: mock fetch failures, timeouts, invalid responses
   ```

### Writing Tests for Coverage

Example test targeting uncovered code:

```typescript
describe('fetchStations', () => {
  it('should handle API timeout', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(
      new Error('Request timeout')
    );
    
    const result = await fetchStations();
    expect(result).toEqual([]);
  });
});
```

## CI/CD Coverage Reporting

### Workflows

#### 1. **Test Workflow** (`.github/workflows/test.yml`)
- Runs on every push/PR
- Generates coverage
- Uploads to Codecov
- Saves artifacts

#### 2. **SonarCloud Workflow** (`.github/workflows/sca.yml`)
- Runs static analysis
- Imports coverage from tests
- Updates SonarCloud dashboard

### Pull Request Coverage

Coverage is checked on every PR:
- **SonarCloud Quality Gate** will fail if coverage drops significantly
- **Codecov comments** on PR showing coverage diff
- **GitHub Actions** uploads coverage artifact

## Troubleshooting

### Coverage Not Generated

**Problem**: No `coverage/` directory after running tests

**Solutions**:
```bash
# Ensure dependencies are installed
npm ci

# Run with verbose output
npm run test:coverage -- --reporter=verbose

# Check vitest.config.ts exists
```

### SonarCloud Not Showing Coverage

**Problem**: SonarCloud shows 0% coverage

**Solutions**:
1. Check `coverage/lcov.info` exists locally
2. Verify `sonar-project.properties` has correct path
3. Ensure GitHub Action runs tests before SonarCloud scan
4. Check SonarCloud project settings

### Coverage Lower Than Expected

**Problem**: Coverage is unexpectedly low

**Causes**:
- Test files are included in coverage (check exclusions)
- Not all code paths tested
- Mocks preventing code execution

**Solutions**:
```bash
# Check what's included
npm run test:coverage -- --coverage.all=false

# Review sonar-project.properties exclusions
```

## Best Practices

1. **Run coverage before committing**
   ```bash
   npm run test:coverage
   ```

2. **Review coverage for new features**
   - Add tests for new functions
   - Aim for 100% on new code

3. **Don't chase 100% coverage**
   - Focus on meaningful tests
   - Some code (error handlers, edge cases) may not need coverage

4. **Use coverage to find gaps**
   - Coverage shows untested code
   - Doesn't guarantee good tests

5. **Exclude generated/config files**
   - Keep coverage focused on source code
   - Exclude test utilities if not testing them

## Resources

- **Vitest Coverage**: https://vitest.dev/guide/coverage
- **SonarCloud Docs**: https://docs.sonarcloud.io/
- **Codecov Docs**: https://docs.codecov.com/
- **LCOV Format**: http://ltp.sourceforge.net/coverage/lcov.php

## Quick Reference

```bash
# Generate coverage
npm run test:coverage

# View HTML report
open coverage/index.html

# Check specific file coverage
npm test -- --coverage src/plugin.svelte

# Run tests in watch mode with coverage
npm test -- --watch --coverage

# Generate coverage with specific reporter
npm run test:coverage -- --coverage.reporter=text
```
