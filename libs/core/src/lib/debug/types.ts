/**
 * Debug types for Developer Debug & Inspection API
 */

/**
 * Signal debug entry
 */
export interface DebugSignalEntry {
  name: string;
  value: any;
  timestamp: number;
}

/**
 * Heuristic debug entry
 */
export interface DebugHeuristicEntry {
  name: string;
  value: any;
  timestamp: number;
}

/**
 * Rule evaluation debug entry
 */
export interface DebugRuleEntry {
  ruleId: string;
  matched: boolean;
  reason?: {
    signal?: string;
    value?: any;
    [key: string]: any;
  };
  timestamp: number;
}

/**
 * UI update debug entry
 */
export interface DebugUIEntry {
  key: string;
  value: any;
  timestamp: number;
}

/**
 * Debug store data structure
 */
export interface DebugStoreData {
  lastSignals: DebugSignalEntry[];
  lastHeuristics: DebugHeuristicEntry[];
  lastRuleEvaluations: DebugRuleEntry[];
  lastUIUpdates: DebugUIEntry[];
}

/**
 * Last decision explanation
 */
export interface DecisionExplanation {
  ruleId?: string;
  matched: boolean;
  reason?: {
    signal?: string;
    value?: any;
    [key: string]: any;
  };
  timestamp?: number;
}
