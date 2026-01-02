import { BaseSignal } from './base-signal';

/**
 * IdleSignal - Detects user idle state using timeout-based detection
 * 
 * Emits { type: 'idle', value: boolean } signals:
 * - value: true when user becomes idle (no activity for idleTimeout ms)
 * - value: false when user activity is detected
 * 
 * Default idle timeout: 3000ms (3 seconds)
 */
export class IdleSignal extends BaseSignal {
  private idleTimer?: NodeJS.Timeout;
  private isIdle: boolean = false;
  private readonly idleTimeout: number = 3000; // 3 seconds default
  private readonly activityEvents: string[] = [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'click',
  ];

  private activityHandler = () => {
    if (this.isIdle) {
      // User became active
      this.isIdle = false;
      this.ctx.emit({ type: 'idle', value: false });
    }
    this.resetIdleTimer();
  };

  private resetIdleTimer() {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }

    this.idleTimer = setTimeout(() => {
      if (!this.isIdle) {
        this.isIdle = true;
        this.ctx.emit({ type: 'idle', value: true });
      }
    }, this.idleTimeout);
  }

  start() {
    if (typeof window === 'undefined') {
      return;
    }

    // Add event listeners for user activity
    this.activityEvents.forEach((event) => {
      window.addEventListener(event, this.activityHandler, { passive: true });
    });

    // Start the idle timer
    this.resetIdleTimer();
  }

  stop() {
    if (typeof window === 'undefined') {
      return;
    }

    // Remove event listeners
    this.activityEvents.forEach((event) => {
      window.removeEventListener(event, this.activityHandler);
    });

    // Clear idle timer
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = undefined;
    }
  }
}
