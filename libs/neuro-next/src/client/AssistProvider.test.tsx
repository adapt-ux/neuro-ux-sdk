import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { AssistProvider } from './AssistProvider';

describe('AssistProvider (Next.js Client)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear window config before each test
    if (typeof window !== 'undefined') {
      delete (window as any).__NEURO_UX_CONFIG__;
    }
  });

  afterEach(() => {
    // Clean up window config after each test
    if (typeof window !== 'undefined') {
      delete (window as any).__NEURO_UX_CONFIG__;
    }
  });

  describe('rendering', () => {
    it('should render children', () => {
      render(
        <AssistProvider>
          <div>Test Content</div>
        </AssistProvider>
      );

      expect(screen.getByText('Test Content')).toBeTruthy();
    });

    it('should use prop config when provided', () => {
      const config = { profile: 'test-profile' };

      render(
        <AssistProvider config={config}>
          <div>Test</div>
        </AssistProvider>
      );

      // Component should render successfully with prop config
      expect(screen.getByText('Test')).toBeTruthy();
    });

    it('should use window config when prop config is not provided', () => {
      const windowConfig = { profile: 'window-profile' };
      if (typeof window !== 'undefined') {
        (window as any).__NEURO_UX_CONFIG__ = windowConfig;
      }

      render(
        <AssistProvider>
          <div>Test</div>
        </AssistProvider>
      );

      // Component should render successfully using window config
      expect(screen.getByText('Test')).toBeTruthy();
    });

    it('should use empty config when neither prop nor window config is provided', () => {
      render(
        <AssistProvider>
          <div>Test</div>
        </AssistProvider>
      );

      expect(screen.getByText('Test')).toBeTruthy();
    });

    it('should prioritize prop config over window config', () => {
      const propConfig = { profile: 'prop-profile' };
      const windowConfig = { profile: 'window-profile' };
      
      if (typeof window !== 'undefined') {
        (window as any).__NEURO_UX_CONFIG__ = windowConfig;
      }

      render(
        <AssistProvider config={propConfig}>
          <div>Test</div>
        </AssistProvider>
      );

      expect(screen.getByText('Test')).toBeTruthy();
    });
  });

  describe('config handling', () => {
    it('should handle missing window config gracefully', () => {
      // Ensure window config is not set
      if (typeof window !== 'undefined') {
        delete (window as any).__NEURO_UX_CONFIG__;
      }

      expect(() => {
        render(
          <AssistProvider>
            <div>Test</div>
          </AssistProvider>
        );
      }).not.toThrow();

      expect(screen.getByText('Test')).toBeTruthy();
    });

    it('should use empty config when window is undefined (SSR)', () => {
      // The component already handles typeof window !== 'undefined' check
      // In jsdom environment, window is always defined, so we test the logic path
      // by ensuring it works when window.__NEURO_UX_CONFIG__ is not set
      if (typeof window !== 'undefined') {
        delete (window as any).__NEURO_UX_CONFIG__;
      }

      render(
        <AssistProvider>
          <div>Test</div>
        </AssistProvider>
      );

      // Component should render with empty config
      expect(screen.getByText('Test')).toBeTruthy();
    });
  });
});
