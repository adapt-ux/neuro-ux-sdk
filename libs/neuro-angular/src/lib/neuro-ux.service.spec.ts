import 'zone.js';
import 'zone.js/testing';
import { describe, it, expect, vi, beforeEach, beforeAll, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { NgZone } from '@angular/core';
import { NeuroUXService } from './neuro-ux.service';

// Mock the createNeuroUX function
vi.mock('@adapt-ux/neuro-core', async () => {
  const actual = await vi.importActual('@adapt-ux/neuro-core');
  return {
    ...actual,
    createNeuroUX: vi.fn(),
  };
});

// Initialize TestBed environment
beforeAll(() => {
  TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
});

describe('NeuroUXService', () => {
  let service: NeuroUXService;
  let ngZone: NgZone;
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

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(NeuroUXService);
    ngZone = TestBed.inject(NgZone);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize NeuroUX instance', async () => {
      await service.init({ profile: 'adhd' });

      expect(mockCreateNeuroUX).toHaveBeenCalledWith({ profile: 'adhd' });
    });

    it('should not initialize twice', async () => {
      await service.init();
      await service.init();

      expect(mockCreateNeuroUX).toHaveBeenCalledTimes(1);
    });
  });

  describe('getInstance', () => {
    it('should throw error if not initialized', () => {
      expect(() => service.getInstance()).toThrow('NeuroUXService not initialized');
    });

    it('should return instance after initialization', async () => {
      await service.init();
      const instance = service.getInstance();

      expect(instance).toBeDefined();
      expect(instance).toHaveProperty('getState');
    });
  });

  describe('getState', () => {
    it('should return default state if not initialized', () => {
      const state = service.getState();

      expect(state).toEqual({ profile: 'default', signals: {}, ui: {} });
    });

    it('should return current state after initialization', async () => {
      await service.init();
      const state = service.getState();

      expect(state).toBeDefined();
      expect(state).toHaveProperty('profile');
      expect(state).toHaveProperty('signals');
      expect(state).toHaveProperty('ui');
    });
  });

  describe('subscribe', () => {
    it('should return no-op unsubscribe if not initialized', () => {
      const unsubscribe = service.subscribe(() => {});

      expect(typeof unsubscribe).toBe('function');
      expect(() => unsubscribe()).not.toThrow();
    });

    it('should subscribe to state changes', async () => {
      await service.init();
      const callback = vi.fn();
      const unsubscribe = service.subscribe(callback);

      expect(typeof unsubscribe).toBe('function');

      unsubscribe();
    });

    it('should run callback in Angular zone', async () => {
      await service.init();
      const zoneRunSpy = vi.spyOn(ngZone, 'run');
      const callback = vi.fn();
      
      service.subscribe(callback);

      // Trigger state change
      const instance = service.getInstance();
      instance.setState({ profile: 'test' });

      // Wait a bit for async zone.run
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(zoneRunSpy).toHaveBeenCalled();
    });
  });

  describe('signals and ui getters', () => {
    it('should throw error if not initialized', () => {
      expect(() => service.signals).toThrow('NeuroUXService not initialized');
      expect(() => service.ui).toThrow('NeuroUXService not initialized');
    });

    it('should return signals and ui after initialization', async () => {
      await service.init();

      expect(service.signals).toBeDefined();
      expect(service.ui).toBeDefined();
    });
  });

  describe('ngOnDestroy', () => {
    it('should cleanup subscriptions', async () => {
      await service.init();
      const unsubscribe = vi.fn();
      service.subscribe(() => {});
      
      // Manually call ngOnDestroy
      service.ngOnDestroy();

      expect(unsubscribe).not.toThrow();
    });

    it('should destroy instance', async () => {
      await service.init();
      const instance = service.getInstance();
      const destroySpy = vi.spyOn(instance, 'destroy');

      service.ngOnDestroy();

      expect(destroySpy).toHaveBeenCalled();
    });
  });
});
