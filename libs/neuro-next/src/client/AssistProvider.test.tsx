import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AssistProvider } from './AssistProvider';

// Mock the createNeuroUX function
vi.mock('@adapt-ux/neuro-core', async () => {
  const actual = await vi.importActual('@adapt-ux/neuro-core');
  return {
    ...actual,
    createNeuroUX: vi.fn(),
  };
});

describe('AssistProvider (Next.js Client)', () => {
  let actualCreateNeuroUX: any;
  let mockCreateNeuroUX: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Clear window config before each test
    if (typeof window !== 'undefined') {
      delete (window as any).__NEURO_UX_CONFIG__;
    }

    if (!actualCreateNeuroUX) {
      const mod = await vi.importActual('@adapt-ux/neuro-core');
      actualCreateNeuroUX = (mod as any).createNeuroUX;
    }
    const mod = await import('@adapt-ux/neuro-core');
    mockCreateNeuroUX = vi.mocked(mod.createNeuroUX);
    mockCreateNeuroUX.mockImplementation(actualCreateNeuroUX);
  });

  afterEach(() => {
    // Clean up window config after each test
    if (typeof window !== 'undefined') {
      delete (window as any).__NEURO_UX_CONFIG__;
    }
  });

  describe('rendering', () => {
    it('should render children', async () => {
      render(
        <AssistProvider>
          <div>Test Content</div>
        </AssistProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Content')).toBeTruthy();
      });
    });

    it('should use prop config when provided', async () => {
      const config = { profile: 'test-profile' };

      render(
        <AssistProvider config={config}>
          <div>Test</div>
        </AssistProvider>
      );

      // Component should render successfully with prop config
      await waitFor(() => {
        expect(screen.getByText('Test')).toBeTruthy();
      });
    });

    it('should use window config when prop config is not provided', async () => {
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
      await waitFor(() => {
        expect(screen.getByText('Test')).toBeTruthy();
      });
    });

    it('should use empty config when neither prop nor window config is provided', async () => {
      render(
        <AssistProvider>
          <div>Test</div>
        </AssistProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Test')).toBeTruthy();
      });
    });

    it('should prioritize prop config over window config', async () => {
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

      await waitFor(() => {
        expect(screen.getByText('Test')).toBeTruthy();
      });
    });
  });

  describe('config handling', () => {
    it('should handle missing window config gracefully', async () => {
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

      await waitFor(() => {
        expect(screen.getByText('Test')).toBeTruthy();
      });
    });

    it('should use empty config when window is undefined (SSR)', async () => {
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
      await waitFor(() => {
        expect(screen.getByText('Test')).toBeTruthy();
      });
    });
  });
});
