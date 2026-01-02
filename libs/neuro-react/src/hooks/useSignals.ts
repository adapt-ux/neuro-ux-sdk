import { useEffect, useState, useCallback } from 'react';
import { useNeuroUX } from './useNeuroUX';

/**
 * useSignals - React hook to access and subscribe to NeuroUX signals
 * 
 * @returns {[Record<string, any>, (name: string, value: any) => void]} Tuple of current signals and update function
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const [signals, updateSignal] = useSignals();
 *   return <div>Idle: {signals.idle ? 'Yes' : 'No'}</div>;
 * }
 * ```
 */
export function useSignals(): [Record<string, any>, (name: string, value: any) => void] {
  const neuro = useNeuroUX();
  const [signals, setSignals] = useState<Record<string, any>>(() => {
    // Get initial signals state
    const state = neuro.getState();
    return state.signals || {};
  });

  useEffect(() => {
    // Subscribe to state changes to update signals
    const unsubscribe = neuro.subscribe(() => {
      const state = neuro.getState();
      setSignals(state.signals || {});
    });

    // Also subscribe to signal:update events for immediate updates
    const handler = ({ name, value }: { name: string; value: any }) => {
      setSignals((prev) => ({
        ...prev,
        [name]: value,
      }));
    };
    const cleanup = neuro.on('signal:update', handler);

    return () => {
      unsubscribe();
      cleanup();
    };
  }, [neuro]);

  const updateSignal = useCallback((name: string, value: any) => {
    neuro.signals.update(name, value);
  }, [neuro]);

  return [signals, updateSignal];
}
