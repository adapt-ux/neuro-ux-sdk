'use client';

import { NeuroUXProvider as ReactNeuroUXProvider } from '@adapt-ux/neuro-react';
import type { NeuroUXConfig } from '@adapt-ux/neuro-core';

export interface NeuroUXProviderProps {
  children: React.ReactNode;
  config?: NeuroUXConfig;
}

/**
 * NeuroUXProvider for Next.js App Router (Client Component)
 * Wraps the React NeuroUXProvider and ensures client-only initialization
 */
export function NeuroUXProvider({ children, config }: NeuroUXProviderProps) {
  // Client-only initialization - SSR-safe
  if (typeof window === 'undefined') {
    return <>{children}</>;
  }

  return <ReactNeuroUXProvider config={config}>{children}</ReactNeuroUXProvider>;
}
