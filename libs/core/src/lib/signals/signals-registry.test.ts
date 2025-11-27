import { describe, it, expect, vi } from 'vitest';
import { createSignalsRegistry, SignalsRegistry } from './signals-registry';

describe('createSignalsRegistry', () => {
  describe('register', () => {
    it('should register a new signal with initial value', () => {
      const registry = createSignalsRegistry();

      registry.register('test-signal', 0);

      expect(registry.get('test-signal')).toBe(0);
    });

    it('should emit signal:register event when registering a signal', () => {
      const registry = createSignalsRegistry();
      const handler = vi.fn();

      const unsubscribe = registry.onRegister(handler);
      registry.register('test-signal', 0);

      expect(handler).toHaveBeenCalledWith({ name: 'test-signal', value: 0 });
      expect(handler).toHaveBeenCalledTimes(1);

      unsubscribe();
    });

    it('should not allow duplicate signal registration', () => {
      const registry = createSignalsRegistry();

      registry.register('test-signal', 0);
      registry.register('test-signal', 100); // Attempt duplicate

      expect(registry.get('test-signal')).toBe(0); // Should keep original value
    });

    it('should allow registering multiple different signals', () => {
      const registry = createSignalsRegistry();

      registry.register('signal1', 0);
      registry.register('signal2', 'value');
      registry.register('signal3', true);

      expect(registry.get('signal1')).toBe(0);
      expect(registry.get('signal2')).toBe('value');
      expect(registry.get('signal3')).toBe(true);
    });

    it('should reject invalid signal types (objects)', () => {
      const registry = createSignalsRegistry();
      const errorHandler = vi.fn();

      const unsubscribe = registry.onError(errorHandler);
      registry.register('test-signal', { nested: true });

      expect(registry.get('test-signal')).toBeUndefined();
      expect(errorHandler).toHaveBeenCalledWith({
        type: 'invalid-type',
        name: 'test-signal',
        attemptedValue: { nested: true },
      });

      unsubscribe();
    });

    it('should reject invalid signal types (arrays)', () => {
      const registry = createSignalsRegistry();
      const errorHandler = vi.fn();

      const unsubscribe = registry.onError(errorHandler);
      registry.register('test-signal', [1, 2, 3]);

      expect(registry.get('test-signal')).toBeUndefined();
      expect(errorHandler).toHaveBeenCalledWith({
        type: 'invalid-type',
        name: 'test-signal',
        attemptedValue: [1, 2, 3],
      });

      unsubscribe();
    });

    it('should reject invalid signal types (null)', () => {
      const registry = createSignalsRegistry();
      const errorHandler = vi.fn();

      const unsubscribe = registry.onError(errorHandler);
      registry.register('test-signal', null);

      expect(registry.get('test-signal')).toBeUndefined();
      expect(errorHandler).toHaveBeenCalledWith({
        type: 'invalid-type',
        name: 'test-signal',
        attemptedValue: null,
      });

      unsubscribe();
    });

    it('should reject invalid signal types (undefined)', () => {
      const registry = createSignalsRegistry();
      const errorHandler = vi.fn();

      const unsubscribe = registry.onError(errorHandler);
      registry.register('test-signal', undefined);

      expect(registry.get('test-signal')).toBeUndefined();
      expect(errorHandler).toHaveBeenCalledWith({
        type: 'invalid-type',
        name: 'test-signal',
        attemptedValue: undefined,
      });

      unsubscribe();
    });

    it('should reject invalid signal names (empty string)', () => {
      const registry = createSignalsRegistry();
      const errorHandler = vi.fn();

      const unsubscribe = registry.onError(errorHandler);
      registry.register('', 0);

      expect(errorHandler).toHaveBeenCalledWith({
        type: 'invalid-name',
        name: '',
        attemptedValue: 0,
      });

      unsubscribe();
    });

    it('should reject invalid signal names (whitespace only)', () => {
      const registry = createSignalsRegistry();
      const errorHandler = vi.fn();

      const unsubscribe = registry.onError(errorHandler);
      registry.register('   ', 0);

      expect(errorHandler).toHaveBeenCalledWith({
        type: 'invalid-name',
        name: '   ',
        attemptedValue: 0,
      });

      unsubscribe();
    });

    it('should accept valid number values including negative and decimal', () => {
      const registry = createSignalsRegistry();

      registry.register('negative', -10);
      registry.register('decimal', 3.14);
      registry.register('zero', 0);

      expect(registry.get('negative')).toBe(-10);
      expect(registry.get('decimal')).toBe(3.14);
      expect(registry.get('zero')).toBe(0);
    });

    it('should reject NaN and Infinity values', () => {
      const registry = createSignalsRegistry();
      const errorHandler = vi.fn();

      const unsubscribe = registry.onError(errorHandler);
      registry.register('nan', NaN);
      registry.register('infinity', Infinity);

      expect(registry.get('nan')).toBeUndefined();
      expect(registry.get('infinity')).toBeUndefined();
      expect(errorHandler).toHaveBeenCalledTimes(2);

      unsubscribe();
    });
  });

  describe('update', () => {
    it('should update an existing signal value', () => {
      const registry = createSignalsRegistry();

      registry.register('test-signal', 0);
      registry.update('test-signal', 100);

      expect(registry.get('test-signal')).toBe(100);
    });

    it('should emit signal:update event when updating a signal', () => {
      const registry = createSignalsRegistry();
      const handler = vi.fn();

      const unsubscribe = registry.onUpdate(handler);

      registry.register('test-signal', 0);
      registry.update('test-signal', 100);

      expect(handler).toHaveBeenCalledWith('test-signal', 100);
      expect(handler).toHaveBeenCalledTimes(1);

      unsubscribe();
    });

    it('should not update a non-existent signal', () => {
      const registry = createSignalsRegistry();

      registry.update('non-existent', 100);

      expect(registry.get('non-existent')).toBeUndefined();
    });

    it('should allow updating with different valid value types', () => {
      const registry = createSignalsRegistry();

      registry.register('test-signal', 0);
      registry.update('test-signal', 'string');
      expect(registry.get('test-signal')).toBe('string');

      registry.update('test-signal', true);
      expect(registry.get('test-signal')).toBe(true);

      registry.update('test-signal', 42);
      expect(registry.get('test-signal')).toBe(42);
    });

    it('should reject invalid types when updating', () => {
      const registry = createSignalsRegistry();
      const errorHandler = vi.fn();

      registry.register('test-signal', 0);
      const unsubscribe = registry.onError(errorHandler);

      registry.update('test-signal', { object: true });
      expect(registry.get('test-signal')).toBe(0); // Should remain unchanged
      expect(errorHandler).toHaveBeenCalledWith({
        type: 'invalid-type',
        name: 'test-signal',
        attemptedValue: { object: true },
      });

      unsubscribe();
    });

    it('should emit signal:error for unknown signals', () => {
      const registry = createSignalsRegistry();
      const errorHandler = vi.fn();

      const unsubscribe = registry.onError(errorHandler);
      registry.update('non-existent', 100);

      expect(registry.get('non-existent')).toBeUndefined();
      expect(errorHandler).toHaveBeenCalledWith({
        type: 'unknown',
        name: 'non-existent',
        attemptedValue: 100,
      });

      unsubscribe();
    });
  });

  describe('get', () => {
    it('should return the value of a registered signal', () => {
      const registry = createSignalsRegistry();

      registry.register('test-signal', 42);

      expect(registry.get('test-signal')).toBe(42);
    });

    it('should return undefined for non-existent signals', () => {
      const registry = createSignalsRegistry();

      expect(registry.get('non-existent')).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should return all registered signals', () => {
      const registry = createSignalsRegistry();

      registry.register('signal1', 0);
      registry.register('signal2', 'value');
      registry.register('signal3', true);

      const all = registry.getAll();

      expect(all).toEqual({
        signal1: 0,
        signal2: 'value',
        signal3: true,
      });
    });

    it('should return an empty object when no signals are registered', () => {
      const registry = createSignalsRegistry();

      expect(registry.getAll()).toEqual({});
    });

    it('should return a copy of the signals, not the original reference', () => {
      const registry = createSignalsRegistry();

      registry.register('test-signal', 'value');
      const all1 = registry.getAll();
      const all2 = registry.getAll();

      expect(all1).not.toBe(all2);
      expect(all1).toEqual(all2);
    });
  });

  describe('onUpdate', () => {
    it('should call callback when a signal is updated', () => {
      const registry = createSignalsRegistry();
      const handler = vi.fn();

      const unsubscribe = registry.onUpdate(handler);

      registry.register('test-signal', 0);
      registry.update('test-signal', 100);

      expect(handler).toHaveBeenCalledWith('test-signal', 100);
      expect(handler).toHaveBeenCalledTimes(1);

      unsubscribe();
    });

    it('should call multiple callbacks when multiple are registered', () => {
      const registry = createSignalsRegistry();
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      const unsubscribe1 = registry.onUpdate(handler1);
      const unsubscribe2 = registry.onUpdate(handler2);

      registry.register('test-signal', 0);
      registry.update('test-signal', 100);

      expect(handler1).toHaveBeenCalledWith('test-signal', 100);
      expect(handler2).toHaveBeenCalledWith('test-signal', 100);

      unsubscribe1();
      unsubscribe2();
    });

    it('should return an unsubscribe function', () => {
      const registry = createSignalsRegistry();
      const handler = vi.fn();

      const unsubscribe = registry.onUpdate(handler);

      registry.register('test-signal', 0);
      registry.update('test-signal', 100);
      expect(handler).toHaveBeenCalledTimes(1);

      unsubscribe();

      registry.update('test-signal', 200);
      expect(handler).toHaveBeenCalledTimes(1); // Should not be called again
    });

    it('should not call callback for register, only for update', () => {
      const registry = createSignalsRegistry();
      const handler = vi.fn();

      const unsubscribe = registry.onUpdate(handler);

      registry.register('test-signal', 0);

      expect(handler).not.toHaveBeenCalled();

      unsubscribe();
    });
  });

  describe('onRegister', () => {
    it('should call callback when a signal is registered', () => {
      const registry = createSignalsRegistry();
      const handler = vi.fn();

      const unsubscribe = registry.onRegister(handler);
      registry.register('test-signal', 42);

      expect(handler).toHaveBeenCalledWith({ name: 'test-signal', value: 42 });
      expect(handler).toHaveBeenCalledTimes(1);

      unsubscribe();
    });

    it('should not call callback when registration fails', () => {
      const registry = createSignalsRegistry();
      const handler = vi.fn();

      const unsubscribe = registry.onRegister(handler);
      registry.register('test-signal', { invalid: true }); // Invalid type

      expect(handler).not.toHaveBeenCalled();

      unsubscribe();
    });

    it('should return an unsubscribe function', () => {
      const registry = createSignalsRegistry();
      const handler = vi.fn();

      const unsubscribe = registry.onRegister(handler);
      registry.register('signal1', 0);
      expect(handler).toHaveBeenCalledTimes(1);

      unsubscribe();
      registry.register('signal2', 1);
      expect(handler).toHaveBeenCalledTimes(1); // Should not be called again
    });
  });

  describe('onError', () => {
    it('should call callback when duplicate signal is registered', () => {
      const registry = createSignalsRegistry();
      const errorHandler = vi.fn();

      const unsubscribe = registry.onError(errorHandler);
      registry.register('test-signal', 0);
      registry.register('test-signal', 100); // Duplicate

      expect(errorHandler).toHaveBeenCalledWith({
        type: 'duplicate',
        name: 'test-signal',
        attemptedValue: 100,
      });

      unsubscribe();
    });

    it('should call callback when unknown signal is updated', () => {
      const registry = createSignalsRegistry();
      const errorHandler = vi.fn();

      const unsubscribe = registry.onError(errorHandler);
      registry.update('unknown-signal', 100);

      expect(errorHandler).toHaveBeenCalledWith({
        type: 'unknown',
        name: 'unknown-signal',
        attemptedValue: 100,
      });

      unsubscribe();
    });

    it('should call callback when invalid type is provided', () => {
      const registry = createSignalsRegistry();
      const errorHandler = vi.fn();

      const unsubscribe = registry.onError(errorHandler);
      registry.register('test-signal', null);

      expect(errorHandler).toHaveBeenCalledWith({
        type: 'invalid-type',
        name: 'test-signal',
        attemptedValue: null,
      });

      unsubscribe();
    });

    it('should return an unsubscribe function', () => {
      const registry = createSignalsRegistry();
      const errorHandler = vi.fn();

      const unsubscribe = registry.onError(errorHandler);
      registry.update('unknown', 100);
      expect(errorHandler).toHaveBeenCalledTimes(1);

      unsubscribe();
      registry.update('unknown2', 200);
      expect(errorHandler).toHaveBeenCalledTimes(1); // Should not be called again
    });
  });

  describe('integration', () => {
    it('should work correctly with full lifecycle', () => {
      const registry = createSignalsRegistry();
      const handler = vi.fn();

      const unsubscribe = registry.onUpdate(handler);

      // Register signals
      registry.register('signal1', 0);
      registry.register('signal2', 'initial');

      // Update signals
      registry.update('signal1', 100);
      registry.update('signal2', 'updated');

      // Verify state
      expect(registry.get('signal1')).toBe(100);
      expect(registry.get('signal2')).toBe('updated');
      expect(registry.getAll()).toEqual({
        signal1: 100,
        signal2: 'updated',
      });

      // Verify callbacks
      expect(handler).toHaveBeenCalledTimes(2);
      expect(handler).toHaveBeenNthCalledWith(1, 'signal1', 100);
      expect(handler).toHaveBeenNthCalledWith(2, 'signal2', 'updated');

      unsubscribe();
    });

    it('should handle rapid updates correctly', () => {
      const registry = createSignalsRegistry();
      const handler = vi.fn();

      const unsubscribe = registry.onUpdate(handler);

      registry.register('test-signal', 0);

      for (let i = 1; i <= 10; i++) {
        registry.update('test-signal', i);
      }

      expect(registry.get('test-signal')).toBe(10);
      expect(handler).toHaveBeenCalledTimes(10);

      unsubscribe();
    });
  });
});
