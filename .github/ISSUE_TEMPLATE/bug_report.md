---
name: "🐞 Bug Report"
about: "Report an issue or unexpected behavior"
title: "[BUG]"
labels: bug
---

body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to report a bug!
        Please fill out the information below so we can investigate.

  - type: input
    id: environment
    attributes:
      label: Environment
      description: "Describe your setup (browser, OS, device, framework, versions)"
      placeholder: "Example: Chrome 122 / Windows 11 / React 18"
    validations:
      required: true

  - type: textarea
    id: description
    attributes:
      label: Bug Description
      description: "What happened? What did you expect to happen?"
      placeholder: "A clear and concise description of the bug..."
    validations:
      required: true

  - type: textarea
    id: reproduction
    attributes:
      label: Steps to Reproduce
      description: "List the steps needed to reproduce the issue"
      placeholder: |
        1. Go to...
        2. Click...
        3. Observe error...
    validations:
      required: true

  - type: textarea
    id: logs
    attributes:
      label: Relevant Logs / Console Output
      description: "If available, include logs, stack traces, or warnings"
      render: shell

  - type: dropdown
    id: package
    attributes:
      label: Affected Package(s)
      options:
        - core
        - assist
        - styles
        - signals
        - utils
        - react
        - vue
        - angular
        - svelte
        - js
      multiple: true

  - type: textarea
    id: additional
    attributes:
      label: Additional Context
      placeholder: "Anything else we should know?"
