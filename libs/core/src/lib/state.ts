export type Subscriber<T> = (state: T) => void;

export function createStateContainer<T extends object>(initial: T) {
  let state: T = { ...initial };
  const subscribers = new Set<Subscriber<T>>();

  function getState(): T {
    return state;
  }

  function setState(patch: Partial<T>) {
    state = { ...state, ...patch };
    for (const fn of subscribers) fn(state);
  }

  function subscribe(fn: Subscriber<T>) {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  }

  return {
    getState,
    setState,
    subscribe,
  };
}
