# 📡 NeuroUX Signals — Signal Manager API Reference

The **NeuroUX Signals** package provides lightweight behavioral signal detectors that identify user activity patterns (scroll, idle, focus, etc.) for adaptive UI. The **Signal Manager** is the central module that manages signal lifecycle and connects them to the Core Engine.

This document describes the **public API** available to developers when using:

```ts
import { SignalManager, IdleSignal, ScrollSignal } from "@adapt-ux/neuro-signals";
```

---

## Overview

The Signal Manager system consists of three main components:

1. **SignalManager** — Manages signal lifecycle and connects to Core Engine
2. **SignalContext** — Provides isolated context for each signal to emit values
3. **SignalSnapshot** — Maintains current state of all signals for rule evaluation

---

## 1. SignalManager

The `SignalManager` class is responsible for:
- Instantiating signals from constructors
- Controlling signal lifecycle (`startAll()` / `stopAll()`)
- Receiving values emitted by signals
- Forwarding values to the Core Engine
- Maintaining signal snapshot for rule processor

### **Signature**

```ts
class SignalManager {
  constructor(
    signalConstructors: Array<new (ctx: SignalContext) => Signal>,
    onEmit: (value: unknown) => void
  );

  startAll(): void;
  stopAll(): void;
  getSnapshot(): Record<string, any>;
  clearSnapshot(): void;
}
```

### **Basic Example**

```ts
import { SignalManager, IdleSignal, ScrollSignal } from "@adapt-ux/neuro-signals";

// Create manager with signal constructors
const manager = new SignalManager(
  [IdleSignal, ScrollSignal],
  (value) => {
    // This callback receives all signal emissions
    console.log('Signal emitted:', value);
    // Forward to Core Engine for state updates and rule evaluation
  }
);

// Start all signals (only in browser environment)
manager.startAll();

// Get current snapshot for rule evaluation
const snapshot = manager.getSnapshot();
// { idle: { type: 'idle', value: true, ts: 1234567890 }, ... }

// Stop all signals and clean up
manager.stopAll();
```

### **Methods**

#### `startAll()`

Starts all signal instances. Only runs in browser environment (checks for `window`). Safe to call in SSR environments (no-op).

```ts
manager.startAll();
```

**Behavior:**
- Checks if `window` is defined (SSR safety)
- Calls `start()` on each signal instance
- Handles errors gracefully (logs to console, continues with other signals)

#### `stopAll()`

Stops all signal instances and cleans up resources (removes event listeners, clears timers, etc.).

```ts
manager.stopAll();
```

**Behavior:**
- Calls `stop()` on each signal instance
- Handles errors gracefully
- Safe to call multiple times

#### `getSnapshot()`

Returns the current snapshot of all signal values. Used by Rule Processor for evaluation.

```ts
const snapshot = manager.getSnapshot();
// Returns: { idle: { type: 'idle', value: true, ts: 1234567890 }, ... }
```

**Returns:** A shallow copy of the current snapshot data.

#### `clearSnapshot()`

Clears all snapshot data. Useful for reset scenarios.

```ts
manager.clearSnapshot();
```

---

## 2. SignalContext

The `SignalContext` interface provides the context for signals to emit values. Each signal receives its own isolated `SignalContext` instance.

### **Interface**

```ts
interface SignalContext {
  emit(value: unknown): void;
}
```

### **Implementation**

The `SignalContextImpl` class implements this interface:

```ts
class SignalContextImpl implements SignalContext {
  constructor(
    snapshot: SignalSnapshot,
    onEmit: (value: unknown) => void
  );

  emit(value: unknown): void;
}
```

**Behavior:**
- Updates the shared snapshot when value has a `type` property
- Forwards all emissions to the Core Engine callback
- Provides isolation between signals

### **Usage in Custom Signals**

When creating custom signals, you receive a `SignalContext` in the constructor:

```ts
import { BaseSignal } from "@adapt-ux/neuro-signals";
import type { SignalContext } from "@adapt-ux/neuro-signals";

class CustomSignal extends BaseSignal {
  start() {
    // Emit values through the context
    this.ctx.emit({ type: 'custom', data: 'value' });
  }

  stop() {
    // Cleanup
  }
}
```

---

## 3. SignalSnapshot

The `SignalSnapshot` class manages the current state of all signals. Each signal update stores its value with a timestamp.

### **Class**

```ts
class SignalSnapshot {
  update(value: { type: string; [key: string]: any }): void;
  get(): Record<string, any>;
  clear(): void;
}
```

