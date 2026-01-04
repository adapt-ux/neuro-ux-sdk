import { createNeuroUX } from '@adapt-ux/neuro-core';
import {
  SignalManager,
  IdleSignal,
  ScrollSignal,
} from '@adapt-ux/neuro-signals';

interface EventLogItem {
  timestamp: string;
  type: string;
  data: any;
}

class DemoApp {
  private engine: ReturnType<typeof createNeuroUX> | undefined;
  private signalManager: SignalManager | undefined;
  private eventLog: EventLogItem[] = [];
  private maxEvents = 20;

  constructor() {
    this.init();
  }

  private async init() {
    try {
      // Initialize Core Engine with rules
      this.engine = createNeuroUX({
        profile: 'adhd',
        debug: true,
        rules: [
          {
            when: { idle: true },
            apply: { colorMode: 'calm' },
          },
          {
            when: { idle: false },
            apply: { colorMode: 'neutral' },
          },
        ],
      });

      // Register signals in Core Engine first
      this.engine.signals.register('idle', false);
      this.engine.signals.register('scroll', 0);

      // Initialize Signal Manager
      this.signalManager = new SignalManager(
        [IdleSignal, ScrollSignal],
        (value: any) => {
          // Forward to Core Engine signals registry
          if (value && typeof value === 'object' && 'type' in value) {
            const signalName = value.type as string;
            if (signalName === 'idle' && 'value' in value) {
              // Idle signal: update with boolean value
              this.engine?.signals.update('idle', value.value);
            } else if (signalName === 'scroll') {
              // Scroll signal: update with position (number)
              this.engine?.signals.update('scroll', value.position || 0);
            }
          }
          this.addEvent('signal', value);
          this.updateDebugPanel();
        }
      );

      // Subscribe to engine state changes
      this.engine.subscribe((state) => {
        this.addEvent('state-change', state);
        this.updateDebugPanel();
      });

      // Subscribe to UI channel updates to track CSS variables
      this.engine.ui.onUpdate((updates) => {
        this.addEvent('ui-update', updates);
        this.updateDebugPanel();
        this.updateCSSVariables();
      });

      // Subscribe to styling engine updates
      this.engine.styling.onUpdate((cssVars) => {
        this.updateCSSVariables();
      });

      // Setup toggle buttons
      this.setupToggleButtons();

      // Start signals
      this.signalManager.startAll();

      // Initial update
      this.updateDebugPanel();
      this.updateCSSVariables();
      this.updateStatus('Running');

      this.addEvent('init', { message: 'Demo initialized successfully' });
    } catch (error) {
      console.error('Failed to initialize demo:', error);
      this.updateStatus('Error');
      this.addEvent('error', { error: String(error) });
    }
  }

  private updateStatus(status: string) {
    const statusEl = document.getElementById('engine-status');
    if (statusEl) {
      statusEl.textContent = status;
      statusEl.style.color = status === 'Running' ? '#27ae60' : '#e74c3c';
    }
  }

  private updateDebugPanel() {
    try {
      // Update engine state
      const engineState = this.engine.getState();
      const profileEl = document.getElementById('profile');
      if (profileEl) {
        profileEl.textContent = engineState.profile || 'default';
      }

      // Update signal snapshot
      const snapshot = this.signalManager.getSnapshot();
      this.updateSignalDisplay(snapshot);

      // Update UI channel
      const uiStateEl = document.getElementById('ui-state');
      if (uiStateEl) {
        const uiState = JSON.stringify(engineState.ui || {}, null, 2);
        uiStateEl.textContent = uiState === '{}' ? 'No UI state' : uiState;
      }
    } catch (error) {
      console.error('Error updating debug panel:', error);
    }
  }

  private updateCSSVariables() {
    try {
      const cssVarsEl = document.getElementById('css-variables');
      if (!cssVarsEl) return;

      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      const neurouxVars: Array<{ name: string; value: string }> = [];

      // Get all CSS variables that start with --neuroux-
      for (let i = 0; i < computedStyle.length; i++) {
        const prop = computedStyle[i];
        if (prop.startsWith('--neuroux-')) {
          const value = computedStyle.getPropertyValue(prop).trim();
          if (value) {
            neurouxVars.push({ name: prop, value });
          }
        }
      }

      if (neurouxVars.length === 0) {
        cssVarsEl.innerHTML =
          '<p class="css-var-placeholder">No CSS variables applied yet...</p>';
        return;
      }

      cssVarsEl.innerHTML = neurouxVars
        .map(
          (v) => `
        <div class="css-var-item">
          <span class="css-var-name">${v.name}:</span>
          <span class="css-var-value">${v.value}</span>
        </div>
      `
        )
        .join('');
    } catch (error) {
      console.error('Error updating CSS variables display:', error);
    }
  }

