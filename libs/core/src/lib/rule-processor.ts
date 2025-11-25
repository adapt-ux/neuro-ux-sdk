import { NormalizedConfig } from './config';

export interface RuleProcessor {
  evaluate(state: any): Record<string, any>;
}

/**
 * Placeholder — rules do nothing for now
 */
export function createRuleProcessor(config: NormalizedConfig): RuleProcessor {
  return {
    evaluate(_state: any) {
      // MVP: does nothing yet
      return {};
    },
  };
}
