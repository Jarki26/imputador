import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sesameService } from './sesameService';

describe('SesameService with proxy', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      })
    ));
  });

  it('should use direct URL when no proxy is provided', async () => {
    await sesameService.getMe('test-token');
    expect(fetch).toHaveBeenCalledWith(
      'https://back-eu4.sesametime.com/api/v3/security/me',
      expect.anything()
    );
  });

  it('should prepend proxy URL when provided', async () => {
    const proxyUrl = 'https://my-proxy.com/';
    await sesameService.getMe('test-token', proxyUrl);
    expect(fetch).toHaveBeenCalledWith(
      'https://my-proxy.com/https://back-eu4.sesametime.com/api/v3/security/me',
      expect.anything()
    );
  });

  it('should handle proxy URL without trailing slash', async () => {
    const proxyUrl = 'https://my-proxy.com';
    await sesameService.getMe('test-token', proxyUrl);
    expect(fetch).toHaveBeenCalledWith(
      'https://my-proxy.com/https://back-eu4.sesametime.com/api/v3/security/me',
      expect.anything()
    );
  });
});