### **Factory Function**

```ts
function createSignalSnapshot(): SignalSnapshot;
```

### **Example**

```ts
import { createSignalSnapshot } from "@adapt-ux/neuro-signals";

const snapshot = createSignalSnapshot();

snapshot.update({ type: 'idle', value: true });
snapshot.update({ type: 'scroll', position: 440 });

const data = snapshot.get();
// {
//   idle: { type: 'idle', value: true, ts: 1234567890 },
//   scroll: { type: 'scroll', position: 440, ts: 1234567891 }
// }
```

### **Snapshot Structure**

Each signal value in the snapshot has the following structure:

```ts
{
  [signalType]: {
    type: string;        // Signal type identifier
    ...signalData;       // Additional signal-specific data
    ts: number;          // Timestamp of last update
  }
}
```

**Example:**
```ts
{
  idle: {
    type: 'idle',
    value: true,
    ts: 1234567890
  },
  scroll: {
    type: 'scroll',
    position: 440,
    ts: 1234567891
  }
}
```

---

## 4. Built-in Signals

### **IdleSignal**

Detects user idle state by emitting periodic updates.

```ts
import { IdleSignal } from "@adapt-ux/neuro-signals";

// Emits every 5 seconds: { type: 'idle', ts: number }
```

### **ScrollSignal**

Detects scroll position changes.

```ts
import { ScrollSignal } from "@adapt-ux/neuro-signals";

// Emits on scroll: { type: 'scroll', position: number }
```

---

## 5. Creating Custom Signals

To create a custom signal, extend `BaseSignal`:

```ts
import { BaseSignal } from "@adapt-ux/neuro-signals";
import type { SignalContext } from "@adapt-ux/neuro-signals";

class FocusSignal extends BaseSignal {
  private handler?: () => void;

  start() {
    this.handler = () => {
      this.ctx.emit({
        type: 'focus',
        active: document.hasFocus(),
      });
    };

    window.addEventListener('focus', this.handler);
    window.addEventListener('blur', this.handler);
    this.handler(); // Initial emission
  }

  stop() {
    if (this.handler) {
      window.removeEventListener('focus', this.handler);
      window.removeEventListener('blur', this.handler);
    }
  }
}
```

**Requirements:**
- Extend `BaseSignal`
- Implement `start()` method
- Implement `stop()` method
- Use `this.ctx.emit()` to emit values
- Emit values with a `type` property for snapshot tracking

---

## 6. SSR Safety

The Signal Manager is SSR-safe:

- `startAll()` checks for `window` before starting signals
- No errors thrown in SSR environments
- Signals simply don't start in SSR (graceful no-op)

```ts
// Safe to call in SSR
manager.startAll(); // No-op if window is undefined
```

---

## 7. Integration with Core Engine

The Signal Manager is designed to integrate with the NeuroUX Core Engine:

```ts
import { createNeuroUX } from "@adapt-ux/core";
import { SignalManager, IdleSignal, ScrollSignal } from "@adapt-ux/neuro-signals";

const engine = createNeuroUX({
  profile: "adhd",
  signals: ["idle", "scroll"],
});

// Create signal manager with Core Engine callback
const signalManager = new SignalManager(
  [IdleSignal, ScrollSignal],
  (value) => {
    // Forward to Core Engine for:
    // - Internal state updates
    // - Rule processor evaluation
    // - Future logs
    engine.handleSignal(value);
  }
);

signalManager.startAll();

// Rule processor can access snapshot
const snapshot = signalManager.getSnapshot();
engine.evaluateRules(snapshot);
```

---

## 8. Error Handling

The Signal Manager handles errors gracefully:

- Errors during `startAll()` are caught and logged (other signals continue)
- Errors during `stopAll()` are caught and logged
- Invalid signal values are ignored (no snapshot update, but callback still called)

---

## 9. Best Practices

1. **Always call `stopAll()`** when cleaning up to prevent memory leaks
2. **Use `type` property** in emitted values for snapshot tracking
3. **Isolate signal logic** — each signal should be independent
4. **Handle cleanup** in `stop()` method (remove listeners, clear timers)
5. **Test SSR compatibility** — ensure signals don't break in SSR environments

---

## 10. Type Definitions

```ts
interface SignalContext {
  emit(value: unknown): void;
}

interface Signal {
  start(): void;
  stop(): void;
}

type SignalConstructor = new (ctx: SignalContext) => Signal;
```

---

## License

MIT
