import { useEffect, useState } from 'react';
import { createNeuroUX } from '@adapt-ux/neuro-core';

export function useNeuroUX() {
  const [ux] = useState(() => createNeuroUX());

  useEffect(() => {
    ux.init();
    return () => ux.destroy();
  }, []);

  return ux;
}
