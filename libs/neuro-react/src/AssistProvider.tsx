'use client';

import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { createNeuroUX, type NeuroUXConfig } from '@adapt-ux/neuro-core';

export type NeuroUXInstance = ReturnType<typeof createNeuroUX>;

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
  const [neuroUX] = useState<NeuroUXInstance>(() => createNeuroUX(config));

  useEffect(() => {
    // Apply initial UI state if needed
    const initialUi = neuroUX.ui.getAll();
    if (Object.keys(initialUi).length > 0) {
      neuroUX.styling.apply(initialUi);
    }

    return () => {
      neuroUX.destroy();
    };
  }, [neuroUX]);

  return (
    <NeuroContext.Provider value={neuroUX}>
      {children}
    </NeuroContext.Provider>
  );
}
