# NeuroUX SDK — Public API Surface (v0.1)

This document provides a comprehensive inventory of all public APIs exported by NeuroUX SDK packages for v0.1.

**Status Legend:**
- ✅ **stable** — Safe to use, will be maintained in v0.1+
- ⚠️ **experimental** — Available but may change in future versions
- 🔒 **internal** — Not intended for external use, may change without notice

---

## 📦 Package: `@adapt-ux/neuro-ux-sdk-core`

### Main Entry Point: `createNeuroUX`

**Status:** ✅ stable

```typescript
function createNeuroUX(userConfig?: NeuroUXConfig): NeuroUXInstance
```

Returns the main NeuroUX instance with the following public API:

#### Instance Methods

| Method | Status | Description |
|--------|--------|-------------|
| `getConfig()` | ✅ stable | Get normalized configuration |
| `getState()` | ✅ stable | Get current adaptive state |
| `setState(patch)` | ✅ stable | Update state (advanced use) |
| `subscribe(fn)` | ✅ stable | Subscribe to state changes |
| `on(event, handler)` | ✅ stable | Subscribe to events |
| `off(event, handler)` | ✅ stable | Unsubscribe from events |
| `emit(event, ...args)` | ✅ stable | Emit custom events |
| `destroy()` | ✅ stable | Cleanup and teardown |

#### Instance Properties

| Property | Status | Type | Description |
|----------|--------|------|-------------|
| `config` | ✅ stable | `NormalizedConfig` | Normalized configuration |
| `signals` | ✅ stable | `SignalsRegistry` | Signal registration and management |
| `ui` | ✅ stable | `UiChannel` | UI adaptation channel |
| `styling` | ✅ stable | `StylingEngine` | Styling engine instance |
| `debug` | ⚠️ experimental | `DebugAPI` | Debug API (only if debug enabled) |

### Type Exports

| Export | Status | Description |
|--------|--------|-------------|
| `NeuroUXConfig` | ✅ stable | Configuration interface |
| `NormalizedConfig` | 🔒 internal | Normalized config (internal structure) |

### Event Bus Exports

| Export | Status | Description |
|--------|--------|-------------|
| `createEventBus()` | 🔒 internal | Internal event bus factory |
| `EventCallback` | 🔒 internal | Internal event callback type |
| `EventBus` (class) | ✅ stable | EventBus class for custom event handling |
| `EventHandler` | ✅ stable | Event handler type |

### State Management

| Export | Status | Description |
|--------|--------|-------------|
| `createStateContainer<T>()` | 🔒 internal | Internal state container factory |
| `Subscriber<T>` | 🔒 internal | Internal subscriber type |

### Signals (Core Registry)

| Export | Status | Description |
|--------|--------|-------------|
| `createSignalsRegistry()` | ✅ stable | Create signals registry |
| `createSignalsEngine()` | ✅ stable | Alias for `createSignalsRegistry()` |
| `SignalsRegistry` | ✅ stable | Signals registry interface |
| `SignalName` | ✅ stable | Signal name type |
| `SignalValue` | ✅ stable | Signal value type |
| `SignalError` | ✅ stable | Signal error interface |

### UI Channel

| Export | Status | Description |
|--------|--------|-------------|
| `createUiChannel()` | ✅ stable | Create UI adaptation channel |
| `UiChannel` | ✅ stable | UI channel interface |
| `UiUpdateHandler` | ✅ stable | UI update handler type |

### Rules System

| Export | Status | Description |
|--------|--------|-------------|
| `createRuleProcessor()` | ✅ stable | Create rule processor |
| `RuleProcessor` | ✅ stable | Rule processor interface |
| `Rule` | ✅ stable | Rule type definition |
| `RuleCondition` | ✅ stable | Rule condition type |
| `RuleApply` | ✅ stable | Rule application type |
| `RuleEvaluationState` | ✅ stable | Rule evaluation state |
| `AdaptationResult` | ✅ stable | Adaptation result type |
| `evaluateRule()` | 🔒 internal | Internal rule evaluator |
| `evaluateRuleCondition()` | 🔒 internal | Internal condition evaluator |

