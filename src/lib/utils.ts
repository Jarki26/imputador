export * from './dateUtils';
export * from './taskUtils';
export * from './uiUtils';

/**
 * Reloads the current page.
 */
export function reloadPage(): void {
  window.location.reload();
}
