import { DebugStoreData, DebugSignalEntry, DebugHeuristicEntry, DebugRuleEntry, DebugUIEntry } from './types';

/**
 * DebugStore maintains a lightweight in-memory store of debug information.
 * Only active when debug mode is enabled.
 * 
 * @internal This class is internal and not part of the public API.
 */
export class DebugStore {
  private data: DebugStoreData = {
    lastSignals: [],
    lastHeuristics: [],
    lastRuleEvaluations: [],
    lastUIUpdates: [],
  };

  // Maximum entries to keep (prevent memory leaks)
  private readonly MAX_ENTRIES = 100;

  /**
   * Adds a signal entry to the store
   */
  addSignal(name: string, value: any): void {
    this.data.lastSignals.push({
      name,
      value,
      timestamp: Date.now(),
    });

    // Keep only last MAX_ENTRIES
    if (this.data.lastSignals.length > this.MAX_ENTRIES) {
      this.data.lastSignals.shift();
    }
  }

  /**
   * Adds a heuristic entry to the store
   */
  addHeuristic(name: string, value: any): void {
    this.data.lastHeuristics.push({
      name,
      value,
      timestamp: Date.now(),
    });

    // Keep only last MAX_ENTRIES
    if (this.data.lastHeuristics.length > this.MAX_ENTRIES) {
      this.data.lastHeuristics.shift();
    }
  }

  /**
   * Adds a rule evaluation entry to the store
   */
  addRuleEvaluation(ruleId: string, matched: boolean, reason?: any): void {
    this.data.lastRuleEvaluations.push({
      ruleId,
      matched,
      reason,
      timestamp: Date.now(),
    });

    // Keep only last MAX_ENTRIES
    if (this.data.lastRuleEvaluations.length > this.MAX_ENTRIES) {
      this.data.lastRuleEvaluations.shift();
    }
  }

  /**
   * Adds a UI update entry to the store
   */
  addUIUpdate(key: string, value: any): void {
    this.data.lastUIUpdates.push({
      key,
      value,
      timestamp: Date.now(),
    });

    // Keep only last MAX_ENTRIES
    if (this.data.lastUIUpdates.length > this.MAX_ENTRIES) {
      this.data.lastUIUpdates.shift();
    }
  }

  /**
   * Gets all signals
   */
  getSignals(): DebugSignalEntry[] {
    return [...this.data.lastSignals];
  }

  /**
   * Gets all heuristics
   */
  getHeuristics(): DebugHeuristicEntry[] {
    return [...this.data.lastHeuristics];
  }

  /**
   * Gets all rule evaluations
   */
  getRuleEvaluations(): DebugRuleEntry[] {
    return [...this.data.lastRuleEvaluations];
  }

  /**
   * Gets all UI updates
   */
  getUIUpdates(): DebugUIEntry[] {
    return [...this.data.lastUIUpdates];
  }

  /**
   * Gets the last rule evaluation (for explainLastDecision)
   */
  getLastRuleEvaluation(): DebugRuleEntry | null {
    const evaluations = this.data.lastRuleEvaluations;
    return evaluations.length > 0 ? evaluations[evaluations.length - 1] : null;
  }

  /**
   * Clears all debug data
   */
  clear(): void {
    this.data = {
      lastSignals: [],
      lastHeuristics: [],
      lastRuleEvaluations: [],
      lastUIUpdates: [],
    };
  }

  /**
   * Gets all debug data (for testing/debugging)
   */
  getAll(): DebugStoreData {
    return {
      lastSignals: [...this.data.lastSignals],
      lastHeuristics: [...this.data.lastHeuristics],
      lastRuleEvaluations: [...this.data.lastRuleEvaluations],
      lastUIUpdates: [...this.data.lastUIUpdates],
    };
  }
}

/**
 * Creates a new DebugStore instance
 * 
 * @internal This function is internal and not part of the public API.
 */
export function createDebugStore(): DebugStore {
  return new DebugStore();
}
