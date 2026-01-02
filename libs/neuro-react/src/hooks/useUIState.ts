import { useEffect, useState } from 'react';
import { useNeuroUX } from './useNeuroUX';

/**
 * useUIState - React hook to access and subscribe to NeuroUX UI state
 * 
 * @returns {Record<string, any>} Current UI state object
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const ui = useUIState();
 *   return <div className={ui.calmMode ? 'calm' : ''}>Content</div>;
 * }
 * ```
 */
export function useUIState(): Record<string, any> {
  const neuro = useNeuroUX();
  const [uiState, setUIState] = useState<Record<string, any>>(() => {
    // Get initial UI state
    const state = neuro.getState();
    return state.ui || {};
  });

  useEffect(() => {
    // Subscribe to state changes to update UI state
    const unsubscribe = neuro.subscribe(() => {
      const state = neuro.getState();
      setUIState(state.ui || {});
    });

    // Also subscribe to ui:update events for immediate updates
    const handler = (updates: Record<string, any>) => {
      setUIState((prev) => ({
        ...prev,
        ...updates,
      }));
    };
    const cleanup = neuro.on('ui:update', handler);

    return () => {
      unsubscribe();
      cleanup();
    };
  }, [neuro]);

  return uiState;
}
