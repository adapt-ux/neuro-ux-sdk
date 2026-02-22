import { onUnmounted } from 'vue';

// Define type locally to avoid module resolution issues during build
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NeuroUXInstance = any;

export function useNeuroUX() {
  // Dynamically import and create instance
  // Use dynamic import to avoid static import issues during build
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let ux: NeuroUXInstance | null = null;

  (async () => {
    try {
      const module = await import('@adapt-ux/neuro-core' as any);
      if (module && module.createNeuroUX) {
        ux = module.createNeuroUX();
      }
    } catch (error) {
      // Handle import error at runtime
      console.warn('Failed to load @adapt-ux/neuro-core:', error);
    }
  })();

  onUnmounted(() => {
    if (ux && typeof ux.destroy === 'function') {
      ux.destroy();
    }
  });

  return ux;
}
