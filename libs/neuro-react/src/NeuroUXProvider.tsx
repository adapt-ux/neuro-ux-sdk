'use client';

import { createContext, useEffect, useState, type ReactNode } from 'react';
import type { NeuroUXConfig } from '@adapt-ux/neuro-core';
import type { createNeuroUX } from '@adapt-ux/neuro-core';

// Use dynamic import type to avoid static import of lazy-loaded library
type NeuroUXModule = typeof import('@adapt-ux/neuro-core');
type CreateNeuroUX = NeuroUXModule['createNeuroUX'];
export type NeuroUXInstance = ReturnType<CreateNeuroUX>;

export const NeuroUXContext = createContext<NeuroUXInstance | null>(null);

export interface NeuroUXProviderProps {
  children: ReactNode;
  config?: NeuroUXConfig;
}

/**
 * NeuroUXProvider - React Context Provider for NeuroUX Core Engine
 * Initializes the NeuroUX engine and provides it to child components via context.
 * Properly cleans up on unmount.
 */
export function NeuroUXProvider({ children, config = {} }: NeuroUXProviderProps) {
  const [neuroUX, setNeuroUX] = useState<NeuroUXInstance | null>(null);

  useEffect(() => {
    let mounted = true;
    let instance: NeuroUXInstance | null = null;

    // Dynamically import createNeuroUX to avoid static import issues
    import('@adapt-ux/neuro-core').then((module) => {
      if (mounted) {
        instance = module.createNeuroUX(config);
        setNeuroUX(instance);
      }
    });

    return () => {
      mounted = false;
      if (instance) {
        instance.destroy();
      }
    };
  }, [JSON.stringify(config)]); // Use JSON.stringify for deep comparison

  if (!neuroUX) {
    return null;
  }

  return (
    <NeuroUXContext.Provider value={neuroUX}>{children}</NeuroUXContext.Provider>
  );
}
