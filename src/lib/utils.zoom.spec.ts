import { describe, it, expect } from 'vitest';
import { calculateVerticalPosition, calculateHeight } from './utils';

describe('Zoom calculation utilities', () => {
  const BASE_PIXELS_PER_MINUTE = 1;

  describe('calculateVerticalPosition', () => {
    it('calculates the correct position at default zoom (1x)', () => {
      const date = new Date(2026, 3, 15, 8, 30); // 08:30
      const pixelsPerMinute = BASE_PIXELS_PER_MINUTE * 1.0;
      // 8 * 60 + 30 = 510 minutes
      expect(calculateVerticalPosition(date, pixelsPerMinute)).toBe(510);
    });

    it('calculates the correct position at 2x zoom', () => {
      const date = new Date(2026, 3, 15, 8, 30);
      const pixelsPerMinute = BASE_PIXELS_PER_MINUTE * 2.0;
      expect(calculateVerticalPosition(date, pixelsPerMinute)).toBe(1020);
    });

    it('calculates the correct position at 0.5x zoom', () => {
      const date = new Date(2026, 3, 15, 8, 30);
      const pixelsPerMinute = BASE_PIXELS_PER_MINUTE * 0.5;
      expect(calculateVerticalPosition(date, pixelsPerMinute)).toBe(255);
    });
  });

  describe('calculateHeight', () => {
    it('calculates the correct height at default zoom (1x)', () => {
      const durationInMinutes = 60; // 1 hour
      const pixelsPerMinute = BASE_PIXELS_PER_MINUTE * 1.0;
      expect(calculateHeight(durationInMinutes, pixelsPerMinute)).toBe(60);
    });

    it('calculates the correct height at 1.5x zoom', () => {
      const durationInMinutes = 30; // 30 minutes
      const pixelsPerMinute = BASE_PIXELS_PER_MINUTE * 1.5;
      expect(calculateHeight(durationInMinutes, pixelsPerMinute)).toBe(45);
    });

    it('calculates the correct height at 0.8x zoom', () => {
      const durationInMinutes = 120; // 2 hours
      const pixelsPerMinute = BASE_PIXELS_PER_MINUTE * 0.8;
      expect(calculateHeight(durationInMinutes, pixelsPerMinute)).toBe(96);
    });
  });
});
