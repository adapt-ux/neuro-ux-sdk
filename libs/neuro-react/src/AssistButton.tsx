'use client';

import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import type { AssistButtonOptions } from '@adapt-ux/neuro-assist';

export interface AssistButtonProps extends AssistButtonOptions {
  onClick?: () => void;
  className?: string;
}

export interface AssistButtonRef {
  setExpanded: (expanded: boolean) => void;
}

/**
 * AssistButton - React component for assist menu trigger
 * Neutral component that opens the assist menu
 * Variants: "floating" (bottom-right) and "inline"
 */
export const AssistButton = forwardRef<AssistButtonRef, AssistButtonProps>(
  (
    { variant = 'floating', label = '⚙️', ariaLabel = 'Open assist menu', onClick, className, ...props },
    ref
  ) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    useImperativeHandle(ref, () => ({
      setExpanded: (expanded: boolean) => {
        setIsExpanded(expanded);
        if (buttonRef.current) {
          buttonRef.current.setAttribute('aria-expanded', String(expanded));
        }
      },
    }));

    const handleClick = () => {
      setIsExpanded((prev) => !prev);
      onClick?.();
    };

    useEffect(() => {
      if (buttonRef.current) {
        buttonRef.current.setAttribute('aria-expanded', String(isExpanded));
      }
    }, [isExpanded]);

    const variantClass = `assist-button--${variant}`;

    return (
      <>
        <style>{`
          .assist-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: var(--neuroux-spacing-md, 12px);
            background: var(--neuroux-bg, #ffffff);
            border: 1px solid var(--neuroux-border, #e0e0e0);
            border-radius: var(--neuroux-radius-md, 8px);
            color: var(--neuroux-text, #1a1a2e);
            cursor: pointer;
            font-size: var(--neuroux-font-size-md, 16px);
            transition: all 0.2s ease;
            box-shadow: var(--neuroux-shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.1));
            min-width: 44px;
            min-height: 44px;
          }

          .assist-button:hover {
            background: var(--neuroux-bg-hover, #f5f5f5);
            border-color: var(--neuroux-border-hover, #d0d0d0);
            box-shadow: var(--neuroux-shadow-md, 0 2px 6px rgba(0, 0, 0, 0.15));
          }

          .assist-button:focus {
            outline: var(--neuroux-focus-border, 2px solid var(--neuroux-accent, #88aaff));
            outline-offset: 2px;
            box-shadow: var(--neuroux-focus-shadow, 0 0 0 3px rgba(136, 170, 255, 0.3));
          }

          .assist-button:active {
            transform: scale(0.98);
          }

          .assist-button--floating {
            position: fixed;
            bottom: var(--neuroux-spacing-lg, 24px);
            right: var(--neuroux-spacing-lg, 24px);
            z-index: 9999;
          }

          .assist-button--inline {
            position: relative;
          }
        `}</style>
        <button
          ref={buttonRef}
          className={`assist-button ${variantClass} ${className || ''}`}
          aria-label={ariaLabel}
          aria-haspopup="true"
          aria-expanded={isExpanded}
          type="button"
          onClick={handleClick}
          {...props}
        >
          {label}
        </button>
      </>
    );
  }
);

AssistButton.displayName = 'AssistButton';
