import { Rule } from '../rules/rule-types';

/**
 * Signal constructor type
 * For MVP, we support both string names and constructor functions
 */
export type SignalConstructor = string | (new (...args: any[]) => any);

/**
 * Styling preset configuration
 * Partial object that can be merged with defaults
 */
export type StylingPreset = Record<string, any>;

/**
 * User-provided NeuroUX configuration
 */
export interface NeuroUXConfig {
  profile?: string;
  rules?: Rule[];
  signals?: SignalConstructor[];
  styling?: Partial<StylingPreset>;
  features?: Record<string, boolean>;
}

/**
 * Normalized configuration with all defaults applied
 */
export interface NormalizedConfig {
  profile: string;
  rules: Rule[];
  signals: SignalConstructor[];
  styling: Partial<StylingPreset>;
  features: Record<string, boolean>;
}
