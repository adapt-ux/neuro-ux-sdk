import { BaseSignal } from './base-signal';

/**
 * TabHiddenSignal - Detects when the page is hidden (tab switched, window minimized)
 *
 * Emits { type: 'tabHidden', value: boolean } signals:
 * - value: true when document.visibilityState is not 'visible'
 * - value: false when the page becomes visible again
 *
 * Emits the current state immediately on start().
 */
export class TabHiddenSignal extends BaseSignal {
  private listening = false;

  private visibilityHandler = () => {
    this.emitCurrentState();
  };

  private emitCurrentState() {
    this.ctx.emit({
      type: 'tabHidden',
      value: document.visibilityState !== 'visible',
    });
  }

  start() {
    if (typeof document === 'undefined' || this.listening) {
      return;
    }

    document.addEventListener('visibilitychange', this.visibilityHandler);
    this.listening = true;
    this.emitCurrentState();
  }

  stop() {
    if (typeof document === 'undefined' || !this.listening) {
      return;
    }

    document.removeEventListener('visibilitychange', this.visibilityHandler);
    this.listening = false;
  }
}
