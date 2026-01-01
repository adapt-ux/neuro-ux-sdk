import { SignalContext } from './types';
import { SignalSnapshot } from './signal-snapshot';

/**
 * SignalContextImpl provides the context for signals to emit values.
 * It updates the snapshot and forwards events to the Core Engine.
 */
export class SignalContextImpl implements SignalContext {
  constructor(
    private snapshot: SignalSnapshot,
    private onEmit: (value: unknown) => void
  ) {}

  /**
   * Emits a signal value, updating the snapshot and notifying the Core Engine.
   */
  emit(value: unknown): void {
    if (value && typeof value === 'object' && 'type' in value) {
      this.snapshot.update(value as { type: string; [key: string]: any });
    }
    this.onEmit(value);
  }
}
