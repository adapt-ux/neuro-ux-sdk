import { createEventBus } from '../event-bus';

export type SignalValue = number | boolean | string;

export interface SignalsRegistry {
  register: (name: string, initialValue: SignalValue) => void;
  update: (name: string, value: SignalValue) => void;
  get: (name: string) => SignalValue | undefined;
  getAll: () => Record<string, SignalValue>;
  onUpdate: (cb: (name: string, value: SignalValue) => void) => () => void;
  onRegister: (cb: (data: { name: string; value: SignalValue }) => void) => () => void;
  onError: (cb: (error: { type: string; name: string; attemptedValue?: unknown }) => void) => () => void;
}

/**
 * Validates and normalizes a signal value to ensure it's a valid type.
 * Only number, boolean, and string are allowed.
 */
function validateAndNormalize(value: unknown): SignalValue | null {
  if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
    return value;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return value;
  }
  return null;
}

export function createSignalsRegistry(): SignalsRegistry {
  const signals: Record<string, SignalValue> = {};
  const events = createEventBus();

  function register(name: string, initialValue: unknown) {
    // Validate signal name
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      events.emit('signal:error', {
        type: 'invalid-name',
        name: String(name),
        attemptedValue: initialValue,
      });
      return;
    }

    // Check for duplicate
    if (name in signals) {
      events.emit('signal:error', {
        type: 'duplicate',
        name,
        attemptedValue: initialValue,
      });
      return;
    }

    // Validate and normalize value
    const normalized = validateAndNormalize(initialValue);
    if (normalized === null) {
      events.emit('signal:error', {
        type: 'invalid-type',
        name,
        attemptedValue: initialValue,
      });
      return;
    }

    signals[name] = normalized;

    events.emit('signal:register', {
      name,
      value: normalized,
    });
  }

  function update(name: string, value: unknown) {
    // Validate signal name
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      events.emit('signal:error', {
        type: 'invalid-name',
        name: String(name),
        attemptedValue: value,
      });
      return;
    }

    // Check if signal exists
    if (!(name in signals)) {
      events.emit('signal:error', {
        type: 'unknown',
        name,
        attemptedValue: value,
      });
      return;
    }

    // Validate and normalize value
    const normalized = validateAndNormalize(value);
    if (normalized === null) {
      events.emit('signal:error', {
        type: 'invalid-type',
        name,
        attemptedValue: value,
      });
      return;
    }

    signals[name] = normalized;

    events.emit('signal:update', {
      name,
      value: normalized,
    });
  }

  function get(name: string): SignalValue | undefined {
    return signals[name];
  }

  function getAll(): Record<string, SignalValue> {
    return { ...signals };
  }

  function onUpdate(cb: (name: string, value: SignalValue) => void) {
    return events.on('signal:update', ({ name, value }) => cb(name, value));
  }

  function onRegister(cb: (data: { name: string; value: SignalValue }) => void) {
    return events.on('signal:register', cb);
  }

  function onError(cb: (error: { type: string; name: string; attemptedValue?: unknown }) => void) {
    return events.on('signal:error', cb);
  }

  return {
    register,
    update,
    get,
    getAll,
    onUpdate,
    onRegister,
    onError,
  };
}

/**
 * Alias for createSignalsRegistry to match the issue specification.
 * @deprecated Use createSignalsRegistry instead. This alias will be removed in a future version.
 */
export function createSignalsEngine(): SignalsRegistry {
  return createSignalsRegistry();
}
