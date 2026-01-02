import { inject, provide, ref, type InjectionKey, type Ref } from 'vue';
import type { NeuroUXConfig } from '@adapt-ux/neuro-core';
import type { createNeuroUX } from '@adapt-ux/neuro-core';

type NeuroUXModule = typeof import('@adapt-ux/neuro-core');
type CreateNeuroUX = NeuroUXModule['createNeuroUX'];
export type NeuroUXInstance = ReturnType<CreateNeuroUX>;

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
  import('@adapt-ux/neuro-core').then((module) => {
    instanceRef.value = module.createNeuroUX(config);
  });
  
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
