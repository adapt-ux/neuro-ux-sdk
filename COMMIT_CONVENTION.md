# 📝 Commit Convention

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification to standardize commit messages.

## Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

## Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Formatting, missing semicolons, etc; no code change
- **refactor**: Production code refactoring
- **perf**: Performance improvement
- **test**: Adding missing tests or fixing existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to CI files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

## Examples

### Simple commit
```bash
git commit -m "feat: add Button component"
```

### Commit with scope
```bash
git commit -m "feat(react): add Button component to React package"
```

### Commit with body
```bash
git commit -m "fix: fix rendering bug in Card component

Fixes issue where Card component was not rendering correctly
when used inside a flex container."
```

### Commit with multiple paragraphs and footer
```bash
git commit -m "feat: add support for custom themes

Allows users to define custom themes through
custom CSS properties.

BREAKING CHANGE: The `theme` property has been removed in favor
of `customTheme` for better clarity."
```

## Validation

Commits are automatically validated using **commitlint** and **husky** before being accepted.

### Manual testing

```bash
# Test commit message without committing
echo "feat: my new feature" | npx commitlint
```

## Common Errors

❌ **Error**: `subject may not be empty`
- **Solution**: Add a descriptive subject after the type

❌ **Error**: `type must be one of [feat, fix, docs...]`
- **Solution**: Use one of the allowed types listed above

❌ **Error**: `subject must not be sentence-case`
- **Solution**: Use lowercase in the subject (e.g., "add" not "Add")

## Tips

- Use imperative mood ("add" instead of "added" or "adding")
- Keep the subject short (maximum 72 characters)
- Use the body to explain the "what" and "why", not the "how"
- Mention related issues and PRs in the footer (e.g., `Closes #123`)
