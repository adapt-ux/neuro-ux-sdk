# 📦 **Changelog — NeuroUX SDK**

All notable changes to this project will be documented in this file.
This project adheres to **[Semantic Versioning](https://semver.org/)** and the **Keep a Changelog** format.

---

## [Unreleased]

### Planned

* Additional signals and heuristics
* Performance optimizations
* Enhanced documentation and examples
* NeuroUX Playground application

---

## [0.1.0-rc.1] – 2024-XX-XX

### Added

* Comprehensive public API surface documentation (`docs/api-surface.md`)
* Release candidate checklist (`docs/release-checklist.md`)
* JSDoc annotations marking APIs as `@internal`, `@experimental`, or stable
* Enhanced entry point documentation with clear public/internal API separation
* Detailed framework wrapper documentation in architecture docs

### Changed

* Improved architecture documentation to reflect actual implementation
* Enhanced package responsibility boundaries documentation
* Updated framework wrapper descriptions with accurate API details
* Improved code organization and documentation consistency

### Fixed

* Resolved TypeScript compilation errors (duplicate `SignalValue` export)
* Fixed index signature access patterns (dot notation → bracket notation)
* Cleaned up unused code and variables
* Improved TypeScript type imports for better tree-shaking

### Documentation

* Created comprehensive API surface inventory
* Documented all public, experimental, and internal APIs
* Established clear naming conventions and patterns
* Defined responsibility boundaries between packages
* Updated architecture documentation with accurate information

---

## [0.0.1] – Initial Development

### Added

* Initial repository structure using Nx monorepo
* Core packages:

  * `@adapt-ux/neuro-core` - Adaptive engine
  * `@adapt-ux/neuro-signals` - Behavioral signal detection
  * `@adapt-ux/neuro-styles` - SCSS design tokens and styling engine
  * `@adapt-ux/neuro-assist` - Web Components UI
  * `@adapt-ux/neuro-react` - React wrapper
  * `@adapt-ux/neuro-vue` - Vue wrapper
  * `@adapt-ux/neuro-angular` - Angular wrapper
  * `@adapt-ux/neuro-svelte` - Svelte wrapper
  * `@adapt-ux/neuro-js` - Vanilla JavaScript loader
  * `@adapt-ux/neuro-next` - Next.js wrapper
  * `@adapt-ux/neuro-utils` - Shared utilities
* Initial documentation folder (`docs/`) with architecture outline
* GitHub Actions:

  * Build & Lint workflows
  * Test workflows
  * Release automation
  * Per-package test workflows
* Project metadata:

  * README
  * LICENSE (MIT)
  * CODE_OF_CONDUCT
  * CONTRIBUTING
  * SECURITY
  * SUPPORT
* GitHub Templates:

  * Bug report
  * Feature request
  * General question
  * Pull request template
* GitHub Discussions categories
* Project badges (CI, release, npm, license, discussions)
* Roadmap document

### Changed

* Updated project to use **SCSS** instead of plain CSS for token system

### Fixed

* Initial mermaid diagram syntax issues
