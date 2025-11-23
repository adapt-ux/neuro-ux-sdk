import { writable } from 'svelte/store';
import { createNeuroUX } from '@adapt-ux/neuro-core';

export function useNeuroUX() {
  const ux = createNeuroUX();
  const state = writable(ux.getState());

  ux.on('ready', () => state.set(ux.getState()));

  return { ux, state };
}
