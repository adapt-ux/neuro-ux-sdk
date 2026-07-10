# AGENTS.md

## Cursor Cloud specific instructions

NeuroUX SDK is an Nx monorepo of framework-agnostic adaptive-UX packages under `libs/*`
(core, signals, styles, assist, utils, and framework wrappers `neuro-react/vue/angular/svelte/js/next`),
plus a browser demo app in `apps/demo`.

### Package manager
- Despite `CONTRIBUTING.md`/`README.md` mentioning pnpm, this repo is driven by **npm**: the committed
  lockfile is `package-lock.json` and CI (`.github/workflows/ci.yml`) uses `npm ci --legacy-peer-deps`.
  Always use npm. `--legacy-peer-deps` is required (Angular 18 / React 19 peer-dependency conflicts).

### Standard commands (see `README.md` and `.github/workflows/ci.yml`)
- Lint all: `npx nx run-many --target=lint --all`
- Test all: `npx nx run-many --target=test --all` (Vitest; jsdom)
- Build: libs intentionally have **no `build` target** (they publish source directly to avoid nx
  recursion), so `npx nx run-many --target=build --all --exclude=demo` runs no tasks — this is expected,
  not an error.
- Run the demo (dev): `npx nx serve demo` → serves on http://localhost:4200 (webpack dev server).

### Non-obvious gotchas
- The `demo` app is **excluded from the CI build** because `apps/demo/src/main.ts` and
  `libs/styles/src/index.ts` currently emit TypeScript **type** errors. These are type-only errors:
  `npx nx serve demo` still emits a working bundle and the app runs correctly in the browser (webpack
  briefly shows an error overlay on first compile, then the app renders). Do not treat the demo's
  type errors as a broken dev environment.
- Lint currently passes with warnings only (unused vars / `no-explicit-any`); warnings do not fail lint.
- `.husky/pre-commit` runs `nx affected:test` but is intentionally non-blocking (always exits 0).
