import { normalizeConfig, NeuroUXConfig, NormalizedConfig } from './config';
import { createStateContainer } from './state';
import { createEventBus } from './event-bus';
import { createSignalsRegistry } from './signals/signals-registry';
import { createUiChannel, UiChannel } from './ui-channel';
import { createRuleProcessor, isValidRule, Rule } from './rule-processor';
import { createHeuristicsEngine } from './heuristics-engine';
import { createStylingEngine } from '@adapt-ux/neuro-ux-sdk-styles';
import { TabHiddenSignal } from '@adapt-ux/neuro-ux-sdk-signals';
import { createDebugStore, createDebugAPI } from './debug';

const TAB_HIDDEN_SIGNAL = 'tabHidden';

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
 * import { createNeuroUX } from '@adapt-ux/neuro-ux-sdk-core';
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

  const heuristics = createHeuristicsEngine(signals, eventBus);

  // Rule output reaches the styling engine through an explicit apply() call,
  // so its own UI subscription must skip writes made by the rule cycle.
  let writingRuleOutput = false;
  const stylingUi: UiChannel = {
    ...ui,
    onUpdate: (handler) =>
      ui.onUpdate((updates) => {
        if (!writingRuleOutput) {
          handler(updates);
        }
      }),
  };
  const styling = createStylingEngine(stylingUi, { eventBus });

  const runtimeRules = new Map<string, Rule>();
  let runtimeRuleCounter = 0;

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

  // Track last adaptation output to emit 'adaptation' only when it changes
  let lastAdaptationOutput: Record<string, any> = {};

  // Evaluate rules and update UI channel when state changes
  function evaluateRules() {
    const currentState = state.getState();
    const evaluationState = {
      signals: currentState.signals || {},
      profile: currentState.profile,
    };
    const rawOutput = ruleProcessor.evaluate(
      evaluationState,
      Array.from(runtimeRules.values())
    );

    // Locked keys belong to the user; rule output must not overwrite them
    const uiOutput: Record<string, any> = {};
    Object.entries(rawOutput).forEach(([key, value]) => {
      if (!ui.isLocked(key)) {
        uiOutput[key] = value;
      }
    });

    // Emit 'adaptation' event when output changes (MVP Rule Processor integration)
    const outputChanged =
      JSON.stringify(uiOutput) !== JSON.stringify(lastAdaptationOutput);
    if (outputChanged) {
      lastAdaptationOutput = { ...uiOutput };
      eventBus.emit('adaptation', lastAdaptationOutput);
    }

    // Write rule processor output to UI channel
    const wasWritingRuleOutput = writingRuleOutput;
    writingRuleOutput = true;
    try {
      Object.entries(uiOutput).forEach(([key, value]) => {
        ui.set(key, value);
      });
    } finally {
      writingRuleOutput = wasWritingRuleOutput;
    }

    if (outputChanged && Object.keys(uiOutput).length > 0) {
      styling.apply({ ...uiOutput });
    }

    // Debug: track rule evaluations
    if (debugStore && config.rules) {
      config.rules.forEach((rule: Rule, index: number) => {
        const ruleId = `rule-${index}`;
        // Check if rule matches by evaluating it separately
        // For simple rules, check the condition
        let matched = false;
        let reason: { signal: string; value: any; op?: string } | undefined =
          undefined;

        if ('when' in rule && 'apply' in rule) {
          // Simple rule - check if the condition matches
          const { signal, op, value: expectedValue } = rule.when;
          const signals = (evaluationState.signals || {}) as Record<
            string,
            number | string | boolean
          >;
          const signalValue = signals[signal];

          // Evaluate the condition
          switch (op) {
            case '>':
              matched =
                signalValue !== undefined &&
                Number(signalValue) > Number(expectedValue);
              break;
            case '<':
              matched =
                signalValue !== undefined &&
                Number(signalValue) < Number(expectedValue);
              break;
            case '>=':
              matched =
                signalValue !== undefined &&
                Number(signalValue) >= Number(expectedValue);
              break;
            case '<=':
              matched =
                signalValue !== undefined &&
                Number(signalValue) <= Number(expectedValue);
              break;
            case '===':
              matched = signalValue === expectedValue;
              break;
            case '!==':
              matched = signalValue !== expectedValue;
              break;
          }

          if (matched) {
            reason = { signal, value: signalValue, op };
          }
        } else if ('and' in rule || 'or' in rule) {
          // Rule group - for debug purposes, we'll check if any output was generated
          // The actual matching is complex and handled by ruleProcessor
          matched = Object.keys(uiOutput).length > 0;
        }

        debugStore.addRuleEvaluation(ruleId, matched, reason);
        eventBus.emit('debug:rule', {
          ruleId,
          matched,
          reason,
          timestamp: Date.now(),
        });
      });
    }
  }

  // Subscribe to state changes to re-evaluate rules
  state.subscribe(() => {
    evaluateRules();
  });

  // Initial rule evaluation
  evaluateRules();

  const rules = {
    /**
     * Adds a rule at runtime. Returns its id, or null when the shape is invalid.
     */
    add(rule: Rule): string | null {
      if (!isValidRule(rule)) {
        return null;
      }
      runtimeRuleCounter += 1;
      const id = `runtime-rule-${runtimeRuleCounter}`;
      runtimeRules.set(id, rule);
      evaluateRules();
      return id;
    },

    /**
     * Removes a runtime rule. Returns false when the id is unknown.
     */
    remove(id: string): boolean {
      const removed = runtimeRules.delete(id);
      if (removed) {
        evaluateRules();
      }
      return removed;
    },

    list(): Array<{ id: string; rule: Rule }> {
      return Array.from(runtimeRules, ([id, rule]) => ({ id, rule: { ...rule } }));
    },
  };

  // Feed tab visibility into the signals registry
  const tabHiddenSignal = new TabHiddenSignal({
    emit(payload: unknown) {
      if (
        !payload ||
        typeof payload !== 'object' ||
        (payload as { type?: unknown }).type !== TAB_HIDDEN_SIGNAL
      ) {
        return;
      }
      const value = (payload as { value?: unknown }).value;
      if (typeof value !== 'boolean') {
        return;
      }
      if (signals.get(TAB_HIDDEN_SIGNAL) === undefined) {
        signals.register(TAB_HIDDEN_SIGNAL, value);
      }
      signals.update(TAB_HIDDEN_SIGNAL, value);
    },
  });
  tabHiddenSignal.start();

  let destroyed = false;

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
    rules,
    styling,

    // debug API
    debug,

    destroy() {
      if (destroyed) {
        return;
      }
      destroyed = true;
      tabHiddenSignal.stop();
      styling.destroy();
      heuristics.destroy();
      if (debugStore) {
        debugStore.clear();
      }
      eventBus.emit('destroy');
    },
  };
}
