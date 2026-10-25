import { NormalizedConfig } from './config';

/**
 * Supported comparison operators
 */
export type ComparisonOperator = '>' | '<' | '>=' | '<=' | '===' | '!==';

/**
 * Condition for a rule - checks a signal value against a threshold
 */
export interface RuleCondition {
  signal: string;
  op: ComparisonOperator;
  value: number | string | boolean;
}

/**
 * UI output to apply when a rule matches
 */
export interface RuleApply {
  ui: Record<string, any>;
}

/**
 * Single rule with a condition and output
 */
export interface SimpleRule {
  when: RuleCondition;
  apply: RuleApply;
}

/**
 * Group of rules combined with AND logic
 */
export interface AndRuleGroup {
  and: Rule[];
}

/**
 * Group of rules combined with OR logic
 */
export interface OrRuleGroup {
  or: Rule[];
}

/**
 * A rule can be a simple rule or a group
 */
export type Rule = SimpleRule | AndRuleGroup | OrRuleGroup;

/**
 * State structure expected by the rule processor
 */
export interface RuleProcessorState {
  signals?: Record<string, number | string | boolean>;
  profile?: string;
  [key: string]: any;
}

/**
 * Rule processor interface
 */
export interface RuleProcessor {
  /**
   * Evaluates config rules, then `extraRules` in order. Later outputs win.
   */
  evaluate(state: RuleProcessorState, extraRules?: Rule[]): Record<string, any>;
}

const COMPARISON_OPERATORS: readonly ComparisonOperator[] = [
  '>',
  '<',
  '>=',
  '<=',
  '===',
  '!==',
];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Checks whether a value has a valid Rule shape (simple rule, AND or OR group).
 */
export function isValidRule(rule: unknown): rule is Rule {
  if (!isPlainObject(rule)) {
    return false;
  }

  if ('and' in rule) {
    const group = rule['and'];
    return Array.isArray(group) && group.every(isValidRule);
  }

  if ('or' in rule) {
    const group = rule['or'];
    return Array.isArray(group) && group.every(isValidRule);
  }

  const when = rule['when'];
  const apply = rule['apply'];
  if (!isPlainObject(when) || !isPlainObject(apply)) {
    return false;
  }

  const signal = when['signal'];
  const valueType = typeof when['value'];
  return (
    typeof signal === 'string' &&
    signal.trim().length > 0 &&
    COMPARISON_OPERATORS.includes(when['op'] as ComparisonOperator) &&
    (valueType === 'number' ||
      valueType === 'string' ||
      valueType === 'boolean') &&
    isPlainObject(apply['ui'])
  );
}

/**
 * Evaluates a single condition against the current state
 */
function evaluateCondition(
  condition: RuleCondition,
  state: RuleProcessorState
): boolean {
  const { signal, op, value } = condition;
  const signals = state.signals || {};
  const signalValue = signals[signal];

  // Unknown signal names return false (safe evaluation)
  if (signalValue === undefined) {
    return false;
  }

  // Type-safe comparison based on operator
  try {
    switch (op) {
      case '>':
        return Number(signalValue) > Number(value);
      case '<':
        return Number(signalValue) < Number(value);
      case '>=':
        return Number(signalValue) >= Number(value);
      case '<=':
        return Number(signalValue) <= Number(value);
      case '===':
        return signalValue === value;
      case '!==':
        return signalValue !== value;
      default:
        // Invalid operator - safe fallback
        return false;
    }
  } catch {
    // Type conversion errors - safe fallback
    return false;
  }
}

/**
 * Evaluates a simple rule (condition + apply)
 */
function evaluateRule(rule: SimpleRule, state: RuleProcessorState): boolean {
  return evaluateCondition(rule.when, state);
}

/**
 * Resolves an AND group - all rules must be true
 */
function resolveAndGroup(
  group: AndRuleGroup,
  state: RuleProcessorState
): boolean {
  return group.and.every((rule) => resolveRule(rule, state));
}

/**
 * Resolves an OR group - at least one rule must be true
 */
function resolveOrGroup(
  group: OrRuleGroup,
  state: RuleProcessorState
): boolean {
  return group.or.some((rule) => resolveRule(rule, state));
}

/**
 * Resolves any rule type (simple, AND, OR) recursively
 */
function resolveRule(rule: Rule, state: RuleProcessorState): boolean {
  // Invalid rule shape - safe fallback
  if (!rule || typeof rule !== 'object') {
    return false;
  }

  if ('and' in rule) {
    return resolveAndGroup(rule, state);
  }

  if ('or' in rule) {
    return resolveOrGroup(rule, state);
  }

  if ('when' in rule && 'apply' in rule) {
    return evaluateRule(rule, state);
  }

  // Invalid rule shape - safe fallback
  return false;
}

/**
 * Collects UI output from a single rule (recursively handles groups)
 */
function collectRuleOutput(
  rule: Rule,
  state: RuleProcessorState
): Record<string, any> {
  const output: Record<string, any> = {};

  if ('apply' in rule && rule.apply?.ui) {
    // Simple rule with apply
    Object.assign(output, rule.apply.ui);
  } else if ('and' in rule) {
    // For AND groups, collect outputs from all matching sub-rules
    for (const subRule of rule.and) {
      if (resolveRule(subRule, state)) {
        const subOutput = collectRuleOutput(subRule, state);
        Object.assign(output, subOutput);
      }
    }
  } else if ('or' in rule) {
    // For OR groups, collect outputs from the first matching sub-rule
    for (const subRule of rule.or) {
      if (resolveRule(subRule, state)) {
        const subOutput = collectRuleOutput(subRule, state);
        Object.assign(output, subOutput);
        break; // Only take first match for OR groups
      }
    }
  }

  return output;
}

/**
 * Collects UI output from all matching rules
 */
function collectRuleOutputs(
  rules: Rule[],
  state: RuleProcessorState
): Record<string, any> {
  const output: Record<string, any> = {};

  for (const rule of rules) {
    const matches = resolveRule(rule, state);

    if (matches) {
      const ruleOutput = collectRuleOutput(rule, state);
      Object.assign(output, ruleOutput);
    }
  }

  return output;
}

/**
 * Creates a rule processor that evaluates declarative rules
 * and generates UI output based on the current state
 */
export function createRuleProcessor(config: NormalizedConfig): RuleProcessor {
  const rules: Rule[] = ((config.rules as Rule[]) || []).filter(
    (rule): rule is Rule => rule != null && typeof rule === 'object'
  );

  return {
    evaluate(
      state: RuleProcessorState,
      extraRules: Rule[] = []
    ): Record<string, any> {
      if (!state || typeof state !== 'object') {
        return {};
      }

      // Ensure signals object exists
      const safeState: RuleProcessorState = {
        ...state,
        signals: state.signals || {},
      };

      // Evaluate all rules and collect UI outputs
      return collectRuleOutputs([...rules, ...extraRules], safeState);
    },
  };
}
