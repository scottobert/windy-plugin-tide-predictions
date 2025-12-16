import { describe, it, expect } from 'vitest';
import { formatTime } from '../../utils/formatters';

describe('formatTime', () => {
  it('should format ISO date string correctly', () => {
    const result = formatTime('2025-12-15T14:30:00Z');
    expect(result).toContain('Dec');
    expect(result).toContain('15');
    expect(result).toMatch(/\d{1,2}:\d{2}\s(AM|PM)/);
  });

  it('should handle different dates', () => {
    const result = formatTime('2025-01-01T12:00:00Z');
    // Check for either 'Jan 1' or 'Dec 31' depending on timezone
    expect(result).toMatch(/(Jan|Dec)/);
    expect(result).toMatch(/\d{1,2}/);
  });

  it('should format time with leading zero for minutes', () => {
    const result = formatTime('2025-12-15T14:05:00Z');
    expect(result).toContain('05');
  });
});
