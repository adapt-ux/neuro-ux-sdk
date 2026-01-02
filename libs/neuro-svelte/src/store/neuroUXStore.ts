import { writable, derived, get } from 'svelte/store';
import type { NeuroUXConfig } from '@adapt-ux/neuro-core';
import type { createNeuroUX } from '@adapt-ux/neuro-core';

type NeuroUXModule = typeof import('@adapt-ux/neuro-core');
type CreateNeuroUX = NeuroUXModule['createNeuroUX'];
type NeuroUXInstance = ReturnType<CreateNeuroUX>;

let instance: NeuroUXInstance | null = null;
let initialized = false;

/**
 * Creates and initializes the NeuroUX instance
 * Should be called once at app startup
 */
export async function initNeuroUX(config?: NeuroUXConfig): Promise<NeuroUXInstance> {
  if (initialized && instance) {
    return instance;
  }

  const module = await import('@adapt-ux/neuro-core');
  instance = module.createNeuroUX(config);
  initialized = true;

  // Update stores when instance state changes
  instance.subscribe(() => {
    const state = instance!.getState();
    neuroUXState.set(state);
    signalsStore.set(state.signals || {});
    uiStateStore.set(state.ui || {});
  });

  // Subscribe to signal:update events
  instance.on('signal:update', ({ name, value }) => {
    signalsStore.update((signals) => ({
      ...signals,
      [name]: value,
    }));
  });

  // Subscribe to ui:update events
  instance.on('ui:update', (updates) => {
    uiStateStore.update((ui) => ({
      ...ui,
      ...updates,
    }));
  });

  return instance;
}

/**
 * Get the NeuroUX instance (call initNeuroUX first)
 */
export function getNeuroUXInstance(): NeuroUXInstance {
  if (!instance) {
    throw new Error('NeuroUX not initialized. Call initNeuroUX() first.');
  }
  return instance;
}

/**
 * NeuroUX state store (full state)
 */
export const neuroUXState = writable<any>({ profile: 'default', signals: {}, ui: {} });

/**
 * Signals store (reactive)
 */
export const signalsStore = writable<Record<string, any>>({});

/**
 * UI state store (reactive)
 */
export const uiStateStore = writable<Record<string, any>>({});

/**
 * Derived store for NeuroUX instance (read-only)
 */
export const neuroUX = derived(neuroUXState, () => instance);
