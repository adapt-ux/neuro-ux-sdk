import * as React from 'react';
import type { NeuroUXNextConfig } from '../types';

export interface AssistProviderProps {
  children: React.ReactNode;
  config?: NeuroUXNextConfig;
}

/**
 * AssistProvider for Next.js - Server Component
 * Provides configuration via script tag for client-side hydration
 * Note: The actual provider logic is in the client component
 */
export function AssistProvider({
  children,
  config = {},
}: AssistProviderProps) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.__NEURO_UX_CONFIG__ = ${JSON.stringify(config)};
          `,
        }}
      />
      {children}
    </>
  );
}
