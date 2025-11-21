# 🗺️ **NeuroUX SDK — Roadmap**

This document outlines the planned direction and long-term vision for the **NeuroUX SDK**, developed by **AdaptUX**.
The roadmap is iterative, research-driven, and shaped by community feedback, academic studies, and real-world accessibility needs.

---

# 📌 **Phase 1 — Foundation (Current)**

### ✅ 1.1 Core Architecture

* Establish base package structure (Nx monorepo)
* Define framework-agnostic adaptive engine
* Set up signals, heuristics, and behavioral detectors
* SCSS token system & foundational themes
* Lit-based Web Components for Assist UI

### ✅ 1.2 Repo Infrastructure

* CI (build, lint, test)
* Individual package testing workflow
* Auto-tag + auto-release
* Issue / PR templates
* Discussions categories
* Codeowners & governance files

### 🚧 1.3 Research Baseline

* Identify neurodivergence categories that benefit from adaptive UX
* Map cognitive and sensory friction points (attention, overstimulation, reading, structure, etc.)
* Cross-reference academic works to build justified UX adaptations

---

# 🚀 **Phase 2 — Adaptive Engine (Q1)**

### 🔜 2.1 Signals Layer

* Focus mode detection (scroll patterns, idle time, tab switching)
* Overstimulation risk heuristics
* Reading difficulty indicators
* Motion sensitivity patterns
* User-controlled override API

### 🔜 2.2 Adaptation Rules Engine

* Base rule evaluator
* Custom rule injection
* Runtime configuration via JS or JSON
* Progressive override (least intrusive first)

### 🔜 2.3 Core API

* `createNeuroUX()` initialization
* Adaptive state store (reactive)
* Global event hub
* Accessibility-safe defaults

---

# 🎨 **Phase 3 — Assist UI Components (Q2)**

### 🔜 3.1 Core Components

* Adaptation toggle widget (puzzle-style icon)
* Text size & spacing adjuster
* Contrast mode switcher
* Focus mode banner
* Reduce motion control

### 🔜 3.2 Interaction Components

* Guided focus navigator
* Smooth onboarding helper
* Distraction-free popover pattern
* Component-level overrides

### 🔜 3.3 External APIs

* CSS variable injection
* Style tokens auto-adaptation
* Plugin system for presets

---

# 🔧 **Phase 4 — Framework Wrappers (Q2–Q3)**

### React

* `<NeuroUXProvider>`
* React hooks: `useNeuroMode()`, `useSignals()`

### Vue

* `NeuroUXPlugin`, `useNeuroUX()`

### Angular

* Standalone provider
* Structural directives (`*neuroIfOverloaded`, etc.)

### Svelte

* Stores integration

### Vanilla JS

* Simple loader, zero-dependency mode

---

# 🌍 **Phase 5 — Research-Driven Adaptive Profiles (Q3)**

### Planned profiles:

* **ADHD-Friendly Mode**
* **Autism-Friendly Mode**
* **Dyslexia-Friendly Mode**
* **Sensory-Sensitive Mode**
* **Cognitive Simplification Mode**

Each profile includes:

* Validated heuristics
* Safe UI defaults
* Rationale with academic citation
* UX patterns aligned with the user’s needs

---

# 🧩 **Phase 6 — Plug-in Ecosystem (Q4)**

### Planned plugins:

* Reading-Aid Toolkit
* Focus Enhancer
* Form Flow Simplifier
* Navigation Softener
* Aesthetic Overload Reducer
* Per-component adaptation middleware

---

# 📚 **Phase 7 — Documentation Platform (Q4)**

* Docs site (Next.js or Docusaurus)
* Live playground for all components
* “Adaptation Recipes” section
* Research Library (papers + UX patterns)
* Accessibility audits and ARIA guidelines

---

# 🧭 **Long-Term Vision (Beyond Year 1)**

* ML-based personalization (privacy-first)
* Adaptive design system generators
* Browser extension (universal adaptation)
* Mobile SDK (React Native / Flutter)
* Enterprise integration APIs
* Academic collaboration programs
* UX testing toolkit focusing on neurodivergent users

---

# 🤝 **Community Influence**

This roadmap evolves with:

* user feedback
* academic research
* accessibility standards
* community discussions
* production use cases

You can help shape it through GitHub Discussions and Issues.
