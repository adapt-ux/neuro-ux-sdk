/**
 * TypeScript declarations for Web Components used in React
 */

import type { AssistButtonOptions } from '@adapt-ux/neuro-assist';
import type { AssistMenuOptions } from '@adapt-ux/neuro-assist';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'assist-button': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & AssistButtonOptions,
        HTMLElement
      >;
      'assist-menu': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & AssistMenuOptions & { open?: string },
        HTMLElement
      >;
    }
  }
}

export {};
