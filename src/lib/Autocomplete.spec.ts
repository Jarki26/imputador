import { describe, it, expect, beforeEach, vi } from 'vitest';
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

  it('should hide suggestions on blur after delay', async () => {
    vi.useFakeTimers();
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
    expect(screen.queryByText('Apple')).toBeDefined();

    await fireEvent.blur(input);
    // Suggestions still there before delay
    expect(screen.queryByText('Apple')).toBeDefined();

    vi.advanceTimersByTime(200);
    await tick();
    expect(screen.queryByText('Apple')).toBeNull();
    vi.useRealTimers();
  });

  it('should not show suggestions list if suggestions array is empty', async () => {
    render(Autocomplete, {
      props: {
        id: 'test-auto',
        label: 'Test Label',
        value: '',
        suggestions: []
      }
    });

    const input = screen.getByLabelText('Test Label');
    await fireEvent.focus(input);
    await tick();

    // Check that the suggestions-list ul is not in the DOM
    const list = document.querySelector('.suggestions-list');
    expect(list).toBeNull();
  });

  it('should not show suggestions list if no match is found', async () => {
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
    await fireEvent.input(input, { target: { value: 'NonExistent' } });
    await tick();

    const list = document.querySelector('.suggestions-list');
    expect(list).toBeNull();
  });

  it('should sort suggestions with missing useCount', async () => {
    const mixedSuggestions = [
      { name: 'C', useCount: 1 },
      { name: 'A' }, // should be treated as 0
      { name: 'B', useCount: 10 }
    ];

    render(Autocomplete, {
      props: {
        id: 'test-auto',
        label: 'Test Label',
        value: '',
        suggestions: mixedSuggestions
      }
    });

    const input = screen.getByLabelText('Test Label');
    await fireEvent.focus(input);
    await tick();

    const buttons = screen.getAllByRole('button');
    expect(buttons[0].textContent?.trim()).toBe('B');
    expect(buttons[1].textContent?.trim()).toBe('C');
    expect(buttons[2].textContent?.trim()).toBe('A');
  });
});
