import { describe, it, expect } from 'vitest';
import { createRuleProcessor, RuleProcessor, Rule } from './rule-processor';
import { NormalizedConfig } from './config';

describe('createRuleProcessor', () => {
  it('should create a rule processor', () => {
    const config: NormalizedConfig = {
      profile: 'default',
      signals: [],
      rules: [],
    };

    const processor = createRuleProcessor(config);

    expect(processor).toBeDefined();
    expect(processor).toHaveProperty('evaluate');
    expect(typeof processor.evaluate).toBe('function');
  });

  it('should return an empty object when no rules are provided', () => {
    const config: NormalizedConfig = {
      profile: 'default',
      signals: [],
      rules: [],
    };

    const processor = createRuleProcessor(config);
    const result = processor.evaluate({ signals: {} });

    expect(result).toEqual({});
  });

  it('should implement the RuleProcessor interface', () => {
    const config: NormalizedConfig = {
      profile: 'default',
      signals: [],
      rules: [],
    };

    const processor = createRuleProcessor(config);

    const processorTyped: RuleProcessor = processor;
    expect(processorTyped.evaluate).toBeDefined();
  });

  describe('Simple rule evaluation', () => {
    it('should evaluate a simple rule with < operator', () => {
      const rule: Rule = {
        when: { signal: 'focus', op: '<', value: 0.4 },
        apply: { ui: { highlight: true } },
      };

      const config: NormalizedConfig = {
        profile: 'default',
        signals: [],
        rules: [rule],
      };

      const processor = createRuleProcessor(config);

      // Signal value is less than 0.4 - rule should match
      const result1 = processor.evaluate({ signals: { focus: 0.3 } });
      expect(result1).toEqual({ highlight: true });

      // Signal value is greater than 0.4 - rule should not match
      const result2 = processor.evaluate({ signals: { focus: 0.5 } });
      expect(result2).toEqual({});
    });

    it('should evaluate a simple rule with > operator', () => {
      const rule: Rule = {
        when: { signal: 'focus', op: '>', value: 0.5 },
        apply: { ui: { highlight: true } },
      };

      const config: NormalizedConfig = {
        profile: 'default',
        signals: [],
        rules: [rule],
      };

      const processor = createRuleProcessor(config);

      const result1 = processor.evaluate({ signals: { focus: 0.6 } });
      expect(result1).toEqual({ highlight: true });

      const result2 = processor.evaluate({ signals: { focus: 0.4 } });
      expect(result2).toEqual({});
    });

    it('should evaluate a simple rule with >= operator', () => {
      const rule: Rule = {
        when: { signal: 'focus', op: '>=', value: 0.5 },
        apply: { ui: { highlight: true } },
      };

      const config: NormalizedConfig = {
        profile: 'default',
        signals: [],
        rules: [rule],
      };

      const processor = createRuleProcessor(config);

      const result1 = processor.evaluate({ signals: { focus: 0.5 } });
      expect(result1).toEqual({ highlight: true });

      const result2 = processor.evaluate({ signals: { focus: 0.6 } });
      expect(result2).toEqual({ highlight: true });

      const result3 = processor.evaluate({ signals: { focus: 0.4 } });
      expect(result3).toEqual({});
    });

    it('should evaluate a simple rule with <= operator', () => {
      const rule: Rule = {
        when: { signal: 'focus', op: '<=', value: 0.5 },
        apply: { ui: { highlight: true } },
      };

      const config: NormalizedConfig = {
        profile: 'default',
        signals: [],
        rules: [rule],
      };

      const processor = createRuleProcessor(config);

      const result1 = processor.evaluate({ signals: { focus: 0.5 } });
      expect(result1).toEqual({ highlight: true });

      const result2 = processor.evaluate({ signals: { focus: 0.4 } });
      expect(result2).toEqual({ highlight: true });

      const result3 = processor.evaluate({ signals: { focus: 0.6 } });
      expect(result3).toEqual({});
    });

    it('should evaluate a simple rule with === operator', () => {
      const rule: Rule = {
        when: { signal: 'status', op: '===', value: 'active' },
        apply: { ui: { visible: true } },
      };

      const config: NormalizedConfig = {
        profile: 'default',
        signals: [],
        rules: [rule],
      };

      const processor = createRuleProcessor(config);

      const result1 = processor.evaluate({ signals: { status: 'active' } });
      expect(result1).toEqual({ visible: true });

      const result2 = processor.evaluate({ signals: { status: 'inactive' } });
      expect(result2).toEqual({});
    });

    it('should evaluate a simple rule with !== operator', () => {
      const rule: Rule = {
        when: { signal: 'status', op: '!==', value: 'inactive' },
        apply: { ui: { visible: true } },
      };

      const config: NormalizedConfig = {
        profile: 'default',
        signals: [],
        rules: [rule],
      };

      const processor = createRuleProcessor(config);

      const result1 = processor.evaluate({ signals: { status: 'active' } });
      expect(result1).toEqual({ visible: true });

      const result2 = processor.evaluate({ signals: { status: 'inactive' } });
      expect(result2).toEqual({});
    });
  });

  describe('AND rule groups', () => {
    it('should evaluate AND group - all rules must match', () => {
      const rule: Rule = {
        and: [
          {
            when: { signal: 'focus', op: '<', value: 0.4 },
            apply: { ui: { highlight: true } },
          },
          {
            when: { signal: 'attention', op: '>', value: 0.6 },
            apply: { ui: { emphasize: true } },
          },
        ],
      };

      const config: NormalizedConfig = {
        profile: 'default',
        signals: [],
        rules: [rule],
      };

      const processor = createRuleProcessor(config);

      // Both conditions match
      const result1 = processor.evaluate({
        signals: { focus: 0.3, attention: 0.7 },
      });
      expect(result1).toEqual({ highlight: true, emphasize: true });

      // Only first condition matches
      const result2 = processor.evaluate({
        signals: { focus: 0.3, attention: 0.5 },
      });
      expect(result2).toEqual({});

      // Only second condition matches
      const result3 = processor.evaluate({
        signals: { focus: 0.5, attention: 0.7 },
      });
      expect(result3).toEqual({});

      // Neither condition matches
      const result4 = processor.evaluate({
        signals: { focus: 0.5, attention: 0.5 },
      });
      expect(result4).toEqual({});
    });

    it('should handle nested AND groups', () => {
      const rule: Rule = {
        and: [
          {
            when: { signal: 'focus', op: '<', value: 0.4 },
            apply: { ui: { highlight: true } },
          },
          {
            and: [
              {
                when: { signal: 'attention', op: '>', value: 0.6 },
                apply: { ui: { emphasize: true } },
              },
              {
                when: { signal: 'engagement', op: '>', value: 0.5 },
                apply: { ui: { animate: true } },
              },
            ],
          },
        ],
      };

      const config: NormalizedConfig = {
        profile: 'default',
        signals: [],
        rules: [rule],
      };

      const processor = createRuleProcessor(config);

      // All conditions match
      const result1 = processor.evaluate({
        signals: { focus: 0.3, attention: 0.7, engagement: 0.6 },
      });
      expect(result1).toEqual({ highlight: true, emphasize: true, animate: true });

      // Not all conditions match
      const result2 = processor.evaluate({
        signals: { focus: 0.3, attention: 0.7, engagement: 0.4 },
      });
      expect(result2).toEqual({});
    });
  });

  describe('OR rule groups', () => {
    it('should evaluate OR group - at least one rule must match', () => {
      const rule: Rule = {
        or: [
          {
            when: { signal: 'focus', op: '<', value: 0.4 },
            apply: { ui: { highlight: true } },
          },
          {
            when: { signal: 'attention', op: '>', value: 0.6 },
            apply: { ui: { emphasize: true } },
          },
        ],
      };

      const config: NormalizedConfig = {
        profile: 'default',
        signals: [],
        rules: [rule],
      };

      const processor = createRuleProcessor(config);

      // First condition matches
      const result1 = processor.evaluate({
        signals: { focus: 0.3, attention: 0.5 },
      });
      expect(result1).toEqual({ highlight: true });

      // Second condition matches
      const result2 = processor.evaluate({
        signals: { focus: 0.5, attention: 0.7 },
      });
      expect(result2).toEqual({ emphasize: true });

      // Both conditions match - should take first match
      const result3 = processor.evaluate({
        signals: { focus: 0.3, attention: 0.7 },
      });
      expect(result3).toEqual({ highlight: true });

      // Neither condition matches
      const result4 = processor.evaluate({
        signals: { focus: 0.5, attention: 0.5 },
      });
      expect(result4).toEqual({});
    });
  });

  describe('Multiple rules', () => {
    it('should evaluate multiple independent rules', () => {
      const rules: Rule[] = [
        {
          when: { signal: 'focus', op: '<', value: 0.4 },
          apply: { ui: { highlight: true } },
        },
        {
          when: { signal: 'attention', op: '>', value: 0.6 },
          apply: { ui: { emphasize: true } },
        },
      ];

      const config: NormalizedConfig = {
        profile: 'default',
        signals: [],
        rules,
      };

      const processor = createRuleProcessor(config);

      // Both rules match
      const result1 = processor.evaluate({
        signals: { focus: 0.3, attention: 0.7 },
      });
      expect(result1).toEqual({ highlight: true, emphasize: true });

      // Only first rule matches
      const result2 = processor.evaluate({
        signals: { focus: 0.3, attention: 0.5 },
      });
      expect(result2).toEqual({ highlight: true });

      // Only second rule matches
      const result3 = processor.evaluate({
        signals: { focus: 0.5, attention: 0.7 },
      });
      expect(result3).toEqual({ emphasize: true });
    });

    it('should merge UI outputs from multiple matching rules', () => {
      const rules: Rule[] = [
        {
          when: { signal: 'focus', op: '<', value: 0.4 },
          apply: { ui: { highlight: true, color: 'red' } },
        },
        {
          when: { signal: 'attention', op: '>', value: 0.6 },
          apply: { ui: { emphasize: true, color: 'blue' } },
        },
      ];

      const config: NormalizedConfig = {
        profile: 'default',
        signals: [],
        rules,
      };

      const processor = createRuleProcessor(config);

      // Both rules match - later rule overwrites earlier values
      const result = processor.evaluate({
        signals: { focus: 0.3, attention: 0.7 },
      });
      expect(result).toEqual({
        highlight: true,
        emphasize: true,
        color: 'blue', // Last rule wins
      });
    });
  });

  describe('Error handling', () => {
    it('should handle unknown signal names gracefully', () => {
      const rule: Rule = {
        when: { signal: 'unknownSignal', op: '<', value: 0.4 },
        apply: { ui: { highlight: true } },
      };

      const config: NormalizedConfig = {
        profile: 'default',
        signals: [],
        rules: [rule],
      };

      const processor = createRuleProcessor(config);

      const result = processor.evaluate({ signals: { focus: 0.3 } });
      expect(result).toEqual({});
    });

    it('should handle missing signals object gracefully', () => {
      const rule: Rule = {
        when: { signal: 'focus', op: '<', value: 0.4 },
        apply: { ui: { highlight: true } },
      };

      const config: NormalizedConfig = {
        profile: 'default',
        signals: [],
        rules: [rule],
      };

      const processor = createRuleProcessor(config);

      const result = processor.evaluate({});
      expect(result).toEqual({});
    });

    it('should handle invalid rule shapes gracefully', () => {
      const config: NormalizedConfig = {
        profile: 'default',
        signals: [],
        rules: [
          null as any,
          undefined as any,
          {} as any,
          { invalid: 'rule' } as any,
        ],
      };

      const processor = createRuleProcessor(config);

      const result = processor.evaluate({ signals: { focus: 0.3 } });
      expect(result).toEqual({});
    });

    it('should handle invalid state gracefully', () => {
      const rule: Rule = {
        when: { signal: 'focus', op: '<', value: 0.4 },
        apply: { ui: { highlight: true } },
      };

      const config: NormalizedConfig = {
        profile: 'default',
        signals: [],
        rules: [rule],
      };

      const processor = createRuleProcessor(config);

      expect(() => processor.evaluate(null as any)).not.toThrow();
      expect(() => processor.evaluate(undefined as any)).not.toThrow();
      expect(() => processor.evaluate('invalid' as any)).not.toThrow();
    });

    it('should handle type conversion errors gracefully', () => {
      const rule: Rule = {
        when: { signal: 'focus', op: '<', value: 0.4 },
        apply: { ui: { highlight: true } },
      };

      const config: NormalizedConfig = {
        profile: 'default',
        signals: [],
        rules: [rule],
      };

      const processor = createRuleProcessor(config);

      // Signal value that can't be converted to number
      const result = processor.evaluate({
        signals: { focus: 'not-a-number' as any },
      });
      expect(result).toEqual({});
    });
  });

  describe('Edge cases', () => {
    it('should handle empty rule arrays', () => {
      const config: NormalizedConfig = {
        profile: 'default',
        signals: [],
        rules: [],
      };

      const processor = createRuleProcessor(config);
      const result = processor.evaluate({ signals: { focus: 0.3 } });
      expect(result).toEqual({});
    });

    it('should handle rules with empty apply.ui', () => {
      const rule: Rule = {
        when: { signal: 'focus', op: '<', value: 0.4 },
        apply: { ui: {} },
      };

      const config: NormalizedConfig = {
        profile: 'default',
        signals: [],
        rules: [rule],
      };

      const processor = createRuleProcessor(config);
      const result = processor.evaluate({ signals: { focus: 0.3 } });
      expect(result).toEqual({});
    });

    it('should handle boolean signal values', () => {
      const rule: Rule = {
        when: { signal: 'enabled', op: '===', value: true },
        apply: { ui: { visible: true } },
      };

      const config: NormalizedConfig = {
        profile: 'default',
        signals: [],
        rules: [rule],
      };

      const processor = createRuleProcessor(config);

      const result1 = processor.evaluate({ signals: { enabled: true } });
      expect(result1).toEqual({ visible: true });

      const result2 = processor.evaluate({ signals: { enabled: false } });
      expect(result2).toEqual({});
    });

    it('should handle string signal values with numeric operators', () => {
      const rule: Rule = {
        when: { signal: 'score', op: '>', value: 50 },
        apply: { ui: { highlight: true } },
      };

      const config: NormalizedConfig = {
        profile: 'default',
        signals: [],
        rules: [rule],
      };

      const processor = createRuleProcessor(config);

      // String "60" should be converted to number 60
      const result1 = processor.evaluate({ signals: { score: '60' } });
      expect(result1).toEqual({ highlight: true });

      // String "40" should be converted to number 40
      const result2 = processor.evaluate({ signals: { score: '40' } });
      expect(result2).toEqual({});
    });
  });
});
