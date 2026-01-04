import { Rule, RuleCondition, RuleEvaluationState } from './rule-types';

/**
 * Gets a value from state, signals, or context
 */
function getValueFromStateOrSignals(
  key: string,
  state: RuleEvaluationState
): any {
  // Check signals first
  if (state.signals && key in state.signals) {
    return state.signals[key];
  }

  // Check state
  if (state.state && key in state.state) {
    return state.state[key];
  }

  // Check context
  if (state.context && key in state.context) {
    return state.context[key];
  }

  // Check root level
  if (key in state) {
    return state[key];
  }

  return undefined;
}

/**
 * Evaluates a single condition key-value pair
 * Supports:
 * - Direct boolean: { idle: true }
 * - Equality: { scroll: 0 }
 * - Greater than: { focus: { $gt: 0.5 } }
 * - Less than: { focus: { $lt: 0.5 } }
 * - Greater or equal: { focus: { $gte: 0.5 } }
 * - Less or equal: { focus: { $lte: 0.5 } }
 * - Key presence: { hasProfile: true } (checks if key exists)
 */
function evaluateConditionEntry(
  key: string,
  expected: any,
  state: RuleEvaluationState
): boolean {
  const actual = getValueFromStateOrSignals(key, state);

  // Handle special operators
  if (typeof expected === 'object' && expected !== null && !Array.isArray(expected)) {
    // Greater than
    if ('$gt' in expected) {
      return Number(actual) > Number(expected.$gt);
    }
    // Less than
    if ('$lt' in expected) {
      return Number(actual) < Number(expected.$lt);
    }
    // Greater or equal
    if ('$gte' in expected) {
      return Number(actual) >= Number(expected.$gte);
    }
    // Less or equal
    if ('$lte' in expected) {
      return Number(actual) <= Number(expected.$lte);
    }
  }

  // Direct equality comparison
  return actual === expected;
}

/**
 * Evaluates a rule condition against the current state
 * 
 * @internal This function is internal and not part of the public API.
 */
export function evaluateRuleCondition(
  condition: RuleCondition,
  state: RuleEvaluationState
): boolean {
  // Check all key-value pairs in the condition
  return Object.entries(condition).every(([key, expected]) => {
    return evaluateConditionEntry(key, expected, state);
  });
}

/**
 * Evaluates a complete rule (condition + apply)
 * Returns the apply object if condition matches, null otherwise
 * 
 * @internal This function is internal and not part of the public API.
 */
export function evaluateRule(
  rule: Rule,
  state: RuleEvaluationState
): Rule['apply'] | null {
  const matches = evaluateRuleCondition(rule.when, state);
  
  if (matches) {
    return rule.apply;
  }

  return null;
}
