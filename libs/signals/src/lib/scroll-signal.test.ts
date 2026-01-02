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
  });

  afterEach(() => {
    signal.stop();
    vi.useRealTimers();
  });

  it('should emit scroll position on scroll event', () => {
    signal.start();

    // Set scroll position
    Object.defineProperty(window, 'scrollY', { value: 100, configurable: true });

    // Mock requestAnimationFrame
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });

    // Trigger scroll event
    window.dispatchEvent(new Event('scroll'));

    expect(emitCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'scroll',
        position: 100,
      })
    );

    rafSpy.mockRestore();
  });

  it('should calculate scroll velocity', () => {
    signal.start();

    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });

    // Initial scroll
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
    window.dispatchEvent(new Event('scroll'));
    emitCallback.mockClear();

    // Fast-forward time
    vi.advanceTimersByTime(100); // 100ms

    // Scroll down
    Object.defineProperty(window, 'scrollY', { value: 100, configurable: true });
    window.dispatchEvent(new Event('scroll'));

    const call = emitCallback.mock.calls[0][0];
    expect(call.type).toBe('scroll');
    expect(call.position).toBe(100);
    expect(call.direction).toBe('down');
    expect(typeof call.velocity).toBe('number');
    expect(call.velocity).toBeGreaterThan(0);

    rafSpy.mockRestore();
  });

  it('should calculate scroll direction correctly', () => {
    signal.start();

    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });

    // Scroll down
    Object.defineProperty(window, 'scrollY', { value: 100, configurable: true });
    window.dispatchEvent(new Event('scroll'));
    emitCallback.mockClear();

    vi.advanceTimersByTime(100);

    // Scroll down more
    Object.defineProperty(window, 'scrollY', { value: 200, configurable: true });
    window.dispatchEvent(new Event('scroll'));

    expect(emitCallback.mock.calls[0][0].direction).toBe('down');

    emitCallback.mockClear();
    vi.advanceTimersByTime(100);

    // Scroll up
    Object.defineProperty(window, 'scrollY', { value: 150, configurable: true });
    window.dispatchEvent(new Event('scroll'));

    expect(emitCallback.mock.calls[0][0].direction).toBe('up');

    rafSpy.mockRestore();
  });

  it('should update snapshot with scroll data', () => {
    signal.start();

    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });

    Object.defineProperty(window, 'scrollY', { value: 440, configurable: true });
    window.dispatchEvent(new Event('scroll'));

    const snapshotData = snapshot.get();
    expect(snapshotData.scroll).toBeDefined();
    expect(snapshotData.scroll.position).toBe(440);
    expect(snapshotData.scroll.type).toBe('scroll');
    expect(typeof snapshotData.scroll.velocity).toBe('number');
    expect(['up', 'down']).toContain(snapshotData.scroll.direction);

    rafSpy.mockRestore();
  });

  it('should stop and clean up event listeners', () => {
    signal.start();

    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });

    Object.defineProperty(window, 'scrollY', { value: 100, configurable: true });
    window.dispatchEvent(new Event('scroll'));

    expect(emitCallback).toHaveBeenCalled();

    emitCallback.mockClear();
    signal.stop();

    // After stop, scroll should not trigger emissions
    window.dispatchEvent(new Event('scroll'));
    expect(emitCallback).not.toHaveBeenCalled();

    rafSpy.mockRestore();
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

    let rafCallbacks: Array<() => void> = [];
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length - 1;
    });

    Object.defineProperty(window, 'scrollY', { value: 100, configurable: true });

    // Trigger multiple scroll events rapidly
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));

    // Should have scheduled RAF calls
    expect(rafCallbacks.length).toBeGreaterThan(0);

    // Execute the last RAF callback (others should have been cancelled)
    if (rafCallbacks.length > 0) {
      rafCallbacks[rafCallbacks.length - 1]();
    }

    // Should have been called
    expect(emitCallback.mock.calls.length).toBeGreaterThan(0);

    rafSpy.mockRestore();
  });
});
