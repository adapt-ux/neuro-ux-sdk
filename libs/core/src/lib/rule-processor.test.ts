import { describe, it, expect } from 'vitest';
import { createRuleProcessor, RuleProcessor } from './rule-processor';
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

  it('should return an empty object when evaluate is called (MVP)', () => {
    const config: NormalizedConfig = {
      profile: 'default',
      signals: [],
      rules: [],
    };

    const processor = createRuleProcessor(config);
    const result = processor.evaluate({});

    expect(result).toEqual({});
  });

  it('should accept any state as parameter', () => {
    const config: NormalizedConfig = {
      profile: 'default',
      signals: [],
      rules: [],
    };

    const processor = createRuleProcessor(config);

    const state1 = { count: 0 };
    const state2 = { profile: 'test', signals: {}, ui: {} };
    const state3 = null;
    const state4 = undefined;

    expect(() => processor.evaluate(state1)).not.toThrow();
    expect(() => processor.evaluate(state2)).not.toThrow();
    expect(() => processor.evaluate(state3 as any)).not.toThrow();
    expect(() => processor.evaluate(state4 as any)).not.toThrow();
  });

  it('should return an empty object regardless of the provided state', () => {
    const config: NormalizedConfig = {
      profile: 'default',
      signals: [],
      rules: [],
    };

    const processor = createRuleProcessor(config);

    const states = [
      {},
      { count: 0 },
      { profile: 'test', signals: {}, ui: {} },
      { complex: { nested: { data: 'value' } } },
    ];

    states.forEach((state) => {
      const result = processor.evaluate(state);
      expect(result).toEqual({});
    });
  });

  it('should implement the RuleProcessor interface', () => {
    const config: NormalizedConfig = {
      profile: 'default',
      signals: [],
      rules: [],
    };

    const processor = createRuleProcessor(config);

    // Verify that it implements the interface
    const processorTyped: RuleProcessor = processor;
    expect(processorTyped.evaluate).toBeDefined();
  });

  it('should work with different configurations', () => {
    const configs: NormalizedConfig[] = [
      { profile: 'default', signals: [], rules: [] },
      { profile: 'custom', signals: ['signal1'], rules: [{ id: 'rule1' }] },
      { profile: 'test', signals: ['s1', 's2'], rules: [{ id: 'r1' }, { id: 'r2' }] },
    ];

    configs.forEach((config) => {
      const processor = createRuleProcessor(config);
      const result = processor.evaluate({});

      expect(result).toEqual({});
    });
  });
});
