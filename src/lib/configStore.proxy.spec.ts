import { describe, it, expect, beforeEach } from 'vitest';
import { ConfigStore } from './configStore';

describe('ConfigStore proxy settings', () => {
  let store: ConfigStore;

  beforeEach(async () => {
    const dbName = `test-config-proxy-db-${Math.random().toString(36).substring(7)}`;
    store = new ConfigStore(dbName);
  });

  it('should return null when no proxy URL is set', async () => {
    const url = await store.getSesameProxyUrl();
    expect(url).toBeNull();
  });

  it('should save and retrieve a proxy URL', async () => {
    const testUrl = 'https://proxy.example.com/';
    await store.setSesameProxyUrl(testUrl);
    const url = await store.getSesameProxyUrl();
    expect(url).toBe(testUrl);
  });

  it('should allow clearing the proxy URL', async () => {
    await store.setSesameProxyUrl('https://proxy.example.com/');
    await store.setSesameProxyUrl(null);
    const url = await store.getSesameProxyUrl();
    expect(url).toBeNull();
  });
});
