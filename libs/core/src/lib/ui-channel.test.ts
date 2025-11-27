import { describe, it, expect, vi } from 'vitest';
import { createUiChannel, UiChannel } from './ui-channel';

describe('createUiChannel', () => {
  describe('initialization', () => {
    it('should create a UI channel', () => {
      const channel = createUiChannel();

      expect(channel).toBeDefined();
      expect(channel).toHaveProperty('set');
      expect(channel).toHaveProperty('get');
      expect(channel).toHaveProperty('getAll');
      expect(channel).toHaveProperty('onUpdate');
    });

    it('should implement the UiChannel interface', () => {
      const channel = createUiChannel();

      const channelTyped: UiChannel = channel;
      expect(channelTyped.set).toBeDefined();
      expect(channelTyped.get).toBeDefined();
      expect(channelTyped.getAll).toBeDefined();
      expect(channelTyped.onUpdate).toBeDefined();
    });
  });

  describe('set and get', () => {
    it('should set and get a value', () => {
      const channel = createUiChannel();

      channel.set('key1', 'value1');
      expect(channel.get('key1')).toBe('value1');
    });

    it('should overwrite existing values', () => {
      const channel = createUiChannel();

      channel.set('key1', 'value1');
      channel.set('key1', 'value2');
      expect(channel.get('key1')).toBe('value2');
    });

    it('should handle different value types', () => {
      const channel = createUiChannel();

      channel.set('string', 'text');
      channel.set('number', 42);
      channel.set('boolean', true);
      channel.set('object', { nested: 'value' });
      channel.set('array', [1, 2, 3]);
      channel.set('null', null);
      channel.set('undefined', undefined);

      expect(channel.get('string')).toBe('text');
      expect(channel.get('number')).toBe(42);
      expect(channel.get('boolean')).toBe(true);
      expect(channel.get('object')).toEqual({ nested: 'value' });
      expect(channel.get('array')).toEqual([1, 2, 3]);
      expect(channel.get('null')).toBeNull();
      expect(channel.get('undefined')).toBeUndefined();
    });

    it('should return undefined for non-existent keys', () => {
      const channel = createUiChannel();

      expect(channel.get('non-existent')).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should return an empty object initially', () => {
      const channel = createUiChannel();

      expect(channel.getAll()).toEqual({});
    });

    it('should return all stored values', () => {
      const channel = createUiChannel();

      channel.set('key1', 'value1');
      channel.set('key2', 'value2');
      channel.set('key3', 'value3');

      const all = channel.getAll();
      expect(all).toEqual({
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      });
    });

    it('should return a copy of the state', () => {
      const channel = createUiChannel();

      channel.set('key1', 'value1');
      const all1 = channel.getAll();
      const all2 = channel.getAll();

      expect(all1).not.toBe(all2);
      expect(all1).toEqual(all2);
    });
  });

  describe('onUpdate', () => {
    it('should call handler when set is called', () => {
      const channel = createUiChannel();
      const handler = vi.fn();

      channel.onUpdate(handler);
      channel.set('key1', 'value1');

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({ key1: 'value1' });
    });

    it('should call handler with correct updates', () => {
      const channel = createUiChannel();
      const handler = vi.fn();

      channel.onUpdate(handler);
      channel.set('key1', 'value1');
      channel.set('key2', 'value2');

      expect(handler).toHaveBeenCalledTimes(2);
      expect(handler).toHaveBeenNthCalledWith(1, { key1: 'value1' });
      expect(handler).toHaveBeenNthCalledWith(2, { key2: 'value2' });
    });

    it('should support multiple handlers', () => {
      const channel = createUiChannel();
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      channel.onUpdate(handler1);
      channel.onUpdate(handler2);
      channel.set('key1', 'value1');

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('should allow unsubscribing handlers', () => {
      const channel = createUiChannel();
      const handler = vi.fn();

      const unsubscribe = channel.onUpdate(handler);
      channel.set('key1', 'value1');

      expect(handler).toHaveBeenCalledTimes(1);

      unsubscribe();
      channel.set('key2', 'value2');

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should not call handler when value is the same', () => {
      const channel = createUiChannel();
      const handler = vi.fn();

      channel.onUpdate(handler);
      channel.set('key1', 'value1');
      channel.set('key1', 'value1');

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('event emission', () => {
    it('should emit ui:update event when onEmit is provided', () => {
      const emit = vi.fn();
      const channel = createUiChannel(emit);

      channel.set('key1', 'value1');

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit).toHaveBeenCalledWith('ui:update', { key1: 'value1' });
    });

    it('should not emit event when onEmit is not provided', () => {
      const channel = createUiChannel();

      expect(() => {
        channel.set('key1', 'value1');
      }).not.toThrow();
    });

    it('should emit event for each set operation', () => {
      const emit = vi.fn();
      const channel = createUiChannel(emit);

      channel.set('key1', 'value1');
      channel.set('key2', 'value2');
      channel.set('key3', 'value3');

      expect(emit).toHaveBeenCalledTimes(3);
      expect(emit).toHaveBeenNthCalledWith(1, 'ui:update', { key1: 'value1' });
      expect(emit).toHaveBeenNthCalledWith(2, 'ui:update', { key2: 'value2' });
      expect(emit).toHaveBeenNthCalledWith(3, 'ui:update', { key3: 'value3' });
    });
  });

  describe('integration', () => {
    it('should work correctly with multiple operations', () => {
      const channel = createUiChannel();
      const handler = vi.fn();

      channel.onUpdate(handler);

      channel.set('key1', 'value1');
      channel.set('key2', 'value2');
      const value1 = channel.get('key1');
      const value2 = channel.get('key2');
      const all = channel.getAll();

      expect(value1).toBe('value1');
      expect(value2).toBe('value2');
      expect(all).toEqual({ key1: 'value1', key2: 'value2' });
      expect(handler).toHaveBeenCalledTimes(2);
    });

    it('should handle complex nested objects', () => {
      const channel = createUiChannel();
      const complexObject = {
        nested: {
          deep: {
            value: 'test',
          },
        },
        array: [1, 2, { item: 'value' }],
      };

      channel.set('complex', complexObject);
      const retrieved = channel.get('complex');

      expect(retrieved).toEqual(complexObject);
    });
  });
});
