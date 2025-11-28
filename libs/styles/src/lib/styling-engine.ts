/**
 * UI Channel interface
 */
export interface UiChannel {
  set(key: string, value: unknown): void;
  get(key: string): unknown;
  getAll(): Record<string, unknown>;
  onUpdate(handler: (updates: Record<string, unknown>) => void): () => void;
}

/**
 * Event bus interface for styling engine
 */
export interface EventBus {
  emit(event: string, ...args: unknown[]): void;
  on(event: string, callback: (...args: unknown[]) => void): () => void;
  off(event: string, callback: (...args: unknown[]) => void): void;
}

/**
 * Style mapping configuration
 * Maps UI output keys to CSS variable definitions
 * Values are converted to strings when used as keys
 */
export interface StyleMapping {
  [uiKey: string]: Record<string, Record<string, string>>;
}

/**
 * Styling engine options
 */
export interface StylingEngineOptions {
  /**
   * Custom style mappings
   * If not provided, uses default mappings
   */
  mappings?: StyleMapping;

  /**
   * CSS variable namespace prefix
   * Default: 'neuroux'
   */
  namespace?: string;

  /**
   * Event bus for emitting style:update events
   */
  eventBus?: EventBus;
}

/**
 * Styling engine instance
 */
export interface StylingEngine {
  /**
   * Apply UI output to CSS variables
   */
  apply(uiOutput: Record<string, unknown>): void;

  /**
   * Reset all CSS variables to empty
   */
  reset(): void;

  /**
   * Destroy the styling engine and clean up listeners
   */
  destroy(): void;

  /**
   * Subscribe to style update events
   */
  onUpdate(callback: (updates: Record<string, string>) => void): () => void;
}

/**
 * Default style mappings
 * Maps common UI outputs to CSS variables
 */
const DEFAULT_MAPPINGS: StyleMapping = {
  colorMode: {
    calm: {
      '--neuroux-color-accent': '#88aaff',
      '--neuroux-background': '#f6f9ff',
      '--neuroux-text': '#1a1a2e',
    },
    vibrant: {
      '--neuroux-color-accent': '#ff6b6b',
      '--neuroux-background': '#fff5f5',
      '--neuroux-text': '#2d3436',
    },
    neutral: {
      '--neuroux-color-accent': '#636e72',
      '--neuroux-background': '#ffffff',
      '--neuroux-text': '#111111',
    },
  },
  highlight: {
    true: {
      '--neuroux-focus-border': '2px solid #88aaff',
      '--neuroux-focus-shadow': '0 0 0 3px rgba(136, 170, 255, 0.3)',
    },
    false: {
      '--neuroux-focus-border': '1px solid #ccc',
      '--neuroux-focus-shadow': 'none',
    },
  },
  contrast: {
    high: {
      '--neuroux-contrast-ratio': '1.5',
      '--neuroux-text': '#000000',
      '--neuroux-background': '#ffffff',
    },
    low: {
      '--neuroux-contrast-ratio': '1.1',
      '--neuroux-text': '#666666',
      '--neuroux-background': '#f5f5f5',
    },
  },
};

/**
 * Check if we're in a browser environment
 */
function isBrowser(): boolean {
  return typeof document !== 'undefined';
}

/**
 * Get the document root element
 */
function getRootElement(): HTMLElement | null {
  if (!isBrowser()) {
    return null;
  }
  return document.documentElement;
}

/**
 * Creates a styling engine that maps UI output to CSS variables
 */
