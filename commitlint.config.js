module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Commit body line length (relaxed for practical use)
    'body-max-line-length': [1, 'always', 100],
    // Allowed types
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation changes
        'style', // Formatting, missing semicolons, etc; no code change
        'refactor', // Production code refactoring
        'perf', // Performance improvement
        'test', // Adding missing tests or fixing existing tests
        'build', // Changes that affect the build system or external dependencies
        'ci', // Changes to CI files and scripts
        'chore', // Other changes that don't modify src or test files
        'revert', // Reverts a previous commit
      ],
    ],
    // Commit message should be lowercase or start with uppercase
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    // Commit subject cannot end with a period
    'subject-full-stop': [2, 'never', '.'],
  },
};
