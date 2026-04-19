import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateGapsFromChecks, syncSesameTasks } from './sesameSync';
import type { SesameCheck } from './sesameService';
import { i18n } from './i18n.svelte';

describe('sesameSync - calculateGapsFromChecks', () => {
  beforeEach(async () => {
    await i18n.setLocale('es');
  });

  it('should return only OFFLINE gaps for a single check-in/out pair at start/end of day', () => {
    const checks: SesameCheck[] = [
      {
        id: '1',
        checkIn: { date: '2026-04-19T09:00:00Z' },
        checkOut: { date: '2026-04-19T18:00:00Z' },
      },
    ];
    const gaps = calculateGapsFromChecks(checks);
    expect(gaps).toHaveLength(2);
    expect(gaps[0].type).toBe('OFFLINE');
    expect(gaps[1].type).toBe('OFFLINE');
  });

  it('should calculate one REST gap and two OFFLINE gaps between two check-in/out pairs', () => {
    const checks: SesameCheck[] = [
      {
        id: '1',
        checkIn: { date: '2026-04-19T09:00:00Z' },
        checkOut: { date: '2026-04-19T13:00:00Z' },
      },
      {
        id: '2',
        checkIn: { date: '2026-04-19T14:00:00Z' },
        checkOut: { date: '2026-04-19T18:00:00Z' },
      },
    ];
    const gaps = calculateGapsFromChecks(checks);
    expect(gaps).toHaveLength(3);
    expect(gaps[0].type).toBe('OFFLINE');
    expect(gaps[0].startTime.getHours()).toBe(0);
    expect(gaps[0].startTime.getMinutes()).toBe(0);

    expect(gaps[1].type).toBe('REST');
    // REST gaps are relative to the checkIn/Out which are UTC but converted to Date objects
    expect(gaps[1].startTime.toISOString()).toBe('2026-04-19T13:00:00.000Z');
    expect(gaps[1].endTime.toISOString()).toBe('2026-04-19T14:00:00.000Z');

    expect(gaps[2].type).toBe('OFFLINE');
    expect(gaps[2].endTime.getHours()).toBe(23);
    expect(gaps[2].endTime.getMinutes()).toBe(59);
  });

  it('should ignore checks without checkOut for REST calculation but still do OFFLINE boundaries', () => {
    const checks: SesameCheck[] = [
      {
        id: '1',
        checkIn: { date: '2026-04-19T09:00:00Z' },
      },
      {
        id: '2',
        checkIn: { date: '2026-04-19T14:00:00Z' },
        checkOut: { date: '2026-04-19T18:00:00Z' },
      },
    ];
    const gaps = calculateGapsFromChecks(checks);
    expect(gaps).toHaveLength(2);
    expect(gaps[0].type).toBe('OFFLINE');
    expect(gaps[1].type).toBe('OFFLINE');
  });

  it('should handle multiple gaps across multiple days correctly', () => {
    const checks: SesameCheck[] = [
      {
        id: '1',
        checkIn: { date: '2026-04-19T09:00:00Z' },
        checkOut: { date: '2026-04-19T11:00:00Z' },
      },
      {
        id: '2',
        checkIn: { date: '2026-04-19T12:00:00Z' },
        checkOut: { date: '2026-04-19T13:00:00Z' },
      },
      {
        id: '3',
        checkIn: { date: '2026-04-19T15:00:00Z' },
        checkOut: { date: '2026-04-19T18:00:00Z' },
      },
      {
        id: '4',
        checkIn: { date: '2026-04-20T08:30:00Z' },
        checkOut: { date: '2026-04-20T12:30:00Z' },
      },
      {
        id: '5',
        checkIn: { date: '2026-04-20T13:30:00Z' },
        checkOut: { date: '2026-04-20T17:30:00Z' },
      },
    ];
    const gaps = calculateGapsFromChecks(checks);
    expect(gaps).toHaveLength(7);
  });

  it('should generate OFFLINE tasks for start and end of day gaps', () => {
    const checks: SesameCheck[] = [
      {
        id: '1',
        checkIn: { date: '2026-04-19T09:00:00Z' },
        checkOut: { date: '2026-04-19T18:00:00Z' },
      },
    ];
    const gaps = calculateGapsFromChecks(checks);
    expect(gaps).toHaveLength(2);

    expect(gaps[0].type).toBe('OFFLINE');
    expect(gaps[0].title).toBe('Fuera de la oficina');
    expect(gaps[0].startTime.getHours()).toBe(0);
    expect(gaps[0].startTime.getMinutes()).toBe(0);

    expect(gaps[1].type).toBe('OFFLINE');
    expect(gaps[1].endTime.getHours()).toBe(23);
    expect(gaps[1].endTime.getMinutes()).toBe(59);
  });
});

describe('sesameSync - syncSesameTasks', () => {
  let mockTaskStore: any;

  beforeEach(async () => {
    await i18n.setLocale('es');
    mockTaskStore = {
      getTasksForDay: vi.fn().mockResolvedValue([]),
      deleteTask: vi.fn().mockResolvedValue(undefined),
      addTask: vi.fn().mockResolvedValue(undefined),
    };
  });

  it('should overwrite existing OFFLINE tasks when syncing Sesame tasks', async () => {
    const existingTasks = [
      {
        id: 10,
        title: 'Fuera de la oficina',
        project: 'sesame',
        type: 'OFFLINE',
        startTime: new Date('2026-04-19T00:00:00Z'),
        endTime: new Date('2026-04-19T09:30:00Z'),
      },
    ];
    mockTaskStore.getTasksForDay.mockResolvedValue(existingTasks);

    const newTasks = [
      {
        title: 'Fuera de la oficina',
        project: 'sesame',
        type: 'OFFLINE',
        startTime: new Date('2026-04-19T00:00:00Z'),
        endTime: new Date('2026-04-19T09:00:00Z'),
      },
    ];

    await syncSesameTasks(newTasks, mockTaskStore);

    expect(mockTaskStore.deleteTask).toHaveBeenCalledWith(10);
    expect(mockTaskStore.addTask).toHaveBeenCalledWith(newTasks[0]);
  });

  it('should overwrite existing REST tasks when syncing Sesame tasks', async () => {
    const existingTasks = [
      {
        id: 20,
        title: 'Descanso',
        project: 'sesame',
        type: 'REST',
        startTime: new Date('2026-04-19T13:00:00Z'),
        endTime: new Date('2026-04-19T14:30:00Z'),
      },
    ];
    mockTaskStore.getTasksForDay.mockResolvedValue(existingTasks);

    const newTasks = [
      {
        title: 'Descanso',
        project: 'sesame',
        type: 'REST',
        startTime: new Date('2026-04-19T13:00:00Z'),
        endTime: new Date('2026-04-19T14:00:00Z'),
      },
    ];

    await syncSesameTasks(newTasks, mockTaskStore);

    expect(mockTaskStore.deleteTask).toHaveBeenCalledWith(20);
    expect(mockTaskStore.addTask).toHaveBeenCalledWith(newTasks[0]);
  });
});
