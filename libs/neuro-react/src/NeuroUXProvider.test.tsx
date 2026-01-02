import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { NeuroUXProvider, NeuroUXContext } from './NeuroUXProvider';
import type { NeuroUXInstance } from './NeuroUXProvider';
import * as React from 'react';

// Mock the createNeuroUX function
vi.mock('@adapt-ux/neuro-core', async () => {
  const actual = await vi.importActual('@adapt-ux/neuro-core');
  return {
    ...actual,
    createNeuroUX: vi.fn(),
  };
});

describe('NeuroUXProvider', () => {
  let actualCreateNeuroUX: any;
  let mockCreateNeuroUX: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    if (!actualCreateNeuroUX) {
      const mod = await vi.importActual('@adapt-ux/neuro-core');
      actualCreateNeuroUX = (mod as any).createNeuroUX;
    }
    const mod = await import('@adapt-ux/neuro-core');
    mockCreateNeuroUX = vi.mocked(mod.createNeuroUX);
    mockCreateNeuroUX.mockImplementation(actualCreateNeuroUX);
  });

  describe('initialization', () => {
    it('should render children', async () => {
      render(
        <NeuroUXProvider>
          <div>Test Content</div>
        </NeuroUXProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Content')).toBeTruthy();
      });
    });

    it('should create NeuroUX instance', async () => {
      render(
        <NeuroUXProvider>
          <div>Test</div>
        </NeuroUXProvider>
      );

      await waitFor(() => {
        expect(mockCreateNeuroUX).toHaveBeenCalled();
      });
    });

    it('should create NeuroUX instance with config', async () => {
      const config = { profile: 'adhd', debug: true };

      render(
        <NeuroUXProvider config={config}>
          <div>Test</div>
        </NeuroUXProvider>
      );

      await waitFor(() => {
        expect(mockCreateNeuroUX).toHaveBeenCalledWith(config);
      });
    });

    it('should provide NeuroUX instance via context', async () => {
      let contextValue: NeuroUXInstance | null = null;

      function TestComponent() {
        contextValue = React.useContext(NeuroUXContext);
        return <div>Test</div>;
      }

      render(
        <NeuroUXProvider>
          <TestComponent />
        </NeuroUXProvider>
      );

      await waitFor(() => {
        expect(contextValue).not.toBeNull();
        expect(contextValue).toHaveProperty('getState');
        expect(contextValue).toHaveProperty('signals');
        expect(contextValue).toHaveProperty('ui');
      });
    });
  });

  describe('cleanup', () => {
    it('should destroy instance on unmount', async () => {
      let instance: NeuroUXInstance | null = null;
      mockCreateNeuroUX.mockImplementation((config: any) => {
        instance = actualCreateNeuroUX(config);
        const destroySpy = vi.fn();
        instance.destroy = destroySpy;
        return instance;
      });

      const { unmount } = render(
        <NeuroUXProvider>
          <div>Test</div>
        </NeuroUXProvider>
      );

      await waitFor(() => {
        expect(instance).not.toBeNull();
      });

      unmount();

      await waitFor(() => {
        expect(instance?.destroy).toHaveBeenCalled();
      });
    });
  });
});
