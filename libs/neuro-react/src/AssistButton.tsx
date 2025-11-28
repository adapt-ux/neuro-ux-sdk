'use client';

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import './register-components';
import type { AssistButtonOptions } from '@adapt-ux/neuro-assist';

export interface AssistButtonProps extends AssistButtonOptions {
  onClick?: () => void;
  className?: string;
}

export interface AssistButtonRef {
  setExpanded: (expanded: boolean) => void;
}

/**
 * AssistButton - React wrapper for the assist-button Web Component
 * Neutral component that opens the assist menu
 * Variants: "floating" (bottom-right) and "inline"
 */
export const AssistButton = forwardRef<AssistButtonRef, AssistButtonProps>(
  ({ variant = 'floating', label, ariaLabel, onClick, className, ...props }, ref) => {
    const buttonRef = useRef<HTMLElement & { setExpanded: (expanded: boolean) => void }>(null);

    useImperativeHandle(ref, () => ({
      setExpanded: (expanded: boolean) => {
        if (buttonRef.current) {
          buttonRef.current.setExpanded(expanded);
        }
      },
    }));

    useEffect(() => {
      const button = buttonRef.current;
      if (!button) return;

      const handleClick = () => {
        onClick?.();
      };

      button.addEventListener('assist:open', handleClick);

      return () => {
        button.removeEventListener('assist:open', handleClick);
      };
    }, [onClick]);

    return (
      <assist-button
        ref={buttonRef}
        variant={variant}
        label={label}
        aria-label={ariaLabel}
        className={className}
        {...props}
      />
    );
  }
);

AssistButton.displayName = 'AssistButton';
