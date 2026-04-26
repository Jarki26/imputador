import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sesameService } from './sesameService';

describe('sesameService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  describe('login', () => {
    it('should successfully login and return a token', async () => {
      const mockToken = 'mock-token';
      (fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockToken }),
      });

      const token = await sesameService.login(
        'user@example.com',
        'password123',
      );

      expect(fetch).toHaveBeenCalledWith(
        'https://back-eu4.sesametime.com/api/v3/security/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'user@example.com',
            password: 'password123',
          }),
        }),
      );
      expect(token).toBe(mockToken);
    });

    it('should throw an error on failed login', async () => {
      (fetch as any).mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      await expect(
        sesameService.login('user@example.com', 'wrong-pass'),
      ).rejects.toThrow('Sesame login failed: 401 Unauthorized');
    });
  });

  describe('getMe', () => {
    it('should return user info including id', async () => {
      const mockUser = { id: 'user-id-123' };
      (fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ data: [mockUser] }),
      });

      const user = await sesameService.getMe('some-token');

      expect(fetch).toHaveBeenCalledWith(
        'https://back-eu4.sesametime.com/api/v3/security/me',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'some-token',
          }),
        }),
      );
      expect(user.id).toBe(mockUser.id);
    });

    it('should throw an error on failed fetch', async () => {
      (fetch as any).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(sesameService.getMe('invalid-token')).rejects.toThrow(
        'Failed to fetch Sesame user info: 404 Not Found',
      );
    });
  });

  describe('getChecks', () => {
    it('should fetch checks for a given period', async () => {
      const mockChecks = [
        { id: 'check-1', checkIn: { date: '2026-04-19T09:00:00Z' } },
      ];
      (fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockChecks }),
      });

      const checks = await sesameService.getChecks(
        'user-id',
        'token',
        '2026-04-19',
        '2026-04-25',
      );

      expect(fetch).toHaveBeenCalledWith(
        'https://back-eu4.sesametime.com/api/v3/employees/user-id/checks?from=2026-04-19&to=2026-04-25&includeOut=true',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'token',
          }),
        }),
      );
      expect(checks).toEqual(mockChecks);
    });

    it('should throw an error on failed fetch', async () => {
      (fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(
        sesameService.getChecks('user-id', 'token', '2026-04-19', '2026-04-25'),
      ).rejects.toThrow(
        'Failed to fetch Sesame checks: 500 Internal Server Error',
      );
    });
  });
});
