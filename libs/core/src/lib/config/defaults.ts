import { NormalizedConfig } from './config-schema';

/**
 * Default configuration values
 * These are applied when user config is missing or incomplete
 */
export const defaultConfig: NormalizedConfig = {
  profile: 'default',
  rules: [],
  signals: [],
  styling: {},
  features: {},
};
