import { getNeuroUXInstance, signalsStore, uiStateStore, neuroUXState } from './store/neuroUXStore';

/**
 * useNeuroUX - Svelte helper to access NeuroUX instance and stores
 * 
 * @returns Object with instance, state, signals, and ui stores
 * 
 * @example
 * ```svelte
 * <script>
 *   import { useNeuroUX } from '@adapt-ux/neuro-svelte';
 *   import { onMount } from 'svelte';
 *   
 *   let neuro;
 *   onMount(async () => {
 *     await initNeuroUX({ profile: 'adhd' });
 *     neuro = useNeuroUX();
 *   });
 * </script>
 * 
 * <div>
 *   {$neuro.signals.idle ? 'Idle' : 'Active'}
 * </div>
 * ```
 */
export function useNeuroUX() {
  return {
    instance: getNeuroUXInstance(),
    state: neuroUXState,
    signals: signalsStore,
    ui: uiStateStore,
  };
}

// Re-export store initialization
export { initNeuroUX, getNeuroUXInstance, signalsStore, uiStateStore, neuroUXState } from './store/neuroUXStore';
