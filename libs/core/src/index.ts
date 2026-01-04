/**
 * @adapt-ux/neuro-core
 * 
 * Main entry point for the NeuroUX Core package.
 * 
 * Public APIs:
 * - createNeuroUX() - Main factory function
 * - Types, interfaces, and stable APIs
 * 
 * Note: Some internal APIs are exported but marked with @internal JSDoc tags.
 * These are not part of the public API surface and may change without notice.
 */

// Main public API
export * from './lib/createNeuroUX';

// Public types
export * from './lib/types';

// EventBus class and types
export * from './lib/events';

// Configuration types (NeuroUXConfig is public, NormalizedConfig is internal)
export * from './lib/config';

// Internal state management (exported for framework wrappers, but marked @internal)
export * from './lib/state';

// Rules system (public APIs)
export * from './lib/rules';
export { createRuleProcessor } from './lib/rule-processor';

// Internal event bus (exported for framework wrappers, but marked @internal)
export * from './lib/event-bus';

// Signals registry (public API)
export * from './lib/signals';

// UI channel (public API)
export * from './lib/ui-channel';

// Heuristics engine (public API)
export * from './lib/heuristics-engine';

// Debug API (experimental, marked with @experimental)
export * from './lib/debug';
