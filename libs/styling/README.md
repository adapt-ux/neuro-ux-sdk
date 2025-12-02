# @adapt-ux/neuro-styling

Dynamic CSS Variable Manager for NeuroUX - transforms Core states, signals, and rules into CSS variables for real-time visual adaptations.

## Overview

The Styling Engine is responsible for transforming logical style states (e.g., "calm mode", "high contrast", "focus mode") into dynamic CSS variables that can be consumed by any framework (React, Vue, Angular, Next, Svelte, Vanilla JS).

## Features

- ✅ **CSS Variable Injector**: Writes CSS variables to `:root` or scoped containers
- ✅ **Style Mapping Engine**: Converts logical style states to CSS variables
- ✅ **Preset System**: Built-in presets for calmMode, highContrast, and focusMode
- ✅ **Core State Subscription**: Automatically applies styles when Core state changes
- ✅ **SSR Safe**: Works in server-side rendering environments (Next.js, etc.)

## Installation

```bash
npm install @adapt-ux/neuro-styling
```

## Usage

### Basic Usage

```typescript
import { createStylingEngine } from '@adapt-ux/neuro-styling';

// Create a styling engine
const styling = createStylingEngine();

// Apply a style state
styling.apply({
  calmMode: true,
  contrast: 'high',
  focusMode: false,
});
```

### Subscribe to Core State

```typescript
import { createStylingEngine } from '@adapt-ux/neuro-styling';
import { createNeuroUX } from '@adapt-ux/neuro-core';

const core = createNeuroUX();
const styling = createStylingEngine();

// Subscribe to Core state changes
styling.subscribeToCore(core);

// When Core state changes, CSS variables are automatically updated
```

### Scoped CSS Variables

```typescript
import { createStylingEngine } from '@adapt-ux/neuro-styling';

const styling = createStylingEngine();

// Apply to a specific container
styling.setScope('[data-neuroux-scope="my-container"]');
styling.apply({
  calmMode: true,
});
```

### Custom Mappings

```typescript
import { createStylingEngine } from '@adapt-ux/neuro-styling';

const customMappings = {
  myCustomProperty: {
    value1: {
      '--neuroux-custom': '#ff0000',
    },
  },
};

const styling = createStylingEngine({
  mappings: customMappings,
});
```

## API

### `createStylingEngine(options?)`

Creates a new styling engine instance.

**Options:**
- `mappings?: StyleMapping` - Custom style mappings
- `namespace?: string` - CSS variable namespace prefix (default: 'neuroux')
- `scope?: Scope` - Initial scope for CSS variable injection (default: ':root')

### `StylingEngine`

#### Methods

- `apply(state: StyleState, scope?: Scope)` - Apply a style state to CSS variables
- `reset(scope?: Scope)` - Reset all CSS variables
- `subscribeToCore(core: CoreStateSubscriber)` - Subscribe to Core state changes
- `setScope(scope: Scope)` - Set the scope for CSS variable injection
- `getScope(): Scope` - Get the current scope
- `getCurrentStyleState(): StyleState` - Get the current style state
- `destroy()` - Destroy the engine and clean up

## CSS Variables

The engine generates CSS variables with the `--neuroux-` prefix by default:

- `--neuroux-bg` - Background color
- `--neuroux-text` - Text color
- `--neuroux-color-accent` - Accent color
- `--neuroux-border` - Border color
- `--neuroux-contrast` - Contrast ratio
- `--neuroux-focus-ring` - Focus ring style
- `--neuroux-focus-opacity` - Focus opacity
- `--neuroux-focus-outline` - Focus outline style

## Presets

The library includes base presets:

- **calmMode**: Soft, calming color palette
- **highContrast**: High contrast colors for accessibility
- **focusMode**: Enhanced focus indicators

## Framework Support

Works with any framework that supports CSS variables:

- ✅ React
- ✅ Next.js (SSR safe)
- ✅ Vue
- ✅ Angular
- ✅ Svelte
- ✅ Vanilla JS

## License

MIT
