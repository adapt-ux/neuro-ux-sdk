import { onMounted, onUnmounted } from 'vue';
import { createNeuroUX } from '@adapt-ux/neuro-core';

export function useNeuroUX() {
  const ux = createNeuroUX();

  onMounted(() => ux.init());
  onUnmounted(() => ux.destroy());

  return ux;
}
