/**
 * Minimal Rule Schema for MVP v0.1
 * 
 * Supports simple declarative rules that evaluate state and signals
 * to generate adaptive decisions.
 */

/**
 * Rule condition - matches against state, signals, or context
 * Supports:
 * - Direct boolean: { idle: true }
 * - Equality: { scroll: 0 }
 * - Greater/Less: { focus: { $gt: 0.5 } }
 * - Key presence: { hasProfile: true }
 */
export interface RuleCondition {
  [key: string]: any;
}

/**
 * Rule output - adaptations to apply when condition matches
 */
export interface RuleApply {
  [key: string]: any;
}

/**
 * Single rule with condition and output
 */
export interface Rule {
  when: RuleCondition;
  apply: RuleApply;
}

/**
 * State structure for rule evaluation
 * Contains signals, state, and context
 */
export interface RuleEvaluationState {
  signals?: Record<string, number | string | boolean>;
  state?: Record<string, any>;
  context?: Record<string, any>;
  [key: string]: any;
}

/**
 * Adaptation result from rule evaluation
 */
export interface AdaptationResult {
  [key: string]: any;
}
