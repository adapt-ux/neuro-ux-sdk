import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IdleSignal } from './idle-signal';
import { SignalSnapshot, createSignalSnapshot } from './signal-snapshot';
import { SignalContextImpl } from './signal-context';

describe('IdleSignal', () => {
  let snapshot: SignalSnapshot;
  let emitCallback: ReturnType<typeof vi.fn>;
  let signal: IdleSignal;

  beforeEach(() => {
    vi.useFakeTimers();
    snapshot = createSignalSnapshot();
    emitCallback = vi.fn();
    const context = new SignalContextImpl(snapshot, emitCallback);
    signal = new IdleSignal(context);
  });

  afterEach(() => {
    signal.stop();
    vi.useRealTimers();
  });

  it('should emit idle: true after timeout when no activity', () => {
    signal.start();

    // Fast-forward past idle timeout (default 3000ms)
    vi.advanceTimersByTime(3000);

    expect(emitCallback).toHaveBeenCalledWith({
      type: 'idle',
      value: true,
    });
  });

  it('should emit idle: false when activity is detected', () => {
    signal.start();

    // Fast-forward past idle timeout
    vi.advanceTimersByTime(3000);

    // Should have emitted idle: true
    expect(emitCallback).toHaveBeenCalledWith({
      type: 'idle',
      value: true,
    });

    emitCallback.mockClear();

    // Simulate user activity (mousemove)
    window.dispatchEvent(new Event('mousemove'));

    expect(emitCallback).toHaveBeenCalledWith({
      type: 'idle',
      value: false,
    });
  });

  it('should reset idle timer on activity', () => {
    signal.start();

    // Fast-forward 2000ms (not enough to trigger idle)
    vi.advanceTimersByTime(2000);
    expect(emitCallback).not.toHaveBeenCalled();

    // Simulate activity - should reset timer
    window.dispatchEvent(new Event('mousemove'));
    emitCallback.mockClear();

    // Fast-forward 2000ms again (should not trigger idle yet)
    vi.advanceTimersByTime(2000);
    expect(emitCallback).not.toHaveBeenCalled();

    // Fast-forward another 1000ms to reach 3000ms total since last activity
    vi.advanceTimersByTime(1000);
    expect(emitCallback).toHaveBeenCalledWith({
      type: 'idle',
      value: true,
    });
  });

  it('should handle multiple activity events', () => {
    signal.start();

    // Fast-forward 2000ms
    vi.advanceTimersByTime(2000);

    // Trigger multiple events
    window.dispatchEvent(new Event('mousemove'));
    window.dispatchEvent(new Event('keypress'));
    window.dispatchEvent(new Event('click'));

    emitCallback.mockClear();

    // Should reset timer, so 2000ms more should not trigger idle
    vi.advanceTimersByTime(2000);
    expect(emitCallback).not.toHaveBeenCalled();
  });

  it('should stop and clean up event listeners', () => {
    signal.start();

    // Fast-forward past idle timeout
    vi.advanceTimersByTime(3000);
    expect(emitCallback).toHaveBeenCalled();

    emitCallback.mockClear();
    signal.stop();

    // After stop, activity should not trigger emissions
    window.dispatchEvent(new Event('mousemove'));
    expect(emitCallback).not.toHaveBeenCalled();

    // Timer should be cleared
    vi.advanceTimersByTime(5000);
    expect(emitCallback).not.toHaveBeenCalled();
  });

  it('should be SSR-safe (no-op when window is undefined)', () => {
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;

    expect(() => {
      signal.start();
      signal.stop();
    }).not.toThrow();

    global.window = originalWindow;
  });

  it('should update snapshot with idle value', () => {
    signal.start();

    // Fast-forward past idle timeout
    vi.advanceTimersByTime(3000);

    const snapshotData = snapshot.get();
    expect(snapshotData.idle).toBeDefined();
    expect(snapshotData.idle.value).toBe(true);
    expect(snapshotData.idle.type).toBe('idle');

    // Trigger activity
    window.dispatchEvent(new Event('mousemove'));

    const updatedData = snapshot.get();
    expect(updatedData.idle.value).toBe(false);
  });
});
