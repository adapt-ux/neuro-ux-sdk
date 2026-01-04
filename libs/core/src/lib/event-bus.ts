/**
 * @internal This type is internal and not part of the public API.
 */
export type EventCallback = (...args: any[]) => void;

/**
 * Creates an event bus for internal use.
 * 
 * @internal This function is internal and not part of the public API.
 */
export function createEventBus() {
  const listeners = new Map<string, Set<EventCallback>>();

  function on(event: string, cb: EventCallback) {
    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }
    listeners.get(event)!.add(cb);

    return () => off(event, cb);
  }

  function off(event: string, cb: EventCallback) {
    listeners.get(event)?.delete(cb);
  }

  function emit(event: string, ...args: any[]) {
    listeners.get(event)?.forEach((cb) => cb(...args));
  }

  return { on, off, emit };
}
