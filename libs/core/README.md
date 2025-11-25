# # 📘 NeuroUX Core — Official API Reference

The **NeuroUX Core Engine** is the adaptive runtime that powers all NeuroUX features.
It provides:

* A reactive internal state container
* A minimal event bus
* A normalized configuration system
* A rule processing pipeline (MVP placeholder)
* A unified public API to interact with all internal systems

This document describes the **public API** available to developers when using:

```ts
import { createNeuroUX } from "@adapt-ux/core";
```

---

# ## 1. `createNeuroUX(config?)`

### **Signature**

```ts
createNeuroUX(config?: NeuroUXConfig): NeuroUXEngine
```

Initializes the NeuroUX engine with the provided configuration.

### **Basic Example**

```ts
import { createNeuroUX } from "@adapt-ux/core";

const neuro = createNeuroUX({
  profile: "adhd",
  signals: ["focus"],
});
```

---

# ## 2. Configuration System

### ### `NeuroUXConfig` (input)

```ts
interface NeuroUXConfig {
  profile?: string;
  signals?: string[];
  rules?: any[];
}
```

### ### Default Behavior

If the developer does not provide configuration, defaults are:

```ts
{
  profile: "default",
  signals: [],
  rules: []
}
```

### ### Normalized Config

Internally converted into:

```ts
interface NormalizedConfig {
  profile: string;
  signals: string[];
  rules: any[];
}
```

Retrieve via:

```ts
engine.config.profile;
```

---

# ## 3. State API

The NeuroUX state container is reactive but extremely lightweight — no proxies, no Immer, no dependencies.

### ### `getState()`

Returns the full current engine state.

```ts
const state = neuro.getState();
```

### ### `setState(partialState)`

Updates the state by shallow-merging a partial object.

```ts
neuro.setState({ signals: { focus: 0.7 } });
```

Triggers:

* Subscribers via `subscribe()`
* Rule evaluation (`processor.evaluate`)
* UI output event (`ui:update`)

### ### `subscribe(callback)`

Subscribes to state updates.

```ts
const unsubscribe = neuro.subscribe((newState) => {
  console.log("State changed:", newState);
});
```

Returns an unsubscribe function.

---

# ## 4. Event Bus API

NeuroUX includes a small custom event bus for internal + external events.

### ### `on(event, handler)`

Registers an event listener.

```ts
const stop = neuro.on("ui:update", (ui) => {
  console.log("UI adaptation result:", ui);
});
```

### ### `off(event, handler)`

Unregisters a listener.

```ts
neuro.off("ui:update", handler);
```

### ### `emit(event, ...args)`

Emits an event manually.

```ts
neuro.emit("custom:event", { foo: true });
```

---

# ## 5. Rule Processor API (MVP)

The rule processor exists, but rules do nothing yet.

### Available now:

* Instantiation: `createRuleProcessor(config)`
* Trigger: Auto-executed on state updates
* Output: Always `{}` in MVP
* Emission: `ui:update` event

### ### Example: listening for rule output

```ts
neuro.on("ui:update", (result) => {
  console.log("Adaptation result:", result);
});
```

This will receive `{}` until rule syntax v1 is implemented.

---

# ## 6. Lifecycle API

### ### `destroy()`

Tears down the engine instance and emits a destroy event.

```ts
neuro.destroy();
```

Use this when:

* The user logs out
* Your SPA navigates to a non-NeuroUX area
* You need to recreate the engine with new config

---

# ## 7. Public Engine Structure

Full return contract:

```ts
interface NeuroUXEngine {
  config: NormalizedConfig;

  getState: () => any;
  setState: (value: any) => void;
  subscribe: (fn: (s: any) => void) => () => void;

  on: (event: string, fn: (...args: any[]) => void) => () => void;
  off: (event: string, fn: (...args: any[]) => void) => void;
  emit: (event: string, ...args: any[]) => void;

  destroy: () => void;
}
```

---

# ## 8. Engine State Shape (MVP)

The internal state begins as:

```ts
{
  profile: string,
  signals: Record<string, any>,
  ui: Record<string, any>,
}
```

Later stages will add:

* user traits
* environment context
* adaptive heuristics
* semantic UI layers

---

# ## 9. Example: Full Usage

```ts
import { createNeuroUX } from "@adapt-ux/core";

const neuro = createNeuroUX({
  profile: "adhd",
  signals: ["focus"],
});

// subscribe to engine updates
neuro.subscribe((state) => {
  console.log("STATE:", state);
});

// listen to ui adaptation results
neuro.on("ui:update", (ui) => {
  console.log("UI ADAPTATION:", ui);
});

// update state
neuro.setState({
  signals: {
    focus: 0.6,
  },
});

// destroy if needed
// neuro.destroy();
```

---

# ## 10. Stability Index (SemVer Policy)

| API Area         | Status                          |
| ---------------- | ------------------------------- |
| State API        | **Stable**                      |
| Event Bus        | **Stable**                      |
| Config Loader    | **Stable**                      |
| Rule API         | 🚧 *Experimental (placeholder)* |
| Engine Lifecycle | **Stable**                      |

---

# ## 11. Notes for Wrapper Developers (React/Vue/Angular/Next/Svelte)

All framework wrappers should:

* Create one shared instance
* Wrap `subscribe()` inside their reactivity system
* Expose `useNeuroUX()` equivalents
* Translate `ui:update` events into framework UI state

Documentation for wrapper authors will come separately.
