import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SignalManager } from './signal-manager';
import { Signal, SignalContext } from './types';
import { BaseSignal } from './base-signal';

// Mock signal classes for testing
class TestSignal1 extends BaseSignal {
  private started = false;
  private stopped = false;

  start() {
    this.started = true;
    // Simulate emitting a value
    setTimeout(() => {
      this.ctx.emit({ type: 'test1', value: 'signal1' });
    }, 10);
  }

  stop() {
    this.stopped = true;
  }

  getStarted() {
    return this.started;
  }

  getStopped() {
    return this.stopped;
  }
}

class TestSignal2 extends BaseSignal {
  private started = false;

  start() {
    this.started = true;
    setTimeout(() => {
      this.ctx.emit({ type: 'test2', value: 'signal2' });
    }, 10);
  }

  stop() {
    // Cleanup logic
  }

  getStarted() {
    return this.started;
  }
}

class ErrorSignal extends BaseSignal {
  start() {
    throw new Error('Signal start error');
  }

  stop() {
    throw new Error('Signal stop error');
  }
}

describe('SignalManager', () => {
  let onEmit: ReturnType<typeof vi.fn>;
  let manager: SignalManager;

  beforeEach(() => {
    onEmit = vi.fn();
    // Mock window for browser environment
    (global as any).window = {};
  });

  afterEach(() => {
    if (manager) {
      manager.stopAll();
    }
    delete (global as any).window;
  });

  describe('constructor', () => {
    it('should create manager with empty signal constructors', () => {
      manager = new SignalManager([], onEmit);
      expect(manager.getSnapshot()).toEqual({});
    });

    it('should instantiate signals from constructors', () => {
      manager = new SignalManager([TestSignal1, TestSignal2], onEmit);
      const snapshot = manager.getSnapshot();
      expect(snapshot).toEqual({});
    });
  });

  describe('startAll', () => {
    it('should start all signal instances', async () => {
      manager = new SignalManager([TestSignal1, TestSignal2], onEmit);
      manager.startAll();

      // Wait for async emissions
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(onEmit).toHaveBeenCalled();
    });

    it('should not start signals in SSR environment', () => {
      delete (global as any).window;
      manager = new SignalManager([TestSignal1], onEmit);

      expect(() => manager.startAll()).not.toThrow();
      // Signals should not emit in SSR
      expect(onEmit).not.toHaveBeenCalled();
    });

    it('should handle errors when starting signals gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      manager = new SignalManager([ErrorSignal], onEmit);

      expect(() => manager.startAll()).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should start signals that do not throw errors even if one fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      manager = new SignalManager([ErrorSignal, TestSignal1], onEmit);
      manager.startAll();

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(onEmit).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('stopAll', () => {
    it('should stop all signal instances', () => {
      manager = new SignalManager([TestSignal1, TestSignal2], onEmit);
      manager.startAll();
      manager.stopAll();

      // Should not throw
      expect(() => manager.stopAll()).not.toThrow();
    });

    it('should handle errors when stopping signals gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      manager = new SignalManager([ErrorSignal], onEmit);
      manager.startAll();

      expect(() => manager.stopAll()).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should allow calling stopAll multiple times', () => {
      manager = new SignalManager([TestSignal1], onEmit);
      manager.startAll();

      manager.stopAll();
      manager.stopAll();
      manager.stopAll();

      expect(() => manager.stopAll()).not.toThrow();
    });
  });

  describe('getSnapshot', () => {
    it('should return empty snapshot initially', () => {
      manager = new SignalManager([], onEmit);
      expect(manager.getSnapshot()).toEqual({});
    });

    it('should return snapshot with signal values after emissions', async () => {
      manager = new SignalManager([TestSignal1, TestSignal2], onEmit);
      manager.startAll();

      await new Promise((resolve) => setTimeout(resolve, 50));

      const snapshot = manager.getSnapshot();
      expect(snapshot.test1).toBeDefined();
      expect(snapshot.test2).toBeDefined();
    });

    it('should return updated snapshot after multiple emissions', async () => {
      class MultiEmitSignal extends BaseSignal {
        start() {
          this.ctx.emit({ type: 'multi', count: 1 });
          setTimeout(() => {
            this.ctx.emit({ type: 'multi', count: 2 });
          }, 10);
        }

        stop() {}
      }

      manager = new SignalManager([MultiEmitSignal], onEmit);
      manager.startAll();

      await new Promise((resolve) => setTimeout(resolve, 50));

      const snapshot = manager.getSnapshot();
      expect(snapshot.multi.count).toBe(2);
    });

    it('should return a copy of snapshot, not the original', () => {
      manager = new SignalManager([], onEmit);
      const snapshot1 = manager.getSnapshot();
      const snapshot2 = manager.getSnapshot();

      expect(snapshot1).not.toBe(snapshot2);
      expect(snapshot1).toEqual(snapshot2);
    });
  });

  describe('clearSnapshot', () => {
    it('should clear snapshot data', async () => {
      manager = new SignalManager([TestSignal1], onEmit);
      manager.startAll();

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(manager.getSnapshot()).not.toEqual({});
      manager.clearSnapshot();
      expect(manager.getSnapshot()).toEqual({});
    });
  });

  describe('integration', () => {
    it('should handle full lifecycle: start -> emit -> stop', async () => {
      manager = new SignalManager([TestSignal1, TestSignal2], onEmit);

      // Start
      manager.startAll();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Verify emissions
      expect(onEmit).toHaveBeenCalled();
      const snapshot = manager.getSnapshot();
      expect(snapshot.test1 || snapshot.test2).toBeDefined();

      // Stop
      manager.stopAll();

      // Should still have snapshot data
      expect(manager.getSnapshot()).not.toEqual({});
    });

    it('should isolate signals - each gets its own context', async () => {
      const contexts: SignalContext[] = [];
      class ContextTrackingSignal extends BaseSignal {
        constructor(ctx: SignalContext) {
          super(ctx);
          contexts.push(ctx);
        }

        start() {
          this.ctx.emit({ type: 'tracked', id: contexts.length });
        }

        stop() {}
      }

      manager = new SignalManager([ContextTrackingSignal, ContextTrackingSignal], onEmit);
      manager.startAll();

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(contexts).toHaveLength(2);
      expect(contexts[0]).not.toBe(contexts[1]);
    });

    it('should forward all emissions to Core Engine callback', async () => {
      manager = new SignalManager([TestSignal1, TestSignal2], onEmit);
      manager.startAll();

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(onEmit).toHaveBeenCalled();
      const calls = onEmit.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
    });
  });
});
