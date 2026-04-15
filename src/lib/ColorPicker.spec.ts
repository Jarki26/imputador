import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, screen, cleanup } from '@testing-library/svelte';
import { tick } from 'svelte';
import ColorPicker from './ColorPicker.svelte';

describe('ColorPicker Component', () => {
  beforeEach(() => {
    cleanup();
  });

  it('should render with current color', () => {
    render(ColorPicker, {
        value: '#ff0000'
    });
    const preview = screen.getByTestId('color-preview');
    // Note: getByTestId might need us to add data-testid in the component
    expect(preview.style.backgroundColor).toBe('rgb(255, 0, 0)');
  });

  it('should show predefined palette', () => {
    render(ColorPicker, {
        value: '#e5e7eb'
    });
    const palette = screen.getAllByTestId('palette-color');
    expect(palette.length).toBeGreaterThan(0);
  });

  it('should select color from palette', async () => {
    const onSelect = vi.fn();
    render(ColorPicker, {
        value: '#e5e7eb',
        onSelect
    });
    
    const paletteColors = screen.getAllByTestId('palette-color');
    await fireEvent.click(paletteColors[1]);
    await tick();

    expect(onSelect).toHaveBeenCalled();
    const preview = screen.getByTestId('color-preview');
    // palette[1] is #fecaca
    expect(preview.style.backgroundColor).toBe('rgb(254, 202, 202)');
  });

  it('should allow custom hex input', async () => {
    render(ColorPicker, {
        value: '#e5e7eb'
    });

    const input = screen.getByLabelText('Custom Color') as HTMLInputElement;
    await fireEvent.input(input, { target: { value: '#00ff00' } });
    await tick();

    // Check if the preview updated
    const preview = screen.getByTestId('color-preview');
    expect(preview.style.backgroundColor).toBe('rgb(0, 255, 0)');
  });
});
