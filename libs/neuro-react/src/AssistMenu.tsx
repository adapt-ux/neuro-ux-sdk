'use client';

import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import './register-components';
import { useNeuroUX } from './useNeuroUX';
import type { AssistMenuOptions, AssistOption, AssistAdaptation } from '@adapt-ux/neuro-assist';

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

/**
 * AssistMenu - React wrapper for the assist-menu Web Component
 * Panel with list of available assists
 * Direct integration with Core Engine
 */
export const AssistMenu = forwardRef<AssistMenuRef, AssistMenuProps>(
  (
    {
      options,
      position = 'bottom-right',
      open: controlledOpen,
      onOpenChange,
      onOptionChange,
      className,
      ...props
    },
    ref
  ) => {
    const menuRef = useRef<HTMLElement & AssistMenuRef>(null);
    const neuroUX = useNeuroUX();
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;

    useImperativeHandle(ref, () => ({
      open: () => {
        if (menuRef.current) {
          const menu = menuRef.current as any;
          if (typeof menu.open === 'function') {
            menu.open();
          }
        }
        if (!isControlled) {
          setInternalOpen(true);
        }
        onOpenChange?.(true);
      },
      close: () => {
        if (menuRef.current) {
          const menu = menuRef.current as any;
          if (typeof menu.close === 'function') {
            menu.close();
          }
        }
        if (!isControlled) {
          setInternalOpen(false);
        }
        onOpenChange?.(false);
      },
      toggle: () => {
        if (isOpen) {
          if (menuRef.current) {
            const menu = menuRef.current as any;
            if (typeof menu.close === 'function') {
              menu.close();
            }
          }
          if (!isControlled) {
            setInternalOpen(false);
          }
          onOpenChange?.(false);
        } else {
          if (menuRef.current) {
            const menu = menuRef.current as any;
            if (typeof menu.open === 'function') {
              menu.open();
            }
          }
          if (!isControlled) {
            setInternalOpen(true);
          }
          onOpenChange?.(true);
        }
      },
      setOptionChecked: (optionId: string, checked: boolean) => {
        if (menuRef.current) {
          const menu = menuRef.current as any;
          if (typeof menu.setOptionChecked === 'function') {
            menu.setOptionChecked(optionId, checked);
          }
        }
      },
      getOptionChecked: (optionId: string) => {
        if (menuRef.current) {
          const menu = menuRef.current as any;
          if (typeof menu.getOptionChecked === 'function') {
            return menu.getOptionChecked(optionId);
          }
        }
        return false;
      },
    }));

    // Sync controlled open state
    useEffect(() => {
      if (menuRef.current && isControlled) {
        const menu = menuRef.current as any;
        if (controlledOpen) {
          if (typeof menu.open === 'function') {
            menu.open();
          } else {
            // Fallback: set attribute directly
            menu.setAttribute('open', '');
          }
        } else {
          if (typeof menu.close === 'function') {
            menu.close();
          } else {
            // Fallback: remove attribute directly
            menu.removeAttribute('open');
          }
        }
      }
    }, [controlledOpen, isControlled]);

    // Handle option changes and apply to Core Engine
    useEffect(() => {
      const menu = menuRef.current;
      if (!menu) return;

      const handleOptionChange = (e: Event) => {
        const customEvent = e as CustomEvent<{ optionId: string; checked: boolean }>;
        const { optionId, checked } = customEvent.detail;

        // Apply adaptation to Core Engine
        const adaptation: AssistAdaptation = {};
        
        if (optionId === 'calmMode') {
          adaptation.calmMode = checked;
          neuroUX.ui.set('colorMode', checked ? 'calm' : 'neutral');
        } else if (optionId === 'contrast') {
          adaptation.contrast = checked ? 'high' : 'normal';
          neuroUX.ui.set('contrast', checked ? 'high' : 'normal');
        } else if (optionId === 'focusMode') {
          adaptation.focusMode = checked;
          neuroUX.ui.set('highlight', checked);
        }

        onOptionChange?.(optionId, checked);
      };

      menu.addEventListener('assist:option-changed', handleOptionChange);

      return () => {
        menu.removeEventListener('assist:option-changed', handleOptionChange);
      };
    }, [neuroUX, onOptionChange]);

    // Sync initial state from Core Engine
    useEffect(() => {
      if (!menuRef.current) return;

      const menu = menuRef.current as any;
      if (typeof menu.setOptionChecked !== 'function') return;

      const uiState = neuroUX.ui.getAll();
      
      // Set calm mode
      if (uiState.colorMode === 'calm') {
        menu.setOptionChecked('calmMode', true);
      }
      
      // Set contrast
      if (uiState.contrast === 'high') {
        menu.setOptionChecked('contrast', true);
      }
      
      // Set focus mode
      if (uiState.highlight === true) {
        menu.setOptionChecked('focusMode', true);
      }
    }, [neuroUX]);

    return (
      <assist-menu
        ref={menuRef}
        position={position}
        open={isOpen ? '' : undefined}
        className={className}
        {...props}
      />
    );
  }
);

AssistMenu.displayName = 'AssistMenu';
