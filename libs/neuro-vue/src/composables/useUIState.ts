import { ref, watch, onUnmounted } from 'vue';
import { useNeuroUX } from './useNeuroUX';

/**
 * useUIState - Vue composable to access and subscribe to NeuroUX UI state
 * 
 * @returns {Ref<Record<string, any>>} Reactive UI state object
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useUIState } from '@adapt-ux/neuro-vue';
 * 
 * const ui = useUIState();
 * </script>
 * <template>
 *   <div :class="{ calm: ui.calmMode }">Content</div>
 * </template>
 * ```
 */
export function useUIState(): globalThis.Ref<Record<string, any>> {
  const neuroRef = useNeuroUX();
  const uiState = ref<Record<string, any>>({});

  let unsubscribe: (() => void) | null = null;
  let cleanup: (() => void) | null = null;

  // Watch for instance to be available
  watch(neuroRef, (neuro) => {
    if (!neuro) {
      return;
    }

    // Get initial state
    const state = neuro.getState();
    uiState.value = state.ui || {};

    // Subscribe to state changes
    unsubscribe = neuro.subscribe(() => {
      const state = neuro.getState();
      uiState.value = state.ui || {};
    });

    // Subscribe to ui:update events
    cleanup = neuro.on('ui:update', (updates: Record<string, any>) => {
      uiState.value = {
        ...uiState.value,
        ...updates,
      };
    });
  }, { immediate: true });

  onUnmounted(() => {
    if (unsubscribe) unsubscribe();
    if (cleanup) cleanup();
  });

  return uiState;
}
