import { describe, it, expect, vi } from 'vitest';
import { createNeuroUX } from './createNeuroUX';
import type { Rule } from './rule-processor';

const calmWhenHidden: Rule = {
  when: { signal: 'tabHidden', op: '===', value: true },
  apply: { ui: { calmMode: true } },
};

function setTabHidden(
  engine: ReturnType<typeof createNeuroUX>,
  value: boolean
) {
  if (engine.signals.get('tabHidden') === undefined) {
    engine.signals.register('tabHidden', value);
  }
  engine.signals.update('tabHidden', value);
}

describe('createNeuroUX - tabHidden signal without document', () => {
  it('does not register tabHidden when document is unavailable', () => {
    const engine = createNeuroUX();

    expect(engine.signals.get('tabHidden')).toBeUndefined();
    expect(engine.getState().signals).toEqual({});
    engine.destroy();
  });
});

describe('createNeuroUX - runtime rules', () => {
  it('returns a non-empty id when adding a valid rule', () => {
    const engine = createNeuroUX();

    const id = engine.rules.add(calmWhenHidden);

    expect(typeof id).toBe('string');
    expect(id).not.toBe('');
    expect(engine.rules.list()).toEqual([{ id, rule: calmWhenHidden }]);
  });

  it('applies a runtime rule on the next evaluation', () => {
    const engine = createNeuroUX();
    engine.rules.add(calmWhenHidden);

    setTabHidden(engine, true);

    expect(engine.ui.get('calmMode')).toBe(true);
  });

  it('applies a runtime rule immediately when its condition already holds', () => {
    const engine = createNeuroUX();
    setTabHidden(engine, true);

    engine.rules.add(calmWhenHidden);

    expect(engine.ui.get('calmMode')).toBe(true);
  });

  it('stops applying a rule after it is removed', () => {
    const engine = createNeuroUX();
    const id = engine.rules.add(calmWhenHidden) as string;
    setTabHidden(engine, true);

    expect(engine.rules.remove(id)).toBe(true);
    engine.ui.set('calmMode', false);
    setTabHidden(engine, false);
    setTabHidden(engine, true);

    expect(engine.ui.get('calmMode')).toBe(false);
    expect(engine.rules.list()).toEqual([]);
  });

  it('returns false when removing an unknown id', () => {
    const engine = createNeuroUX();

    expect(engine.rules.remove('does-not-exist')).toBe(false);
  });

  it.each([
    [{ when: {} }],
    [null],
    ['rule'],
    [{ when: { signal: 'a', op: '~=', value: 1 }, apply: { ui: {} } }],
    [{ when: { signal: '', op: '===', value: 1 }, apply: { ui: {} } }],
    [{ when: { signal: 'a', op: '===', value: {} }, apply: { ui: {} } }],
    [{ when: { signal: 'a', op: '===', value: 1 }, apply: {} }],
    [{ and: 'not-an-array' }],
    [{ or: [{ when: {} }] }],
  ])('returns null and keeps the list unchanged for invalid rule %j', (rule) => {
    const engine = createNeuroUX();

    expect(engine.rules.add(rule as unknown as Rule)).toBeNull();
    expect(engine.rules.list()).toHaveLength(0);
  });

  it('accepts valid AND and OR groups', () => {
    const engine = createNeuroUX();

    expect(engine.rules.add({ and: [calmWhenHidden] })).not.toBeNull();
    expect(engine.rules.add({ or: [calmWhenHidden] })).not.toBeNull();
    expect(engine.rules.list()).toHaveLength(2);
  });

  it('returns shallow copies from list()', () => {
    const engine = createNeuroUX();
    engine.rules.add(calmWhenHidden);

    const [entry] = engine.rules.list();

    expect(entry.rule).toEqual(calmWhenHidden);
    expect(entry.rule).not.toBe(calmWhenHidden);
  });

  it('lets a runtime rule win over a config rule on the same key', () => {
    const engine = createNeuroUX({
      rules: [
        {
          when: { signal: 'tabHidden', op: '===', value: true },
          apply: { ui: { calmMode: 'config' } },
        },
      ],
    });
    engine.rules.add({
      when: { signal: 'tabHidden', op: '===', value: true },
      apply: { ui: { calmMode: 'runtime' } },
    });

    setTabHidden(engine, true);

    expect(engine.ui.get('calmMode')).toBe('runtime');
  });
});

