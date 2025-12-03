import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SignalContextImpl } from './signal-context';
import { SignalSnapshot, createSignalSnapshot } from './signal-snapshot';

describe('SignalContextImpl', () => {
  let snapshot: SignalSnapshot;
  let onEmit: ReturnType<typeof vi.fn>;
  let context: SignalContextImpl;

  beforeEach(() => {
    snapshot = createSignalSnapshot();
    onEmit = vi.fn();
    context = new SignalContextImpl(snapshot, onEmit);
  });

  describe('emit', () => {
    it('should call onEmit callback with the value', () => {
      const value = { type: 'idle', value: true };
      context.emit(value);

      expect(onEmit).toHaveBeenCalledWith(value);
      expect(onEmit).toHaveBeenCalledTimes(1);
    });

    it('should update snapshot when value has type property', () => {
      const value = { type: 'scroll', position: 440 };
      context.emit(value);

      const snapshotData = snapshot.get();
      expect(snapshotData.scroll).toBeDefined();
      expect(snapshotData.scroll.position).toBe(440);
      expect(snapshotData.scroll.type).toBe('scroll');
    });

    it('should call onEmit even if value does not have type property', () => {
      const value = { value: true };
      context.emit(value);

      expect(onEmit).toHaveBeenCalledWith(value);
      expect(snapshot.get()).toEqual({});
    });

    it('should handle primitive values', () => {
      context.emit(123);
      context.emit('string');
      context.emit(true);

      expect(onEmit).toHaveBeenCalledTimes(3);
      expect(onEmit).toHaveBeenNthCalledWith(1, 123);
      expect(onEmit).toHaveBeenNthCalledWith(2, 'string');
      expect(onEmit).toHaveBeenNthCalledWith(3, true);
    });

    it('should handle null and undefined values', () => {
      context.emit(null);
      context.emit(undefined);

      expect(onEmit).toHaveBeenCalledTimes(2);
      expect(onEmit).toHaveBeenNthCalledWith(1, null);
      expect(onEmit).toHaveBeenNthCalledWith(2, undefined);
    });

    it('should update snapshot and call onEmit for valid signal values', () => {
      const value1 = { type: 'idle', value: true };
      const value2 = { type: 'scroll', position: 100 };

      context.emit(value1);
      context.emit(value2);

      expect(onEmit).toHaveBeenCalledTimes(2);
      expect(onEmit).toHaveBeenNthCalledWith(1, value1);
      expect(onEmit).toHaveBeenNthCalledWith(2, value2);

      const snapshotData = snapshot.get();
      expect(snapshotData.idle.value).toBe(true);
      expect(snapshotData.scroll.position).toBe(100);
    });

    it('should work with multiple context instances sharing same snapshot', () => {
      const context1 = new SignalContextImpl(snapshot, vi.fn());
      const context2 = new SignalContextImpl(snapshot, vi.fn());

      context1.emit({ type: 'idle', value: true });
      context2.emit({ type: 'scroll', position: 200 });

      const snapshotData = snapshot.get();
      expect(snapshotData.idle).toBeDefined();
      expect(snapshotData.scroll).toBeDefined();
    });

    it('should work with multiple context instances with different callbacks', () => {
      const onEmit1 = vi.fn();
      const onEmit2 = vi.fn();
      const context1 = new SignalContextImpl(snapshot, onEmit1);
      const context2 = new SignalContextImpl(snapshot, onEmit2);

      context1.emit({ type: 'idle', value: true });
      context2.emit({ type: 'scroll', position: 300 });

      expect(onEmit1).toHaveBeenCalledTimes(1);
      expect(onEmit2).toHaveBeenCalledTimes(1);
    });
  });
});
