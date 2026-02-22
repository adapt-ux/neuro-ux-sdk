import { useEffect, useRef } from 'react';
import { useNeuroUX } from '@adapt-ux/neuro-react';
import {
  SignalManager,
  IdleSignal,
  ScrollSignal,
} from '@adapt-ux/neuro-signals';

/**
 * SignalBridge - Connects SignalManager (IdleSignal, ScrollSignal) to NeuroUX Core.
 * Registers signals and forwards updates from behavior detection to the engine.
 */
export function SignalBridge() {
  const neuro = useNeuroUX();
  const signalManagerRef = useRef<SignalManager | null>(null);

  useEffect(() => {
    // Register signals in Core Engine
    neuro.signals.register('idle', false);
    neuro.signals.register('scroll', 0);

    const signalManager = new SignalManager(
      [IdleSignal, ScrollSignal],
      (value: unknown) => {
        if (value && typeof value === 'object' && 'type' in value) {
          const v = value as { type: string; value?: boolean; position?: number };
          if (v.type === 'idle' && 'value' in v && v.value !== undefined) {
            neuro.signals.update('idle', v.value);
          } else if (v.type === 'scroll') {
            neuro.signals.update('scroll', v.position ?? 0);
          }
        }
      }
    );

    signalManagerRef.current = signalManager;
    signalManager.startAll();

    return () => {
      signalManager.stopAll();
      signalManagerRef.current = null;
    };
  }, [neuro]);

  return null;
}
