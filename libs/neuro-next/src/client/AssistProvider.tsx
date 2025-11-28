'use client';

import { AssistProvider as ReactAssistProvider } from '@adapt-ux/neuro-react';
import type { NeuroUXNextConfig } from '../types';
import type { NeuroUXConfig } from '@adapt-ux/neuro-core';

/**
 * AssistProvider for Next.js - Client Component
 * Wraps the React AssistProvider and handles config from window
 */
export function AssistProvider({
  children,
  config: propConfig,
}: {
  children: React.ReactNode;
  config?: NeuroUXNextConfig;
}) {
  // Get config from window (set by server component) or from props
  const getConfig = (): NeuroUXConfig => {
    if (propConfig) {
      return propConfig;
    }
    
    if (typeof window !== 'undefined' && (window as any).__NEURO_UX_CONFIG__) {
      return (window as any).__NEURO_UX_CONFIG__;
    }
    
    return {};
  };

  return (
    <ReactAssistProvider config={getConfig()}>
      {children}
    </ReactAssistProvider>
  );
}
