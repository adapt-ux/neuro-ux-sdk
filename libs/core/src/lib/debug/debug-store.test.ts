import { describe, it, expect, beforeEach } from 'vitest';
import { DebugStore, createDebugStore } from './debug-store';

describe('DebugStore', () => {
  let store: DebugStore;

  beforeEach(() => {
    store = createDebugStore();
  });

  describe('addSignal', () => {
    it('should add signal entry to store', () => {
      store.addSignal('idle', true);
      const signals = store.getSignals();

      expect(signals).toHaveLength(1);
      expect(signals[0].name).toBe('idle');
      expect(signals[0].value).toBe(true);
      expect(signals[0].timestamp).toBeTypeOf('number');
    });

    it('should limit entries to MAX_ENTRIES', () => {
      for (let i = 0; i < 150; i++) {
        store.addSignal(`signal${i}`, i);
      }

      const signals = store.getSignals();
      expect(signals.length).toBeLessThanOrEqual(100);
    });
  });

  describe('addHeuristic', () => {
    it('should add heuristic entry to store', () => {
      store.addHeuristic('focusStability', 0.5);
      const heuristics = store.getHeuristics();

      expect(heuristics).toHaveLength(1);
      expect(heuristics[0].name).toBe('focusStability');
      expect(heuristics[0].value).toBe(0.5);
      expect(heuristics[0].timestamp).toBeTypeOf('number');
    });
  });

  describe('addRuleEvaluation', () => {
    it('should add rule evaluation entry to store', () => {
      store.addRuleEvaluation('rule-0', true, { signal: 'idle', value: true });
      const rules = store.getRuleEvaluations();

      expect(rules).toHaveLength(1);
      expect(rules[0].ruleId).toBe('rule-0');
      expect(rules[0].matched).toBe(true);
      expect(rules[0].reason).toEqual({ signal: 'idle', value: true });
      expect(rules[0].timestamp).toBeTypeOf('number');
    });

    it('should handle rule evaluation without reason', () => {
      store.addRuleEvaluation('rule-1', false);
      const rules = store.getRuleEvaluations();

      expect(rules[0].ruleId).toBe('rule-1');
      expect(rules[0].matched).toBe(false);
      expect(rules[0].reason).toBeUndefined();
    });
  });

  describe('addUIUpdate', () => {
    it('should add UI update entry to store', () => {
      store.addUIUpdate('fontSize', 16);
      const uiUpdates = store.getUIUpdates();

      expect(uiUpdates).toHaveLength(1);
      expect(uiUpdates[0].key).toBe('fontSize');
      expect(uiUpdates[0].value).toBe(16);
      expect(uiUpdates[0].timestamp).toBeTypeOf('number');
    });
  });

  describe('getLastRuleEvaluation', () => {
    it('should return null when no evaluations exist', () => {
      expect(store.getLastRuleEvaluation()).toBeNull();
    });

    it('should return the last rule evaluation', () => {
      store.addRuleEvaluation('rule-0', false);
      store.addRuleEvaluation('rule-1', true, { signal: 'idle' });

      const last = store.getLastRuleEvaluation();
      expect(last?.ruleId).toBe('rule-1');
      expect(last?.matched).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all debug data', () => {
      store.addSignal('idle', true);
      store.addHeuristic('focusStability', 0.5);
      store.addRuleEvaluation('rule-0', true);
      store.addUIUpdate('fontSize', 16);

      store.clear();

      expect(store.getSignals()).toHaveLength(0);
      expect(store.getHeuristics()).toHaveLength(0);
      expect(store.getRuleEvaluations()).toHaveLength(0);
      expect(store.getUIUpdates()).toHaveLength(0);
    });
  });

  describe('createDebugStore', () => {
    it('should create independent store instances', () => {
      const store1 = createDebugStore();
      const store2 = createDebugStore();

      store1.addSignal('signal1', 1);
      store2.addSignal('signal2', 2);

      expect(store1.getSignals()).toHaveLength(1);
      expect(store2.getSignals()).toHaveLength(1);
      expect(store1.getSignals()[0].name).toBe('signal1');
      expect(store2.getSignals()[0].name).toBe('signal2');
    });
  });
});