### Heuristics Engine

| Export | Status | Description |
|--------|--------|-------------|
| `createHeuristicsEngine()` | ✅ stable | Create heuristics engine |
| `HeuristicsEngine` | ✅ stable | Heuristics engine interface |
| `Heuristic` | ✅ stable | Heuristic definition |
| `HeuristicFunction` | ✅ stable | Heuristic function type |
| `HeuristicsState` | ✅ stable | Heuristics state interface |
| `HeuristicPrevious` | 🔒 internal | Internal previous state type |

### Debug API

| Export | Status | Description |
|--------|--------|-------------|
| `createDebugAPI()` | 🔒 internal | Internal debug API factory |
| `createDebugStore()` | 🔒 internal | Internal debug store factory |
| `DebugAPI` | ⚠️ experimental | Debug API interface (experimental) |
| `DebugStore` | 🔒 internal | Internal debug store |
| `DebugSignalEntry` | 🔒 internal | Internal debug entry type |
| `DebugHeuristicEntry` | 🔒 internal | Internal debug entry type |
| `DebugRuleEntry` | 🔒 internal | Internal debug entry type |
| `DebugUIEntry` | 🔒 internal | Internal debug entry type |
| `DebugStoreData` | 🔒 internal | Internal debug store data |
| `DecisionExplanation` | 🔒 internal | Internal decision explanation |

### Configuration

| Export | Status | Description |
|--------|--------|-------------|
| `normalizeConfig()` | 🔒 internal | Internal config normalizer |
| `loadConfig()` | 🔒 internal | Internal config loader |
| `defaultConfig` | 🔒 internal | Internal default config |
| `SignalConstructor` | 🔒 internal | Internal signal constructor type |
| `StylingPreset` | 🔒 internal | Internal styling preset type |

### Additional Types

| Export | Status | Description |
|--------|--------|-------------|
| `NeuroUXOptions` | ✅ stable | Options interface for NeuroUX configuration |
| `NeuroUXInstance` | ✅ stable | Instance interface type |

---

## 📦 Package: `@adapt-ux/neuro-ux-sdk-signals`

### Signal Classes

| Export | Status | Description |
|--------|--------|-------------|
| `BaseSignal` | ✅ stable | Base class for custom signals |
| `IdleSignal` | ✅ stable | Idle detection signal |
| `ScrollSignal` | ✅ stable | Scroll behavior signal |

### Signal Types

| Export | Status | Description |
|--------|--------|-------------|
| `Signal` | ✅ stable | Signal interface |
| `SignalContext` | ✅ stable | Signal context interface |

### Signal Utilities

| Export | Status | Description |
|--------|--------|-------------|
| `SignalManager` | ✅ stable | Signal lifecycle manager |
| `SignalSnapshot` | ✅ stable | Signal state snapshot |
| `createSignalSnapshot()` | ✅ stable | Create signal snapshot |
| `SignalContextImpl` | 🔒 internal | Internal signal context implementation |

---

## 📦 Package: `@adapt-ux/neuro-ux-sdk-styles`

### Main Exports

| Export | Status | Description |
|--------|--------|-------------|
| `styles` (object) | 🔒 internal | Internal version object |
| `createStylingEngine()` | ✅ stable | Create styling engine (from UI channel) |
| `StylingEngine` | ✅ stable | Styling engine interface |
| `createCoreStylingEngine()` | ⚠️ experimental | Core state-based styling engine |
| `CoreStylingEngine` | ⚠️ experimental | Core styling engine interface |
| `CssWriter` | ✅ stable | CSS writer utility |
| `StylingTypes` | ✅ stable | Styling type definitions |
| `BasePreset` | ✅ stable | Base preset configuration |

### SCSS Files (not TypeScript exports)

- `styles.scss` — Main stylesheet
- `_colors.scss` — Color tokens
- `_spacing.scss` — Spacing tokens
- `_typography.scss` — Typography tokens

---

## 📦 Package: `@adapt-ux/neuro-ux-sdk-assist`

