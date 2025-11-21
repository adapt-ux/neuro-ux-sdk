name: "❓ Question"
description: "Ask a question about usage, design, or architecture"
title: "[QUESTION] "
labels: ["question"]
assignees: []

body:
  - type: markdown
    attributes:
      value: |
        Have a question?  
        We're happy to help! Please include as much detail as possible.

  - type: textarea
    id: question
    attributes:
      label: Your Question
      placeholder: "Describe what you want to understand..."
    validations:
      required: true

  - type: textarea
    id: context
    attributes:
      label: Context
      description: "Why are you asking? What are you trying to accomplish?"
      placeholder: "Explain your use case or project context..."

  - type: dropdown
    id: package
    attributes:
      label: Related Package(s)
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
      label: Additional Info
      placeholder: "Links, screenshots, code samples, or anything else helpful."
