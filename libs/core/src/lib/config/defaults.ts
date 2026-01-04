import { NormalizedConfig } from './config-schema';

/**
 * Default configuration values
 * These are applied when user config is missing or incomplete
 * 
 * @internal This constant is internal and not part of the public API.
 */
export const defaultConfig: NormalizedConfig = {
  profile: 'default',
  rules: [],
  signals: [],
  styling: {},
  features: {},
  debug: false,
};
