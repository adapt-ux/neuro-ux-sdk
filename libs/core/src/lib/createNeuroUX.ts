import { normalizeConfig, NeuroUXConfig, NormalizedConfig } from './config';
import { createStateContainer } from './state';
import { createEventBus } from './event-bus';
import { createSignalsRegistry } from './signals/signals-registry';
import { createUiChannel } from './ui-channel';
import { createRuleProcessor } from './rule-processor';
import { RuleProcessor } from './rules/rule-processor';
import { createHeuristicsEngine } from './heuristics-engine';
import { createStylingEngine } from '@adapt-ux/neuro-styles';

export function createNeuroUX(userConfig: NeuroUXConfig = {}) {
  const config = normalizeConfig(userConfig);

  const eventBus = createEventBus();
  const state = createStateContainer({
    profile: config.profile,
    signals: {},
    ui: {},
  });

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

  // Sync UI channel updates to state
  ui.onUpdate((updates) => {
    const currentUi = state.getState().ui || {};
    state.setState({
      ui: {
        ...currentUi,
        ...updates,
      },
    });
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
    mvpRuleProcessor.evaluate({
      signals: currentState.signals || {},
      state: currentState,
      context: {
        profile: currentState.profile,
      },
    });
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

    destroy() {
      styling.destroy();
      heuristics.destroy();
      eventBus.emit('destroy');
    },
  };
}
