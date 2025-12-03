import { Rule, RuleEvaluationState, AdaptationResult } from './rule-types';
import { evaluateRule } from './rule-evaluator';

/**
 * Core Engine interface for binding
 */
export interface CoreEngine {
  emit: (event: string, payload: any) => void;
}

/**
 * Rule Processor MVP v0.1
 * 
 * Analyzes state, signals, and context to generate adaptive decisions.
 * Reprocesses rules when state changes or new signals arrive.
 */
export class RuleProcessor {
  private rules: Rule[] = [];
  private lastResult: AdaptationResult = {};
  private engine: CoreEngine | null = null;

  constructor(rules: Rule[] = []) {
    this.rules = rules.filter(
      (rule): rule is Rule =>
        rule != null &&
        typeof rule === 'object' &&
        'when' in rule &&
        'apply' in rule
    );
  }

  /**
   * Binds the Rule Processor to a Core Engine
   * This allows the processor to emit 'adaptation' events
   */
  bindEngine(engine: CoreEngine): void {
    this.engine = engine;
  }

  /**
   * Evaluates all rules against the current state
   * Returns the combined adaptation result
   */
  evaluate(state: RuleEvaluationState): AdaptationResult {
    const result: AdaptationResult = {};

    // Evaluate each rule
    for (const rule of this.rules) {
      const ruleOutput = evaluateRule(rule, state);
      
      if (ruleOutput) {
        // Merge rule output into result
        Object.assign(result, ruleOutput);
      }
    }

    // Check if result changed
    const hasChanged = JSON.stringify(result) !== JSON.stringify(this.lastResult);
    
    if (hasChanged) {
      this.lastResult = result;
      
      // Emit adaptation event if engine is bound
      if (this.engine) {
        this.engine.emit('adaptation', result);
      }
    }

    return result;
  }

  /**
   * Gets the last evaluation result
   */
  getLastResult(): AdaptationResult {
    return { ...this.lastResult };
  }

  /**
   * Adds a new rule
   */
  addRule(rule: Rule): void {
    if (
      rule &&
      typeof rule === 'object' &&
      'when' in rule &&
      'apply' in rule
    ) {
      this.rules.push(rule);
    }
  }

  /**
   * Removes all rules
   */
  clearRules(): void {
    this.rules = [];
    this.lastResult = {};
  }
}
