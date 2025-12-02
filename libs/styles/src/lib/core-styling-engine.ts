import { CSSWriter } from './css-writer';
import { defaultMappings } from './presets/base';
import type {
  StyleState,
  CSSVariables,
  StyleMapping,
  StylingEngineOptions,
  CoreStateSubscriber,
  Scope,
} from './styling-types';

/**
 * Core Styling Engine
 * Transforms logical style states into CSS variables and applies them to the DOM
 * This version subscribes directly to Core state changes
 */
export class CoreStylingEngine {
  private cssWriter: CSSWriter;
  private mappings: StyleMapping;
  private unsubscribeCore: (() => void) | null = null;
  private isDestroyed = false;
  private currentStyleState: StyleState = {};

  constructor(options: StylingEngineOptions = {}) {
    const {
      mappings = defaultMappings,
      namespace = 'neuroux',
      scope = ':root',
    } = options;

    this.cssWriter = new CSSWriter(namespace, scope);
    this.mappings = mappings;
  }

  /**
   * Map a logical style state to CSS variables
   */
  private mapStyleStateToCSS(state: StyleState): CSSVariables {
    const cssVars: CSSVariables = {};

    // Process each property in the style state
    Object.entries(state).forEach(([key, value]) => {
      const keyMapping = this.mappings[key];
      if (!keyMapping) {
        return;
      }

      // Convert value to string for mapping lookup
      const valueStr = String(value);
      const valueMapping = keyMapping[valueStr];

      if (valueMapping) {
        // Merge CSS variables from this mapping
        Object.assign(cssVars, valueMapping);
      }
    });

    return cssVars;
  }

  /**
   * Apply a style state to CSS variables
   */
  apply(state: StyleState, scope?: Scope): void {
    if (this.isDestroyed) {
      return;
    }

    // Use specified scope or current scope
    if (scope) {
      this.cssWriter.setScope(scope);
    }

    // Map style state to CSS variables
    const cssVars = this.mapStyleStateToCSS(state);

    // Write CSS variables to DOM
    this.cssWriter.write(cssVars, scope);

    // Update current style state
    this.currentStyleState = { ...this.currentStyleState, ...state };
  }

  /**
   * Reset all CSS variables
   */
  reset(scope?: Scope): void {
    if (this.isDestroyed) {
      return;
    }

    if (scope) {
      this.cssWriter.clear(scope);
    } else {
      this.cssWriter.clearAll();
    }

    this.currentStyleState = {};
  }

  /**
   * Subscribe to Core state changes
   */
  subscribeToCore(core: CoreStateSubscriber): () => void {
    if (this.isDestroyed) {
      return () => {
        // No-op unsubscribe when destroyed
      };
    }

    // Unsubscribe from previous subscription if exists
    if (this.unsubscribeCore) {
      this.unsubscribeCore();
    }

    // Subscribe to Core state changes
    this.unsubscribeCore = core.subscribe((state: unknown) => {
      if (this.isDestroyed) {
        return;
      }

      // Extract style state from Core state
      const styleState = this.extractStyleStateFromCore(state);
      if (styleState) {
        this.apply(styleState);
      }
    });

    // Apply initial state
    const initialState = core.getState();
    const initialStyleState = this.extractStyleStateFromCore(initialState);
    if (initialStyleState) {
      this.apply(initialStyleState);
    }

    return () => {
      if (this.unsubscribeCore) {
        this.unsubscribeCore();
        this.unsubscribeCore = null;
      }
    };
  }

  /**
   * Extract style state from Core state
   * This is a flexible extractor that looks for common style properties
   */
  private extractStyleStateFromCore(coreState: unknown): StyleState | null {
    if (!coreState || typeof coreState !== 'object') {
      return null;
    }

    const state = coreState as Record<string, unknown>;
    const styleState: StyleState = {};

    // Extract calmMode
    if ('calmMode' in state && typeof state['calmMode'] === 'boolean') {
      styleState.calmMode = state['calmMode'] as boolean;
    }

    // Extract contrast
    if ('contrast' in state && typeof state['contrast'] === 'string') {
      const contrast = state['contrast'] as string;
      if (['low', 'normal', 'high'].includes(contrast)) {
        styleState.contrast = contrast as 'low' | 'normal' | 'high';
      }
    }

    // Extract focusMode
    if ('focusMode' in state && typeof state['focusMode'] === 'boolean') {
      styleState.focusMode = state['focusMode'] as boolean;
    }

    // Also check in nested ui object (common pattern)
    if (
      'ui' in state &&
      typeof state['ui'] === 'object' &&
      state['ui'] !== null
    ) {
      const ui = state['ui'] as Record<string, unknown>;
      if ('calmMode' in ui && typeof ui['calmMode'] === 'boolean') {
        styleState.calmMode = ui['calmMode'] as boolean;
      }
      if ('contrast' in ui && typeof ui['contrast'] === 'string') {
        const contrast = ui['contrast'] as string;
        if (['low', 'normal', 'high'].includes(contrast)) {
          styleState.contrast = contrast as 'low' | 'normal' | 'high';
        }
      }
      if ('focusMode' in ui && typeof ui['focusMode'] === 'boolean') {
        styleState.focusMode = ui['focusMode'] as boolean;
      }
    }

    return Object.keys(styleState).length > 0 ? styleState : null;
  }

  /**
   * Get current style state
   */
  getCurrentStyleState(): StyleState {
    return { ...this.currentStyleState };
  }

  /**
   * Set scope for CSS variable injection
   */
  setScope(scope: Scope): void {
    if (this.isDestroyed) {
      return;
    }
    this.cssWriter.setScope(scope);
  }

  /**
   * Get current scope
   */
  getScope(): Scope {
    return this.cssWriter.getScope();
  }

  /**
   * Destroy the styling engine and clean up
   */
  destroy(): void {
    if (this.isDestroyed) {
      return;
    }

    // Unsubscribe from Core
    if (this.unsubscribeCore) {
      this.unsubscribeCore();
      this.unsubscribeCore = null;
    }

    // Clear all CSS variables
    this.cssWriter.clearAll();

    // Mark as destroyed
    this.isDestroyed = true;
  }
}

/**
 * Create a Core styling engine instance
 * This version subscribes directly to Core state changes
 */
export function createCoreStylingEngine(
  options: StylingEngineOptions = {}
): CoreStylingEngine {
  return new CoreStylingEngine(options);
}
