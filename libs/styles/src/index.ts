export const styles = {
  version: '0.0.1',
};

// Export UI Channel-based styling engine (existing)
export * from './lib/styling-engine';

// Export Core State-based styling engine (new)
export * from './lib/core-styling-engine';
export * from './lib/css-writer';
export * from './lib/styling-types';
export * from './lib/presets/base';
