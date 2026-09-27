<img width="1536" height="1024" alt="Banner " src="https://github.com/user-attachments/assets/48be33dc-bc4d-4257-a16c-9e39f39c5a7c" />

# **NeuroUX SDK**

![Build](https://img.shields.io/github/actions/workflow/status/adapt-ux/neuro-ux-sdk/ci.yml?label=build&style=flat)
![Release](https://img.shields.io/github/v/release/adapt-ux/neuro-ux-sdk?style=flat)
![License](https://img.shields.io/github/license/adapt-ux/neuro-ux-sdk?style=flat)
[![NPM Version](https://img.shields.io/npm/v/%40adapt-ux/neuro-ux-sdk-core?style=flat)](https://www.npmjs.com/package/@adapt-ux/neuro-ux-sdk-core)
[![Downloads](https://img.shields.io/npm/dm/%40adapt-ux/neuro-ux-sdk-core?style=flat)](https://www.npmjs.com/package/@adapt-ux/neuro-ux-sdk-core)
![Discussions](https://img.shields.io/github/discussions/adapt-ux/neuro-ux-sdk?style=flat)
[![Roadmap](https://img.shields.io/badge/roadmap-available-blue?style=for-the-badge?style=flat)](docs/roadmap/ROADMAP.md)

Adaptive User Experience Framework for Cognitive Diversity

---

## 🌐 Overview

**NeuroUX SDK** is an open, framework-agnostic toolkit designed to make digital experiences more adaptable, inclusive, and comfortable for people with diverse cognitive and sensory processing styles.

Instead of enforcing a one-size-fits-all interface, NeuroUX enables **dynamic UI adjustments** that respect attention patterns, reading styles, sensory thresholds, and cognitive load — without diagnosing, tracking, or labeling users.

Built with **TypeScript**, **Web Components**, and optional wrappers for React, Vue, Angular, Svelte, Next and vanilla JavaScript, the SDK can run anywhere: from enterprise platforms to static HTML pages.

---

## ✨ Key Features

### **🔸 Universal Compatibility**

Runs in:

* React
* Vue
* Svelte
* Angular
* HTML/vanilla JavaScript
* Next
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

* `@adapt-ux/neuro-ux-sdk-react` - React wrapper
* `@adapt-ux/neuro-ux-sdk-vue` - Vue wrapper
* `@adapt-ux/neuro-ux-sdk-angular` - Angular wrapper
* `@adapt-ux/neuro-ux-sdk-svelte` - Svelte wrapper
* `@adapt-ux/neuro-ux-sdk-js` - Vanilla JavaScript loader
* `@adapt-ux/neuro-ux-sdk-next` - Next wrapper

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
  core/          # @adapt-ux/neuro-ux-sdk-core - Adaptive engine (TS)
  assist/        # @adapt-ux/neuro-ux-sdk-assist - Web Components UI
  styles/        # @adapt-ux/neuro-ux-sdk-styles - Tokens, themes, SCSS utilities
  signals/       # @adapt-ux/neuro-ux-sdk-signals - Behavioral detection logic
  utils/         # @adapt-ux/neuro-ux-sdk-utils - Shared utilities

  neuro-react/   # @adapt-ux/neuro-ux-sdk-react - React wrapper
  neuro-vue/     # @adapt-ux/neuro-ux-sdk-vue - Vue wrapper
  neuro-angular/ # @adapt-ux/neuro-ux-sdk-angular - Angular wrapper
  neuro-svelte/  # @adapt-ux/neuro-ux-sdk-svelte - Svelte wrapper
  neuro-js/      # @adapt-ux/neuro-ux-sdk-js - Vanilla JavaScript loader
  neuro-next/    # @adapt-ux/neuro-ux-sdk-next - Next wrapper
apps/
  demo/          # Example app for testing
docs/            # Internal documentation
```

---

## 🚀 Getting Started

### **Install the universal SDK**

```bash
npm install @adapt-ux/neuro-ux-sdk-core @adapt-ux/neuro-ux-sdk-assist
```

### **Using the NeuroAssist Web Component (HTML/Vanilla JS)**

```html
<script type="module" src="https://cdn.adaptux.dev/neuro-assist.js"></script>

<neuro-assist></neuro-assist>
```

Or install via npm:

```bash
npm install @adapt-ux/neuro-ux-sdk-assist @adapt-ux/neuro-ux-sdk-core
```

```javascript
import '@adapt-ux/neuro-ux-sdk-assist';
```

---

## 🧩 Framework Examples

### **React**

```bash
npm install @adapt-ux/neuro-ux-sdk-react
```

```tsx
import { NeuroAssist } from '@adapt-ux/neuro-ux-sdk-react';

export default function Page() {
  return <NeuroAssist />;
}
```

---

### **Next.js**

```bash
npm install @adapt-ux/neuro-ux-sdk-next
```

**app/layout.tsx** (Root Layout):
```tsx
import { NeuroUXProvider } from '@adapt-ux/neuro-ux-sdk-next';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NeuroUXProvider>
      {children}
    </NeuroUXProvider>
  );
}
```

**app/page.tsx** (Client Component):
```tsx
'use client';

import { NeuroUXToggle } from '@adapt-ux/neuro-ux-sdk-next';

export default function Page() {
  return (
    <div>
      <h1>My Next.js App</h1>
      <NeuroUXToggle />
    </div>
  );
}
```

---

### **Vue**

```bash
npm install @adapt-ux/neuro-ux-sdk-vue
```

```vue
<template>
  <neuro-assist />
</template>

<script setup>
import '@adapt-ux/neuro-ux-sdk-vue';
</script>
```

---

### **Angular**

```bash
npm install @adapt-ux/neuro-ux-sdk-angular
```

```typescript
// app.module.ts or standalone component
import { Component } from '@angular/core';
import '@adapt-ux/neuro-ux-sdk-assist';

@Component({
  selector: 'app-root',
  template: '<neuro-assist></neuro-assist>'
})
export class AppComponent {}
```

---

### **Svelte**

```bash
npm install @adapt-ux/neuro-ux-sdk-svelte
```

```svelte
<script>
  import '@adapt-ux/neuro-ux-sdk-svelte';
</script>

<neuro-assist />
```

---

### **Vanilla JavaScript**

```bash
npm install @adapt-ux/neuro-ux-sdk-js
```

```javascript
import '@adapt-ux/neuro-ux-sdk-js';

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
