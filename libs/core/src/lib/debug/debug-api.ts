import { DebugStore } from './debug-store';
import {
  DebugSignalEntry,
  DebugHeuristicEntry,
  DebugRuleEntry,
  DebugUIEntry,
  DecisionExplanation,
} from './types';
import { NormalizedConfig } from '../config';

/**
 * Debug API interface
 *
 * @experimental This API is experimental and may change in future versions.
 */
export interface DebugAPI {
  /**
   * Gets all signal entries
   */
  getSignals(): DebugSignalEntry[];

  /**
   * Gets all heuristic entries
   */
  getHeuristics(): DebugHeuristicEntry[];

  /**
   * Gets all rule evaluation entries
   */
  getRules(): DebugRuleEntry[];

  /**
   * Gets all UI update entries
   */
  getUIState(): DebugUIEntry[];

  /**
   * Gets the normalized configuration
   */
  getConfig(): NormalizedConfig;

  /**
   * Explains the last decision made by the rule processor
   */
  explainLastDecision(): DecisionExplanation | null;

  /**
   * Clears all debug data
   */
  clear(): void;
}

/**
 * Creates a Debug API instance
 *
 * @internal This function is internal and not part of the public API.
 */
export function createDebugAPI(
  store: DebugStore | null,
  config: NormalizedConfig
): DebugAPI {
  // If debug is disabled or store is null, return a no-op API
  if (!store) {
    return {
      getSignals: () => [],
      getHeuristics: () => [],
      getRules: () => [],
      getUIState: () => [],
      getConfig: () => config,
      explainLastDecision: () => null,
      clear: () => {
        // No-op
      },
    };
  }

  return {
    getSignals(): DebugSignalEntry[] {
      return store.getSignals();
    },

    getHeuristics(): DebugHeuristicEntry[] {
      return store.getHeuristics();
    },

    getRules(): DebugRuleEntry[] {
      return store.getRuleEvaluations();
    },

    getUIState(): DebugUIEntry[] {
      return store.getUIUpdates();
    },

    getConfig(): NormalizedConfig {
      return { ...config };
    },

    explainLastDecision(): DecisionExplanation | null {
      const lastEval = store.getLastRuleEvaluation();
      if (!lastEval) {
        return null;
      }

      return {
        ruleId: lastEval.ruleId,
        matched: lastEval.matched,
        reason: lastEval.reason,
        timestamp: lastEval.timestamp,
      };
    },

    clear(): void {
      store.clear();
    },
  };
}
