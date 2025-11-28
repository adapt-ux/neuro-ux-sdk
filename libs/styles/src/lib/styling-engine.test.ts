import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createStylingEngine, StylingEngine, UiChannel, EventBus } from './styling-engine';

// Simple implementations for testing
function createUiChannel(): UiChannel {
  const state: Record<string, unknown> = {};
  const updateHandlers = new Set<(updates: Record<string, unknown>) => void>();

  function set(key: string, value: unknown) {
    if (state[key] === value) {
      return;
    }
    
    state[key] = value;
    const updates = { [key]: value };
    
    updateHandlers.forEach((handler) => handler(updates));
  }

  function get(key: string): unknown {
    return state[key];
  }

  function getAll(): Record<string, unknown> {
    return { ...state };
  }

  function onUpdate(handler: (updates: Record<string, unknown>) => void): () => void {
    updateHandlers.add(handler);
    return () => updateHandlers.delete(handler);
  }

  return {
    set,
    get,
    getAll,
    onUpdate,
  };
}

function createEventBus(): EventBus {
  const listeners = new Map<string, Set<(...args: unknown[]) => void>>();

  function on(event: string, cb: (...args: unknown[]) => void) {
    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }
    listeners.get(event)!.add(cb);

    return () => off(event, cb);
  }

  function off(event: string, cb: (...args: unknown[]) => void) {
    listeners.get(event)?.delete(cb);
  }

  function emit(event: string, ...args: unknown[]) {
    listeners.get(event)?.forEach((cb) => cb(...args));
  }

  return { on, off, emit };
}

// Mock document for browser environment
const mockDocument = {
  documentElement: {
    style: {
      setProperty: vi.fn(),
      removeProperty: vi.fn(),
      getPropertyValue: vi.fn(),
    },
    getAttribute: vi.fn(),
    setAttribute: vi.fn(),
    removeAttribute: vi.fn(),
  },
};

// Mock getComputedStyle
const mockComputedStyle = {
  length: 0,
  getPropertyValue: vi.fn(),
};

// Store original document
const originalDocument = global.document;

