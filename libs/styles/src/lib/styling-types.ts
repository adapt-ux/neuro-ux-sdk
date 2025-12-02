/**
 * Logical style state that can be converted to CSS variables
 */
export interface StyleState {
  calmMode?: boolean;
  contrast?: 'low' | 'normal' | 'high';
  focusMode?: boolean;
  [key: string]: unknown;
}

/**
 * CSS variable map
 */
export type CSSVariables = Record<string, string>;

/**
 * Style mapping configuration
 * Maps logical style properties to CSS variable definitions
 */
export interface StyleMapping {
  [key: string]: {
    [value: string]: CSSVariables;
  };
}

/**
 * Preset configuration
 */
export interface Preset {
  name: string;
  styleState: StyleState;
}

/**
 * Scope selector for CSS variable injection
 */
export type Scope = ':root' | `[data-neuroux-scope="${string}"]`;

/**
 * Styling engine options for Core State subscription
 */
export interface StylingEngineOptions {
  /**
   * Custom style mappings
   * If not provided, uses default mappings from presets
   */
  mappings?: StyleMapping;

  /**
   * CSS variable namespace prefix
   * Default: 'neuroux'
   */
  namespace?: string;

  /**
   * Initial scope for CSS variable injection
   * Default: ':root'
   */
  scope?: Scope;
}

/**
 * Core state subscriber interface
 */
export interface CoreStateSubscriber {
  subscribe(callback: (state: unknown) => void): () => void;
  getState(): unknown;
}
