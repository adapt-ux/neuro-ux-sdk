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
});
