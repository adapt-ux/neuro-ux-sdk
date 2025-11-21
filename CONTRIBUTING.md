# Contributing to NeuroUX SDK

Thank you for your interest in contributing to **NeuroUX SDK**, an open and framework-agnostic adaptive UX toolkit created by **AdaptUX**.
We welcome contributions of any kind — code, documentation, research, tests, ideas, issue reports, and accessibility expertise.

This document outlines the guidelines and expectations for contributors.

---

# 🧭 Table of Contents

1. Code of Conduct
2. How to Contribute
3. Development Setup
4. Repository Structure
5. Coding Guidelines
6. Commit Conventions
7. Pull Request Process
8. Testing
9. Documentation
10. Security Issues

---

# 1. Code of Conduct

By participating in this project, you agree to follow our **[Code of Conduct](./CODE_OF_CONDUCT.md)**.
Please read it before contributing.

---

# 2. How to Contribute

You can contribute in several ways:

### ✔ Report issues

Use GitHub Issues for:

* bug reports
* feature requests
* design/UI proposals
* performance concerns

### ✔ Submit pull requests

We accept improvements, bug fixes, new components, docs, tests and refactors.

### ✔ Improve documentation

Docs contributions are extremely valuable.

### ✔ Participate in discussions

Your ideas shape the direction of this project.

---

# 3. Development Setup

### Requirements:

* Node 18+
* pnpm
* NX CLI
* Git

### Clone repo:

```bash
git clone https://github.com/adapt-ux/neuro-ux-sdk.git
cd neuro-ux-sdk
pnpm install
```

### Run demo app:

```bash
nx serve demo
```

### Build all libraries:

```bash
nx run-many --target=build --all
```

---

# 4. Repository Structure

```
apps/
  demo/               # Example application

libs/
  core/               # Adaptive engine
  assist/             # Web Components UI
  styles/             # SCSS tokens and themes
  signals/            # Behavioral heuristics
  utils/              # Shared functions

  neuro-react/        # React wrapper
  neuro-vue/          # Vue wrapper
  neuro-angular/      # Angular wrapper
  neuro-svelte/       # Svelte wrapper
  neuro-js/           # Vanilla JS loader
```

All packages follow a **design-first** and **framework-agnostic-first** philosophy.

---

# 5. Coding Guidelines

### TypeScript

All logic should be written in TypeScript unless the framework requires otherwise.

### Web Components

All UI components use **Lit** as the base library.

### SCSS

SCSS is the default styling language for styles/tokens.

### Naming conventions

* Classes, Interfaces: `PascalCase`
* Variables, functions: `camelCase`
* SCSS tokens: `$token-name`

### Imports

Use absolute imports where configured.

---

# 6. Commit Conventions

We follow **Conventional Commits**:

```
feat:       New feature  
fix:        Bug fix  
docs:       Documentation  
style:      Formatting only  
refactor:   Code improvement (no new features)  
test:       Adding tests  
build:      Build system changes  
chore:      Misc updates  
```

Examples:

```
feat(assist): add high-contrast mode toggle
fix(core): handle missing interaction signals safely
docs: add wrapper usage section for Svelte
```

---

# 7. Pull Request Process

1. Fork the repository
2. Create a feature branch

   ```bash
   git checkout -b feat/my-feature
   ```
3. Write clear commits
4. Ensure your branch builds:

   ```bash
   nx run-many --target=build --all
   ```
5. Add or update tests if necessary
6. Submit a PR with:

   * clear description
   * what changed
   * why it’s needed
   * screenshots (if UI)
7. Maintainers will review and provide feedback

PRs that do not follow the guidelines may be asked to make adjustments.

---

# 8. Testing

We use **Vitest** across all packages.

### Running tests:

```bash
nx test core
nx test assist
nx test signals
```

### Running all tests:

```bash
nx run-many --target=test --all
```

All new features must include appropriate test coverage.

---

# 9. Documentation

Documentation lives in:

```
/docs/
```

All SDK features require:

* Usage examples
* API reference
* Edge case notes
* Framework-specific notes (if relevant)

You can also improve the root README or per-package READMEs.

---

# 10. Security Issues

If you discover a vulnerability, **do not open a public issue**.
Report it privately via:

📧 **[security@adaptux.org](mailto:security@adaptux.org)**
*(email can be changed if needed)*

---

# ❤️ Thank You

Your contributions directly help make digital experiences more inclusive, adaptive, and comfortable for everyone.
We are grateful for every PR, issue, idea, and discussion.
