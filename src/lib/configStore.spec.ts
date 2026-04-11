import { describe, it, expect, beforeEach } from 'vitest';
import { ConfigStore } from './configStore';

describe('ConfigStore operations', () => {
  let store: ConfigStore;

  beforeEach(async () => {
    // Use unique database name per test for isolation
    const dbName = `test-config-db-${Math.random().toString(36).substring(7)}`;
    store = new ConfigStore(dbName);
  });

  it('should return default value of 41 when no target is set', async () => {
    const target = await store.getWeeklyHoursTarget();
    expect(target).toBe(41);
  });

  it('should save and retrieve a new target value', async () => {
    await store.setWeeklyHoursTarget(38);
    const target = await store.getWeeklyHoursTarget();
    expect(target).toBe(38);
  });

  it('should update an existing target value', async () => {
    await store.setWeeklyHoursTarget(40);
    await store.setWeeklyHoursTarget(35);
    const target = await store.getWeeklyHoursTarget();
    expect(target).toBe(35);
  });
});
