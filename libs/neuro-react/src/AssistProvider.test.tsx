import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    it('should render children', () => {
      render(
        <AssistProvider>
          <div>Test Content</div>
        </AssistProvider>
      );

      expect(screen.getByText('Test Content')).toBeTruthy();
    });

    it('should create NeuroUX instance', () => {
      render(
        <AssistProvider>
          <div>Test</div>
        </AssistProvider>
      );

      expect(mockCreateNeuroUX).toHaveBeenCalledTimes(1);
    });

    it('should create NeuroUX instance with config', () => {
      const config = { profile: 'test-profile' };

      render(
        <AssistProvider config={config}>
          <div>Test</div>
        </AssistProvider>
      );

      expect(mockCreateNeuroUX).toHaveBeenCalledWith(config);
    });

    it('should provide NeuroUX instance via context', () => {
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

      expect(contextValue).toBeTruthy();
      expect(contextValue).toHaveProperty('ui');
      expect(contextValue).toHaveProperty('styling');
      expect(contextValue).toHaveProperty('destroy');
    });
  });

  describe('cleanup', () => {
    it('should destroy NeuroUX instance on unmount', () => {
      const destroySpy = vi.fn();
      mockCreateNeuroUX.mockReturnValue({
        config: { profile: 'default', signals: [], rules: [] },
        getState: vi.fn(() => ({ profile: 'default', signals: {}, ui: {} })),
        setState: vi.fn(),
        subscribe: vi.fn(() => () => {}),
        on: vi.fn(() => () => {}),
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

      unmount();

      expect(destroySpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('styling integration', () => {
    it('should apply initial UI state if present', () => {
      const applySpy = vi.fn();
      const initialUi = { colorMode: 'calm' };

      mockCreateNeuroUX.mockReturnValue({
        config: { profile: 'default', signals: [], rules: [] },
        getState: vi.fn(() => ({ profile: 'default', signals: {}, ui: initialUi })),
        setState: vi.fn(),
        subscribe: vi.fn(() => () => {}),
        on: vi.fn(() => () => {}),
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

      expect(applySpy).toHaveBeenCalledWith(initialUi);
    });

    it('should not apply styling if UI state is empty', () => {
      const applySpy = vi.fn();

      mockCreateNeuroUX.mockReturnValue({
        config: { profile: 'default', signals: [], rules: [] },
        getState: vi.fn(() => ({ profile: 'default', signals: {}, ui: {} })),
        setState: vi.fn(),
        subscribe: vi.fn(() => () => {}),
        on: vi.fn(() => () => {}),
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

      expect(applySpy).not.toHaveBeenCalled();
    });
  });
});
