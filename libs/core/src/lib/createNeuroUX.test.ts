import { describe, it, expect, vi } from 'vitest';
import { createNeuroUX } from './createNeuroUX';
import { NeuroUXConfig } from './config';

describe('createNeuroUX', () => {
  describe('initialization', () => {
    it('should create a NeuroUX instance without configuration', () => {
      const instance = createNeuroUX();

      expect(instance).toBeDefined();
      expect(instance).toHaveProperty('config');
      expect(instance).toHaveProperty('getState');
      expect(instance).toHaveProperty('setState');
      expect(instance).toHaveProperty('subscribe');
      expect(instance).toHaveProperty('on');
      expect(instance).toHaveProperty('off');
      expect(instance).toHaveProperty('emit');
      expect(instance).toHaveProperty('signals');
      expect(instance).toHaveProperty('destroy');
    });

    it('should create a NeuroUX instance with default configuration', () => {
      const instance = createNeuroUX();

      expect(instance.config).toEqual({
        profile: 'default',
        signals: [],
        rules: [],
      });
    });

    it('should create a NeuroUX instance with custom configuration', () => {
      const userConfig: NeuroUXConfig = {
        profile: 'custom-profile',
        signals: ['signal1', 'signal2'],
        rules: [{ id: 'rule1' }],
      };

      const instance = createNeuroUX(userConfig);

      expect(instance.config).toEqual(userConfig);
    });

    it('should initialize state with the provided configuration', () => {
      const userConfig: NeuroUXConfig = {
        profile: 'test-profile',
      };

      const instance = createNeuroUX(userConfig);
      const state = instance.getState();

      expect(state).toHaveProperty('profile', 'test-profile');
      expect(state).toHaveProperty('signals');
      expect(state).toHaveProperty('ui');
    });
  });

  describe('state management', () => {
    it('should return the initial state', () => {
      const instance = createNeuroUX();
      const state = instance.getState();

      expect(state).toHaveProperty('profile');
      expect(state).toHaveProperty('signals');
      expect(state).toHaveProperty('ui');
    });

    it('should allow updating the state', () => {
      const instance = createNeuroUX();
      instance.setState({ profile: 'new-profile' });

      const state = instance.getState();
      expect(state.profile).toBe('new-profile');
    });

    it('should notify subscribers when state changes', () => {
      const instance = createNeuroUX();
      const subscriber = vi.fn();

      instance.subscribe(subscriber);
      instance.setState({ profile: 'updated' });

      expect(subscriber).toHaveBeenCalled();
      const calledState = subscriber.mock.calls[0][0];
      expect(calledState.profile).toBe('updated');
    });

    it('should allow unsubscribing subscribers', () => {
      const instance = createNeuroUX();
      const subscriber = vi.fn();

      const unsubscribe = instance.subscribe(subscriber);
      instance.setState({ profile: 'first' });

      expect(subscriber).toHaveBeenCalledTimes(1);

      unsubscribe();
      instance.setState({ profile: 'second' });

      expect(subscriber).toHaveBeenCalledTimes(1);
    });
  });

  describe('event bus', () => {
    it('should allow registering event listeners', () => {
      const instance = createNeuroUX();
      const handler = vi.fn();

      instance.on('test-event', handler);
      instance.emit('test-event', 'data');

      expect(handler).toHaveBeenCalledWith('data');
    });

    it('should allow removing event listeners', () => {
      const instance = createNeuroUX();
      const handler = vi.fn();

      instance.on('test-event', handler);
      instance.off('test-event', handler);
      instance.emit('test-event', 'data');

      expect(handler).not.toHaveBeenCalled();
    });

    it('should emit signal:update event when signals are updated', () => {
      const instance = createNeuroUX();
      const handler = vi.fn();

      instance.on('signal:update', handler);
      instance.signals.register('test-signal', 0);
      instance.signals.update('test-signal', 100);

      expect(handler).toHaveBeenCalledWith({ name: 'test-signal', value: 100 });
    });

    it('should emit signal:register event when signals are registered', () => {
      const instance = createNeuroUX();
      const handler = vi.fn();

      instance.on('signal:register', handler);
      instance.signals.register('test-signal', 42);

      expect(handler).toHaveBeenCalledWith({ name: 'test-signal', value: 42 });
    });

    it('should emit signal:error event when invalid operations occur', () => {
      const instance = createNeuroUX();
      const handler = vi.fn();

      instance.on('signal:error', handler);
      instance.signals.update('unknown-signal', 100); // Try to update non-existent signal

      expect(handler).toHaveBeenCalledWith({
        type: 'unknown',
        name: 'unknown-signal',
        attemptedValue: 100,
      });
    });

    it('should allow multiple listeners for the same event', () => {
      const instance = createNeuroUX();
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      instance.on('test-event', handler1);
      instance.on('test-event', handler2);
      instance.emit('test-event', 'data');

      expect(handler1).toHaveBeenCalledWith('data');
      expect(handler2).toHaveBeenCalledWith('data');
    });
  });

  describe('destroy', () => {
    it('should have a destroy function', () => {
      const instance = createNeuroUX();

      expect(typeof instance.destroy).toBe('function');
    });

    it('should emit destroy event when called', () => {
      const instance = createNeuroUX();
      const handler = vi.fn();

      instance.on('destroy', handler);
      instance.destroy();

      expect(handler).toHaveBeenCalled();
    });

    it('should not throw error when destroy is called multiple times', () => {
      const instance = createNeuroUX();

      expect(() => {
        instance.destroy();
        instance.destroy();
      }).not.toThrow();
    });
  });

  describe('signals integration', () => {
    it('should update state when signals are updated', () => {
      const instance = createNeuroUX();
      const subscriber = vi.fn();

      instance.subscribe(subscriber);

      instance.signals.register('test-signal', 0);
      instance.signals.update('test-signal', 100);

      const state = instance.getState();
      expect(state.signals).toHaveProperty('test-signal', 100);
      expect(subscriber).toHaveBeenCalled();
    });

    it('should emit signal:update event when signals are updated', () => {
      const instance = createNeuroUX();
      const handler = vi.fn();

      instance.on('signal:update', handler);

      instance.signals.register('test-signal', 0);
      instance.signals.update('test-signal', 100);

      expect(handler).toHaveBeenCalledWith({ name: 'test-signal', value: 100 });
    });

    it('should maintain signal state across multiple updates', () => {
      const instance = createNeuroUX();

      instance.signals.register('signal1', 0);
      instance.signals.register('signal2', 'initial');

      instance.signals.update('signal1', 100);
      instance.signals.update('signal2', 'updated');

      const state = instance.getState();
      expect(state.signals).toEqual({ signal1: 100, signal2: 'updated' });
    });
  });

  describe('integration', () => {
    it('should work correctly with multiple subscribers and events', () => {
      const instance = createNeuroUX();
      const stateSubscriber = vi.fn();
      const eventHandler = vi.fn();

      instance.subscribe(stateSubscriber);
      instance.on('custom-event', eventHandler);

      instance.setState({ profile: 'test' });
      instance.emit('custom-event', 'data');

      expect(stateSubscriber).toHaveBeenCalled();
      expect(eventHandler).toHaveBeenCalledWith('data');
    });

    it('should maintain state integrity during multiple updates', () => {
      const instance = createNeuroUX();

      instance.setState({ profile: 'profile1' });
      expect(instance.getState().profile).toBe('profile1');

      instance.setState({ signals: { test: 'signal' } });
      const state = instance.getState();
      expect(state.profile).toBe('profile1');
      expect(state.signals).toEqual({ test: 'signal' });
    });
  });

  describe('UI channel integration', () => {
    it('should expose ui channel in the instance', () => {
      const instance = createNeuroUX();

      expect(instance).toHaveProperty('ui');
      expect(instance.ui).toHaveProperty('set');
      expect(instance.ui).toHaveProperty('get');
      expect(instance.ui).toHaveProperty('getAll');
      expect(instance.ui).toHaveProperty('onUpdate');
    });

    it('should update state.ui when UI channel is updated', () => {
      const instance = createNeuroUX();
      const subscriber = vi.fn();

      instance.subscribe(subscriber);

      instance.ui.set('key1', 'value1');

      const state = instance.getState();
      expect(state.ui).toHaveProperty('key1', 'value1');
      expect(subscriber).toHaveBeenCalled();
    });

    it('should emit ui:update event when UI channel is updated', () => {
      const instance = createNeuroUX();
      const handler = vi.fn();

      instance.on('ui:update', handler);
      instance.ui.set('key1', 'value1');

      expect(handler).toHaveBeenCalledWith({ key1: 'value1' });
    });

    it('should allow reading UI values through ui.get', () => {
      const instance = createNeuroUX();

      instance.ui.set('key1', 'value1');
      instance.ui.set('key2', 'value2');

      expect(instance.ui.get('key1')).toBe('value1');
      expect(instance.ui.get('key2')).toBe('value2');
    });

    it('should allow reading all UI values through ui.getAll', () => {
      const instance = createNeuroUX();

      instance.ui.set('key1', 'value1');
      instance.ui.set('key2', 'value2');

      const all = instance.ui.getAll();
      expect(all).toEqual({ key1: 'value1', key2: 'value2' });
    });

    it('should allow subscribing to UI updates', () => {
      const instance = createNeuroUX();
      const handler = vi.fn();

      instance.ui.onUpdate(handler);
      instance.ui.set('key1', 'value1');

      expect(handler).toHaveBeenCalledWith({ key1: 'value1' });
    });

    it('should update state.ui when rule processor evaluates', () => {
      const instance = createNeuroUX({
        rules: [
          {
            when: { signal: 'focus', op: '<', value: 0.4 },
            apply: { ui: { highlight: true } },
          },
        ],
      });
      const subscriber = vi.fn();

      instance.subscribe(subscriber);

      // Set signal value that matches the rule
      instance.signals.register('focus', 0);
      instance.signals.update('focus', 0.3);

      // Wait for rule evaluation
      const state = instance.getState();
      expect(state.ui).toHaveProperty('highlight', true);
      expect(subscriber).toHaveBeenCalled();
    });

    it('should emit ui:update event when rule processor triggers UI updates', () => {
      const instance = createNeuroUX({
        rules: [
          {
            when: { signal: 'focus', op: '<', value: 0.4 },
            apply: { ui: { highlight: true } },
          },
        ],
      });
      const handler = vi.fn();

      instance.on('ui:update', handler);

      // Set signal value that matches the rule
      instance.signals.register('focus', 0);
      instance.signals.update('focus', 0.3);

      // Rule processor should trigger ui:update event
      expect(handler).toHaveBeenCalledWith({ highlight: true });
    });

    it('should maintain UI state across multiple updates', () => {
      const instance = createNeuroUX();

      instance.ui.set('key1', 'value1');
      instance.ui.set('key2', 'value2');
      instance.ui.set('key1', 'updated-value1');

      const state = instance.getState();
      expect(state.ui).toEqual({
        key1: 'updated-value1',
        key2: 'value2',
      });
    });

    it('should not break signal:update events when UI updates occur', () => {
      const instance = createNeuroUX();
      const signalHandler = vi.fn();
      const uiHandler = vi.fn();

      instance.on('signal:update', signalHandler);
      instance.on('ui:update', uiHandler);

      instance.signals.register('test-signal', 0);
      instance.signals.update('test-signal', 100);
      instance.ui.set('ui-key', 'ui-value');

      expect(signalHandler).toHaveBeenCalledWith({ name: 'test-signal', value: 100 });
      expect(uiHandler).toHaveBeenCalledWith({ 'ui-key': 'ui-value' });
    });
  });

  describe('Rule processor integration', () => {
    it('should evaluate rules when signals are updated', () => {
      const instance = createNeuroUX({
        rules: [
          {
            when: { signal: 'focus', op: '<', value: 0.4 },
            apply: { ui: { highlight: true } },
          },
        ],
      });

      instance.signals.register('focus', 0);
      instance.signals.update('focus', 0.3);

      const state = instance.getState();
      expect(state.ui).toHaveProperty('highlight', true);
    });

    it('should evaluate rules when state is manually updated', () => {
      const instance = createNeuroUX({
        rules: [
          {
            when: { signal: 'focus', op: '<', value: 0.4 },
            apply: { ui: { highlight: true } },
          },
        ],
      });

      instance.setState({
        signals: { focus: 0.3 },
      });

      const state = instance.getState();
      expect(state.ui).toHaveProperty('highlight', true);
    });

    it('should update UI channel when rules match', () => {
      const instance = createNeuroUX({
        rules: [
          {
            when: { signal: 'attention', op: '>', value: 0.6 },
            apply: { ui: { emphasize: true } },
          },
        ],
      });

      instance.signals.register('attention', 0);
      instance.signals.update('attention', 0.7);

      expect(instance.ui.get('emphasize')).toBe(true);
    });

    it('should emit ui:update event when rules match', () => {
      const instance = createNeuroUX({
        rules: [
          {
            when: { signal: 'focus', op: '<', value: 0.4 },
            apply: { ui: { highlight: true } },
          },
        ],
      });
      const handler = vi.fn();

      instance.on('ui:update', handler);

      instance.signals.register('focus', 0);
      instance.signals.update('focus', 0.3);

      expect(handler).toHaveBeenCalledWith({ highlight: true });
    });

    it('should handle multiple rules and merge outputs', () => {
      const instance = createNeuroUX({
        rules: [
          {
            when: { signal: 'focus', op: '<', value: 0.4 },
            apply: { ui: { highlight: true } },
          },
          {
            when: { signal: 'attention', op: '>', value: 0.6 },
            apply: { ui: { emphasize: true } },
          },
        ],
      });

      instance.signals.register('focus', 0);
      instance.signals.register('attention', 0);
      instance.signals.update('focus', 0.3);
      instance.signals.update('attention', 0.7);

      const state = instance.getState();
      expect(state.ui).toEqual({
        highlight: true,
        emphasize: true,
      });
    });

    it('should handle AND rule groups', () => {
      const instance = createNeuroUX({
        rules: [
          {
            and: [
              {
                when: { signal: 'focus', op: '<', value: 0.4 },
                apply: { ui: { highlight: true } },
              },
              {
                when: { signal: 'attention', op: '>', value: 0.6 },
                apply: { ui: { emphasize: true } },
              },
            ],
          },
        ],
      });

      instance.signals.register('focus', 0);
      instance.signals.register('attention', 0);

      // Only first condition matches - rule should not match
      instance.signals.update('focus', 0.3);
      instance.signals.update('attention', 0.5);
      expect(instance.ui.get('highlight')).toBeUndefined();

      // Both conditions match - rule should match
      instance.signals.update('attention', 0.7);
      const state = instance.getState();
      expect(state.ui).toEqual({
        highlight: true,
        emphasize: true,
      });
    });

    it('should handle OR rule groups', () => {
      const instance = createNeuroUX({
        rules: [
          {
            or: [
              {
                when: { signal: 'focus', op: '<', value: 0.4 },
                apply: { ui: { highlight: true } },
              },
              {
                when: { signal: 'attention', op: '>', value: 0.6 },
                apply: { ui: { emphasize: true } },
              },
            ],
          },
        ],
      });

      instance.signals.register('focus', 0);
      instance.signals.register('attention', 0);

      // First condition matches
      instance.signals.update('focus', 0.3);
      expect(instance.ui.get('highlight')).toBe(true);

      // Reset
      instance.signals.update('focus', 0.5);
      instance.setState({ signals: { focus: 0.5, attention: 0.5 } });

      // Second condition matches
      instance.signals.update('attention', 0.7);
      expect(instance.ui.get('emphasize')).toBe(true);
    });

    it('should not update UI when rules do not match', () => {
      const instance = createNeuroUX({
        rules: [
          {
            when: { signal: 'focus', op: '<', value: 0.4 },
            apply: { ui: { highlight: true } },
          },
        ],
      });

      instance.signals.register('focus', 0);
      instance.signals.update('focus', 0.5); // Does not match

      expect(instance.ui.get('highlight')).toBeUndefined();
    });

    it('should handle unknown signal names gracefully', () => {
      const instance = createNeuroUX({
        rules: [
          {
            when: { signal: 'unknownSignal', op: '<', value: 0.4 },
            apply: { ui: { highlight: true } },
          },
        ],
      });

      instance.signals.register('focus', 0);
      instance.signals.update('focus', 0.3);

      // Rule should not match because signal is unknown
      expect(instance.ui.get('highlight')).toBeUndefined();
    });

    it('should re-evaluate rules when state changes', () => {
      const instance = createNeuroUX({
        rules: [
          {
            when: { signal: 'focus', op: '<', value: 0.4 },
            apply: { ui: { highlight: true } },
          },
        ],
      });

      instance.signals.register('focus', 0);

      // First update - matches
      instance.signals.update('focus', 0.3);
      expect(instance.ui.get('highlight')).toBe(true);

      // Second update - does not match
      instance.signals.update('focus', 0.5);
      // Note: Rule processor doesn't clear previous outputs, it only adds/overwrites
      // This is expected behavior - UI channel maintains state
      expect(instance.ui.get('highlight')).toBe(true);
    });
  });
});
