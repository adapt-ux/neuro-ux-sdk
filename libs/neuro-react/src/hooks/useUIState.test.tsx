import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useUIState } from './useUIState';
import { NeuroUXProvider } from '../NeuroUXProvider';
import * as React from 'react';

// Mock the createNeuroUX function
vi.mock('@adapt-ux/neuro-core', async () => {
  const actual = await vi.importActual('@adapt-ux/neuro-core');
  return {
    ...actual,
    createNeuroUX: vi.fn(),
  };
});

describe('useUIState', () => {
  let mockInstance: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await vi.importActual('@adapt-ux/neuro-core');
    const createNeuroUX = (mod as any).createNeuroUX;

    mockInstance = createNeuroUX({});
    
    const mockModule = await import('@adapt-ux/neuro-core');
    vi.mocked(mockModule.createNeuroUX).mockReturnValue(mockInstance);
  });

  it('should return initial UI state from state', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NeuroUXProvider>{children}</NeuroUXProvider>
    );

    mockInstance.getState = vi.fn(() => ({
      signals: {},
      profile: 'default',
      ui: { fontSize: 16, calmMode: true },
    }));

    const { result } = renderHook(() => useUIState(), { wrapper });

    await waitFor(() => {
      expect(result.current).toEqual({ fontSize: 16, calmMode: true });
    });
  });

  it('should update UI state when state changes', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NeuroUXProvider>{children}</NeuroUXProvider>
    );

    let stateSubscriber: (() => void) | null = null;
    mockInstance.getState = vi.fn(() => ({ signals: {}, profile: 'default', ui: {} }));
    mockInstance.subscribe = vi.fn((fn: () => void) => {
      stateSubscriber = fn;
      return () => {};
    });
    mockInstance.on = vi.fn(() => () => {});

    const { result } = renderHook(() => useUIState(), { wrapper });

    await waitFor(() => {
      expect(stateSubscriber).not.toBeNull();
    });

    // Update state
    mockInstance.getState = vi.fn(() => ({
      signals: {},
      profile: 'default',
      ui: { fontSize: 18 },
    }));

    act(() => {
      stateSubscriber!();
    });

    await waitFor(() => {
      expect(result.current).toEqual({ fontSize: 18 });
    });
  });

  it('should update UI state on ui:update event', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NeuroUXProvider>{children}</NeuroUXProvider>
    );

    let eventHandler: ((updates: any) => void) | null = null;
    mockInstance.getState = vi.fn(() => ({ signals: {}, profile: 'default', ui: {} }));
    mockInstance.subscribe = vi.fn(() => () => {});
    mockInstance.on = vi.fn((event: string, handler: (updates: any) => void) => {
      if (event === 'ui:update') {
        eventHandler = handler;
      }
      return () => {};
    });

    const { result } = renderHook(() => useUIState(), { wrapper });

    await waitFor(() => {
      expect(eventHandler).not.toBeNull();
    });

    act(() => {
      eventHandler!({ fontSize: 20 });
    });

    await waitFor(() => {
      expect(result.current).toEqual({ fontSize: 20 });
    });
  });

  it('should cleanup subscriptions on unmount', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NeuroUXProvider>{children}</NeuroUXProvider>
    );

    const unsubscribeState = vi.fn();
    const unsubscribeEvent = vi.fn();

    mockInstance.getState = vi.fn(() => ({ signals: {}, profile: 'default', ui: {} }));
    mockInstance.subscribe = vi.fn(() => unsubscribeState);
    mockInstance.on = vi.fn(() => unsubscribeEvent);

    const { unmount } = renderHook(() => useUIState(), { wrapper });

    await waitFor(() => {
      expect(mockInstance.subscribe).toHaveBeenCalled();
    });

    unmount();

    expect(unsubscribeState).toHaveBeenCalled();
    expect(unsubscribeEvent).toHaveBeenCalled();
  });
});
