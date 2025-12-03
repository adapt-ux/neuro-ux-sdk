import { describe, it, expect } from 'vitest';
import { evaluateRuleCondition, evaluateRule } from './rule-evaluator';
import { Rule, RuleCondition, RuleEvaluationState } from './rule-types';

describe('rule-evaluator', () => {
  describe('evaluateRuleCondition', () => {
    it('should evaluate simple boolean condition', () => {
      const condition: RuleCondition = { idle: true };
      const state: RuleEvaluationState = {
        signals: { idle: true },
      };

      const result = evaluateRuleCondition(condition, state);
      expect(result).toBe(true);
    });

    it('should return false when condition does not match', () => {
      const condition: RuleCondition = { idle: true };
      const state: RuleEvaluationState = {
        signals: { idle: false },
      };

      const result = evaluateRuleCondition(condition, state);
      expect(result).toBe(false);
    });

    it('should evaluate equality condition', () => {
      const condition: RuleCondition = { scroll: 0 };
      const state: RuleEvaluationState = {
        signals: { scroll: 0 },
      };

      const result = evaluateRuleCondition(condition, state);
      expect(result).toBe(true);
    });

    it('should evaluate greater than operator', () => {
      const condition: RuleCondition = { focus: { $gt: 0.5 } };
      const state: RuleEvaluationState = {
        signals: { focus: 0.7 },
      };

      const result = evaluateRuleCondition(condition, state);
      expect(result).toBe(true);
    });

    it('should evaluate less than operator', () => {
      const condition: RuleCondition = { focus: { $lt: 0.5 } };
      const state: RuleEvaluationState = {
        signals: { focus: 0.3 },
      };

      const result = evaluateRuleCondition(condition, state);
      expect(result).toBe(true);
    });

    it('should evaluate greater or equal operator', () => {
      const condition: RuleCondition = { focus: { $gte: 0.5 } };

      const result1 = evaluateRuleCondition(condition, {
        signals: { focus: 0.5 },
      });
      expect(result1).toBe(true);

      const result2 = evaluateRuleCondition(condition, {
        signals: { focus: 0.6 },
      });
      expect(result2).toBe(true);

      const result3 = evaluateRuleCondition(condition, {
        signals: { focus: 0.4 },
      });
      expect(result3).toBe(false);
    });

    it('should evaluate less or equal operator', () => {
      const condition: RuleCondition = { focus: { $lte: 0.5 } };

      const result1 = evaluateRuleCondition(condition, {
        signals: { focus: 0.5 },
      });
      expect(result1).toBe(true);

      const result2 = evaluateRuleCondition(condition, {
        signals: { focus: 0.4 },
      });
      expect(result2).toBe(true);

      const result3 = evaluateRuleCondition(condition, {
        signals: { focus: 0.6 },
      });
      expect(result3).toBe(false);
    });

    it('should evaluate multiple conditions (AND logic)', () => {
      const condition: RuleCondition = { idle: true, scroll: 0 };

      const result1 = evaluateRuleCondition(condition, {
        signals: { idle: true, scroll: 0 },
      });
      expect(result1).toBe(true);

      const result2 = evaluateRuleCondition(condition, {
        signals: { idle: true, scroll: 1 },
      });
      expect(result2).toBe(false);

      const result3 = evaluateRuleCondition(condition, {
        signals: { idle: false, scroll: 0 },
      });
      expect(result3).toBe(false);
    });

    it('should check signals first, then state, then context', () => {
      const condition: RuleCondition = { key: 'value' };

      // Check signals
      const result1 = evaluateRuleCondition(condition, {
        signals: { key: 'value' },
        state: { key: 'other' },
        context: { key: 'another' },
      });
      expect(result1).toBe(true);

      // Check state when signal not present
      const result2 = evaluateRuleCondition(condition, {
        state: { key: 'value' },
        context: { key: 'other' },
      });
      expect(result2).toBe(true);

      // Check context when signal and state not present
      const result3 = evaluateRuleCondition(condition, {
        context: { key: 'value' },
      });
      expect(result3).toBe(true);
    });

    it('should return false when key is not found', () => {
      const condition: RuleCondition = { unknown: true };
      const state: RuleEvaluationState = {
        signals: { idle: true },
      };

      const result = evaluateRuleCondition(condition, state);
      expect(result).toBe(false);
    });
  });

  describe('evaluateRule', () => {
    it('should return apply object when condition matches', () => {
      const rule: Rule = {
        when: { idle: true },
        apply: { calmMode: true },
      };

      const state: RuleEvaluationState = {
        signals: { idle: true },
      };

      const result = evaluateRule(rule, state);
      expect(result).toEqual({ calmMode: true });
    });

    it('should return null when condition does not match', () => {
      const rule: Rule = {
        when: { idle: true },
        apply: { calmMode: true },
      };

      const state: RuleEvaluationState = {
        signals: { idle: false },
      };

      const result = evaluateRule(rule, state);
      expect(result).toBeNull();
    });

    it('should handle complex apply objects', () => {
      const rule: Rule = {
        when: { idle: true },
        apply: {
          calmMode: true,
          highContrast: false,
          focusMode: false,
        },
      };

      const state: RuleEvaluationState = {
        signals: { idle: true },
      };

      const result = evaluateRule(rule, state);
      expect(result).toEqual({
        calmMode: true,
        highContrast: false,
        focusMode: false,
      });
    });
  });
});
