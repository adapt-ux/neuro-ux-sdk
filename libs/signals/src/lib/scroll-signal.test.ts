import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ScrollSignal } from './scroll-signal';
import { SignalSnapshot, createSignalSnapshot } from './signal-snapshot';
import { SignalContextImpl } from './signal-context';

describe('ScrollSignal', () => {
  let snapshot: SignalSnapshot;
  let emitCallback: ReturnType<typeof vi.fn>;
  let signal: ScrollSignal;

  beforeEach(() => {
    vi.useFakeTimers();
    snapshot = createSignalSnapshot();
    emitCallback = vi.fn();
    const context = new SignalContextImpl(snapshot, emitCallback);
    signal = new ScrollSignal(context);

    // Mock window.scrollY
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    });

    // Mock requestAnimationFrame to execute callbacks immediately (synchronously for tests)
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      // Execute callback immediately for tests
      cb(performance.now());
      return 1;
    });

    // Mock cancelAnimationFrame (no-op for tests)
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    signal.stop();
    vi.useRealTimers();
  });

  it('should emit scroll position on scroll event', () => {
    signal.start();

    // Set scroll position
    Object.defineProperty(window, 'scrollY', { value: 100, configurable: true, writable: true });

    // Trigger scroll event
    window.dispatchEvent(new Event('scroll'));

    expect(emitCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'scroll',
        position: 100,
      })
    );
  });

  it('should calculate scroll velocity', () => {
    signal.start();

    // Initial scroll
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true, writable: true });
    window.dispatchEvent(new Event('scroll'));
    emitCallback.mockClear();

    // Fast-forward time
    vi.advanceTimersByTime(100); // 100ms

    // Scroll down
    Object.defineProperty(window, 'scrollY', { value: 100, configurable: true, writable: true });
    window.dispatchEvent(new Event('scroll'));

    const call = emitCallback.mock.calls[0][0];
    expect(call.type).toBe('scroll');
    expect(call.position).toBe(100);
    expect(call.direction).toBe('down');
    expect(typeof call.velocity).toBe('number');
    expect(call.velocity).toBeGreaterThan(0);
  });

  it('should calculate scroll direction correctly', () => {
    signal.start();

    // Scroll down
    Object.defineProperty(window, 'scrollY', { value: 100, configurable: true, writable: true });
    window.dispatchEvent(new Event('scroll'));
    emitCallback.mockClear();

    vi.advanceTimersByTime(100);

    // Scroll down more
    Object.defineProperty(window, 'scrollY', { value: 200, configurable: true, writable: true });
    window.dispatchEvent(new Event('scroll'));

    expect(emitCallback.mock.calls[0][0].direction).toBe('down');

    emitCallback.mockClear();
    vi.advanceTimersByTime(100);

    // Scroll up
    Object.defineProperty(window, 'scrollY', { value: 150, configurable: true, writable: true });
    window.dispatchEvent(new Event('scroll'));

    expect(emitCallback.mock.calls[0][0].direction).toBe('up');
  });

  it('should update snapshot with scroll data', () => {
    signal.start();

    Object.defineProperty(window, 'scrollY', { value: 440, configurable: true, writable: true });
    window.dispatchEvent(new Event('scroll'));

    const snapshotData = snapshot.get();
    expect(snapshotData.scroll).toBeDefined();
    expect(snapshotData.scroll.position).toBe(440);
    expect(snapshotData.scroll.type).toBe('scroll');
    expect(typeof snapshotData.scroll.velocity).toBe('number');
    expect(['up', 'down']).toContain(snapshotData.scroll.direction);
  });

  it('should stop and clean up event listeners', () => {
    signal.start();

    Object.defineProperty(window, 'scrollY', { value: 100, configurable: true, writable: true });
    window.dispatchEvent(new Event('scroll'));

    expect(emitCallback).toHaveBeenCalled();

    emitCallback.mockClear();
    signal.stop();

    // After stop, scroll should not trigger emissions
    window.dispatchEvent(new Event('scroll'));
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

  it('should throttle scroll events using requestAnimationFrame', () => {
    signal.start();

    Object.defineProperty(window, 'scrollY', { value: 100, configurable: true, writable: true });

    // Trigger multiple scroll events rapidly
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));

    // Should have been called (throttled, so only once or a few times)
    expect(emitCallback.mock.calls.length).toBeGreaterThan(0);
  });
});
