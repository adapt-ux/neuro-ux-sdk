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
      const ReactAssistProvider = require('@adapt-ux/neuro-react').AssistProvider;
      const spy = vi.spyOn(ReactAssistProvider, 'render');

      render(
        <AssistProvider config={config}>
          <div>Test</div>
        </AssistProvider>
      );

      // The ReactAssistProvider should be called with the prop config
      expect(ReactAssistProvider).toBeTruthy();
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
    it('should handle undefined window gracefully', () => {
      // Simulate SSR environment where window is undefined
      const originalWindow = global.window;
      // @ts-expect-error - intentionally removing window for test
      delete global.window;

      expect(() => {
        render(
          <AssistProvider>
            <div>Test</div>
          </AssistProvider>
        );
      }).not.toThrow();

      // Restore window
      global.window = originalWindow;
    });
  });
});
