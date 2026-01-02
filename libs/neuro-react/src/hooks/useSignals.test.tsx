import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useSignals } from './useSignals';
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

describe('useSignals', () => {
  let mockInstance: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await vi.importActual('@adapt-ux/neuro-core');
    const createNeuroUX = (mod as any).createNeuroUX;

    mockInstance = createNeuroUX({});
    
    const mockModule = await import('@adapt-ux/neuro-core');
    vi.mocked(mockModule.createNeuroUX).mockReturnValue(mockInstance);
  });

  it('should return initial signals from state', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NeuroUXProvider>{children}</NeuroUXProvider>
    );

    // Set initial state
    mockInstance.getState = vi.fn(() => ({
      signals: { idle: true, scroll: 0 },
      profile: 'default',
      ui: {},
    }));

    const { result } = renderHook(() => useSignals(), { wrapper });

    await waitFor(() => {
      expect(result.current[0]).toEqual({ idle: true, scroll: 0 });
    });
  });

  it('should return updateSignal function', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NeuroUXProvider>{children}</NeuroUXProvider>
    );

    mockInstance.getState = vi.fn(() => ({ signals: {}, profile: 'default', ui: {} }));
    mockInstance.subscribe = vi.fn(() => () => {});
    mockInstance.on = vi.fn(() => () => {});

    const { result } = renderHook(() => useSignals(), { wrapper });

    await waitFor(() => {
      expect(typeof result.current[1]).toBe('function');
    });

    act(() => {
      result.current[1]('test-signal', 42);
    });

    expect(mockInstance.signals.update).toHaveBeenCalledWith('test-signal', 42);
  });

  it('should update signals when state changes', async () => {
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

    const { result } = renderHook(() => useSignals(), { wrapper });

    await waitFor(() => {
      expect(stateSubscriber).not.toBeNull();
    });

    // Update state
    mockInstance.getState = vi.fn(() => ({
      signals: { idle: true },
      profile: 'default',
      ui: {},
    }));

    act(() => {
      stateSubscriber!();
    });

    await waitFor(() => {
      expect(result.current[0]).toEqual({ idle: true });
    });
  });

  it('should update signals on signal:update event', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NeuroUXProvider>{children}</NeuroUXProvider>
    );

    let eventHandler: ((data: any) => void) | null = null;
    mockInstance.getState = vi.fn(() => ({ signals: {}, profile: 'default', ui: {} }));
    mockInstance.subscribe = vi.fn(() => () => {});
    mockInstance.on = vi.fn((event: string, handler: (data: any) => void) => {
      if (event === 'signal:update') {
        eventHandler = handler;
      }
      return () => {};
    });

    const { result } = renderHook(() => useSignals(), { wrapper });

    await waitFor(() => {
      expect(eventHandler).not.toBeNull();
    });

    act(() => {
      eventHandler!({ name: 'idle', value: true });
    });

    await waitFor(() => {
      expect(result.current[0]).toEqual({ idle: true });
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

    const { unmount } = renderHook(() => useSignals(), { wrapper });

    await waitFor(() => {
      expect(mockInstance.subscribe).toHaveBeenCalled();
    });

    unmount();

    expect(unsubscribeState).toHaveBeenCalled();
    expect(unsubscribeEvent).toHaveBeenCalled();
  });
});
