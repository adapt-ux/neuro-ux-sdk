/**
 * @adapt-ux/neuro-signals
 * 
 * Signals package for NeuroUX SDK.
 * Provides signal classes and utilities for behavior detection.
 * 
 * Note: SignalContextImpl is exported but marked @internal.
 */

// Public signal classes
export * from './lib/base-signal';
export * from './lib/idle-signal';
export * from './lib/scroll-signal';

// Public types
export * from './lib/types';

// Public signal utilities
export * from './lib/signal-snapshot';
export * from './lib/signal-manager';

// Internal signal context implementation (exported but marked @internal)
export * from './lib/signal-context';