### Web Components

| Export | Status | Description |
|--------|--------|-------------|
| `NeuroToggle` | ✅ stable | Main adaptation toggle component |
| `AssistButton` | ✅ stable | Assist button component |
| `AssistMenu` | ✅ stable | Assist menu component |

### Types

| Export | Status | Description |
|--------|--------|-------------|
| `AssistButtonProps` | ✅ stable | Assist button props |
| `AssistMenuProps` | ✅ stable | Assist menu props |
| `NeuroToggleProps` | ✅ stable | Neuro toggle props |

---

## 📦 Package: `@adapt-ux/neuro-ux-sdk-react`

### Providers

| Export | Status | Description |
|--------|--------|-------------|
| `NeuroUXProvider` | ✅ stable | React context provider |
| `AssistProvider` | ✅ stable | Assist UI provider |

### Hooks

| Export | Status | Description |
|--------|--------|-------------|
| `useNeuroUX()` | ✅ stable | Access NeuroUX instance |
| `useSignals()` | ✅ stable | Subscribe to signals |
| `useUIState()` | ✅ stable | Subscribe to UI state |

### Components

| Export | Status | Description |
|--------|--------|-------------|
| `AssistButton` | ✅ stable | Assist button component |
| `AssistMenu` | ✅ stable | Assist menu component |

### Utilities

| Export | Status | Description |
|--------|--------|-------------|
| `registerComponents()` | 🔒 internal | Internal component registration |

---

## 📦 Package: `@adapt-ux/neuro-ux-sdk-next`

### Client Components

| Export | Status | Description |
|--------|--------|-------------|
| `NeuroUXProvider` | ✅ stable | Client-side provider |
| `useNeuroUX()` | ✅ stable | Client-side hook |
| `NeuroUXToggle` | ✅ stable | Toggle component |
| `AssistButton` | ✅ stable | Assist button |
| `AssistMenu` | ✅ stable | Assist menu |
| `AssistProvider` | ✅ stable | Assist provider |

### Server Components

| Export | Status | Description |
|--------|--------|-------------|
| `NeuroUXProvider` (server) | ✅ stable | Server-side provider |
| `AssistProvider` (server) | ✅ stable | Server-side assist provider |

### Types

| Export | Status | Description |
|--------|--------|-------------|
| `NeuroNextConfig` | ✅ stable | Next.js specific config |

---

## 📦 Package: `@adapt-ux/neuro-ux-sdk-vue`

### Composables

| Export | Status | Description |
|--------|--------|-------------|
| `useNeuroUX()` | ✅ stable | Access NeuroUX instance |
| `useSignals()` | ✅ stable | Subscribe to signals |
| `useUIState()` | ✅ stable | Subscribe to UI state |

---

## 📦 Package: `@adapt-ux/neuro-ux-sdk-svelte`

### Store

| Export | Status | Description |
|--------|--------|-------------|
| `neuroUXStore` | ✅ stable | Svelte store for NeuroUX |
| `useNeuroUX()` | ✅ stable | Hook to access store (convenience) |

---

## 📦 Package: `@adapt-ux/neuro-ux-sdk-angular`

### Module

| Export | Status | Description |
|--------|--------|-------------|
| `NeuroUXModule` | ✅ stable | Angular module |

### Service

| Export | Status | Description |
|--------|--------|-------------|
| `NeuroUXService` | ✅ stable | Angular service for NeuroUX |

---

## 📦 Package: `@adapt-ux/neuro-ux-sdk-js`

### Main Export

| Export | Status | Description |
|--------|--------|-------------|
| `neuroUX` | ✅ stable | Pre-initialized NeuroUX instance |

---

## 📦 Package: `@adapt-ux/neuro-ux-sdk-utils`

### Utilities

| Export | Status | Description |
|--------|--------|-------------|
| `*` (all utilities) | ✅ stable | Shared utility functions |

---

## 🎯 Naming Consistency Notes

### Resolved Patterns

