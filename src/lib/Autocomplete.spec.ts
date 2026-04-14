import { describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent, screen, cleanup } from '@testing-library/svelte';
import { tick } from 'svelte';
import Autocomplete from './Autocomplete.svelte';

describe('Autocomplete Component', () => {
  const suggestions = [
    { name: 'Apple', useCount: 10 },
    { name: 'Amazon', useCount: 5 },
    { name: 'Alphabet', useCount: 2 }
  ];

  beforeEach(() => {
    cleanup();
  });

  it('should render with initial value', () => {
    render(Autocomplete, {
      props: {
        id: 'test-auto',
        label: 'Test Label',
        value: 'Initial',
        suggestions: []
      }
    });

    const input = screen.getByLabelText('Test Label') as HTMLInputElement;
    expect(input.value).toBe('Initial');
  });

  it('should show suggestions when focused', async () => {
    render(Autocomplete, {
      props: {
        id: 'test-auto',
        label: 'Test Label',
        value: '',
        suggestions
      }
    });

    const input = screen.getByLabelText('Test Label');
    await fireEvent.focus(input);
    await tick();

    expect(screen.getByText('Apple')).toBeDefined();
    expect(screen.getByText('Amazon')).toBeDefined();
  });

  it('should filter suggestions based on input', async () => {
    render(Autocomplete, {
      props: {
        id: 'test-auto',
        label: 'Test Label',
        value: '',
        suggestions
      }
    });

    const input = screen.getByLabelText('Test Label');
    await fireEvent.focus(input);
    await fireEvent.input(input, { target: { value: 'Am' } });
    await tick();

    expect(screen.queryByText('Apple')).toBeNull();
    expect(screen.getByText('Amazon')).toBeDefined();
  });

  it('should select a suggestion on click', async () => {
    render(Autocomplete, {
      props: {
        id: 'test-auto',
        label: 'Test Label',
        value: '',
        suggestions
      }
    });

    const input = screen.getByLabelText('Test Label') as HTMLInputElement;
    await fireEvent.focus(input);
    await tick();
    
    const option = screen.getByText('Apple');
    // use mousedown because onblur has a timeout and selectSuggestion uses onmousedown
    await fireEvent.mouseDown(option);
    await tick();

    expect(input.value).toBe('Apple');
  });
});
