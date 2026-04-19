import { describe, it, expect } from 'vitest';
import { calculateGapsFromChecks } from './sesameSync';
import type { SesameCheck } from './sesameService';

describe('sesameSync - calculateGapsFromChecks', () => {
  it('should return no gaps for a single check-in/out pair', () => {
    const checks: SesameCheck[] = [
      {
        id: '1',
        checkIn: { date: '2026-04-19T09:00:00Z' },
        checkOut: { date: '2026-04-19T18:00:00Z' }
      }
    ];
    const gaps = calculateGapsFromChecks(checks);
    expect(gaps).toHaveLength(0);
  });

  it('should calculate one gap between two check-in/out pairs', () => {
    const checks: SesameCheck[] = [
      {
        id: '1',
        checkIn: { date: '2026-04-19T09:00:00Z' },
        checkOut: { date: '2026-04-19T13:00:00Z' }
      },
      {
        id: '2',
        checkIn: { date: '2026-04-19T14:00:00Z' },
        checkOut: { date: '2026-04-19T18:00:00Z' }
      }
    ];
    const gaps = calculateGapsFromChecks(checks);
    expect(gaps).toHaveLength(1);
    expect(gaps[0].startTime.toISOString()).toBe('2026-04-19T13:00:00.000Z');
    expect(gaps[0].endTime.toISOString()).toBe('2026-04-19T14:00:00.000Z');
    expect(gaps[0].title).toBe('Descanso');
    expect(gaps[0].project).toBe('sesame');
    expect(gaps[0].type).toBe('REST');
  });

  it('should ignore checks without checkOut (except the last one which defines the end boundary)', () => {
    const checks: SesameCheck[] = [
      {
        id: '1',
        checkIn: { date: '2026-04-19T09:00:00Z' },
        // missing checkOut
      },
      {
        id: '2',
        checkIn: { date: '2026-04-19T14:00:00Z' },
        checkOut: { date: '2026-04-19T18:00:00Z' }
      }
    ];
    // If check 1 has no checkOut, we can't know when the gap starts.
    // So we should expect 0 gaps in this case.
    const gaps = calculateGapsFromChecks(checks);
    expect(gaps).toHaveLength(0);
  });

  it('should handle multiple gaps across multiple days correctly', () => {
    const checks: SesameCheck[] = [
      // Day 1: two gaps
      {
        id: '1',
        checkIn: { date: '2026-04-19T09:00:00Z' },
        checkOut: { date: '2026-04-19T11:00:00Z' }
      },
      {
        id: '2',
        checkIn: { date: '2026-04-19T12:00:00Z' },
        checkOut: { date: '2026-04-19T13:00:00Z' }
      },
      {
        id: '3',
        checkIn: { date: '2026-04-19T15:00:00Z' },
        checkOut: { date: '2026-04-19T18:00:00Z' }
      },
      // Day 2: one gap
      {
        id: '4',
        checkIn: { date: '2026-04-20T08:30:00Z' },
        checkOut: { date: '2026-04-20T12:30:00Z' }
      },
      {
        id: '5',
        checkIn: { date: '2026-04-20T13:30:00Z' },
        checkOut: { date: '2026-04-20T17:30:00Z' }
      }
    ];
    const gaps = calculateGapsFromChecks(checks);
    expect(gaps).toHaveLength(3);
    
    // Day 1 gaps
    expect(gaps[0].startTime.toISOString()).toBe('2026-04-19T11:00:00.000Z');
    expect(gaps[0].endTime.toISOString()).toBe('2026-04-19T12:00:00.000Z');
    expect(gaps[1].startTime.toISOString()).toBe('2026-04-19T13:00:00.000Z');
    expect(gaps[1].endTime.toISOString()).toBe('2026-04-19T15:00:00.000Z');
    
    // Day 2 gap
    expect(gaps[2].startTime.toISOString()).toBe('2026-04-20T12:30:00.000Z');
    expect(gaps[2].endTime.toISOString()).toBe('2026-04-20T13:30:00.000Z');
  });
});
