import { EventBus } from './events';
import { NeuroUXInstance, NeuroUXOptions } from './types';

export function createNeuroUX(options: NeuroUXOptions = {}): NeuroUXInstance {
  const events = new EventBus();
  const state: Record<string, any> = {
    initialized: false,
    profile: options.profile ?? 'default',
  };

  return {
    init() {
      state['initialized'] = true;
      events.emit('ready', state);
    },
    destroy() {
      state['initialized'] = false;
      events.emit('destroy');
    },
    getState() {
      return state;
    },
    on(event, handler) {
      events.on(event, handler);
    },
  };
}
