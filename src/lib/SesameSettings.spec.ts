import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from '@testing-library/svelte';
import SesameSettings from './SesameSettings.svelte';
import { i18n } from './i18n.svelte';
import { sesameService } from './sesameService';
import { tick } from 'svelte';

vi.mock('./sesameService', () => ({
  sesameService: {
    login: vi.fn(),
    getMe: vi.fn(),
  },
}));

describe('SesameSettings.svelte', () => {
  const mockConfigStore = {
    getSesameEmail: vi.fn(),
    setSesameToken: vi.fn(),
    setSesameUserId: vi.fn(),
    setSesameEmail: vi.fn(),
  };

  beforeEach(async () => {
    cleanup();
    vi.clearAllMocks();
    await i18n.setLocale('en');
  });

  it('should render login form when not logged in', async () => {
    mockConfigStore.getSesameEmail.mockResolvedValue(null);
    render(SesameSettings, { props: { configStore: mockConfigStore as any } });

    expect(await screen.findByText(/Sesame HR Integration/i)).toBeDefined();
    await waitFor(() => {
      expect(screen.getByLabelText(/Sesame Email/i)).toBeDefined();
    });
  });

  it('should render logged in state when email is present', async () => {
    mockConfigStore.getSesameEmail.mockResolvedValue('test@example.com');
    render(SesameSettings, { props: { configStore: mockConfigStore as any } });

    expect(
      await screen.findByText(/Logged in as: test@example.com/i),
    ).toBeDefined();
    expect(screen.getByText(/Logout from Sesame/i)).toBeDefined();
  });

  it('should successfuly login', async () => {
    mockConfigStore.getSesameEmail.mockResolvedValue(null);
    (sesameService.login as any).mockResolvedValue('token-123');
    (sesameService.getMe as any).mockResolvedValue({ id: 'user-id-456' });

    render(SesameSettings, { props: { configStore: mockConfigStore as any } });

    const emailInput = await screen.findByLabelText(/Sesame Email/i);
    const passwordInput = screen.getByLabelText(/Sesame Password/i);
    const loginBtn = screen.getByText(/Login to Sesame/i);

    await fireEvent.input(emailInput, {
      target: { value: 'test@example.com' },
    });
    await fireEvent.input(passwordInput, { target: { value: 'password123' } });
    await fireEvent.click(loginBtn);

    await waitFor(
      async () => {
        expect(sesameService.login).toHaveBeenCalledWith(
          'test@example.com',
          'password123',
        );
        expect(mockConfigStore.setSesameToken).toHaveBeenCalledWith(
          'token-123',
        );
        expect(mockConfigStore.setSesameUserId).toHaveBeenCalledWith(
          'user-id-456',
        );
        expect(mockConfigStore.setSesameEmail).toHaveBeenCalledWith(
          'test@example.com',
        );
      },
      { timeout: 2000 },
    );

    expect(
      await screen.findByText(/Successfully logged in to Sesame/i),
    ).toBeDefined();
    expect(
      await screen.findByText(/Logged in as: test@example.com/i),
    ).toBeDefined();
  });

  it('should handle login error', async () => {
    mockConfigStore.getSesameEmail.mockResolvedValue(null);
    (sesameService.login as any).mockRejectedValue(
      new Error('Invalid credentials'),
    );

    render(SesameSettings, { props: { configStore: mockConfigStore as any } });

    const emailInput = await screen.findByLabelText(/Sesame Email/i);
    const passwordInput = screen.getByLabelText(/Sesame Password/i);
    const loginBtn = screen.getByText(/Login to Sesame/i);

    await fireEvent.input(emailInput, {
      target: { value: 'test@example.com' },
    });
    await fireEvent.input(passwordInput, { target: { value: 'wrong-pass' } });
    await fireEvent.click(loginBtn);

    expect(
      await screen.findByText(/Login failed: Invalid credentials/i),
    ).toBeDefined();
  });

  it('should logout correctly', async () => {
    mockConfigStore.getSesameEmail.mockResolvedValue('test@example.com');
    render(SesameSettings, { props: { configStore: mockConfigStore as any } });

    const logoutBtn = await screen.findByText(/Logout from Sesame/i);
    await fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(mockConfigStore.setSesameToken).toHaveBeenCalledWith(null);
      expect(mockConfigStore.setSesameUserId).toHaveBeenCalledWith(null);
      expect(mockConfigStore.setSesameEmail).toHaveBeenCalledWith(null);
    });

    expect(await screen.findByLabelText(/Sesame Email/i)).toBeDefined();
  });
});
