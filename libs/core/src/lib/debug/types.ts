/**
 * Debug types for Developer Debug & Inspection API
 */

/**
 * Signal debug entry
 * 
 * @internal This interface is internal and not part of the public API.
 */
export interface DebugSignalEntry {
  name: string;
  value: any;
  timestamp: number;
}

/**
 * Heuristic debug entry
 * 
 * @internal This interface is internal and not part of the public API.
 */
export interface DebugHeuristicEntry {
  name: string;
  value: any;
  timestamp: number;
}

/**
 * Rule evaluation debug entry
 * 
 * @internal This interface is internal and not part of the public API.
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
 * 
 * @internal This interface is internal and not part of the public API.
 */
export interface DebugUIEntry {
  key: string;
  value: any;
  timestamp: number;
}

/**
 * Debug store data structure
 * 
 * @internal This interface is internal and not part of the public API.
 */
export interface DebugStoreData {
  lastSignals: DebugSignalEntry[];
  lastHeuristics: DebugHeuristicEntry[];
  lastRuleEvaluations: DebugRuleEntry[];
  lastUIUpdates: DebugUIEntry[];
}

/**
 * Last decision explanation
 * 
 * @internal This interface is internal and not part of the public API.
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
