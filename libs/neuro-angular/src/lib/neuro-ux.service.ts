import { Injectable, OnDestroy, NgZone } from '@angular/core';
import type { NeuroUXConfig } from '@adapt-ux/neuro-core';
import type { createNeuroUX } from '@adapt-ux/neuro-core';

type NeuroUXModule = typeof import('@adapt-ux/neuro-core');
type CreateNeuroUX = NeuroUXModule['createNeuroUX'];
type NeuroUXInstance = ReturnType<CreateNeuroUX>;

/**
 * NeuroUXService - Angular service for NeuroUX Core Engine
 * Injectable service that manages the NeuroUX instance lifecycle
 * Zone-safe and compatible with Angular Change Detection
 */
@Injectable({ providedIn: 'root' })
export class NeuroUXService implements OnDestroy {
  private instance: NeuroUXInstance | null = null;
  private stateSubscriptions: Array<() => void> = [];

  constructor(private ngZone: NgZone) {}

  /**
   * Initialize the NeuroUX engine with configuration
   * Should be called in app initialization (e.g., APP_INITIALIZER)
   */
  async init(config?: NeuroUXConfig): Promise<void> {
    if (this.instance) {
      return;
    }

    const module = await import('@adapt-ux/neuro-core');
    this.instance = module.createNeuroUX(config);
  }

  /**
   * Get the NeuroUX instance
   * @throws Error if instance is not initialized
   */
  getInstance(): NeuroUXInstance {
    if (!this.instance) {
      throw new Error('NeuroUXService not initialized. Call init() first.');
    }
    return this.instance;
  }

  /**
   * Get current engine state (zone-safe)
   */
  getState() {
    if (!this.instance) {
      return { profile: 'default', signals: {}, ui: {} };
    }
    return this.instance.getState();
  }

  /**
   * Subscribe to state changes (zone-safe)
   * Automatically runs change detection when state changes
   */
  subscribe(callback: (state: any) => void): () => void {
    if (!this.instance) {
      return () => {};
    }

    const unsubscribe = this.instance.subscribe((state) => {
      // Run callback inside Angular zone for change detection
      this.ngZone.run(() => {
        callback(state);
      });
    });

    this.stateSubscriptions.push(unsubscribe);
    return unsubscribe;
  }

  /**
   * Get signals registry
   */
  get signals() {
    if (!this.instance) {
      throw new Error('NeuroUXService not initialized');
    }
    return this.instance.signals;
  }

  /**
   * Get UI channel
   */
  get ui() {
    if (!this.instance) {
      throw new Error('NeuroUXService not initialized');
    }
    return this.instance.ui;
  }

  /**
   * Cleanup and destroy the NeuroUX instance
   */
  ngOnDestroy(): void {
    this.stateSubscriptions.forEach((unsubscribe) => unsubscribe());
    this.stateSubscriptions = [];

    if (this.instance) {
      this.instance.destroy();
      this.instance = null;
    }
  }
}