describe('createNeuroUX - UI locks', () => {
  it('reports lock state and tolerates unknown keys', () => {
    const engine = createNeuroUX();

    expect(engine.ui.isLocked('calmMode')).toBe(false);
    expect(() => engine.ui.unlock('never-locked')).not.toThrow();

    engine.ui.lock('calmMode');
    expect(engine.ui.isLocked('calmMode')).toBe(true);

    engine.ui.unlock('calmMode');
    expect(engine.ui.isLocked('calmMode')).toBe(false);
  });

  it('does not let rules overwrite a locked key', () => {
    const engine = createNeuroUX();
    engine.rules.add(calmWhenHidden);
    engine.ui.lock('calmMode');
    engine.ui.set('calmMode', false);

    setTabHidden(engine, true);

    expect(engine.ui.get('calmMode')).toBe(false);
  });

  it('still allows direct set on a locked key', () => {
    const engine = createNeuroUX();
    engine.ui.lock('calmMode');

    engine.ui.set('calmMode', 'manual');

    expect(engine.ui.get('calmMode')).toBe('manual');
  });

  it('lets rules write the key again after unlock', () => {
    const engine = createNeuroUX();
    engine.rules.add(calmWhenHidden);
    engine.ui.lock('calmMode');
    engine.ui.set('calmMode', false);
    setTabHidden(engine, true);

    engine.ui.unlock('calmMode');
    engine.setState({});

    expect(engine.ui.get('calmMode')).toBe(true);
  });
});

describe('createNeuroUX - styling engine', () => {
  it('exposes the real styling engine API', () => {
    const engine = createNeuroUX();

    expect(typeof engine.styling.apply).toBe('function');
    expect(typeof engine.styling.reset).toBe('function');
    expect(typeof engine.styling.destroy).toBe('function');
  });

  it('passes rule output to styling.apply', () => {
    const engine = createNeuroUX();
    const applySpy = vi.spyOn(engine.styling, 'apply');
    engine.rules.add(calmWhenHidden);

    setTabHidden(engine, true);

    expect(applySpy).toHaveBeenCalledWith(
      expect.objectContaining({ calmMode: true })
    );
  });

  it('omits locked keys from the object passed to styling.apply', () => {
    const engine = createNeuroUX();
    const applySpy = vi.spyOn(engine.styling, 'apply');
    engine.rules.add({
      when: { signal: 'tabHidden', op: '===', value: true },
      apply: { ui: { calmMode: true, colorMode: 'calm' } },
    });
    engine.ui.lock('calmMode');

    setTabHidden(engine, true);

    expect(applySpy).toHaveBeenCalled();
    applySpy.mock.calls.forEach(([output]) => {
      expect(output).not.toHaveProperty('calmMode');
    });
  });

  it('does not call styling.apply when rule output is empty', () => {
    const engine = createNeuroUX();
    const applySpy = vi.spyOn(engine.styling, 'apply');

    setTabHidden(engine, true);

    expect(applySpy).not.toHaveBeenCalled();
  });

  it('calls styling.destroy once even when destroy is called twice', () => {
    const engine = createNeuroUX();
    const destroySpy = vi.spyOn(engine.styling, 'destroy');
    const destroyHandler = vi.fn();
    engine.on('destroy', destroyHandler);

    engine.destroy();
    engine.destroy();

    expect(destroySpy).toHaveBeenCalledTimes(1);
    expect(destroyHandler).toHaveBeenCalledTimes(1);
  });

  it('does not throw when applying without a document', () => {
    const engine = createNeuroUX();

    expect(() => engine.styling.apply({ colorMode: 'calm' })).not.toThrow();
  });
});
