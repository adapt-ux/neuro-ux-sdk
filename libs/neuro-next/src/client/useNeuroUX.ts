'use client';

import { useEffect, useState } from 'react';
import { createNeuroUX } from '@adapt-ux/neuro-core';
import type { NeuroUXNextConfig } from '../types';

export function useNeuroUX(config: NeuroUXNextConfig = {}) {
  const [ux] = useState(() => createNeuroUX(config));

  useEffect(() => {
    ux.init();
    return () => ux.destroy();
  }, []);

  return ux;
}