1. **Initialization**: ✅ `createNeuroUX()` is the standard (not `init()` or `engine()`)
2. **Signal Updates**: ✅ `signals.update()` / `signals.register()` are standard
3. **UI Updates**: ✅ `ui.set()` is standard (not `apply()`)
4. **Events**: ✅ `signal:update`, `ui:update` are standard event names

### Naming Patterns

All APIs follow consistent naming patterns:
- Factory functions: `create*()` (e.g., `createNeuroUX`, `createSignalsRegistry`)
- Instance methods: camelCase (e.g., `getState()`, `on()`, `off()`)
- Events: `namespace:action` format (e.g., `signal:update`, `ui:update`)

---

## 📐 Responsibility Boundaries

### Core Package (`@adapt-ux/neuro-ux-sdk-core`)

**Responsibilities:**
- Engine initialization and lifecycle
- State management
- Rule processing and evaluation
- Event system
- UI channel management
- Heuristics engine
- Signal registry (registration and coordination)
- Configuration management
- Debug API (experimental)

**Does NOT:**
- Implement specific signal detection logic (that's in `@adapt-ux/neuro-ux-sdk-signals`)
- Provide framework-specific APIs (that's in framework wrappers)
- Implement UI components (that's in `@adapt-ux/neuro-ux-sdk-assist`)
- Provide styling implementations (that's in `@adapt-ux/neuro-ux-sdk-styles`)

### Signals Package (`@adapt-ux/neuro-ux-sdk-signals`)

**Responsibilities:**
- Signal detection implementations (IdleSignal, ScrollSignal, etc.)
- Base signal class for custom signals
- Signal lifecycle management
- Signal snapshots and state tracking

**Does NOT:**
- Register or coordinate signals (that's Core's SignalsRegistry)
- Process rules or evaluate adaptations (that's Core's RuleProcessor)
- Manage UI state (that's Core's UI Channel)

### Framework Wrappers

**Responsibilities:**
- Framework-specific integration (React hooks, Vue composables, Angular services, etc.)
- Provide idiomatic APIs for each framework
- Bridge framework lifecycle with NeuroUX instance lifecycle

**Does NOT:**
- Modify Core behavior
- Add new adaptation logic
- Change signal detection algorithms

### Styles Package (`@adapt-ux/neuro-ux-sdk-styles`)

**Responsibilities:**
- CSS variable generation
- Style state to CSS mapping
- Styling presets and themes
- CSS writer utilities

**Does NOT:**
- Detect when styles should change (that's Core's rules/heuristics)
- Implement UI components (that's `@adapt-ux/neuro-ux-sdk-assist`)

### Assist Package (`@adapt-ux/neuro-ux-sdk-assist`)

**Responsibilities:**
- Web Components UI (NeuroToggle, AssistButton, AssistMenu)
- User-facing adaptation controls
- Component styling and theming

**Does NOT:**
- Process adaptation logic (that's Core)
- Detect signals (that's Signals package)

---

## 🔒 Internal APIs (Not for Public Use)

The following are exported but marked as `@internal` and should not be used by external code:

- All `create*` factory functions (except public ones like `createNeuroUX`, `createSignalsRegistry`, `createUiChannel`, `createRuleProcessor`, `createHeuristicsEngine`)
- Internal state management (`createStateContainer`, `Subscriber`)
- Internal event bus (`createEventBus`, `EventCallback`)
- Internal configuration (`normalizeConfig`, `loadConfig`, `defaultConfig`)
- Internal rule evaluation (`evaluateRule`, `evaluateRuleCondition`)
- Internal debug infrastructure (`createDebugStore`, `createDebugAPI`, debug types)
- Internal signal implementations (`SignalContextImpl`)
- Framework-specific internal utilities (`registerComponents`)

---

## 📝 Version 0.1 Stability Commitment

All APIs marked as **✅ stable** in this document are committed to:

- Maintain backward compatibility through v0.1.x
- Follow semantic versioning for changes
- Provide migration paths for any changes
- Be documented with TypeScript types

APIs marked as **⚠️ experimental** may change but will follow deprecation warnings.

APIs marked as **🔒 internal** are not covered by stability guarantees.
