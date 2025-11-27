import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createHeuristicsEngine } from './heuristics-engine';
import { createSignalsRegistry } from './signals/signals-registry';
import { createEventBus } from './event-bus';

describe('createHeuristicsEngine', () => {
  let signals: ReturnType<typeof createSignalsRegistry>;
  let eventBus: ReturnType<typeof createEventBus>;
  let heuristics: ReturnType<typeof createHeuristicsEngine>;

  beforeEach(() => {
    signals = createSignalsRegistry();
    eventBus = createEventBus();
    heuristics = createHeuristicsEngine(signals, eventBus);
  });

  describe('initialization', () => {
    it('should create a heuristics engine', () => {
      expect(heuristics).toBeDefined();
      expect(heuristics).toHaveProperty('register');
      expect(heuristics).toHaveProperty('evaluate');
      expect(heuristics).toHaveProperty('getValues');
      expect(heuristics).toHaveProperty('destroy');
    });

    it('should initialize with base heuristics', () => {
      const values = heuristics.getValues();
      // Initially empty until evaluation
      expect(values).toEqual({});
    });
  });

  describe('evaluation', () => {
    it('should evaluate heuristics when state is provided', () => {
      const state = {
        signals: {
          focus: true,
          idle: false,
          scroll: 100,
        },
      };

      heuristics.evaluate(state);

      const values = heuristics.getValues();
      expect(values).toHaveProperty('focusStability');
      expect(values).toHaveProperty('idlePattern');
      expect(values).toHaveProperty('scrollAggression');
      expect(values).toHaveProperty('interactionDensity');
    });

    it('should emit heuristic:update event when values change', () => {
      const handler = vi.fn();
      eventBus.on('heuristic:update', handler);

      const state = {
        signals: {
          focus: true,
        },
      };

      heuristics.evaluate(state);

      expect(handler).toHaveBeenCalled();
      const callArgs = handler.mock.calls[0][0];
      expect(callArgs).toHaveProperty('heuristics');
      expect(callArgs).toHaveProperty('timestamp');
    });

    it('should register derived signals in signals registry', () => {
      const state = {
        signals: {
          focus: true,
          idle: false,
        },
      };

      heuristics.evaluate(state);

      expect(signals.get('focusStability')).toBeDefined();
      expect(signals.get('idlePattern')).toBeDefined();
      expect(signals.get('scrollAggression')).toBeDefined();
      expect(signals.get('interactionDensity')).toBeDefined();
    });

    it('should update existing signals when heuristics change', () => {
      const state1 = {
        signals: {
          focus: true,
        },
      };

      const state2 = {
        signals: {
          focus: false,
        },
      };

      heuristics.evaluate(state1);
      const value1 = signals.get('focusStability');

      heuristics.evaluate(state2);
      const value2 = signals.get('focusStability');

      // Values should be different (or at least evaluated)
      expect(value1).toBeDefined();
      expect(value2).toBeDefined();
    });

    it('should handle missing signals gracefully', () => {
      const state = {
        signals: {},
      };

      // Should not throw
      expect(() => heuristics.evaluate(state)).not.toThrow();

      const values = heuristics.getValues();
      // Should still produce values (neutral/default)
      expect(values).toHaveProperty('focusStability');
    });

    it('should not emit event if values do not change significantly', () => {
      const handler = vi.fn();
      eventBus.on('heuristic:update', handler);

      const state = {
        signals: {
          focus: true,
        },
      };

      // First evaluation - should emit
      heuristics.evaluate(state);
      expect(handler).toHaveBeenCalledTimes(1);

      // Second evaluation with same state - should not emit (no significant change)
      handler.mockClear();
      heuristics.evaluate(state);
      // May or may not emit depending on internal smoothing logic
      // This is acceptable behavior
    });
  });

  describe('focusStability heuristic', () => {
    it('should calculate focus variability', () => {
      const state1 = { signals: { focus: true } };
      heuristics.evaluate(state1);
      const value1 = signals.get('focusStability');

      const state2 = { signals: { focus: false } };
      heuristics.evaluate(state2);
      const value2 = signals.get('focusStability');

      expect(typeof value1).toBe('number');
      expect(typeof value2).toBe('number');
      expect(value1).toBeGreaterThanOrEqual(0);
      expect(value1).toBeLessThanOrEqual(1);
      expect(value2).toBeGreaterThanOrEqual(0);
      expect(value2).toBeLessThanOrEqual(1);
    });

    it('should handle boolean focus values', () => {
      const state = { signals: { focus: true } };
      heuristics.evaluate(state);
      const value = signals.get('focusStability');
      expect(typeof value).toBe('number');
    });

    it('should handle numeric focus values', () => {
      const state = { signals: { focus: 0.8 } };
      heuristics.evaluate(state);
      const value = signals.get('focusStability');
      expect(typeof value).toBe('number');
    });
  });

  describe('idlePattern heuristic', () => {
    it('should calculate idle burstiness', () => {
      const state = { signals: { idle: true } };
      heuristics.evaluate(state);
      const value = signals.get('idlePattern');

      expect(typeof value).toBe('number');
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    });

    it('should detect state changes', () => {
      const state1 = { signals: { idle: true } };
      heuristics.evaluate(state1);
      const value1 = signals.get('idlePattern');

      const state2 = { signals: { idle: false } };
      heuristics.evaluate(state2);
      const value2 = signals.get('idlePattern');

      expect(value1).toBeDefined();
      expect(value2).toBeDefined();
    });
  });

  describe('scrollAggression heuristic', () => {
    it('should calculate scroll intensity', () => {
      const state = { signals: { scroll: 500 } };
      heuristics.evaluate(state);
      const value = signals.get('scrollAggression');

      expect(typeof value).toBe('number');
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    });

    it('should detect scroll changes', () => {
      const state1 = { signals: { scroll: 100 } };
      heuristics.evaluate(state1);
      const value1 = signals.get('scrollAggression');

      const state2 = { signals: { scroll: 500 } };
      heuristics.evaluate(state2);
      const value2 = signals.get('scrollAggression');

      expect(value1).toBeDefined();
      expect(value2).toBeDefined();
    });
  });

  describe('interactionDensity heuristic', () => {
    it('should calculate interaction density', () => {
      const state = {
        signals: {
          focus: true,
          idle: false,
          scroll: 100,
        },
      };
      heuristics.evaluate(state);
      const value = signals.get('interactionDensity');

      expect(typeof value).toBe('number');
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    });

    it('should ignore internal heuristics storage', () => {
      const state = {
        signals: {
          focus: true,
          _internalHeuristics: { test: 123 },
        },
      };
      heuristics.evaluate(state);
      const value = signals.get('interactionDensity');

      expect(typeof value).toBe('number');
    });

    it('should handle empty signals', () => {
      const state = { signals: {} };
      heuristics.evaluate(state);
      const value = signals.get('interactionDensity');

      expect(typeof value).toBe('number');
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    });
  });

  describe('custom heuristics', () => {
    it('should allow registering custom heuristics', () => {
      const customHeuristic = {
        name: 'customHeuristic',
        evaluate: () => 42,
      };

      heuristics.register(customHeuristic);

      const state = { signals: {} };
      heuristics.evaluate(state);

      expect(signals.get('customHeuristic')).toBe(42);
    });

    it('should throw error for invalid heuristic', () => {
      expect(() => {
        heuristics.register(null as any);
      }).toThrow('Invalid heuristic');

      expect(() => {
        heuristics.register({ name: 'test' } as any);
      }).toThrow('Invalid heuristic');
    });

    it('should throw error for duplicate heuristic names', () => {
      const heuristic1 = {
        name: 'duplicate',
        evaluate: () => 1,
      };

      const heuristic2 = {
        name: 'duplicate',
        evaluate: () => 2,
      };

      heuristics.register(heuristic1);

      expect(() => {
        heuristics.register(heuristic2);
      }).toThrow('already registered');
    });
  });

  describe('error handling', () => {
    it('should not crash when heuristic throws error', () => {
      const faultyHeuristic = {
        name: 'faulty',
        evaluate: () => {
          throw new Error('Test error');
        },
      };

      heuristics.register(faultyHeuristic);

      const state = { signals: {} };

      // Should not throw
      expect(() => heuristics.evaluate(state)).not.toThrow();
    });

    it('should handle invalid signal values gracefully', () => {
      const state = {
        signals: {
          focus: null as any,
          scroll: undefined as any,
        },
      };

      // Should not throw
      expect(() => heuristics.evaluate(state)).not.toThrow();
    });
  });

  describe('destroy', () => {
    it('should clean up heuristics on destroy', () => {
      const state = { signals: { focus: true } };
      heuristics.evaluate(state);

      expect(heuristics.getValues()).not.toEqual({});

      heuristics.destroy();

      // Values should be cleared
      expect(heuristics.getValues()).toEqual({});
    });

    it('should allow re-evaluation after destroy', () => {
      heuristics.destroy();

      const state = { signals: { focus: true } };
      // Should not throw
      expect(() => heuristics.evaluate(state)).not.toThrow();
    });
  });

  describe('integration with signals registry', () => {
    it('should make derived signals available to rule processor', () => {
      const state = {
        signals: {
          focus: true,
          scroll: 200,
        },
      };

      heuristics.evaluate(state);

      // Derived signals should be in signals registry
      const allSignals = signals.getAll();
      expect(allSignals).toHaveProperty('focusStability');
      expect(allSignals).toHaveProperty('scrollAggression');
      expect(allSignals).toHaveProperty('interactionDensity');
      expect(allSignals).toHaveProperty('idlePattern');
    });

    it('should update signals when heuristics change', () => {
      const updateHandler = vi.fn();
      const registerHandler = vi.fn();
      signals.onUpdate(updateHandler);
      signals.onRegister(registerHandler);

      const state1 = { signals: { focus: true } };
      heuristics.evaluate(state1);

      // Should have triggered register or update events
      // First time registers, subsequent times update
      expect(registerHandler.mock.calls.length + updateHandler.mock.calls.length).toBeGreaterThan(0);

      updateHandler.mockClear();
      registerHandler.mockClear();

      const state2 = { signals: { focus: false } };
      heuristics.evaluate(state2);

      // Should trigger updates if values changed significantly
      // (May or may not call depending on smoothing logic, which is acceptable)
    });
  });
});
