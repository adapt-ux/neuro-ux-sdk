'use client';

import {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
  useCallback,
} from 'react';
import { useNeuroUX } from './useNeuroUX';
import type { AssistMenuOptions, AssistOption } from '@adapt-ux/neuro-assist';

export interface AssistMenuProps extends AssistMenuOptions {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onOptionChange?: (optionId: string, checked: boolean) => void;
  className?: string;
}

export interface AssistMenuRef {
  open: () => void;
  close: () => void;
  toggle: () => void;
  setOptionChecked: (optionId: string, checked: boolean) => void;
  getOptionChecked: (optionId: string) => boolean;
}

const defaultOptions: AssistOption[] = [
  {
    id: 'calmMode',
    label: 'Calm Mode',
    description: 'Reduces visual noise and distractions',
  },
  {
    id: 'contrast',
    label: 'Increase Contrast',
    description: 'Enhances text and element visibility',
  },
  {
    id: 'focusMode',
    label: 'Focus Mode',
    description: 'Highlights only the main content',
  },
];

/**
 * AssistMenu - React component for assist options panel
 * Panel with list of available assists
 * Direct integration with Core Engine
 */
export const AssistMenu = forwardRef<AssistMenuRef, AssistMenuProps>(
  (
    {
      options = defaultOptions,
      position = 'bottom-right',
      open: controlledOpen,
      onOpenChange,
      onOptionChange,
      className,
      ...props
    },
    ref
  ) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const neuroUX = useNeuroUX();
    const [internalOpen, setInternalOpen] = useState(false);
    const [checkedOptions, setCheckedOptions] = useState<
      Record<string, boolean>
    >({});
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;

    const handleOpen = useCallback(() => {
      if (!isControlled) {
        setInternalOpen(true);
      }
      onOpenChange?.(true);
    }, [isControlled, onOpenChange]);

    const handleClose = useCallback(() => {
      if (!isControlled) {
        setInternalOpen(false);
      }
      onOpenChange?.(false);
    }, [isControlled, onOpenChange]);

    const handleToggle = useCallback(() => {
      if (isOpen) {
        handleClose();
      } else {
        handleOpen();
      }
    }, [isOpen, handleOpen, handleClose]);

    useImperativeHandle(ref, () => ({
      open: handleOpen,
      close: handleClose,
      toggle: handleToggle,
      setOptionChecked: (optionId: string, checked: boolean) => {
        setCheckedOptions((prev) => ({ ...prev, [optionId]: checked }));
      },
      getOptionChecked: (optionId: string) => {
        return checkedOptions[optionId] || false;
      },
    }));

    // Handle option changes and apply to Core Engine
    const handleOptionChangeInternal = useCallback(
      (optionId: string, checked: boolean) => {
        setCheckedOptions((prev) => ({ ...prev, [optionId]: checked }));

        // Apply adaptation to Core Engine
        if (optionId === 'calmMode') {
          neuroUX.ui.set('colorMode', checked ? 'calm' : 'neutral');
        } else if (optionId === 'contrast') {
          neuroUX.ui.set('contrast', checked ? 'high' : 'normal');
        } else if (optionId === 'focusMode') {
          neuroUX.ui.set('highlight', checked);
        }

        onOptionChange?.(optionId, checked);
      },
      [neuroUX, onOptionChange]
    );

    // Close menu when clicking outside
    useEffect(() => {
      if (!isOpen) return;

      const handleClickOutside = (e: MouseEvent) => {
        if (
          menuRef.current &&
          !menuRef.current.contains(e.target as Node) &&
          !(e.target as Element)?.closest('assist-button')
        ) {
          handleClose();
        }
      };

      // Close menu on Escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleClose();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }, [isOpen, handleClose]);

    // Sync initial state from Core Engine
    useEffect(() => {
      const uiState = neuroUX.ui.getAll();

      const initialChecked: Record<string, boolean> = {};

      // Set calm mode
      if (uiState['colorMode'] === 'calm') {
        initialChecked['calmMode'] = true;
      }

      // Set contrast
      if (uiState['contrast'] === 'high') {
        initialChecked['contrast'] = true;
      }

      // Set focus mode
      if (uiState['highlight'] === true) {
        initialChecked['focusMode'] = true;
      }

      setCheckedOptions(initialChecked);
    }, [neuroUX]);

    const positionClass = `assist-menu--${position}`;
    const visibilityClass = isOpen
      ? 'assist-menu--open'
      : 'assist-menu--closed';

    return (
      <div
        ref={menuRef}
        className={`assist-menu ${positionClass} ${visibilityClass} ${
          className || ''
        }`}
        role="menu"
        aria-label="Assist options"
        aria-hidden={!isOpen}
        {...props}
      >
        <style>{`
          .assist-menu {
            position: fixed;
            background: var(--neuroux-bg, #ffffff);
            border: 1px solid var(--neuroux-border, #e0e0e0);
            border-radius: var(--neuroux-radius-md, 8px);
            box-shadow: var(--neuroux-shadow-lg, 0 4px 12px rgba(0, 0, 0, 0.15));
            padding: var(--neuroux-spacing-sm, 8px);
            min-width: 280px;
            max-width: 320px;
            z-index: 10000;
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
            pointer-events: none;
            transition: opacity 0.2s ease, transform 0.2s ease;
          }

          .assist-menu--open {
            opacity: 1;
            transform: scale(1) translateY(0);
            pointer-events: all;
          }

          .assist-menu--closed {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
            pointer-events: none;
          }

          .assist-menu--bottom-right {
            bottom: calc(var(--neuroux-spacing-lg, 24px) + 60px);
            right: var(--neuroux-spacing-lg, 24px);
          }

          .assist-menu--bottom-left {
            bottom: calc(var(--neuroux-spacing-lg, 24px) + 60px);
            left: var(--neuroux-spacing-lg, 24px);
          }

          .assist-menu--top-right {
            top: calc(var(--neuroux-spacing-lg, 24px) + 60px);
            right: var(--neuroux-spacing-lg, 24px);
          }

          .assist-menu--top-left {
            top: calc(var(--neuroux-spacing-lg, 24px) + 60px);
            left: var(--neuroux-spacing-lg, 24px);
          }

          .assist-menu__header {
            padding: var(--neuroux-spacing-md, 12px);
            border-bottom: 1px solid var(--neuroux-border, #e0e0e0);
            font-weight: var(--neuroux-font-weight-semibold, 600);
            color: var(--neuroux-text, #1a1a2e);
            font-size: var(--neuroux-font-size-md, 16px);
          }

          .assist-menu__list {
            list-style: none;
            margin: 0;
            padding: 0;
          }

          .assist-menu__item {
            display: flex;
            align-items: center;
            padding: var(--neuroux-spacing-md, 12px);
            cursor: pointer;
            border-radius: var(--neuroux-radius-sm, 4px);
            transition: background 0.15s ease;
          }

          .assist-menu__item:hover {
            background: var(--neuroux-bg-hover, #f5f5f5);
          }

          .assist-menu__item:focus-within {
            outline: var(--neuroux-focus-border, 2px solid var(--neuroux-accent, #88aaff));
            outline-offset: -2px;
          }

          .assist-menu__checkbox {
            width: 20px;
            height: 20px;
            margin-right: var(--neuroux-spacing-md, 12px);
            cursor: pointer;
            accent-color: var(--neuroux-accent, #88aaff);
          }

          .assist-menu__label {
            flex: 1;
            display: flex;
            flex-direction: column;
            cursor: pointer;
          }

          .assist-menu__label-text {
            font-size: var(--neuroux-font-size-md, 16px);
            color: var(--neuroux-text, #1a1a2e);
            font-weight: var(--neuroux-font-weight-medium, 500);
          }

          .assist-menu__label-desc {
            font-size: var(--neuroux-font-size-sm, 14px);
            color: var(--neuroux-text-secondary, #666666);
            margin-top: 2px;
          }
        `}</style>
        <div className="assist-menu__header">Accessibility Options</div>
        <ul className="assist-menu__list">
          {options.map((option) => (
            <li
              key={option.id}
              className="assist-menu__item"
              role="menuitemcheckbox"
              aria-checked={checkedOptions[option.id] || false}
            >
              <input
                type="checkbox"
                className="assist-menu__checkbox"
                id={`assist-${option.id}`}
                checked={checkedOptions[option.id] || false}
                onChange={(e) =>
                  handleOptionChangeInternal(option.id, e.target.checked)
                }
                aria-label={option.label}
              />
              <label
                className="assist-menu__label"
                htmlFor={`assist-${option.id}`}
              >
                <span className="assist-menu__label-text">{option.label}</span>
                {option.description && (
                  <span className="assist-menu__label-desc">
                    {option.description}
                  </span>
                )}
              </label>
            </li>
          ))}
        </ul>
      </div>
    );
  }
);

AssistMenu.displayName = 'AssistMenu';
