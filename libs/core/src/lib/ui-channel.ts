export type UiUpdateHandler = (updates: Record<string, any>) => void;

export interface UiChannel {
  set(key: string, value: any): void;
  get(key: string): any;
  getAll(): Record<string, any>;
  onUpdate(handler: UiUpdateHandler): () => void;
}

/**
 * Creates a UI channel for managing UI adaptation outputs.
 * The channel maintains internal state and emits events when updates occur.
 */
export function createUiChannel(
  onEmit?: (event: string, payload: any) => void
): UiChannel {
  const state: Record<string, any> = {};
  const updateHandlers = new Set<UiUpdateHandler>();

  function set(key: string, value: any) {
    // Only update if value actually changed
    if (state[key] === value) {
      return;
    }
    
    state[key] = value;
    const updates = { [key]: value };
    
    // Notify all handlers
    updateHandlers.forEach((handler) => handler(updates));
    
    // Emit event if event bus is provided
    if (onEmit) {
      onEmit('ui:update', updates);
    }
  }

  function get(key: string): any {
    return state[key];
  }

  function getAll(): Record<string, any> {
    return { ...state };
  }

  function onUpdate(handler: UiUpdateHandler): () => void {
    updateHandlers.add(handler);
    return () => updateHandlers.delete(handler);
  }

  return {
    set,
    get,
    getAll,
    onUpdate,
  };
}
