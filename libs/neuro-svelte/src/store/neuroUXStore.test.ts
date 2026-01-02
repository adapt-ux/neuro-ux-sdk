import { describe, it, expect, vi, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { initNeuroUX, getNeuroUXInstance, signalsStore, uiStateStore, neuroUXState } from './neuroUXStore';

// Mock the createNeuroUX function
vi.mock('@adapt-ux/neuro-core', async () => {
  const actual = await vi.importActual('@adapt-ux/neuro-core');
  return {
    ...actual,
    createNeuroUX: vi.fn(),
  };
});

describe('neuroUXStore', () => {
  let actualCreateNeuroUX: any;
  let mockCreateNeuroUX: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Reset stores
    signalsStore.set({});
    uiStateStore.set({});
    neuroUXState.set({ profile: 'default', signals: {}, ui: {} });

    if (!actualCreateNeuroUX) {
      const mod = await vi.importActual('@adapt-ux/neuro-core');
      actualCreateNeuroUX = (mod as any).createNeuroUX;
    }
    const mod = await import('@adapt-ux/neuro-core');
    mockCreateNeuroUX = vi.mocked(mod.createNeuroUX);
    mockCreateNeuroUX.mockImplementation(actualCreateNeuroUX);
  });

  describe('initNeuroUX', () => {
    it('should create and return NeuroUX instance', async () => {
      const instance = await initNeuroUX({ profile: 'adhd' });

      expect(instance).toBeDefined();
      expect(instance).toHaveProperty('getState');
      expect(mockCreateNeuroUX).toHaveBeenCalledWith({ profile: 'adhd' });
    });

    it('should not initialize twice', async () => {
      await initNeuroUX();
      await initNeuroUX();

      expect(mockCreateNeuroUX).toHaveBeenCalledTimes(1);
    });

    it('should update stores when instance state changes', async () => {
      const instance = await initNeuroUX();
      
      // Trigger state change
      instance.setState({ profile: 'test', signals: { idle: true }, ui: { fontSize: 16 } });

      // Wait a bit for async updates
      await new Promise((resolve) => setTimeout(resolve, 10));

      const state = get(neuroUXState);
      expect(state.profile).toBe('test');
    });
  });

  describe('getNeuroUXInstance', () => {
    it('should throw error if not initialized', () => {
      expect(() => getNeuroUXInstance()).toThrow('NeuroUX not initialized');
    });

    it('should return instance after initialization', async () => {
      await initNeuroUX();
      const instance = getNeuroUXInstance();

      expect(instance).toBeDefined();
    });
  });

  describe('signalsStore', () => {
    it('should have initial empty state', () => {
      const signals = get(signalsStore);
      expect(signals).toEqual({});
    });

    it('should update when signals change', async () => {
      const instance = await initNeuroUX();
      
      // Update signal
      instance.signals.register('idle', false);
      instance.signals.update('idle', true);

      // Wait for async update
      await new Promise((resolve) => setTimeout(resolve, 10));

      const signals = get(signalsStore);
      expect(signals.idle).toBe(true);
    });
  });

  describe('uiStateStore', () => {
    it('should have initial empty state', () => {
      const ui = get(uiStateStore);
      expect(ui).toEqual({});
    });

    it('should update when UI state changes', async () => {
      const instance = await initNeuroUX();
      
      // Update UI
      instance.ui.set('fontSize', 18);

      // Wait for async update
      await new Promise((resolve) => setTimeout(resolve, 10));

      const ui = get(uiStateStore);
      expect(ui.fontSize).toBe(18);
    });
  });

  describe('neuroUXState', () => {
    it('should have initial default state', () => {
      const state = get(neuroUXState);
      expect(state.profile).toBe('default');
      expect(state.signals).toEqual({});
      expect(state.ui).toEqual({});
    });

    it('should update when state changes', async () => {
      const instance = await initNeuroUX();
      
      // Update state
      instance.setState({ profile: 'adhd' });

      // Wait for async update
      await new Promise((resolve) => setTimeout(resolve, 10));

      const state = get(neuroUXState);
      expect(state.profile).toBe('adhd');
    });
  });
});
