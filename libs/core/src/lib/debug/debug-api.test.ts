import { describe, it, expect, beforeEach } from 'vitest';
import { createDebugAPI } from './debug-api';
import { createDebugStore } from './debug-store';
import { NormalizedConfig } from '../config';

describe('createDebugAPI', () => {
  const mockConfig: NormalizedConfig = {
    profile: 'test',
    rules: [],
    signals: [],
    styling: {},
    features: {},
    debug: true,
  };

  describe('with debug store', () => {
    let store: ReturnType<typeof createDebugStore>;
    let api: ReturnType<typeof createDebugAPI>;

    beforeEach(() => {
      store = createDebugStore();
      api = createDebugAPI(store, mockConfig);
    });

    it('should return signals', () => {
      store.addSignal('idle', true);
      const signals = api.getSignals();

      expect(signals).toHaveLength(1);
      expect(signals[0].name).toBe('idle');
    });

    it('should return heuristics', () => {
      store.addHeuristic('focusStability', 0.5);
      const heuristics = api.getHeuristics();

      expect(heuristics).toHaveLength(1);
      expect(heuristics[0].name).toBe('focusStability');
    });

    it('should return rules', () => {
      store.addRuleEvaluation('rule-0', true, { signal: 'idle' });
      const rules = api.getRules();

      expect(rules).toHaveLength(1);
      expect(rules[0].ruleId).toBe('rule-0');
    });

    it('should return UI state', () => {
      store.addUIUpdate('fontSize', 16);
      const uiState = api.getUIState();

      expect(uiState).toHaveLength(1);
      expect(uiState[0].key).toBe('fontSize');
    });

    it('should return config', () => {
      const config = api.getConfig();

      expect(config).toEqual(mockConfig);
      expect(config).not.toBe(mockConfig); // Should be a copy
    });

    it('should explain last decision', () => {
      store.addRuleEvaluation('rule-0', true, { signal: 'idle', value: true });
      const explanation = api.explainLastDecision();

      expect(explanation).not.toBeNull();
      expect(explanation?.ruleId).toBe('rule-0');
      expect(explanation?.matched).toBe(true);
      expect(explanation?.reason).toEqual({ signal: 'idle', value: true });
    });

    it('should return null when no decision exists', () => {
      expect(api.explainLastDecision()).toBeNull();
    });

    it('should clear debug data', () => {
      store.addSignal('idle', true);
      store.addHeuristic('focusStability', 0.5);

      api.clear();

      expect(api.getSignals()).toHaveLength(0);
      expect(api.getHeuristics()).toHaveLength(0);
    });
  });

  describe('without debug store (debug disabled)', () => {
    let api: ReturnType<typeof createDebugAPI>;

    beforeEach(() => {
      api = createDebugAPI(null, mockConfig);
    });

    it('should return empty arrays for all getters', () => {
      expect(api.getSignals()).toEqual([]);
      expect(api.getHeuristics()).toEqual([]);
      expect(api.getRules()).toEqual([]);
      expect(api.getUIState()).toEqual([]);
    });

    it('should return config', () => {
      const config = api.getConfig();
      expect(config).toEqual(mockConfig);
    });

    it('should return null for explainLastDecision', () => {
      expect(api.explainLastDecision()).toBeNull();
    });

    it('should not throw on clear', () => {
      expect(() => api.clear()).not.toThrow();
    });
  });
});
