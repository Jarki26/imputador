import { describe, it, expect, beforeEach } from 'vitest';
import { initDB } from './db';

describe('IndexedDB Initialization', () => {
  beforeEach(async () => {
    // Clear databases before each test (using browser global)
    const dbs = await window.indexedDB.databases();
    dbs.forEach((db) => {
      if (db.name) window.indexedDB.deleteDatabase(db.name);
    });
  });

  it('should initialize the database with tasks and projects stores', async () => {
    const db = await initDB('test-db');
    expect(db.objectStoreNames).toContain('tasks');
    expect(db.objectStoreNames).toContain('projects');
    db.close();
  });

  it('should have correct indexes for tasks store', async () => {
    const db = await initDB('test-db');
    const tx = db.transaction('tasks', 'readonly');
    const store = tx.objectStore('tasks');

    expect(store.indexNames).toContain('date');
    db.close();
  });
});
