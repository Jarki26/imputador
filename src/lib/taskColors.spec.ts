import { describe, it, expect, beforeEach } from 'vitest';
import { ConfigStore } from './configStore';
import { TASK_TYPES } from './config';
import { deleteDB } from 'idb';

describe('Task Colors Configuration', () => {
  let configStore: ConfigStore;
  const TEST_DB_NAME = 'task-colors-test-db';

  beforeEach(async () => {
    await deleteDB(TEST_DB_NAME);
    configStore = new ConfigStore(TEST_DB_NAME);
  });

  it('should return a default neutral color for any task type if not configured', async () => {
    const color = await configStore.getTaskTypeColor('DESARROLLO');
    expect(color).toBe('#e5e7eb'); // Default neutral gray-200
  });

  it('should allow setting and retrieving a custom color for a task type', async () => {
    const customColor = '#ff0000';
    await configStore.setTaskTypeColor('DESARROLLO', customColor);
    const color = await configStore.getTaskTypeColor('DESARROLLO');
    expect(color).toBe(customColor);
  });

  it('should return the same custom color for all task types if we set a default one? No, spec says per task type.', async () => {
     await configStore.setTaskTypeColor('REUNIONES', '#00ff00');
     expect(await configStore.getTaskTypeColor('REUNIONES')).toBe('#00ff00');
     expect(await configStore.getTaskTypeColor('DESARROLLO')).toBe('#e5e7eb'); // Should remain default
  });

  it('should return all custom color mappings', async () => {
    await configStore.setTaskTypeColor('DESARROLLO', '#111');
    await configStore.setTaskTypeColor('REUNIONES', '#222');
    
    const mappings = await configStore.getAllTaskTypeColors();
    expect(mappings['DESARROLLO']).toBe('#111');
    expect(mappings['REUNIONES']).toBe('#222');
  });
});
