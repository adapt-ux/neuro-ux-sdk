import * as React from 'react';
import type { NeuroUXNextConfig } from '../types';

export function NeuroUXProvider({
  children,
  config = {},
}: {
  children: React.ReactNode;
  config?: NeuroUXNextConfig;
}) {
  return (
    <html lang="en">
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__NEURO_UX_CONFIG__ = ${JSON.stringify(config)};
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
