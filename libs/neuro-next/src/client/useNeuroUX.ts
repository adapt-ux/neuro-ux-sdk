'use client';

import { useNeuroUX as useReactNeuroUX } from '@adapt-ux/neuro-react';

/**
 * useNeuroUX for Next.js - Re-exports the React hook
 * Use AssistProvider to provide the NeuroUX instance
 */
export function useNeuroUX() {
  return useReactNeuroUX();
}
