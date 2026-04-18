import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import Tutorial from './Tutorial.svelte';
import { i18n } from './i18n.svelte';

describe('Tutorial.svelte', () => {
  const setView = vi.fn();

  beforeEach(async () => {
    cleanup();
    await i18n.setLocale('es');
  });

  it('should not render when show is false', () => {
    render(Tutorial, { props: { show: false, onClose: vi.fn(), setView } });
    expect(screen.queryByText(/¡Bienvenido a Imputador!/i)).toBeNull();
  });

  it('should render when show is true', () => {
    render(Tutorial, { props: { show: true, onClose: vi.fn(), setView } });
    expect(screen.getByText(/¡Bienvenido a Imputador!/i)).toBeDefined();
  });

  it('should advance to next step when Next is clicked', async () => {
    render(Tutorial, { props: { show: true, onClose: vi.fn(), setView } });

    const nextBtn = screen.getByRole('button', { name: /Siguiente/i });
    await fireEvent.click(nextBtn);

    expect(screen.getByText(/Vista Semanal/i)).toBeDefined();
  });

  it('should call onClose when Skip is clicked', async () => {
    const onClose = vi.fn();
    render(Tutorial, { props: { show: true, onClose, setView } });

    const skipBtn = screen.getByRole('button', { name: /Saltar/i });
    await fireEvent.click(skipBtn);

    expect(onClose).toHaveBeenCalled();
  });
});
