# @adapt-ux/neuro-styles

SCSS design tokens, themes, and utilities for building adaptive, neuro-friendly interfaces using the NeuroUX system. Includes both UI Channel-based and Core State-based styling engines for dynamic CSS variable management.

## Overview

The `@adapt-ux/neuro-styles` library provides:

1. **SCSS Design Tokens**: Colors, spacing, typography, and other design system variables
2. **UI Channel Styling Engine**: Maps UI channel outputs to CSS variables (existing)
3. **Core State Styling Engine**: Transforms Core states directly into CSS variables (new in v0.1)

## Features

### Core State Styling Engine (v0.1)

- ✅ **CSS Variable Injector**: Writes CSS variables to `:root` or scoped containers
- ✅ **Style Mapping Engine**: Converts logical style states to CSS variables
- ✅ **Preset System**: Built-in presets for calmMode, highContrast, and focusMode
- ✅ **Core State Subscription**: Automatically applies styles when Core state changes
- ✅ **SSR Safe**: Works in server-side rendering environments (Next.js, etc.)

### UI Channel Styling Engine (existing)

- Maps UI channel outputs to CSS variables
- Integrates with Core Engine's UI channel
- Event-based updates

## Installation

```bash
npm install @adapt-ux/neuro-styles
```

## Usage

### Core State Styling Engine

```typescript
import { createCoreStylingEngine } from '@adapt-ux/neuro-styles';
import { createNeuroUX } from '@adapt-ux/neuro-core';

const core = createNeuroUX();
const styling = createCoreStylingEngine();

// Subscribe to Core state changes
styling.subscribeToCore(core);

// Or apply styles manually
styling.apply({
  calmMode: true,
  contrast: 'high',
  focusMode: false,
});
```

### UI Channel Styling Engine (existing)

```typescript
import { createStylingEngine } from '@adapt-ux/neuro-styles';
import { createUiChannel } from '@adapt-ux/neuro-core';

const ui = createUiChannel();
const styling = createStylingEngine(ui, { eventBus });

// Styles are automatically applied when UI channel updates
ui.set('colorMode', 'calm');
```

### Scoped CSS Variables

```typescript
import { createCoreStylingEngine } from '@adapt-ux/neuro-styles';

const styling = createCoreStylingEngine();

// Apply to a specific container
styling.setScope('[data-neuroux-scope="my-container"]');
styling.apply({
  calmMode: true,
});
```

### Custom Mappings

```typescript
import { createCoreStylingEngine } from '@adapt-ux/neuro-styles';

const customMappings = {
  myCustomProperty: {
    value1: {
      '--neuroux-custom': '#ff0000',
    },
  },
};

const styling = createCoreStylingEngine({
  mappings: customMappings,
});
```

## API

### Core State Styling Engine

#### `createCoreStylingEngine(options?)`

Creates a new Core State-based styling engine instance.

**Options:**
- `mappings?: StyleMapping` - Custom style mappings
- `namespace?: string` - CSS variable namespace prefix (default: 'neuroux')
- `scope?: Scope` - Initial scope for CSS variable injection (default: ':root')

#### `CoreStylingEngine`

**Methods:**
- `apply(state: StyleState, scope?: Scope)` - Apply a style state to CSS variables
- `reset(scope?: Scope)` - Reset all CSS variables
- `subscribeToCore(core: CoreStateSubscriber)` - Subscribe to Core state changes
- `setScope(scope: Scope)` - Set the scope for CSS variable injection
- `getScope(): Scope` - Get the current scope
- `getCurrentStyleState(): StyleState` - Get the current style state
- `destroy()` - Destroy the engine and clean up

### UI Channel Styling Engine

#### `createStylingEngine(ui: UiChannel, options?)`

Creates a UI Channel-based styling engine instance (existing API).

## CSS Variables

The engines generate CSS variables with the `--neuroux-` prefix by default:

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

## SCSS Design Tokens

The library also provides SCSS variables for static styling:

- `_colors.scss` - Color tokens
- `_spacing.scss` - Spacing tokens
- `_typography.scss` - Typography tokens

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
