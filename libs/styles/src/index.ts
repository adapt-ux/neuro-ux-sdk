export const styles = {
  version: '0.0.1',
};

// Export shared types first
export type {
  StyleState,
  CSSVariables,
  StyleMapping,
  StylingEngineOptions,
  Preset,
  Scope,
  CoreStateSubscriber,
} from './lib/styling-types';

// Export UI Channel-based styling engine (existing)
export {
  createStylingEngine,
  type UiChannel,
  type EventBus,
  type StylingEngine,
  type UiChannelStylingEngineOptions,
} from './lib/styling-engine';

// Export Core State-based styling engine (new)
export * from './lib/core-styling-engine';
export * from './lib/css-writer';
export * from './lib/presets/base';
