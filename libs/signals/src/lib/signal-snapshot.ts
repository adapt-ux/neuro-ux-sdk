/**
 * SignalSnapshot manages the current state of all signals.
 * Each signal update stores its value with a timestamp.
 */
export class SignalSnapshot {
  private data: Record<string, any> = {};

  /**
   * Updates the snapshot with a new signal value.
   * The value must have a 'type' property to identify the signal.
   */
  update(value: { type: string; [key: string]: any }) {
    if (!value || typeof value !== 'object' || !value.type) {
      return;
    }

    this.data[value.type] = {
      ...value,
      ts: Date.now(),
    };
  }

  /**
   * Returns a shallow copy of the current snapshot.
   * Used by Rule Processor for evaluation.
   */
  get(): Record<string, any> {
    return { ...this.data };
  }

  /**
   * Clears all snapshot data.
   * Useful for cleanup or reset scenarios.
   */
  clear(): void {
    this.data = {};
  }
}

/**
 * Creates a new SignalSnapshot instance.
 */
export function createSignalSnapshot(): SignalSnapshot {
  return new SignalSnapshot();
}
