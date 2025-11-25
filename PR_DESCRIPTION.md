# 🧩 NeuroUX SDK — Pull Request Template

Thank you for contributing to the NeuroUX SDK!  
Please complete the sections below to help maintainers review your PR efficiently.

---

## 📌 Summary

This PR implements a complete refactoring of the NeuroUX Core engine, introducing a modular architecture with separate concerns for configuration, state management, event handling, and rule processing. It also adds comprehensive unit test coverage for all core modules.

**Key changes:**
- Refactored `createNeuroUX` to use a modular architecture
- Added configuration system with normalization (`config.ts`)
- Implemented reactive state container (`state.ts`)
- Created lightweight event bus (`event-bus.ts`)
- Added rule processor placeholder for future implementation (`rule-processor.ts`)
- Added 60 unit tests covering all core functionality
- Updated README with complete API documentation
- Exported all new modules from the main index

---

## 🧠 Motivation

The previous implementation had all functionality tightly coupled in a single file, making it difficult to test, maintain, and extend. This refactoring:

- **Improves testability**: Each module can be tested independently
- **Enhances maintainability**: Clear separation of concerns
- **Enables future features**: Modular architecture allows easy extension
- **Provides documentation**: Complete API reference for developers
- **Ensures quality**: Comprehensive test coverage (60 tests)

This change establishes the foundation for future NeuroUX features while maintaining backward compatibility through the public API.

---

## 🛠️ Type of Change

Select one:

- [x] 🚀 Feature  
- [ ] 🐞 Bug fix  
- [ ] 📚 Documentation  
- [x] 🧹 Refactor  
- [x] 🧪 Tests  
- [ ] 🔧 Build / CI  
- [ ] Other (specify):

---

## 🧪 How to Test

### 1. Run tests

```bash
cd libs/core
npm test
# or
npx vitest run
```

Expected output: All 60 tests should pass.

### 2. Build the package

```bash
nx build core
```

Expected: Build should complete without errors.

### 3. Test the API

Create a test file to verify the API works as expected:

```ts
import { createNeuroUX } from '@adapt-ux/neuro-core';

const neuro = createNeuroUX({
  profile: 'test',
  signals: ['focus'],
});

// Test state management
neuro.setState({ signals: { focus: 0.7 } });
console.log(neuro.getState());

// Test event bus
neuro.on('ui:update', (ui) => {
  console.log('UI update:', ui);
});

// Test subscription
const unsubscribe = neuro.subscribe((state) => {
  console.log('State changed:', state);
});

// Cleanup
neuro.destroy();
```

### 4. Verify exports

Check that all modules are properly exported:

```ts
import {
  createNeuroUX,
  loadConfig,
  createStateContainer,
  createEventBus,
  createRuleProcessor,
} from '@adapt-ux/neuro-core';
```

---

## 📦 Affected Packages

Mark all that apply:

- [x] `core`
- [ ] `assist`
- [ ] `styles`
- [ ] `signals`
- [ ] `utils`
- [ ] `neuro-react`
- [ ] `neuro-vue`
- [ ] `neuro-angular`
- [ ] `neuro-svelte`
- [ ] `neuro-js`
- [ ] `neuro-next`
- [ ] `demo`

---

## ✔ Checklist

Before submitting:

- [x] Code builds with no errors (`nx run-many --target=build --all`)
- [x] Tests pass (`nx run-many --target=test --all`)
- [x] I added or updated tests when needed
- [x] I updated documentation where appropriate
- [x] I followed the project's coding conventions
- [x] I used Conventional Commits
- [x] I have reviewed the **Code of Conduct**

---

## 📸 Screenshots / Demos (if applicable)

N/A - This is a core refactoring with no UI changes.

---

## 🔒 Security Considerations

Does this PR introduce potential security concerns?

- [x] No
- [ ] Yes (explain below)

---

## 🗒 Additional Notes

### Architecture Overview

The refactored core engine consists of:

1. **Config Module** (`config.ts`): Handles configuration normalization with sensible defaults
2. **State Module** (`state.ts`): Lightweight reactive state container with subscription support
3. **Event Bus** (`event-bus.ts`): Minimal event system for internal and external events
4. **Rule Processor** (`rule-processor.ts`): Placeholder for future rule evaluation (currently returns empty object)
5. **Main Engine** (`createNeuroUX.ts`): Orchestrates all modules and provides unified API

### Test Coverage

- **config.test.ts**: 7 tests covering configuration loading and normalization
- **state.test.ts**: 17 tests covering state management and subscriptions
- **event-bus.test.ts**: 12 tests covering event registration and emission
- **rule-processor.test.ts**: 6 tests covering rule processor MVP behavior
- **createNeuroUX.test.ts**: 18 tests covering engine initialization and integration

**Total: 60 tests, all passing**

### Breaking Changes

None. The public API remains compatible with the previous implementation.

### Future Work

- Implement actual rule evaluation logic in `rule-processor.ts`
- Add TypeScript types for state shape
- Consider adding state persistence capabilities
- Add more comprehensive error handling

### Documentation

The README has been completely rewritten to provide:
- Complete API reference
- Usage examples
- Configuration options
- Stability index for each API area
- Notes for framework wrapper developers
