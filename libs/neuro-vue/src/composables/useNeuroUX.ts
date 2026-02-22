import { inject, provide, ref, type InjectionKey, type Ref } from 'vue';

// Define types locally to avoid module resolution issues during build
export type NeuroUXConfig = {
  profile?: string;
  rules?: any[];
  signals?: any[];
  styling?: Record<string, any>;
  features?: Record<string, boolean>;
  debug?: boolean;
};

// Type for NeuroUX instance - will be resolved at runtime
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NeuroUXInstance = any;

const NeuroUXInjectionKey: InjectionKey<Ref<NeuroUXInstance | null>> = Symbol('neuro-ux');

/**
 * Provides NeuroUX instance to child components
 * Should be called at the root of your Vue app (in setup)
 * 
 * @param config - NeuroUX configuration
 * @returns The reactive NeuroUX instance ref
 * 
 * @example
 * ```vue
 * <script setup>
 * import { provideNeuroUX } from '@adapt-ux/neuro-vue';
 * 
 * const neuro = provideNeuroUX({ profile: 'adhd' });
 * </script>
 * ```
 */
export function provideNeuroUX(config?: NeuroUXConfig): Ref<NeuroUXInstance | null> {
  // Check if already provided
  const existing = inject(NeuroUXInjectionKey, null);
  if (existing) {
    return existing;
  }

  // Create reactive ref for instance
  const instanceRef = ref<NeuroUXInstance | null>(null);
  
  // Dynamically import and create instance
  // Use dynamic import to avoid static import issues during build
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (async () => {
    try {
      const module = await import('@adapt-ux/neuro-core' as any);
      if (module && module.createNeuroUX) {
        instanceRef.value = module.createNeuroUX(config);
      }
    } catch (error) {
      // Handle import error at runtime
      console.warn('Failed to load @adapt-ux/neuro-core:', error);
    }
  })();
  
  provide(NeuroUXInjectionKey, instanceRef);

  return instanceRef;
}

/**
 * useNeuroUX - Vue composable to access the NeuroUX instance
 * 
 * @throws {Error} If used without provideNeuroUX
 * @returns {NeuroUXInstance} The NeuroUX engine instance
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useNeuroUX } from '@adapt-ux/neuro-vue';
 * 
 * const neuro = useNeuroUX();
 * const state = neuro.value.getState();
 * </script>
 * ```
 */
export function useNeuroUX(): Ref<NeuroUXInstance | null> {
  const instanceRef = inject(NeuroUXInjectionKey, null);
  
  if (!instanceRef) {
    throw new Error('useNeuroUX must be used after provideNeuroUX');
  }
  
  return instanceRef;
}
