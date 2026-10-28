# NeuroUX SDK — Release Candidate Checklist

This checklist ensures the SDK is ready for release.

---

## ✅ Version Alignment

- [ ] All packages share the same version (`0.1.0-rc.x`)
- [ ] Root `package.json` version updated
- [ ] All `libs/*/package.json` versions aligned
- [ ] Nx release config aligned (if using Nx release)
- [ ] Internal dependency versions use `workspace:*` correctly

**Packages to verify:**
- `@adapt-ux/neuro-ux-sdk-core`
- `@adapt-ux/neuro-ux-sdk-signals`
- `@adapt-ux/neuro-ux-sdk-styles`
- `@adapt-ux/neuro-ux-sdk-assist`
- `@adapt-ux/neuro-ux-sdk-react`
- `@adapt-ux/neuro-ux-sdk-vue`
- `@adapt-ux/neuro-ux-sdk-angular`
- `@adapt-ux/neuro-ux-sdk-svelte`
- `@adapt-ux/neuro-ux-sdk-next`
- `@adapt-ux/neuro-ux-sdk-js`
- `@adapt-ux/neuro-ux-sdk-utils`

---

## ✅ Build & Test Validation

### Build

- [ ] `nx run-many --target=build --all` passes
- [ ] Individual package builds succeed:
  - [ ] `nx build core`
  - [ ] `nx build signals`
  - [ ] `nx build styles`
  - [ ] `nx build assist`
  - [ ] `nx build neuro-react`
  - [ ] `nx build neuro-vue`
  - [ ] `nx build neuro-angular`
  - [ ] `nx build neuro-svelte`
  - [ ] `nx build neuro-next`
  - [ ] `nx build neuro-js`

### Tests

- [ ] `nx run-many --target=test --all` passes
- [ ] All test suites complete without failures
- [ ] Test coverage is acceptable (if configured)

### TypeScript

- [ ] `nx run-many --target=typecheck --all` passes (if target exists)
- [ ] No TypeScript errors in any package
- [ ] Type definitions compile correctly
- [ ] `.d.ts` files are generated correctly

### Dependencies

- [ ] No circular dependencies detected
- [ ] `nx graph` shows valid dependency graph
- [ ] All workspace dependencies use `workspace:*` syntax

---

## ✅ SSR & Runtime Safety

### Server-Side Rendering

- [ ] No browser APIs (`window`, `document`, `navigator`) accessed during SSR
- [ ] All browser-specific code is properly guarded:
  - [ ] `typeof window !== 'undefined'` checks
  - [ ] Lazy initialization where needed
  - [ ] Dynamic imports for browser-only code

### Next.js Validation

- [ ] Next.js build succeeds: `nx build neuro-next`
- [ ] Server components work correctly
- [ ] Client components are properly marked with `'use client'`
- [ ] No hydration mismatches

### Runtime Safety

- [ ] Safe lazy initialization confirmed
- [ ] Error boundaries in place (for React packages)
- [ ] Graceful degradation for unsupported environments

---

## ✅ Public API Freeze

- [ ] No changes to public exports since API audit
- [ ] All public APIs are marked as `stable` or `experimental` in `docs/api-surface.md`
- [ ] Internal APIs are marked with `@internal` JSDoc tags
- [ ] Experimental APIs are marked with `@experimental` JSDoc tags
- [ ] Breaking changes are documented (none expected for v0.1.0-rc.1)

**Verification:**
- Review `docs/api-surface.md`
- Check git diff for changes to public exports
- Verify JSDoc tags are present

---

## ✅ Documentation Check

### README

- [ ] Main `README.md` is up to date
- [ ] Installation instructions are correct
- [ ] Usage examples compile and work:
  - [ ] React example
  - [ ] Next.js example
  - [ ] Vue example
  - [ ] Angular example
  - [ ] Svelte example
  - [ ] Vanilla JS example

### Architecture Documentation

- [ ] `docs/architecture/ARCHITECTURE.md` matches implementation
- [ ] Package responsibilities are accurately described
- [ ] Diagrams (if any) are up to date

### API Documentation

- [ ] `docs/api-surface.md` is complete
- [ ] All packages are documented
- [ ] Status markers (stable/experimental/internal) are accurate

### Quick Start Validation

Test quick start in each framework:

- [ ] **React**: Quick start works end-to-end
- [ ] **Next.js**: Quick start works end-to-end
- [ ] **Vanilla JS**: Quick start works end-to-end

---

## ✅ Release Metadata

### Changelog

- [ ] `CHANGELOG.md` is prepared
- [ ] All significant changes since last version are documented
- [ ] Format follows [Keep a Changelog](https://keepachangelog.com/) conventions
- [ ] Breaking changes (if any) are clearly marked
- [ ] Migration guides are provided (if needed)

### GitHub Release

- [ ] Draft GitHub Release created
- [ ] Release notes include:
  - [ ] Summary of changes
  - [ ] Installation instructions
  - [ ] Migration notes (if any)
  - [ ] Links to documentation
- [ ] Release tag follows semantic versioning (`v0.1.0-rc.1`)

### Legal & Policy

- [ ] `LICENSE` file is present and correct (MIT)
- [ ] `SECURITY.md` is present and validated
- [ ] `CONTRIBUTING.md` is present and validated
- [ ] `CODE_OF_CONDUCT.md` is present and validated
- [ ] All packages have correct license in `package.json`

---

## ✅ Final Pre-Release Checks

- [ ] All checklist items are completed
- [ ] Code review completed and approved
- [ ] No known blocking bugs
- [ ] No undocumented public APIs
- [ ] First-time user can integrate in <15 minutes (tested)
- [ ] Maintainers confident to tag `v0.1.0-rc.1`

---

## 📝 Release Process

Once all items are checked:

See [Branches and releases](../CONTRIBUTING.md#branches-and-releases) for the branch flow.

1. **Create release branch** from the version's pre-release branch:
   ```bash
   git checkout -b release/0.1.0-rc.1 origin/pre-release/0.1.0-rc.1
   ```

2. **Update versions**:
   - Update all `package.json` files and internal dependencies to `0.1.0-rc.1`
   - Add the `CHANGELOG.md` entry
   - Commit changes: `git commit -m "chore(release): 0.1.0-rc.1"`
   - Open a PR from `release/0.1.0-rc.1` into `main` and merge it with a merge commit

3. **Final verification**:
   ```bash
   npm install
   nx run-many --target=build --all
   nx run-many --target=test --all
   ```

4. **Tag release** on the merge commit in `main`:
   ```bash
   git tag -a v0.1.0-rc.1 -m "Release v0.1.0-rc.1"
   git push origin v0.1.0-rc.1
   ```

5. **Complete the GitHub Release**:
   - The tag triggers `.github/workflows/release.yml`, which creates the release with generated notes
   - Prepend the `CHANGELOG.md` entry to the notes
   - Keep it marked as latest, not as pre-release, so it shows on the repository page

6. **Publish to npm** (if approved), from each `libs/<package>`, dependencies first:
   ```bash
   npm publish --tag rc --access public
   ```

7. **Delete the version's branches** (`pre-release`, `release`, `feat`, `fix`); the tag keeps the history.

---

## 🔄 After Release

- [ ] Update issue tracker
- [ ] Notify team/stakeholders
- [ ] Monitor for issues
- [ ] Prepare for next RC or final release

---

**Last Updated:** [Date]  
**Checked By:** [Name]  
**Status:** ⏳ In Progress
