import { BaseSignal } from './base-signal';

export class IdleSignal extends BaseSignal {
  private timer?: NodeJS.Timeout;

  start() {
    this.timer = setInterval(() => {
      this.ctx.emit({ type: 'idle', ts: Date.now() });
    }, 5000);
  }

  stop() {
    clearInterval(this.timer);
  }
}
