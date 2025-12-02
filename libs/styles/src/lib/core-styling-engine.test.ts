import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createCoreStylingEngine } from './core-styling-engine';
import type { CoreStateSubscriber } from './styling-types';

// Mock document for browser environment
const mockDocument = {
  documentElement: {
    style: {
      setProperty: vi.fn(),
      removeProperty: vi.fn(),
    },
  },
  querySelector: vi.fn(),
};

// Store original document
const originalDocument = global.document;
const originalWindow = global.window;

function createMockCoreState(): CoreStateSubscriber & {
  setState: (state: Record<string, unknown>) => void;
} {
  let state: Record<string, unknown> = {
    profile: 'default',
    signals: {},
    ui: {},
  };

  const subscribers = new Set<(state: unknown) => void>();

  return {
    subscribe(callback: (state: unknown) => void) {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    },
    getState() {
      return state;
    },
    setState(newState: Record<string, unknown>) {
      state = newState;
      subscribers.forEach((cb) => cb(state));
    },
  };
}

describe('CoreStylingEngine', () => {
  beforeEach(() => {
    // Setup browser environment
    global.document = mockDocument as any;
    global.window = {} as any;

    // Reset mocks
    vi.clearAllMocks();
    mockDocument.documentElement.style.setProperty.mockClear();
    mockDocument.documentElement.style.removeProperty.mockClear();
  });

  afterEach(() => {
    // Restore original document
    global.document = originalDocument;
    global.window = originalWindow;
  });

  describe('createCoreStylingEngine', () => {
    it('should create a styling engine instance', () => {
      const engine = createCoreStylingEngine();
      expect(engine).toBeDefined();
      expect(engine.apply).toBeDefined();
      expect(engine.reset).toBeDefined();
      expect(engine.subscribeToCore).toBeDefined();
      expect(engine.destroy).toBeDefined();
    });

    it('should create engine with custom options', () => {
      const engine = createCoreStylingEngine({
        namespace: 'custom',
        scope: ':root',
      });
      expect(engine).toBeDefined();
      expect(engine.getScope()).toBe(':root');
    });
  });

  describe('apply', () => {
    it('should apply style state to CSS variables', () => {
      const engine = createCoreStylingEngine();
      engine.apply({
        calmMode: true,
        contrast: 'high',
      });

      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalled();
    });

    it('should map calmMode to CSS variables', () => {
      const engine = createCoreStylingEngine();
      engine.apply({ calmMode: true });

      const calls = mockDocument.documentElement.style.setProperty.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      expect(calls.some((call) => call[0].includes('neuroux-bg'))).toBe(true);
    });

    it('should map contrast to CSS variables', () => {
      const engine = createCoreStylingEngine();
      engine.apply({ contrast: 'high' });

      const calls = mockDocument.documentElement.style.setProperty.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      expect(calls.some((call) => call[0].includes('neuroux-contrast'))).toBe(
        true
      );
    });

    it('should map focusMode to CSS variables', () => {
      const engine = createCoreStylingEngine();
      engine.apply({ focusMode: true });

      const calls = mockDocument.documentElement.style.setProperty.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      expect(calls.some((call) => call[0].includes('neuroux-focus'))).toBe(
        true
      );
    });

    it('should not apply styles when destroyed', () => {
      const engine = createCoreStylingEngine();
      engine.destroy();
      engine.apply({ calmMode: true });

      expect(
        mockDocument.documentElement.style.setProperty
      ).not.toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should clear all CSS variables', () => {
      const engine = createCoreStylingEngine();
      engine.apply({ calmMode: true });
      engine.reset();

      expect(
        mockDocument.documentElement.style.removeProperty
      ).toHaveBeenCalled();
    });

    it('should not reset when destroyed', () => {
      const engine = createCoreStylingEngine();
      engine.destroy();
      engine.reset();

      expect(
        mockDocument.documentElement.style.removeProperty
      ).not.toHaveBeenCalled();
    });
  });

  describe('subscribeToCore', () => {
    it('should subscribe to Core state changes', () => {
      const engine = createCoreStylingEngine();
      const core = createMockCoreState();

      const unsubscribe = engine.subscribeToCore(core);
      expect(unsubscribe).toBeDefined();
      expect(typeof unsubscribe).toBe('function');

      unsubscribe();
    });

    it('should apply styles when Core state changes', () => {
      const engine = createCoreStylingEngine();
      const core = createMockCoreState();

      engine.subscribeToCore(core);

      // Simulate state change
      core.setState({
        profile: 'default',
        signals: {},
        ui: {
          calmMode: true,
        },
      });

      // Should have been called to apply styles
      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalled();
    });
  });

  describe('scope management', () => {
    it('should set and get scope', () => {
      const engine = createCoreStylingEngine();
      engine.setScope('[data-neuroux-scope="test"]');
      expect(engine.getScope()).toBe('[data-neuroux-scope="test"]');
    });

    it('should default to :root scope', () => {
      const engine = createCoreStylingEngine();
      expect(engine.getScope()).toBe(':root');
    });
  });

  describe('getCurrentStyleState', () => {
    it('should return current style state', () => {
      const engine = createCoreStylingEngine();
      engine.apply({ calmMode: true, contrast: 'high' });

      const state = engine.getCurrentStyleState();
      expect(state.calmMode).toBe(true);
      expect(state.contrast).toBe('high');
    });
  });

  describe('destroy', () => {
    it('should clean up resources', () => {
      const engine = createCoreStylingEngine();
      const core = createMockCoreState();

      engine.subscribeToCore(core);
      engine.destroy();

      // Should not apply after destroy
      engine.apply({ calmMode: true });
      expect(
        mockDocument.documentElement.style.setProperty
      ).not.toHaveBeenCalled();
    });
  });
});
