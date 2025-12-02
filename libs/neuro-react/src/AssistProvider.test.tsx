import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AssistProvider, NeuroContext } from './AssistProvider';
import type { NeuroUXInstance } from './AssistProvider';
import * as React from 'react';

// Mock the createNeuroUX function - define inside factory to avoid hoisting issues
vi.mock('@adapt-ux/neuro-core', async () => {
  const actual = await vi.importActual('@adapt-ux/neuro-core');
  const mockFn = vi.fn();
  return {
    ...actual,
    createNeuroUX: mockFn,
  };
});

describe('AssistProvider', () => {
  let actualCreateNeuroUX: any;
  let mockCreateNeuroUX: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Get actual implementation and mock function
    if (!actualCreateNeuroUX) {
      const mod = await vi.importActual('@adapt-ux/neuro-core');
      actualCreateNeuroUX = (mod as any).createNeuroUX;
    }
    const mod = await import('@adapt-ux/neuro-core');
    mockCreateNeuroUX = vi.mocked(mod.createNeuroUX);
    // Reset mock to return actual implementation by default
    mockCreateNeuroUX.mockImplementation(actualCreateNeuroUX);
  });

  describe('initialization', () => {
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

    it('should create NeuroUX instance', async () => {
      render(
        <AssistProvider>
          <div>Test</div>
        </AssistProvider>
      );

      await waitFor(() => {
        expect(mockCreateNeuroUX).toHaveBeenCalledTimes(1);
      });
    });

    it('should create NeuroUX instance with config', async () => {
      const config = { profile: 'test-profile' };

      render(
        <AssistProvider config={config}>
          <div>Test</div>
        </AssistProvider>
      );

      await waitFor(() => {
        expect(mockCreateNeuroUX).toHaveBeenCalledWith(config);
      });
    });

    it('should provide NeuroUX instance via context', async () => {
      let contextValue: NeuroUXInstance | null = null;

      const TestComponent = () => {
        contextValue = React.useContext(NeuroContext);
        return <div>Test</div>;
      };

      render(
        <AssistProvider>
          <TestComponent />
        </AssistProvider>
      );

      await waitFor(() => {
        expect(contextValue).toBeTruthy();
        expect(contextValue).toHaveProperty('ui');
        expect(contextValue).toHaveProperty('styling');
        expect(contextValue).toHaveProperty('destroy');
      });
    });
  });

  describe('cleanup', () => {
    it('should destroy NeuroUX instance on unmount', async () => {
      const destroySpy = vi.fn();
      mockCreateNeuroUX.mockReturnValue({
        config: { profile: 'default', signals: [], rules: [] },
        getState: vi.fn(() => ({ profile: 'default', signals: {}, ui: {} })),
        setState: vi.fn(),
        subscribe: vi.fn(() => () => undefined),
        on: vi.fn(() => () => undefined),
        off: vi.fn(),
        emit: vi.fn(),
        signals: {} as any,
        ui: { getAll: () => ({}) } as any,
        styling: { apply: vi.fn() } as any,
        destroy: destroySpy,
      });

      const { unmount } = render(
        <AssistProvider>
          <div>Test</div>
        </AssistProvider>
      );

      // Wait for instance to be created
      await waitFor(() => {
        expect(mockCreateNeuroUX).toHaveBeenCalled();
      });

      unmount();

      // In React StrictMode, effects run twice, so destroy might be called multiple times
      // We just check that it was called at least once
      await waitFor(() => {
        expect(destroySpy).toHaveBeenCalled();
      });
    });
  });

  describe('styling integration', () => {
    it('should apply initial UI state if present', async () => {
      const applySpy = vi.fn();
      const initialUi = { colorMode: 'calm' };

      mockCreateNeuroUX.mockReturnValue({
        config: { profile: 'default', signals: [], rules: [] },
        getState: vi.fn(() => ({
          profile: 'default',
          signals: {},
          ui: initialUi,
        })),
        setState: vi.fn(),
        subscribe: vi.fn(() => () => undefined),
        on: vi.fn(() => () => undefined),
        off: vi.fn(),
        emit: vi.fn(),
        signals: {} as any,
        ui: { getAll: () => initialUi } as any,
        styling: { apply: applySpy } as any,
        destroy: vi.fn(),
      });

      render(
        <AssistProvider>
          <div>Test</div>
        </AssistProvider>
      );

      await waitFor(() => {
        expect(applySpy).toHaveBeenCalledWith(initialUi);
      });
    });

    it('should not apply styling if UI state is empty', async () => {
      const applySpy = vi.fn();

      mockCreateNeuroUX.mockReturnValue({
        config: { profile: 'default', signals: [], rules: [] },
        getState: vi.fn(() => ({ profile: 'default', signals: {}, ui: {} })),
        setState: vi.fn(),
        subscribe: vi.fn(() => () => undefined),
        on: vi.fn(() => () => undefined),
        off: vi.fn(),
        emit: vi.fn(),
        signals: {} as any,
        ui: { getAll: () => ({}) } as any,
        styling: { apply: applySpy } as any,
        destroy: vi.fn(),
      });

      render(
        <AssistProvider>
          <div>Test</div>
        </AssistProvider>
      );

      await waitFor(() => {
        expect(mockCreateNeuroUX).toHaveBeenCalled();
      });

      // Wait a bit to ensure apply is not called
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(applySpy).not.toHaveBeenCalled();
    });
  });
});
