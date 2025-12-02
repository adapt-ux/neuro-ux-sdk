'use client';

import { createContext, useEffect, useState, type ReactNode } from 'react';
import type { NeuroUXConfig } from '@adapt-ux/neuro-core';

// Use dynamic import type to avoid static import of lazy-loaded library
type NeuroUXModule = typeof import('@adapt-ux/neuro-core');
type CreateNeuroUX = NeuroUXModule['createNeuroUX'];
export type NeuroUXInstance = Awaited<ReturnType<CreateNeuroUX>>;

export const NeuroContext = createContext<NeuroUXInstance | null>(null);

export interface AssistProviderProps {
  children: ReactNode;
  config?: NeuroUXConfig;
}

/**
 * AssistProvider - Wrapper for React that provides context and communication with Core
 * Registers state changes and sends to components
 */
export function AssistProvider({ children, config = {} }: AssistProviderProps) {
  const [neuroUX, setNeuroUX] = useState<NeuroUXInstance | null>(null);

  useEffect(() => {
    let mounted = true;
    let instance: NeuroUXInstance | null = null;

    // Dynamically import createNeuroUX to avoid static import of lazy-loaded library
    import('@adapt-ux/neuro-core').then((module) => {
      if (mounted) {
        instance = module.createNeuroUX(config);
        setNeuroUX(instance);

        // Apply initial UI state if needed
        const initialUi = instance.ui.getAll();
        if (Object.keys(initialUi).length > 0) {
          instance.styling.apply(initialUi);
        }
      }
    });

    return () => {
      mounted = false;
      if (instance) {
        instance.destroy();
      }
    };
  }, [config]);

  if (!neuroUX) {
    return null;
  }

  return (
    <NeuroContext.Provider value={neuroUX}>{children}</NeuroContext.Provider>
  );
}
