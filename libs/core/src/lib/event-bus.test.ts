import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createEventBus } from './event-bus';

describe('createEventBus', () => {
  let eventBus: ReturnType<typeof createEventBus>;

  beforeEach(() => {
    eventBus = createEventBus();
  });

  describe('on', () => {
    it('should register a listener for an event', () => {
      const callback = vi.fn();
      eventBus.on('test-event', callback);

      eventBus.emit('test-event', 'data');

      expect(callback).toHaveBeenCalledWith('data');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should register multiple listeners for the same event', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      eventBus.on('test-event', callback1);
      eventBus.on('test-event', callback2);

      eventBus.emit('test-event', 'data');

      expect(callback1).toHaveBeenCalledWith('data');
      expect(callback2).toHaveBeenCalledWith('data');
    });

    it('should return an unsubscribe function', () => {
      const callback = vi.fn();
      const unsubscribe = eventBus.on('test-event', callback);

      eventBus.emit('test-event', 'data1');
      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();

      eventBus.emit('test-event', 'data2');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should allow registering listeners for different events', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      eventBus.on('event1', callback1);
      eventBus.on('event2', callback2);

      eventBus.emit('event1', 'data1');
      eventBus.emit('event2', 'data2');

      expect(callback1).toHaveBeenCalledWith('data1');
      expect(callback2).toHaveBeenCalledWith('data2');
      expect(callback1).not.toHaveBeenCalledWith('data2');
      expect(callback2).not.toHaveBeenCalledWith('data1');
    });
  });

  describe('off', () => {
    it('should remove a specific listener', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      eventBus.on('test-event', callback1);
      eventBus.on('test-event', callback2);

      eventBus.off('test-event', callback1);

      eventBus.emit('test-event', 'data');

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith('data');
    });

    it('should do nothing if the event does not exist', () => {
      const callback = vi.fn();
      eventBus.off('non-existent', callback);

      // Should not throw an error
      expect(() => eventBus.off('non-existent', callback)).not.toThrow();
    });

    it('should do nothing if the callback is not registered', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      eventBus.on('test-event', callback1);
      eventBus.off('test-event', callback2);

      eventBus.emit('test-event', 'data');

      expect(callback1).toHaveBeenCalledWith('data');
    });
  });

  describe('emit', () => {
    it('should call all registered listeners with the provided arguments', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      eventBus.on('test-event', callback1);
      eventBus.on('test-event', callback2);

      eventBus.emit('test-event', 'arg1', 'arg2', 'arg3');

      expect(callback1).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
      expect(callback2).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });

    it('should do nothing if there are no listeners for the event', () => {
      expect(() => eventBus.emit('non-existent', 'data')).not.toThrow();
    });

    it('should pass multiple arguments to listeners', () => {
      const callback = vi.fn();

      eventBus.on('test-event', callback);
      eventBus.emit('test-event', 1, 2, 3, 4, 5);

      expect(callback).toHaveBeenCalledWith(1, 2, 3, 4, 5);
    });

    it('should work without arguments', () => {
      const callback = vi.fn();

      eventBus.on('test-event', callback);
      eventBus.emit('test-event');

      expect(callback).toHaveBeenCalledWith();
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('integration', () => {
    it('should work correctly with complete subscribe/unsubscribe/emit cycle', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();

      const unsubscribe1 = eventBus.on('event', callback1);
      eventBus.on('event', callback2);

      eventBus.emit('event', 'data1');
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);

      unsubscribe1();
      eventBus.on('event', callback3);

      eventBus.emit('event', 'data2');
      expect(callback1).toHaveBeenCalledTimes(1); // Should not be called again
      expect(callback2).toHaveBeenCalledTimes(2);
      expect(callback3).toHaveBeenCalledTimes(1);
    });
  });
});
