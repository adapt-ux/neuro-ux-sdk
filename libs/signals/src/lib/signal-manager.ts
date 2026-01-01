import { Signal, SignalContext } from './types';
import { SignalSnapshot, createSignalSnapshot } from './signal-snapshot';
import { SignalContextImpl } from './signal-context';

/**
 * SignalManager manages the lifecycle of all signals and connects them to the Core Engine.
 * It instantiates signals from constructors, controls their lifecycle, and forwards
 * emitted values to the Core Engine for state updates and rule evaluation.
 */
export class SignalManager {
  private instances: Signal[] = [];
  private snapshot: SignalSnapshot;
  private contexts: SignalContext[] = [];

  constructor(
    private signalConstructors: Array<new (ctx: SignalContext) => Signal>,
    private onEmit: (value: unknown) => void
  ) {
    this.snapshot = createSignalSnapshot();
    this.initializeSignals();
  }

  /**
   * Initializes signal instances from constructors.
   * Each signal receives its own SignalContext instance for isolation.
   */
  private initializeSignals(): void {
    this.instances = [];
    this.contexts = [];

    for (const SignalConstructor of this.signalConstructors) {
      const context = new SignalContextImpl(this.snapshot, this.onEmit);
      const instance = new SignalConstructor(context);
      this.contexts.push(context);
      this.instances.push(instance);
    }
  }

  /**
   * Starts all signal instances.
   * Only runs in browser environment (checks for window).
   * Safe to call in SSR environments (no-op).
   */
  startAll(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.instances.forEach((signal) => {
      try {
        signal.start();
      } catch (error) {
        console.error('[SignalManager] Error starting signal:', error);
      }
    });
  }

  /**
   * Stops all signal instances and cleans up resources.
   * Removes event listeners, clears timers, etc.
   */
  stopAll(): void {
    this.instances.forEach((signal) => {
      try {
        signal.stop();
      } catch (error) {
        console.error('[SignalManager] Error stopping signal:', error);
      }
    });
  }

  /**
   * Returns the current snapshot of all signal values.
   * Used by Rule Processor for evaluation.
   */
  getSnapshot(): Record<string, any> {
    return this.snapshot.get();
  }

  /**
   * Clears the snapshot data.
   * Useful for reset scenarios.
   */
  clearSnapshot(): void {
    this.snapshot.clear();
  }
}
