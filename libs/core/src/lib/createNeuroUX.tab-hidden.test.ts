import { describe, it, expect, vi, beforeEach } from 'vitest';

const captured = vi.hoisted(() => ({
  emit: null as ((value: unknown) => void) | null,
}));

vi.mock('@adapt-ux/neuro-ux-sdk-signals', () => ({
  TabHiddenSignal: class {
    constructor(ctx: { emit(value: unknown): void }) {
      captured.emit = (value) => ctx.emit(value);
    }
    start() {
      // Emissions are driven by the test through captured.emit
    }
    stop() {
      // No listeners to remove in the mock
    }
  },
}));

import { createNeuroUX } from './createNeuroUX';

describe('createNeuroUX - tabHidden signal context', () => {
  beforeEach(() => {
    captured.emit = null;
  });

  it('writes boolean tabHidden values to the signals registry', () => {
    const engine = createNeuroUX();

    captured.emit?.({ type: 'tabHidden', value: true });
    expect(engine.signals.get('tabHidden')).toBe(true);
    expect(engine.getState().signals.tabHidden).toBe(true);

    captured.emit?.({ type: 'tabHidden', value: false });
    expect(engine.signals.get('tabHidden')).toBe(false);
  });

  it.each([
    [{ type: 'tabHidden', value: 'yes' }],
    [{ type: 'tabHidden', value: 1 }],
    [{ type: 'tabHidden' }],
    [{ type: 'other', value: true }],
    [null],
    ['tabHidden'],
  ])('ignores invalid emission %j without throwing', (payload) => {
    const engine = createNeuroUX();

    expect(() => captured.emit?.(payload)).not.toThrow();
    expect(engine.signals.get('tabHidden')).toBeUndefined();
  });
});
