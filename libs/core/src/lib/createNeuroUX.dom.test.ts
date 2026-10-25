// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createNeuroUX } from './createNeuroUX';

function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => state,
  });
}

function hideTab() {
  setVisibility('hidden');
  document.dispatchEvent(new Event('visibilitychange'));
}

describe('createNeuroUX in the browser', () => {
  let engine: ReturnType<typeof createNeuroUX>;

  beforeEach(() => {
    setVisibility('visible');
  });

  afterEach(() => {
    engine?.destroy();
    document.documentElement.removeAttribute('style');
  });

  describe('tabHidden signal', () => {
    it('registers tabHidden from the current visibility on creation', () => {
      setVisibility('hidden');
      engine = createNeuroUX();

      expect(engine.signals.get('tabHidden')).toBe(true);
      expect(engine.getState().signals.tabHidden).toBe(true);
    });

    it('updates tabHidden when visibility changes', () => {
      engine = createNeuroUX();
      expect(engine.signals.get('tabHidden')).toBe(false);

      hideTab();

      expect(engine.signals.get('tabHidden')).toBe(true);
    });

    it('stops tracking visibility after destroy', () => {
      engine = createNeuroUX();
      engine.destroy();

      hideTab();

      expect(engine.signals.get('tabHidden')).toBe(false);
    });

    it('drives rules from tab visibility', () => {
      engine = createNeuroUX();
      engine.rules.add({
        when: { signal: 'tabHidden', op: '===', value: true },
        apply: { ui: { calmMode: true } },
      });

      hideTab();

      expect(engine.ui.get('calmMode')).toBe(true);
    });
  });

  describe('styling', () => {
    const root = () => document.documentElement.style;

    it('writes CSS variables for rule output', () => {
      engine = createNeuroUX();
      engine.rules.add({
        when: { signal: 'tabHidden', op: '===', value: true },
        apply: { ui: { colorMode: 'calm' } },
      });

      hideTab();

      expect(root().getPropertyValue('--neuroux-color-accent')).toBe('#88aaff');
    });

    it('writes CSS variables for direct UI updates', () => {
      engine = createNeuroUX();

      engine.ui.set('contrast', 'high');

      expect(root().getPropertyValue('--neuroux-contrast-ratio')).toBe('1.5');
    });

    it('does not write CSS for a locked key set by a rule', () => {
      engine = createNeuroUX();
      engine.ui.lock('colorMode');
      engine.rules.add({
        when: { signal: 'tabHidden', op: '===', value: true },
        apply: { ui: { colorMode: 'calm' } },
      });

      hideTab();

      expect(root().getPropertyValue('--neuroux-color-accent')).toBe('');
    });

    it('removes CSS variables on destroy', () => {
      engine = createNeuroUX();
      engine.ui.set('contrast', 'high');

      engine.destroy();

      expect(root().getPropertyValue('--neuroux-contrast-ratio')).toBe('');
    });
  });
});
