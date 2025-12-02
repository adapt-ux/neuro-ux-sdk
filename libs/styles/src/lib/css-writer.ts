import type { Scope, CSSVariables } from './styling-types';

/**
 * Check if we're in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Get the target element for CSS variable injection
 */
function getTargetElement(scope: Scope): HTMLElement | null {
  if (!isBrowser()) {
    return null;
  }

  if (scope === ':root') {
    return document.documentElement;
  }

  // Extract scope ID from [data-neuroux-scope="id"]
  const match = scope.match(/\[data-neuroux-scope="([^"]+)"\]/);
  if (!match) {
    return null;
  }

  const scopeId = match[1];
  return document.querySelector(
    `[data-neuroux-scope="${scopeId}"]`
  ) as HTMLElement | null;
}

/**
 * CSS Writer service
 * Handles writing CSS variables to the DOM with support for global and container scopes
 */
export class CSSWriter {
  private namespace: string;
  private currentScope: Scope;
  private appliedVariables: Map<Scope, Set<string>> = new Map();

  constructor(namespace = 'neuroux', scope: Scope = ':root') {
    this.namespace = namespace;
    this.currentScope = scope;
    this.appliedVariables.set(scope, new Set());
  }

  /**
   * Set the scope for CSS variable injection
   */
  setScope(scope: Scope): void {
    this.currentScope = scope;
    if (!this.appliedVariables.has(scope)) {
      this.appliedVariables.set(scope, new Set());
    }
  }

  /**
   * Get the current scope
   */
  getScope(): Scope {
    return this.currentScope;
  }

  /**
   * Normalize CSS variable name with namespace
   */
  private normalizeVariableName(varName: string): string {
    if (varName.startsWith('--')) {
      // If it already has --, check if it has our namespace
      if (varName.startsWith(`--${this.namespace}-`)) {
        return varName;
      }
      // Has -- but different namespace, replace or add our namespace
      const nameWithoutPrefix = varName.replace(/^--[^-]+-/, '');
      return `--${this.namespace}-${nameWithoutPrefix}`;
    }

    // No -- prefix, add both namespace and prefix
    if (varName.startsWith(`${this.namespace}-`)) {
      return `--${varName}`;
    }

    return `--${this.namespace}-${varName}`;
  }

  /**
   * Write CSS variables to the DOM
   */
  write(variables: CSSVariables, scope?: Scope): void {
    if (!isBrowser()) {
      return;
    }

    const targetScope = scope || this.currentScope;
    const targetElement = getTargetElement(targetScope);

    if (!targetElement) {
      return;
    }

    // Ensure scope tracking exists
    if (!this.appliedVariables.has(targetScope)) {
      this.appliedVariables.set(targetScope, new Set());
    }

    const trackedVars = this.appliedVariables.get(targetScope) as Set<string>;

    // Apply each CSS variable
    Object.entries(variables).forEach(([varName, value]) => {
      const normalizedVar = this.normalizeVariableName(varName);
      targetElement.style.setProperty(normalizedVar, value);
      trackedVars.add(normalizedVar);
    });
  }

  /**
   * Remove CSS variables from the DOM
   */
  remove(variableNames: string[], scope?: Scope): void {
    if (!isBrowser()) {
      return;
    }

    const targetScope = scope || this.currentScope;
    const targetElement = getTargetElement(targetScope);

    if (!targetElement) {
      return;
    }

    const trackedVars = this.appliedVariables.get(targetScope);
    if (!trackedVars) {
      return;
    }

    variableNames.forEach((varName) => {
      const normalizedVar = this.normalizeVariableName(varName);
      targetElement.style.removeProperty(normalizedVar);
      trackedVars.delete(normalizedVar);
    });
  }

  /**
   * Clear all CSS variables for a scope
   */
  clear(scope?: Scope): void {
    if (!isBrowser()) {
      return;
    }

    const targetScope = scope || this.currentScope;
    const targetElement = getTargetElement(targetScope);
    const trackedVars = this.appliedVariables.get(targetScope);

    if (!targetElement || !trackedVars) {
      return;
    }

    // Remove all tracked variables
    trackedVars.forEach((varName) => {
      targetElement.style.removeProperty(varName);
    });

    trackedVars.clear();
  }

  /**
   * Clear all CSS variables across all scopes
   */
  clearAll(): void {
    if (!isBrowser()) {
      return;
    }

    this.appliedVariables.forEach((trackedVars, scope) => {
      const targetElement = getTargetElement(scope);
      if (targetElement) {
        trackedVars.forEach((varName) => {
          targetElement.style.removeProperty(varName);
        });
      }
      trackedVars.clear();
    });
  }

  /**
   * Get all applied variables for a scope
   */
  getAppliedVariables(scope?: Scope): string[] {
    const targetScope = scope || this.currentScope;
    const trackedVars = this.appliedVariables.get(targetScope);
    return trackedVars ? Array.from(trackedVars) : [];
  }
}
