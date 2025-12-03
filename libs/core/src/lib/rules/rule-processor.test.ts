import { describe, it, expect, vi } from 'vitest';
import { RuleProcessor } from './rule-processor';
import { Rule, RuleEvaluationState } from './rule-types';

describe('RuleProcessor MVP v0.1', () => {
  describe('Constructor', () => {
    it('should create a RuleProcessor with empty rules', () => {
      const processor = new RuleProcessor();
      expect(processor).toBeDefined();
    });

    it('should create a RuleProcessor with initial rules', () => {
      const rules: Rule[] = [
        {
          when: { idle: true },
          apply: { calmMode: true },
        },
      ];

      const processor = new RuleProcessor(rules);
      expect(processor).toBeDefined();
    });

    it('should filter out invalid rules', () => {
      const rules: any[] = [
        {
          when: { idle: true },
          apply: { calmMode: true },
        },
        null,
        undefined,
        {},
        { when: {} },
        { apply: {} },
      ];

      const processor = new RuleProcessor(rules);
      expect(processor).toBeDefined();
    });
  });

  describe('bindEngine', () => {
    it('should bind a Core Engine', () => {
      const processor = new RuleProcessor();
      const mockEngine = {
        emit: vi.fn(),
      };

      processor.bindEngine(mockEngine);
      expect(processor).toBeDefined();
    });
  });

  describe('evaluate', () => {
    it('should return empty object when no rules match', () => {
      const rules: Rule[] = [
        {
          when: { idle: true },
          apply: { calmMode: true },
        },
      ];

      const processor = new RuleProcessor(rules);
      const state: RuleEvaluationState = {
        signals: { idle: false },
      };

      const result = processor.evaluate(state);
      expect(result).toEqual({});
    });

    it('should evaluate simple boolean rule', () => {
      const rules: Rule[] = [
        {
          when: { idle: true },
          apply: { calmMode: true },
        },
      ];

      const processor = new RuleProcessor(rules);
      const state: RuleEvaluationState = {
        signals: { idle: true },
      };

      const result = processor.evaluate(state);
      expect(result).toEqual({ calmMode: true });
    });

    it('should evaluate equality rule', () => {
      const rules: Rule[] = [
        {
          when: { scroll: 0 },
          apply: { staticMode: true },
        },
      ];

      const processor = new RuleProcessor(rules);
      const state: RuleEvaluationState = {
        signals: { scroll: 0 },
      };

      const result = processor.evaluate(state);
      expect(result).toEqual({ staticMode: true });
    });

    it('should evaluate greater than operator', () => {
      const rules: Rule[] = [
        {
          when: { focus: { $gt: 0.5 } },
          apply: { highlight: true },
        },
      ];

      const processor = new RuleProcessor(rules);
      const state: RuleEvaluationState = {
        signals: { focus: 0.7 },
      };

      const result = processor.evaluate(state);
      expect(result).toEqual({ highlight: true });
    });

    it('should evaluate less than operator', () => {
      const rules: Rule[] = [
        {
          when: { focus: { $lt: 0.5 } },
          apply: { highlight: true },
        },
      ];

      const processor = new RuleProcessor(rules);
      const state: RuleEvaluationState = {
        signals: { focus: 0.3 },
      };

      const result = processor.evaluate(state);
      expect(result).toEqual({ highlight: true });
    });

    it('should evaluate greater or equal operator', () => {
      const rules: Rule[] = [
        {
          when: { focus: { $gte: 0.5 } },
          apply: { highlight: true },
        },
      ];

      const processor = new RuleProcessor(rules);
      
      const result1 = processor.evaluate({
        signals: { focus: 0.5 },
      });
      expect(result1).toEqual({ highlight: true });

      const result2 = processor.evaluate({
        signals: { focus: 0.6 },
      });
      expect(result2).toEqual({ highlight: true });

      const result3 = processor.evaluate({
        signals: { focus: 0.4 },
      });
      expect(result3).toEqual({});
    });

    it('should evaluate less or equal operator', () => {
      const rules: Rule[] = [
        {
          when: { focus: { $lte: 0.5 } },
          apply: { highlight: true },
        },
      ];

      const processor = new RuleProcessor(rules);
      
      const result1 = processor.evaluate({
        signals: { focus: 0.5 },
      });
      expect(result1).toEqual({ highlight: true });

      const result2 = processor.evaluate({
        signals: { focus: 0.4 },
      });
      expect(result2).toEqual({ highlight: true });

      const result3 = processor.evaluate({
        signals: { focus: 0.6 },
      });
      expect(result3).toEqual({});
    });

    it('should evaluate multiple conditions', () => {
      const rules: Rule[] = [
        {
          when: { idle: true, scroll: 0 },
          apply: { calmMode: true },
        },
      ];

      const processor = new RuleProcessor(rules);
      
      const result1 = processor.evaluate({
        signals: { idle: true, scroll: 0 },
      });
      expect(result1).toEqual({ calmMode: true });

      const result2 = processor.evaluate({
        signals: { idle: true, scroll: 1 },
      });
      expect(result2).toEqual({});
    });

    it('should merge outputs from multiple matching rules', () => {
      const rules: Rule[] = [
        {
          when: { idle: true },
          apply: { calmMode: true },
        },
        {
          when: { scroll: 0 },
          apply: { staticMode: true },
        },
      ];

      const processor = new RuleProcessor(rules);
      const state: RuleEvaluationState = {
        signals: { idle: true, scroll: 0 },
      };

      const result = processor.evaluate(state);
      expect(result).toEqual({
        calmMode: true,
        staticMode: true,
      });
    });

    it('should emit adaptation event when result changes', () => {
      const rules: Rule[] = [
        {
          when: { idle: true },
          apply: { calmMode: true },
        },
      ];

      const processor = new RuleProcessor(rules);
      const mockEngine = {
        emit: vi.fn(),
      };

      processor.bindEngine(mockEngine);

      const state: RuleEvaluationState = {
        signals: { idle: true },
      };

      processor.evaluate(state);
      expect(mockEngine.emit).toHaveBeenCalledWith('adaptation', {
        calmMode: true,
      });
    });

    it('should not emit adaptation event when result does not change', () => {
      const rules: Rule[] = [
        {
          when: { idle: true },
          apply: { calmMode: true },
        },
      ];

      const processor = new RuleProcessor(rules);
      const mockEngine = {
        emit: vi.fn(),
      };

      processor.bindEngine(mockEngine);

      const state: RuleEvaluationState = {
        signals: { idle: true },
      };

      processor.evaluate(state);
      mockEngine.emit.mockClear();

      // Evaluate again with same state
      processor.evaluate(state);
      expect(mockEngine.emit).not.toHaveBeenCalled();
    });

    it('should evaluate rules from state object', () => {
      const rules: Rule[] = [
        {
          when: { profile: 'calm' },
          apply: { calmMode: true },
        },
      ];

      const processor = new RuleProcessor(rules);
      const state: RuleEvaluationState = {
        state: { profile: 'calm' },
      };

      const result = processor.evaluate(state);
      expect(result).toEqual({ calmMode: true });
    });

    it('should evaluate rules from context object', () => {
      const rules: Rule[] = [
        {
          when: { profile: 'calm' },
          apply: { calmMode: true },
        },
      ];

      const processor = new RuleProcessor(rules);
      const state: RuleEvaluationState = {
        context: { profile: 'calm' },
      };

      const result = processor.evaluate(state);
      expect(result).toEqual({ calmMode: true });
    });
  });

  describe('getLastResult', () => {
    it('should return the last evaluation result', () => {
      const rules: Rule[] = [
        {
          when: { idle: true },
          apply: { calmMode: true },
        },
      ];

      const processor = new RuleProcessor(rules);
      const state: RuleEvaluationState = {
        signals: { idle: true },
      };

      processor.evaluate(state);
      const lastResult = processor.getLastResult();
      expect(lastResult).toEqual({ calmMode: true });
    });

    it('should return empty object when no rules have matched', () => {
      const processor = new RuleProcessor();
      const lastResult = processor.getLastResult();
      expect(lastResult).toEqual({});
    });
  });

  describe('addRule', () => {
    it('should add a new rule', () => {
      const processor = new RuleProcessor();
      const rule: Rule = {
        when: { idle: true },
        apply: { calmMode: true },
      };

      processor.addRule(rule);
      const state: RuleEvaluationState = {
        signals: { idle: true },
      };

      const result = processor.evaluate(state);
      expect(result).toEqual({ calmMode: true });
    });

    it('should not add invalid rules', () => {
      const processor = new RuleProcessor();
      const invalidRules: any[] = [
        null,
        undefined,
        {},
        { when: {} },
        { apply: {} },
      ];

      invalidRules.forEach((rule) => {
        processor.addRule(rule);
      });

      const state: RuleEvaluationState = {
        signals: { idle: true },
      };

      const result = processor.evaluate(state);
      expect(result).toEqual({});
    });
  });

  describe('clearRules', () => {
    it('should clear all rules', () => {
      const rules: Rule[] = [
        {
          when: { idle: true },
          apply: { calmMode: true },
        },
      ];

      const processor = new RuleProcessor(rules);
      processor.clearRules();

      const state: RuleEvaluationState = {
        signals: { idle: true },
      };

      const result = processor.evaluate(state);
      expect(result).toEqual({});
    });
  });
});
