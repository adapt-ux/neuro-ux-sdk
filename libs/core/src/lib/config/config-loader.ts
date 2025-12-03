import { NeuroUXConfig, NormalizedConfig } from './config-schema';
import { defaultConfig } from './defaults';

/**
 * Validates configuration and emits warnings for invalid values
 * MVP: Only warns, never throws
 */
function validateConfig(config: NeuroUXConfig): void {
  // Validate rules
  if (config.rules !== undefined) {
    if (!Array.isArray(config.rules)) {
      console.warn(
        '[NeuroUX] Invalid config: "rules" must be an array. Using default.'
      );
    }
  }

  // Validate signals
  if (config.signals !== undefined) {
    if (!Array.isArray(config.signals)) {
      console.warn(
        '[NeuroUX] Invalid config: "signals" must be an array. Using default.'
      );
    }
  }

  // Validate styling
  if (config.styling !== undefined) {
    if (typeof config.styling !== 'object' || config.styling === null || Array.isArray(config.styling)) {
      console.warn(
        '[NeuroUX] Invalid config: "styling" must be an object. Using default.'
      );
    }
  }

  // Validate features
  if (config.features !== undefined) {
    if (typeof config.features !== 'object' || config.features === null || Array.isArray(config.features)) {
      console.warn(
        '[NeuroUX] Invalid config: "features" must be an object. Using default.'
      );
    }
  }

  // Validate profile
  if (config.profile !== undefined) {
    if (typeof config.profile !== 'string' || config.profile.trim().length === 0) {
      console.warn(
        '[NeuroUX] Invalid config: "profile" must be a non-empty string. Using default.'
      );
    }
  }
}

/**
 * Normalizes user configuration by merging with defaults
 * and validating values
 */
export function normalizeConfig(
  userConfig: NeuroUXConfig = {}
): NormalizedConfig {
  // Validate first (warnings only)
  validateConfig(userConfig);

  // Normalize and merge with defaults
  return {
    profile: userConfig.profile && typeof userConfig.profile === 'string' && userConfig.profile.trim().length > 0
      ? userConfig.profile.trim()
      : defaultConfig.profile,
    
    rules: Array.isArray(userConfig.rules)
      ? userConfig.rules
      : defaultConfig.rules,
    
    signals: Array.isArray(userConfig.signals)
      ? userConfig.signals
      : defaultConfig.signals,
    
    styling: userConfig.styling &&
      typeof userConfig.styling === 'object' &&
      userConfig.styling !== null &&
      !Array.isArray(userConfig.styling)
      ? userConfig.styling
      : defaultConfig.styling,
    
    features: userConfig.features &&
      typeof userConfig.features === 'object' &&
      userConfig.features !== null &&
      !Array.isArray(userConfig.features)
      ? userConfig.features
      : defaultConfig.features,
  };
}

/**
 * Loads and normalizes configuration
 * Alias for normalizeConfig for backward compatibility
 */
export function loadConfig(userConfig: NeuroUXConfig = {}): NormalizedConfig {
  return normalizeConfig(userConfig);
}
