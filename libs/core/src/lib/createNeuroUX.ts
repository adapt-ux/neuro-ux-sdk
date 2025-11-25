import { loadConfig, NeuroUXConfig } from './config';
import { createStateContainer } from './state';
import { createRuleProcessor } from './rule-processor';
import { createEventBus } from './event-bus';

export function createNeuroUX(userConfig: NeuroUXConfig = {}) {
  const config = loadConfig(userConfig);

  const eventBus = createEventBus();
  const state = createStateContainer({
    profile: config.profile,
    signals: {},
    ui: {},
  });

  const processor = createRuleProcessor(config);

  // Reavaliar regras quando o estado mudar
  state.subscribe((current) => {
    const uiOutput = processor.evaluate(current);

    eventBus.emit('ui:update', uiOutput);
  });

  function destroy() {
    eventBus.emit('destroy');
  }

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

    destroy,
  };
}