export function createStylingEngine(
  ui: UiChannel,
  options: StylingEngineOptions = {}
): StylingEngine {
  const {
    mappings = DEFAULT_MAPPINGS,
    namespace = 'neuroux',
    eventBus,
  } = options;

  const updateCallbacks = new Set<(updates: Record<string, string>) => void>();
  const appliedVariables = new Set<string>(); // Track applied CSS variables
  let unsubscribeUi: (() => void) | null = null;
  let isDestroyed = false;

  /**
   * Apply a single UI output key-value pair to CSS variables
   */
  function applyUiKey(key: string, value: unknown): Record<string, string> {
    const applied: Record<string, string> = {};
    const root = getRootElement();

    if (!root || isDestroyed) {
      return applied;
    }

    // Get mapping for this UI key
    const keyMapping = mappings[key];
    if (!keyMapping) {
      return applied;
    }

    // Get CSS variable definitions for this value
    const valueMapping = keyMapping[String(value)];
    if (!valueMapping) {
      return applied;
    }

    // Apply each CSS variable
    Object.entries(valueMapping).forEach(([cssVar, cssValue]) => {
      // Normalize CSS variable name
      let normalizedVar: string;
      if (cssVar.startsWith('--')) {
        // If it already has --, check if it has our namespace
        if (cssVar.startsWith(`--${namespace}-`)) {
          // Already has our namespace, use as is
          normalizedVar = cssVar;
        } else {
          // Has -- but different namespace, replace or add our namespace
          const varName = cssVar.replace(/^--[^-]+-/, ''); // Remove existing namespace
          normalizedVar = `--${namespace}-${varName}`;
        }
      } else {
        // No -- prefix, check if it already starts with namespace
        if (cssVar.startsWith(`${namespace}-`)) {
          // Already has namespace, just add --
          normalizedVar = `--${cssVar}`;
        } else {
          // No namespace, add both
          normalizedVar = `--${namespace}-${cssVar}`;
        }
      }

      root.style.setProperty(normalizedVar, cssValue);
      appliedVariables.add(normalizedVar); // Track applied variable
      applied[normalizedVar] = cssValue;
    });

    return applied;
  }

  /**
   * Apply UI output to CSS variables
   */
  function apply(uiOutput: Record<string, unknown>): void {
    if (isDestroyed || !isBrowser()) {
      return;
    }

    const allApplied: Record<string, string> = {};

    // Apply each key-value pair from UI output
    Object.entries(uiOutput).forEach(([key, value]) => {
      const applied = applyUiKey(key, value);
      Object.assign(allApplied, applied);
    });

    // Notify callbacks
    if (Object.keys(allApplied).length > 0) {
      updateCallbacks.forEach((cb) => cb(allApplied));

      // Emit event if event bus is provided
      if (eventBus) {
        eventBus.emit('style:update', allApplied);
      }
    }
  }

  /**
   * Reset all CSS variables that match the namespace
   */
  function reset(): void {
    if (isDestroyed || !isBrowser()) {
      return;
    }

    const root = getRootElement();
    if (!root) {
      return;
    }

    // Remove all tracked CSS variables
    appliedVariables.forEach((varName) => {
      root.style.removeProperty(varName);
    });

    // Clear the tracking set
    appliedVariables.clear();

    // Notify callbacks
    updateCallbacks.forEach((cb) => cb({}));

    if (eventBus) {
      eventBus.emit('style:update', {});
    }
  }

  /**
   * Subscribe to style update events
   */
  function onUpdate(
    callback: (updates: Record<string, string>) => void
  ): () => void {
    if (isDestroyed) {
      return () => {
        // No-op unsubscribe when destroyed
      };
    }

    updateCallbacks.add(callback);
    return () => updateCallbacks.delete(callback);
  }

  /**
   * Destroy the styling engine
   */
  function destroy(): void {
    if (isDestroyed) {
      return;
    }

    // Unsubscribe from UI channel first
    if (unsubscribeUi) {
      unsubscribeUi();
      unsubscribeUi = null;
    }

    // Clear callbacks before reset (so reset doesn't call them)
    updateCallbacks.clear();

    // Reset CSS variables
    const root = getRootElement();
    if (root) {
      appliedVariables.forEach((varName) => {
        root.style.removeProperty(varName);
      });
      appliedVariables.clear();
    }

    // Mark as destroyed
    isDestroyed = true;
  }

  // Subscribe to UI channel updates
  unsubscribeUi = ui.onUpdate((updates) => {
    apply(updates);
  });

  // Apply initial UI state
  const initialUi = ui.getAll();
  if (Object.keys(initialUi).length > 0) {
    apply(initialUi);
  }

  return {
    apply,
    reset,
    destroy,
    onUpdate,
  };
}
