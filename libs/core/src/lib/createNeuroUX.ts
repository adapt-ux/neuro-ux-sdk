import { normalizeConfig, NeuroUXConfig, NormalizedConfig } from './config';
import { createStateContainer } from './state';
import { createEventBus } from './event-bus';
import { createSignalsRegistry } from './signals/signals-registry';
import { createUiChannel } from './ui-channel';
import { createRuleProcessor } from './rule-processor';
import { RuleProcessor } from './rules/rule-processor';
import { createHeuristicsEngine } from './heuristics-engine';
import { createStylingEngine } from '@adapt-ux/neuro-styles';
import { createDebugStore, createDebugAPI } from './debug';
import { evaluateRule } from './rules/rule-evaluator';

/**
 * Creates a new NeuroUX instance.
 *
 * This is the main entry point for the NeuroUX SDK.
 *
 * @param userConfig - Optional configuration object
 * @returns A NeuroUX instance with signals, UI channel, styling, and event APIs
 *
 * @example
 * ```typescript
 * import { createNeuroUX } from '@adapt-ux/neuro-core';
 *
 * const neuroUX = createNeuroUX({
 *   profile: 'adhd',
 *   debug: true
 * });
 *
 * neuroUX.signals.register('mySignal', () => 0.5);
 * neuroUX.on('signal:update', (data) => console.log(data));
 * ```
 */
export function createNeuroUX(userConfig: NeuroUXConfig = {}) {
  const config = normalizeConfig(userConfig);

  const eventBus = createEventBus();
  const state = createStateContainer({
    profile: config.profile,
    signals: {},
    ui: {},
  });

  // Create debug store only if debug is enabled
  const debugStore = config.debug ? createDebugStore() : null;
  const debug = createDebugAPI(debugStore, config);

  const signals = createSignalsRegistry();
  const ui = createUiChannel((event, payload) => {
    eventBus.emit(event, payload);
  });
  const ruleProcessor = createRuleProcessor(config);

  // Create MVP Rule Processor for simple declarative rules
  const mvpRuleProcessor = new RuleProcessor(config.rules || []);
  mvpRuleProcessor.bindEngine({
    emit: (event: string, payload: any) => {
      eventBus.emit(event, payload);
    },
  });

  const heuristics = createHeuristicsEngine(signals, eventBus);
  const styling = createStylingEngine(ui, { eventBus });

  // Sync signal updates to state
  signals.onUpdate((name, value) => {
    const currentState = state.getState();
    const updatedSignals = {
      ...currentState.signals,
      [name]: value,
    };

    state.setState({
      signals: updatedSignals,
    });

    // Debug: track signal updates
    if (debugStore) {
      debugStore.addSignal(name, value);
      eventBus.emit('debug:signal', { name, value, timestamp: Date.now() });
    }

    // Evaluate heuristics when signals update
    heuristics.evaluate({
      signals: updatedSignals,
      profile: currentState.profile,
    });
  });

  // Propagate signal:update to main event bus
  signals.onUpdate((name, value) => {
    eventBus.emit('signal:update', { name, value });
  });

  // Propagate signal:register to main event bus
  signals.onRegister((data) => {
    eventBus.emit('signal:register', data);
  });

  // Propagate signal:error to main event bus
  signals.onError((error) => {
    eventBus.emit('signal:error', error);
  });

  // Debug: track heuristic updates
  if (debugStore) {
    eventBus.on('heuristic:update', ({ heuristics: changedHeuristics }) => {
      Object.entries(changedHeuristics).forEach(([name, value]) => {
        debugStore.addHeuristic(name, value);
        eventBus.emit('debug:heuristic', {
          name,
          value,
          timestamp: Date.now(),
        });
      });
    });
  }

  // Sync UI channel updates to state
  ui.onUpdate((updates) => {
    const currentUi = state.getState().ui || {};
    state.setState({
      ui: {
        ...currentUi,
        ...updates,
      },
    });

    // Debug: track UI updates
    if (debugStore) {
      Object.entries(updates).forEach(([key, value]) => {
        debugStore.addUIUpdate(key, value);
        eventBus.emit('debug:ui', { key, value, timestamp: Date.now() });
      });
    }
  });

  // Evaluate rules and update UI channel when state changes
  function evaluateRules() {
    const currentState = state.getState();
    const uiOutput = ruleProcessor.evaluate(currentState);

    // Write rule processor output to UI channel
    Object.entries(uiOutput).forEach(([key, value]) => {
      ui.set(key, value);
    });
  }

  // Evaluate MVP rules when state or signals change
  function evaluateMvpRules() {
    const currentState = state.getState();
    const evaluationState = {
      signals: currentState.signals || {},
      state: currentState,
      context: {
        profile: currentState.profile,
      },
    };

    // Debug: track rule evaluations
    if (debugStore && config.rules) {
      config.rules.forEach((rule, index) => {
        const ruleId = `rule-${index}`;
        const ruleOutput = evaluateRule(rule, evaluationState);
        const matched = ruleOutput !== null;

        // Extract reason from rule condition
        const reason =
          matched && rule.when
            ? {
                signal: Object.keys(rule.when)[0],
                value: Object.values(rule.when)[0],
                ...rule.when,
              }
            : undefined;

        debugStore.addRuleEvaluation(ruleId, matched, reason);
        eventBus.emit('debug:rule', {
          ruleId,
          matched,
          reason,
          timestamp: Date.now(),
        });
      });
    }

    mvpRuleProcessor.evaluate(evaluationState);
  }

  // Subscribe to state changes to re-evaluate rules
  state.subscribe(() => {
    evaluateRules();
    evaluateMvpRules();
  });

  // Initial rule evaluation
  evaluateRules();
  evaluateMvpRules();

  return {
    config,

    /**
     * Get the normalized configuration
     */
    getConfig(): NormalizedConfig {
      return { ...config };
    },

    // state
    getState: state.getState,
    setState: state.setState,
    subscribe: state.subscribe,

    // events
    on: eventBus.on,
    off: eventBus.off,
    emit: eventBus.emit,

    signals,
    ui,
    styling,

    // debug API
    debug,

    destroy() {
      styling.destroy();
      heuristics.destroy();
      if (debugStore) {
        debugStore.clear();
      }
      eventBus.emit('destroy');
    },
  };
}
