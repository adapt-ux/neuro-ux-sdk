import { loadConfig, NeuroUXConfig } from './config';
import { createStateContainer } from './state';
import { createEventBus } from './event-bus';
import { createSignalsRegistry } from './signals/signals-registry';

export function createNeuroUX(userConfig: NeuroUXConfig = {}) {
  const config = loadConfig(userConfig);

  const eventBus = createEventBus();
  const state = createStateContainer({
    profile: config.profile,
    signals: {},
    ui: {},
  });

  const signals = createSignalsRegistry();

  // Sync signal updates to state
  signals.onUpdate((name, value) => {
    state.setState({
      signals: {
        ...state.getState().signals,
        [name]: value,
      },
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

  return {
    config,

    // state
    getState: state.getState,
    setState: state.setState,
    subscribe: state.subscribe,

    // events
    on: eventBus.on,
    off: eventBus.off,
    emit: eventBus.emit,

    signals,

    destroy() {
      eventBus.emit('destroy');
    },
  };
}
