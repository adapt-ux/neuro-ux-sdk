import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TabHiddenSignal } from './tab-hidden-signal';
import { SignalSnapshot, createSignalSnapshot } from './signal-snapshot';
import { SignalContextImpl } from './signal-context';

function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => state,
  });
}

describe('TabHiddenSignal', () => {
  let snapshot: SignalSnapshot;
  let emitCallback: ReturnType<typeof vi.fn>;
  let signal: TabHiddenSignal;

  beforeEach(() => {
    setVisibility('visible');
    snapshot = createSignalSnapshot();
    emitCallback = vi.fn();
    const context = new SignalContextImpl(
      snapshot,
      emitCallback as (value: unknown) => void
    );
    signal = new TabHiddenSignal(context);
  });

  afterEach(() => {
    signal.stop();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('emits the current visibility state on start', () => {
    signal.start();

    expect(emitCallback).toHaveBeenCalledTimes(1);
    expect(emitCallback).toHaveBeenCalledWith({
      type: 'tabHidden',
      value: false,
    });
  });

  it('emits true when the document becomes hidden', () => {
    signal.start();
    emitCallback.mockClear();

    setVisibility('hidden');
    document.dispatchEvent(new Event('visibilitychange'));

    expect(emitCallback).toHaveBeenCalledWith({
      type: 'tabHidden',
      value: true,
    });
  });

  it('emits false when the document becomes visible again', () => {
    setVisibility('hidden');
    signal.start();
    emitCallback.mockClear();

    setVisibility('visible');
    document.dispatchEvent(new Event('visibilitychange'));

    expect(emitCallback).toHaveBeenCalledWith({
      type: 'tabHidden',
      value: false,
    });
  });

  it('stops emitting after stop()', () => {
    signal.start();
    signal.stop();
    emitCallback.mockClear();

    setVisibility('hidden');
    document.dispatchEvent(new Event('visibilitychange'));

    expect(emitCallback).not.toHaveBeenCalled();
  });

  it('registers the listener only once when start() is called twice', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');

    signal.start();
    signal.start();

    const calls = addSpy.mock.calls.filter(
      ([event]) => event === 'visibilitychange'
    );
    expect(calls).toHaveLength(1);
  });

  it('does nothing when document is not available', () => {
    vi.stubGlobal('document', undefined);

    expect(() => signal.start()).not.toThrow();
    expect(() => signal.stop()).not.toThrow();
    expect(emitCallback).not.toHaveBeenCalled();
  });

  it('updates the snapshot with the emitted value', () => {
    setVisibility('hidden');
    signal.start();

    expect(snapshot.get().tabHidden).toMatchObject({
      type: 'tabHidden',
      value: true,
    });
  });
});
