# **NeuroUX SDK**

Adaptive User Experience Framework for Cognitive Diversity

---

## 🌐 Overview

**NeuroUX SDK** is an open, framework-agnostic toolkit designed to make digital experiences more adaptable, inclusive, and comfortable for people with diverse cognitive and sensory processing styles.

Instead of enforcing a one-size-fits-all interface, NeuroUX enables **dynamic UI adjustments** that respect attention patterns, reading styles, sensory thresholds, and cognitive load — without diagnosing, tracking, or labeling users.

Built with **TypeScript**, **Web Components**, and optional wrappers for React/Vue, the SDK can run anywhere: from enterprise platforms to static HTML pages.

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

Lightweight bindings:

* `@adapt-ux/neuro-react`
* `@adapt-ux/neuro-vue`

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
  core/        # Adaptive engine (TS)
  assist/      # Web Components UI
  styles/      # Tokens, themes, SCSS utilities
  signals/     # Behavioral detection logic
  utils/       # Shared utilities

  react/       # Optional React wrapper
  vue/         # Optional Vue wrapper
apps/
  demo/        # Example app for testing
docs/          # Internal documentation
```

---

## 🚀 Getting Started

### **Install the universal SDK**

```bash
npm install @adapt-ux/neuro-core @adapt-ux/neuro-assist
```

### **Using the NeuroAssist Web Component (HTML)**

```html
<script type="module" src="https://cdn.adaptux.dev/neuro-assist.js"></script>

<neuro-assist></neuro-assist>
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
import '@adapt-ux/neuro-assist';
</script>
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
```

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
