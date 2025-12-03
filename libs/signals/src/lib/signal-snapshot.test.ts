import { describe, it, expect, beforeEach } from 'vitest';
import { SignalSnapshot, createSignalSnapshot } from './signal-snapshot';

describe('SignalSnapshot', () => {
  let snapshot: SignalSnapshot;

  beforeEach(() => {
    snapshot = createSignalSnapshot();
  });

  describe('update', () => {
    it('should update snapshot with signal value', () => {
      snapshot.update({ type: 'idle', value: true });

      const data = snapshot.get();
      expect(data.idle).toBeDefined();
      expect(data.idle.value).toBe(true);
      expect(data.idle.type).toBe('idle');
      expect(data.idle.ts).toBeTypeOf('number');
    });

    it('should add timestamp to signal value', () => {
      const before = Date.now();
      snapshot.update({ type: 'scroll', position: 100 });
      const after = Date.now();

      const data = snapshot.get();
      expect(data.scroll.ts).toBeGreaterThanOrEqual(before);
      expect(data.scroll.ts).toBeLessThanOrEqual(after);
    });

    it('should overwrite previous value for same signal type', () => {
      snapshot.update({ type: 'idle', value: false });
      snapshot.update({ type: 'idle', value: true });

      const data = snapshot.get();
      expect(data.idle.value).toBe(true);
      expect(Object.keys(data)).toHaveLength(1);
    });

    it('should store multiple different signal types', () => {
      snapshot.update({ type: 'idle', value: true });
      snapshot.update({ type: 'scroll', position: 440 });
      snapshot.update({ type: 'focus', active: true });

      const data = snapshot.get();
      expect(data.idle).toBeDefined();
      expect(data.scroll).toBeDefined();
      expect(data.focus).toBeDefined();
      expect(Object.keys(data)).toHaveLength(3);
    });

    it('should preserve all properties from signal value', () => {
      snapshot.update({
        type: 'scroll',
        position: 440,
        direction: 'down',
        velocity: 10,
      });

      const data = snapshot.get();
      expect(data.scroll.position).toBe(440);
      expect(data.scroll.direction).toBe('down');
      expect(data.scroll.velocity).toBe(10);
      expect(data.scroll.ts).toBeTypeOf('number');
    });

    it('should not update if value is null', () => {
      snapshot.update(null as any);
      expect(snapshot.get()).toEqual({});
    });

    it('should not update if value is undefined', () => {
      snapshot.update(undefined as any);
      expect(snapshot.get()).toEqual({});
    });

    it('should not update if value does not have type property', () => {
      snapshot.update({ value: true } as any);
      expect(snapshot.get()).toEqual({});
    });

    it('should not update if value is not an object', () => {
      snapshot.update('string' as any);
      snapshot.update(123 as any);
      snapshot.update(true as any);
      expect(snapshot.get()).toEqual({});
    });
  });

  describe('get', () => {
    it('should return empty object when no signals have been updated', () => {
      expect(snapshot.get()).toEqual({});
    });

    it('should return a shallow copy of snapshot data', () => {
      snapshot.update({ type: 'idle', value: true });
      const data1 = snapshot.get();
      const data2 = snapshot.get();

      expect(data1).toEqual(data2);
      expect(data1).not.toBe(data2);
    });

    it('should return updated snapshot after multiple updates', () => {
      snapshot.update({ type: 'idle', value: false });
      snapshot.update({ type: 'scroll', position: 100 });
      snapshot.update({ type: 'idle', value: true });

      const data = snapshot.get();
      expect(data.idle.value).toBe(true);
      expect(data.scroll.position).toBe(100);
    });
  });

  describe('clear', () => {
    it('should clear all snapshot data', () => {
      snapshot.update({ type: 'idle', value: true });
      snapshot.update({ type: 'scroll', position: 100 });

      snapshot.clear();

      expect(snapshot.get()).toEqual({});
    });

    it('should allow updates after clearing', () => {
      snapshot.update({ type: 'idle', value: true });
      snapshot.clear();
      snapshot.update({ type: 'scroll', position: 200 });

      const data = snapshot.get();
      expect(data.idle).toBeUndefined();
      expect(data.scroll.position).toBe(200);
    });
  });

  describe('createSignalSnapshot', () => {
    it('should create a new SignalSnapshot instance', () => {
      const newSnapshot = createSignalSnapshot();
      expect(newSnapshot).toBeInstanceOf(SignalSnapshot);
    });

    it('should create independent snapshot instances', () => {
      const snapshot1 = createSignalSnapshot();
      const snapshot2 = createSignalSnapshot();

      snapshot1.update({ type: 'idle', value: true });
      snapshot2.update({ type: 'scroll', position: 100 });

      expect(snapshot1.get()).toEqual({ idle: expect.objectContaining({ value: true }) });
      expect(snapshot2.get()).toEqual({ scroll: expect.objectContaining({ position: 100 }) });
    });
  });
});
