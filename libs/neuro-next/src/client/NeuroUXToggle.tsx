'use client';

import { useNeuroUX } from './useNeuroUX';

export function NeuroUXToggle() {
  const ux = useNeuroUX();

  return (
    <button
      onClick={() => ux.emit?.('toggle')}
      style={{
        padding: '8px 12px',
        fontSize: '14px',
        borderRadius: '8px',
        cursor: 'pointer',
      }}
    >
      NeuroUX
    </button>
  );
}
