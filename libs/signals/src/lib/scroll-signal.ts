import { BaseSignal } from './base-signal';

export class ScrollSignal extends BaseSignal {
  handler = () => {
    this.ctx.emit({
      type: 'scroll',
      position: window.scrollY,
    });
  };

  start() {
    window.addEventListener('scroll', this.handler);
  }

  stop() {
    window.removeEventListener('scroll', this.handler);
  }
}