describe('createStylingEngine', () => {
  beforeEach(() => {
    // Setup browser environment
    global.document = mockDocument as any;
    global.getComputedStyle = vi.fn(() => mockComputedStyle as any);
    
    // Reset mocks
    vi.clearAllMocks();
    mockDocument.documentElement.style.setProperty.mockClear();
    mockDocument.documentElement.style.removeProperty.mockClear();
    mockComputedStyle.length = 0;
  });

  afterEach(() => {
    // Restore original document
    global.document = originalDocument;
  });

  describe('initialization', () => {
    it('should create a styling engine', () => {
      const ui = createUiChannel();
      const engine = createStylingEngine(ui);

      expect(engine).toBeDefined();
      expect(engine).toHaveProperty('apply');
      expect(engine).toHaveProperty('reset');
      expect(engine).toHaveProperty('destroy');
      expect(engine).toHaveProperty('onUpdate');
    });

    it('should implement the StylingEngine interface', () => {
      const ui = createUiChannel();
      const engine = createStylingEngine(ui);

      const engineTyped: StylingEngine = engine;
      expect(engineTyped.apply).toBeDefined();
      expect(engineTyped.reset).toBeDefined();
      expect(engineTyped.destroy).toBeDefined();
      expect(engineTyped.onUpdate).toBeDefined();
    });

    it('should apply initial UI state', () => {
      const ui = createUiChannel();
      ui.set('colorMode', 'calm');
      
      const engine = createStylingEngine(ui);

      // Should have applied initial state
      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalled();
    });
  });

  describe('apply', () => {
    it('should apply CSS variables from UI output', () => {
      const ui = createUiChannel();
      const engine = createStylingEngine(ui);

      engine.apply({ colorMode: 'calm' });

      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--neuroux-color-accent',
        '#88aaff'
      );
      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--neuroux-background',
        '#f6f9ff'
      );
    });

    it('should apply multiple UI outputs', () => {
      const ui = createUiChannel();
      const engine = createStylingEngine(ui);

      engine.apply({
        colorMode: 'calm',
        highlight: true,
      });

      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--neuroux-color-accent',
        '#88aaff'
      );
      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--neuroux-focus-border',
        '2px solid #88aaff'
      );
    });

    it('should ignore unknown UI keys', () => {
      const ui = createUiChannel();
      const engine = createStylingEngine(ui);

      const initialCallCount = mockDocument.documentElement.style.setProperty.mock.calls.length;
      
      engine.apply({ unknownKey: 'value' });

      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledTimes(initialCallCount);
    });

    it('should ignore unknown values for known keys', () => {
      const ui = createUiChannel();
      const engine = createStylingEngine(ui);

      const initialCallCount = mockDocument.documentElement.style.setProperty.mock.calls.length;
      
      engine.apply({ colorMode: 'unknown-mode' });

      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledTimes(initialCallCount);
    });

    it('should handle boolean values', () => {
      const ui = createUiChannel();
      const engine = createStylingEngine(ui);

      engine.apply({ highlight: true });

      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--neuroux-focus-border',
        '2px solid #88aaff'
      );
    });

    it('should handle string values', () => {
      const ui = createUiChannel();
      const engine = createStylingEngine(ui);

      engine.apply({ colorMode: 'vibrant' });

      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--neuroux-color-accent',
        '#ff6b6b'
      );
    });
  });

  describe('custom mappings', () => {
    it('should use custom mappings when provided', () => {
      const ui = createUiChannel();
      const customMappings = {
        customKey: {
          'customValue': {
            '--neuroux-custom-var': '#ff0000',
          },
        },
      };

      const engine = createStylingEngine(ui, { mappings: customMappings });

      engine.apply({ customKey: 'customValue' });

      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--neuroux-custom-var',
        '#ff0000'
      );
    });

    it('should use custom namespace when provided', () => {
      const ui = createUiChannel();
      const customMappings = {
        test: {
          'value': {
            'color-accent': '#ff0000', // No -- prefix, will get namespace
          },
        },
      };
      const engine = createStylingEngine(ui, { 
        namespace: 'custom',
        mappings: customMappings,
      });

      engine.apply({ test: 'value' });

      // Should use custom namespace
      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--custom-color-accent',
        '#ff0000'
      );
    });
  });

  describe('onUpdate', () => {
    it('should call callback when styles are applied', () => {
      const ui = createUiChannel();
      const engine = createStylingEngine(ui);
      const callback = vi.fn();

      engine.onUpdate(callback);
      engine.apply({ colorMode: 'calm' });

      expect(callback).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          '--neuroux-color-accent': '#88aaff',
        })
      );
    });

    it('should support multiple callbacks', () => {
      const ui = createUiChannel();
      const engine = createStylingEngine(ui);
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      engine.onUpdate(callback1);
      engine.onUpdate(callback2);
      engine.apply({ colorMode: 'calm' });

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('should allow unsubscribing callbacks', () => {
      const ui = createUiChannel();
      const engine = createStylingEngine(ui);
      const callback = vi.fn();

      const unsubscribe = engine.onUpdate(callback);
      engine.apply({ colorMode: 'calm' });

      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();
      engine.apply({ colorMode: 'vibrant' });

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('event bus integration', () => {
    it('should emit style:update event when event bus is provided', () => {
      const ui = createUiChannel();
      const eventBus = createEventBus();
      const emitSpy = vi.spyOn(eventBus, 'emit');

      const engine = createStylingEngine(ui, { eventBus });

      engine.apply({ colorMode: 'calm' });

      expect(emitSpy).toHaveBeenCalledWith(
        'style:update',
        expect.objectContaining({
          '--neuroux-color-accent': '#88aaff',
        })
      );
    });

    it('should not emit event when event bus is not provided', () => {
      const ui = createUiChannel();
      const eventBus = createEventBus();
      const emitSpy = vi.spyOn(eventBus, 'emit');

      const engine = createStylingEngine(ui);

      engine.apply({ colorMode: 'calm' });

      expect(emitSpy).not.toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should remove CSS variables that were applied', () => {
      const ui = createUiChannel();
      const engine = createStylingEngine(ui);

      // Apply some styles first
      engine.apply({ colorMode: 'calm' });

      // Clear previous calls
      mockDocument.documentElement.style.removeProperty.mockClear();

      // Now reset
      engine.reset();

      expect(mockDocument.documentElement.style.removeProperty).toHaveBeenCalledWith(
        '--neuroux-color-accent'
      );
      expect(mockDocument.documentElement.style.removeProperty).toHaveBeenCalledWith(
        '--neuroux-background'
      );
      expect(mockDocument.documentElement.style.removeProperty).toHaveBeenCalledWith(
        '--neuroux-text'
      );
    });

    it('should call onUpdate callbacks after reset', () => {
      const ui = createUiChannel();
      const engine = createStylingEngine(ui);
      const callback = vi.fn();

      engine.onUpdate(callback);
      engine.reset();

      expect(callback).toHaveBeenCalledWith({});
    });

    it('should emit style:update event after reset', () => {
      const ui = createUiChannel();
      const eventBus = createEventBus();
      const emitSpy = vi.spyOn(eventBus, 'emit');

      const engine = createStylingEngine(ui, { eventBus });

      engine.reset();

      expect(emitSpy).toHaveBeenCalledWith('style:update', {});
    });
  });

  describe('destroy', () => {
    it('should clean up UI channel subscription', () => {
      const ui = createUiChannel();
      const engine = createStylingEngine(ui);

      engine.destroy();

      // After destroy, apply should not work
      const initialCallCount = mockDocument.documentElement.style.setProperty.mock.calls.length;
      engine.apply({ colorMode: 'calm' });

      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledTimes(initialCallCount);
    });

    it('should clear all callbacks', () => {
      const ui = createUiChannel();
      const engine = createStylingEngine(ui);
      const callback = vi.fn();

      engine.onUpdate(callback);
      
      // Apply something before destroy to ensure callback works
      engine.apply({ colorMode: 'calm' });
      expect(callback).toHaveBeenCalled();
      
      // Clear mock and destroy
      callback.mockClear();
      engine.destroy();
      
      // After destroy, apply should not trigger callbacks
      engine.apply({ colorMode: 'vibrant' });

      expect(callback).not.toHaveBeenCalled();
    });

    it('should reset CSS variables on destroy', () => {
      const ui = createUiChannel();
      const engine = createStylingEngine(ui);

      // Apply some styles first
      engine.apply({ colorMode: 'calm' });

      // Clear previous calls
      mockDocument.documentElement.style.removeProperty.mockClear();

      engine.destroy();

      expect(mockDocument.documentElement.style.removeProperty).toHaveBeenCalled();
    });

    it('should be idempotent', () => {
      const ui = createUiChannel();
      const engine = createStylingEngine(ui);

      engine.destroy();
      expect(() => engine.destroy()).not.toThrow();
    });
  });

  describe('UI channel integration', () => {
    it('should automatically apply styles when UI channel updates', () => {
      const ui = createUiChannel();
      const engine = createStylingEngine(ui);

      ui.set('colorMode', 'calm');

      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--neuroux-color-accent',
        '#88aaff'
      );
    });

    it('should stop applying styles after destroy', () => {
      const ui = createUiChannel();
      const engine = createStylingEngine(ui);

      engine.destroy();

      const initialCallCount = mockDocument.documentElement.style.setProperty.mock.calls.length;
      ui.set('colorMode', 'calm');

      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledTimes(initialCallCount);
    });
  });

  describe('SSR safety', () => {
    it('should no-op when document is undefined', () => {
      // Remove document
      delete (global as any).document;

      const ui = createUiChannel();
      const engine = createStylingEngine(ui);

      expect(() => {
        engine.apply({ colorMode: 'calm' });
        engine.reset();
        engine.destroy();
      }).not.toThrow();
    });

    it('should no-op when documentElement is null', () => {
      global.document = {
        documentElement: null,
      } as any;

      const ui = createUiChannel();
      const engine = createStylingEngine(ui);

      expect(() => {
        engine.apply({ colorMode: 'calm' });
        engine.reset();
      }).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle empty UI output', () => {
      const ui = createUiChannel();
      const engine = createStylingEngine(ui);
      const callback = vi.fn();

      engine.onUpdate(callback);
      engine.apply({});

      // Should not call callback if nothing was applied
      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle CSS variables without -- prefix', () => {
      const ui = createUiChannel();
      const customMappings = {
        test: {
          'value': {
            'neuroux-test-var': '#ff0000', // No -- prefix
          },
        },
      };

      const engine = createStylingEngine(ui, { mappings: customMappings });

      engine.apply({ test: 'value' });

      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--neuroux-test-var',
        '#ff0000'
      );
    });

    it('should handle CSS variables with -- prefix', () => {
      const ui = createUiChannel();
      const customMappings = {
        test: {
          'value': {
            '--neuroux-test-var': '#ff0000', // With -- prefix
          },
        },
      };

      const engine = createStylingEngine(ui, { mappings: customMappings });

      engine.apply({ test: 'value' });

      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--neuroux-test-var',
        '#ff0000'
      );
    });
  });
});
