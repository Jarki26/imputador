import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import Settings from './Settings.svelte';

describe('Settings.svelte', () => {
  beforeEach(() => {
    cleanup();
  });

  it('should render with default value of 41', () => {
    render(Settings, { props: { weeklyTarget: 41, onSave: vi.fn() } });
    const input = screen.getByLabelText(/Weekly Hours Target/i) as HTMLInputElement;
    expect(input.value).toBe('41');
  });

  it('should show error for value less than 1', async () => {
    const onSave = vi.fn();
    render(Settings, { props: { weeklyTarget: 41, onSave } });
    
    const input = screen.getByLabelText(/Weekly Hours Target/i);
    await fireEvent.input(input, { target: { value: '0' } });
    
    const saveBtn = screen.getByRole('button', { name: /Save/i });
    await fireEvent.click(saveBtn);
    
    expect(await screen.findByText(/Value must be between 1 and 60/i)).toBeDefined();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('should show error for value greater than 60', async () => {
    const onSave = vi.fn();
    render(Settings, { props: { weeklyTarget: 41, onSave } });
    
    const input = screen.getByLabelText(/Weekly Hours Target/i);
    await fireEvent.input(input, { target: { value: '61' } });
    
    const saveBtn = screen.getByRole('button', { name: /Save/i });
    await fireEvent.click(saveBtn);
    
    expect(await screen.findByText(/Value must be between 1 and 60/i)).toBeDefined();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('should call onSave with valid value', async () => {
    const onSave = vi.fn();
    render(Settings, { props: { weeklyTarget: 41, onSave } });
    
    const input = screen.getByLabelText(/Weekly Hours Target/i);
    await fireEvent.input(input, { target: { value: '45' } });
    
    const saveBtn = screen.getByRole('button', { name: /Save/i });
    await fireEvent.click(saveBtn);
    
    expect(onSave).toHaveBeenCalledWith(45);
  });
});
