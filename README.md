<img width="1536" height="1024" alt="Banner " src="https://github.com/user-attachments/assets/48be33dc-bc4d-4257-a16c-9e39f39c5a7c" />

# **NeuroUX SDK**

![Build](https://img.shields.io/github/actions/workflow/status/adapt-ux/neuro-ux-sdk/ci.yml?label=build&style=flat)
![Release](https://img.shields.io/github/v/release/adapt-ux/neuro-ux-sdk?style=flat)
![License](https://img.shields.io/github/license/adapt-ux/neuro-ux-sdk?style=flat)
![NPM Version](https://img.shields.io/npm/v/neuro-ux-sdk?style=flat)
![Downloads](https://img.shields.io/npm/dm/neuro-ux-sdk?style=flat)
![Discussions](https://img.shields.io/github/discussions/adapt-ux/neuro-ux-sdk?style=flat)
![Roadmap](https://img.shields.io/badge/roadmap-available-blue?style=for-the-badge?style=flat)

Adaptive User Experience Framework for Cognitive Diversity

---

## 🌐 Overview

**NeuroUX SDK** is an open, framework-agnostic toolkit designed to make digital experiences more adaptable, inclusive, and comfortable for people with diverse cognitive and sensory processing styles.

Instead of enforcing a one-size-fits-all interface, NeuroUX enables **dynamic UI adjustments** that respect attention patterns, reading styles, sensory thresholds, and cognitive load — without diagnosing, tracking, or labeling users.

Built with **TypeScript**, **Web Components**, and optional wrappers for React, Vue, Angular, Svelte, and vanilla JavaScript, the SDK can run anywhere: from enterprise platforms to static HTML pages.

---

## ✨ Key Features

### **🔸 Universal Compatibility**

Runs in:

* React
* Vue
* Svelte
* Angular
* HTML/vanilla JavaScript
* CMS platforms (WordPress, Shopify, etc.)

### **🔸 Evidence-Based Adaptive Engine**

Behavioral signals detect when users may benefit from:

* Reduced visual noise
* Increased focus
* Enhanced readability
* Lower cognitive load
* Simplified interactions

All adaptations are **optional**, **transparent**, and **opt-in**.

### **🔸 Web Components UI (NeuroAssist)**

A universal widget that allows users to adjust:

* Motion reduction
* Focus mode
* Typography tuning
* Contrast
* Spacing
* Reading aids
* Highlighting features

### **🔸 Framework Wrappers (Optional)**

Lightweight bindings for popular frameworks:

* `@adapt-ux/neuro-react` - React wrapper
* `@adapt-ux/neuro-vue` - Vue wrapper
* `@adapt-ux/neuro-angular` - Angular wrapper
* `@adapt-ux/neuro-svelte` - Svelte wrapper
* `@adapt-ux/neuro-js` - Vanilla JavaScript loader

### **🔸 Zero Diagnosis, Zero Tracking**

The SDK does **not**:

* infer medical conditions
* store cognitive profiles
* track identity
* require accounts

It only adapts based on **interaction patterns** and **user preference**.

---

## 📦 Packages

The monorepo contains:

```
libs/
  core/          # @adapt-ux/neuro-core - Adaptive engine (TS)
  assist/        # @adapt-ux/neuro-assist - Web Components UI
  styles/        # @adapt-ux/neuro-styles - Tokens, themes, SCSS utilities
  signals/       # @adapt-ux/neuro-signals - Behavioral detection logic
  utils/         # @adapt-ux/neuro-utils - Shared utilities

  neuro-react/   # @adapt-ux/neuro-react - React wrapper
  neuro-vue/     # @adapt-ux/neuro-vue - Vue wrapper
  neuro-angular/ # @adapt-ux/neuro-angular - Angular wrapper
  neuro-svelte/  # @adapt-ux/neuro-svelte - Svelte wrapper
  neuro-js/      # @adapt-ux/neuro-js - Vanilla JavaScript loader
apps/
  demo/          # Example app for testing
docs/            # Internal documentation
```

---

## 🚀 Getting Started

### **Install the universal SDK**

```bash
npm install @adapt-ux/neuro-core @adapt-ux/neuro-assist
```

### **Using the NeuroAssist Web Component (HTML/Vanilla JS)**

```html
<script type="module" src="https://cdn.adaptux.dev/neuro-assist.js"></script>

<neuro-assist></neuro-assist>
```

Or install via npm:

```bash
npm install @adapt-ux/neuro-assist @adapt-ux/neuro-core
```

```javascript
import '@adapt-ux/neuro-assist';
```

---

## 🧩 Framework Examples

### **React**

```bash
npm install @adapt-ux/neuro-react
```

```tsx
import { NeuroAssist } from '@adapt-ux/neuro-react';

export default function Page() {
  return <NeuroAssist />;
}
```

---

### **Vue**

```bash
npm install @adapt-ux/neuro-vue
```

```vue
<template>
  <neuro-assist />
</template>

<script setup>
import '@adapt-ux/neuro-vue';
</script>
```

---

### **Angular**

```bash
npm install @adapt-ux/neuro-angular
```

```typescript
// app.module.ts or standalone component
import { Component } from '@angular/core';
import '@adapt-ux/neuro-assist';

@Component({
  selector: 'app-root',
  template: '<neuro-assist></neuro-assist>'
})
export class AppComponent {}
```

---

### **Svelte**

```bash
npm install @adapt-ux/neuro-svelte
```

```svelte
<script>
  import '@adapt-ux/neuro-svelte';
</script>

<neuro-assist />
```

---

### **Vanilla JavaScript**

```bash
npm install @adapt-ux/neuro-js
```

```javascript
import '@adapt-ux/neuro-js';

// Or via CDN
// <script type="module" src="https://cdn.adaptux.dev/neuro-js.js"></script>

// The component will be available as a custom element
document.body.innerHTML = '<neuro-assist></neuro-assist>';
```

---

## 🛠 Development

### Run the demo app:

```bash
nx serve demo
```

### Build all packages:

```bash
nx run-many --target=build --all
```

### Test:

```bash
nx test core
nx test assist
nx test signals
nx test styles
nx test utils
```

### Build a specific package:

```bash
nx build core
nx build assist
nx build react
# ... etc
```

---

## 🗺️ Roadmap

Our development plans, research milestones, and long-term goals are documented in the roadmap.

👉 **[Open ROADMAP.md](docs/roadmap/ROADMAP.md)**  
This document is frequently updated as the project evolves.

---

## 🔬 Vision & Philosophy

NeuroUX is guided by these principles:

* **Adaptation over standardization**
* **Inclusion without identification**
* **Respect by default**
* **Evidence-driven design**
* **Framework-agnostic architecture**
* **Developer-first ergonomics**

Our goal is simple:

### **Make the web more comfortable for everyone — without assumptions, labels, or friction.**

---

## 🤝 Contributing

We welcome contributions in:

* Accessibility research
* UI/UX behavior experiments
* New adaptive patterns
* Code improvements
* Documentation
* Testing & QA

Please open a discussion or pull request.

---

## 📜 License

MIT License — freely usable and modifiable for personal or commercial purposes.