  private setupToggleButtons() {
    // Color mode toggles
    const calmBtn = document.getElementById('toggle-color-calm');
    const vibrantBtn = document.getElementById('toggle-color-vibrant');
    const neutralBtn = document.getElementById('toggle-color-neutral');
    const highlightBtn = document.getElementById('toggle-highlight');

    if (calmBtn) {
      calmBtn.addEventListener('click', () => {
        this.engine.ui.set('colorMode', 'calm');
        this.addEvent('toggle', { action: 'colorMode', value: 'calm' });
      });
    }

    if (vibrantBtn) {
      vibrantBtn.addEventListener('click', () => {
        this.engine.ui.set('colorMode', 'vibrant');
        this.addEvent('toggle', { action: 'colorMode', value: 'vibrant' });
      });
    }

    if (neutralBtn) {
      neutralBtn.addEventListener('click', () => {
        this.engine.ui.set('colorMode', 'neutral');
        this.addEvent('toggle', { action: 'colorMode', value: 'neutral' });
      });
    }

    if (highlightBtn) {
      highlightBtn.addEventListener('click', () => {
        const current = this.engine.ui.get('highlight');
        const newValue = !current;
        this.engine.ui.set('highlight', newValue);
        this.addEvent('toggle', { action: 'highlight', value: newValue });
      });
    }
  }

  private updateSignalDisplay(snapshot: any) {
    // Idle state
    const idleEl = document.getElementById('idle-state');
    if (idleEl && snapshot.idle !== undefined) {
      idleEl.textContent = snapshot.idle.value ? 'Idle' : 'Active';
      idleEl.style.color = snapshot.idle.value ? '#e74c3c' : '#27ae60';
    }

    // Scroll state
    const scrollPosEl = document.getElementById('scroll-position');
    if (scrollPosEl && snapshot.scroll) {
      scrollPosEl.textContent = `${snapshot.scroll.position}px`;
    }

    const scrollVelEl = document.getElementById('scroll-velocity');
    if (scrollVelEl && snapshot.scroll) {
      scrollVelEl.textContent = `${snapshot.scroll.velocity} px/s`;
    }

    const scrollDirEl = document.getElementById('scroll-direction');
    if (scrollDirEl && snapshot.scroll) {
      scrollDirEl.textContent = snapshot.scroll.direction;
      scrollDirEl.style.color =
        snapshot.scroll.direction === 'up' ? '#3498db' : '#9b59b6';
    }
  }

  private addEvent(type: string, data: any) {
    const event: EventLogItem = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      data,
    };

    this.eventLog.unshift(event);
    if (this.eventLog.length > this.maxEvents) {
      this.eventLog = this.eventLog.slice(0, this.maxEvents);
    }

    this.updateEventLog();
  }

  private updateEventLog() {
    const logEl = document.getElementById('event-log');
    if (!logEl) return;

    if (this.eventLog.length === 0) {
      logEl.innerHTML = '<p class="event-placeholder">No events yet...</p>';
      return;
    }

    logEl.innerHTML = this.eventLog
      .map((event) => {
        const className =
          event.type === 'error'
            ? 'error'
            : event.type === 'init'
            ? 'success'
            : '';
        const dataStr = JSON.stringify(event.data, null, 2);
        return `
          <div class="event-item ${className}">
            <span class="event-timestamp">${event.timestamp}</span>
            <span class="event-type">[${event.type}]</span>
            <span class="event-data">${this.escapeHtml(dataStr)}</span>
          </div>
        `;
      })
      .join('');
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  public destroy() {
    if (this.signalManager) {
      this.signalManager.stopAll();
    }
    if (this.engine) {
      this.engine.destroy();
    }
  }
}

// Initialize demo when DOM is ready
let demo: DemoApp;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    demo = new DemoApp();
  });
} else {
  demo = new DemoApp();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (demo) {
    demo.destroy();
  }
});
