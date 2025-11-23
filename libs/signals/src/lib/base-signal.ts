import { Signal, SignalContext } from './types';

export abstract class BaseSignal implements Signal {
  protected ctx: SignalContext;

  constructor(ctx: SignalContext) {
    this.ctx = ctx;
  }

  abstract start(): void;
  abstract stop(): void;
}
