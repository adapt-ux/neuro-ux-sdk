export interface NeuroUXConfig {
  profile?: string;
  signals?: string[];
  rules?: any[];
}

export interface NormalizedConfig {
  profile: string;
  signals: string[];
  rules: any[];
}

/**
 * Default config
 */
const defaultConfig: NormalizedConfig = {
  profile: 'default',
  signals: [],
  rules: [],
};

/**
 * Loads + normalizes user config
 */
export function loadConfig(user: NeuroUXConfig = {}): NormalizedConfig {
  return {
    ...defaultConfig,
    ...user,
    signals: user.signals ?? defaultConfig.signals,
    rules: user.rules ?? defaultConfig.rules,
  };
}
