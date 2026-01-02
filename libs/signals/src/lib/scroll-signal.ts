import { BaseSignal } from './base-signal';

/**
 * ScrollSignal - Detects scroll position and calculates scroll velocity
 * 
 * Emits { type: 'scroll', position: number, velocity: number, direction: 'up' | 'down' } signals
 * - position: Current scroll position (window.scrollY)
 * - velocity: Scroll velocity in pixels per second
 * - direction: Scroll direction ('up' or 'down')
 */
export class ScrollSignal extends BaseSignal {
  private lastPosition: number = 0;
  private lastTime: number = 0;
  private rafId?: number;

  handler = () => {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }

    this.rafId = requestAnimationFrame(() => {
      const currentTime = Date.now();
      const currentPosition = window.scrollY;

      // Calculate velocity
      let velocity = 0;
      let direction: 'up' | 'down' = 'down';

      if (this.lastTime > 0) {
        const timeDelta = (currentTime - this.lastTime) / 1000; // Convert to seconds
        const positionDelta = currentPosition - this.lastPosition;

        if (timeDelta > 0) {
          velocity = Math.abs(positionDelta / timeDelta);
        }

        direction = positionDelta >= 0 ? 'down' : 'up';
      }

      this.ctx.emit({
        type: 'scroll',
        position: currentPosition,
        velocity: Math.round(velocity * 10) / 10, // Round to 1 decimal place
        direction,
      });

      this.lastPosition = currentPosition;
      this.lastTime = currentTime;
      this.rafId = undefined;
    });
  };

  start() {
    if (typeof window === 'undefined') {
      return;
    }

    // Initialize position and time
    this.lastPosition = window.scrollY;
    this.lastTime = Date.now();

    window.addEventListener('scroll', this.handler, { passive: true });
  }

  stop() {
    if (typeof window === 'undefined') {
      return;
    }

    window.removeEventListener('scroll', this.handler);

    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = undefined;
    }
  }
}
