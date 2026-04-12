import { describe, it, expect, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import Tutorial from './Tutorial.svelte';

describe('Tutorial.svelte', () => {
  const setView = vi.fn();

  it('should not render when show is false', () => {
    cleanup();
    render(Tutorial, { props: { show: false, onClose: vi.fn(), setView } });
    expect(screen.queryByText(/Welcome to Imputador/i)).toBeNull();
  });

  it('should render when show is true', () => {
    cleanup();
    render(Tutorial, { props: { show: true, onClose: vi.fn(), setView } });
    expect(screen.getByText(/Welcome to Imputador/i)).toBeDefined();
  });

  it('should advance to next step when Next is clicked', async () => {
    cleanup();
    render(Tutorial, { props: { show: true, onClose: vi.fn(), setView } });
    
    const nextBtn = screen.getByRole('button', { name: /Next/i });
    await fireEvent.click(nextBtn);
    
    expect(screen.getByText(/Weekly View/i)).toBeDefined();
  });

  it('should call onClose when Skip is clicked', async () => {
    cleanup();
    const onClose = vi.fn();
    render(Tutorial, { props: { show: true, onClose, setView } });
    
    const skipBtn = screen.getByRole('button', { name: /Skip/i });
    await fireEvent.click(skipBtn);
    
    expect(onClose).toHaveBeenCalled();
  });
});
