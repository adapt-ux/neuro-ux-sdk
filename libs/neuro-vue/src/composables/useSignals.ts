import { ref, watch, onUnmounted, computed } from 'vue';
import { useNeuroUX } from './useNeuroUX';

/**
 * useSignals - Vue composable to access and subscribe to NeuroUX signals
 * 
 * @returns {[Ref<Record<string, any>>, (name: string, value: any) => void]} Tuple of reactive signals and update function
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useSignals } from '@adapt-ux/neuro-vue';
 * 
 * const [signals, updateSignal] = useSignals();
 * </script>
 * <template>
 *   <div>Idle: {{ signals.idle ? 'Yes' : 'No' }}</div>
 * </template>
 * ```
 */
export function useSignals(): [globalThis.Ref<Record<string, any>>, (name: string, value: any) => void] {
  const neuroRef = useNeuroUX();
  const signals = ref<Record<string, any>>({});

  let unsubscribe: (() => void) | null = null;
  let cleanup: (() => void) | null = null;

  // Watch for instance to be available
  watch(neuroRef, (neuro) => {
    if (!neuro) {
      return;
    }

    // Get initial state
    const state = neuro.getState();
    signals.value = state.signals || {};

    // Subscribe to state changes
    unsubscribe = neuro.subscribe(() => {
      const state = neuro.getState();
      signals.value = state.signals || {};
    });

    // Subscribe to signal:update events
    cleanup = neuro.on('signal:update', ({ name, value }: { name: string; value: any }) => {
      signals.value = {
        ...signals.value,
        [name]: value,
      };
    });
  }, { immediate: true });

  onUnmounted(() => {
    if (unsubscribe) unsubscribe();
    if (cleanup) cleanup();
  });

  const updateSignal = (name: string, value: any) => {
    const neuro = neuroRef.value;
    if (neuro) {
      neuro.signals.update(name, value);
    }
  };

  return [signals, updateSignal];
}
