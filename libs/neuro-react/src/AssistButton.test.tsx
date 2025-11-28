import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { AssistButton } from './AssistButton';
import { AssistProvider } from './AssistProvider';

describe('AssistButton', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('rendering', () => {
    it('should render assist-button element', () => {
      render(
        <AssistProvider>
          <AssistButton />
        </AssistProvider>
      );

      const button = document.querySelector('assist-button');
      expect(button).toBeTruthy();
    });

    it('should render with default variant floating', () => {
      render(
        <AssistProvider>
          <AssistButton />
        </AssistProvider>
      );

      const button = document.querySelector('assist-button');
      expect(button?.getAttribute('variant')).toBe('floating');
    });

    it('should render with inline variant', () => {
      render(
        <AssistProvider>
          <AssistButton variant="inline" />
        </AssistProvider>
      );

      const button = document.querySelector('assist-button');
      expect(button?.getAttribute('variant')).toBe('inline');
    });

    it('should render with custom label', () => {
      render(
        <AssistProvider>
          <AssistButton label="Settings" />
        </AssistProvider>
      );

      const button = document.querySelector('assist-button');
      expect(button?.getAttribute('label')).toBe('Settings');
    });

    it('should render with custom aria-label', () => {
      render(
        <AssistProvider>
          <AssistButton ariaLabel="Custom label" />
        </AssistProvider>
      );

      const button = document.querySelector('assist-button');
      expect(button?.getAttribute('aria-label')).toBe('Custom label');
    });
  });

  describe('events', () => {
    it('should call onClick when button is clicked', async () => {
      const onClick = vi.fn();

      render(
        <AssistProvider>
          <AssistButton onClick={onClick} />
        </AssistProvider>
      );

      const button = document.querySelector('assist-button');
      const shadowRoot = button?.shadowRoot;
      const buttonElement = shadowRoot?.querySelector(
        'button'
      ) as HTMLButtonElement;

      buttonElement?.click();

      await waitFor(() => {
        expect(onClick).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('ref API', () => {
    it('should expose setExpanded method via ref', () => {
      const ref = { current: null } as any;

      render(
        <AssistProvider>
          <AssistButton ref={ref} />
        </AssistProvider>
      );

      expect(ref.current).toBeTruthy();
      expect(typeof ref.current.setExpanded).toBe('function');
    });

    it('should update aria-expanded via ref', async () => {
      const ref = { current: null } as any;

      render(
        <AssistProvider>
          <AssistButton ref={ref} />
        </AssistProvider>
      );

      await waitFor(() => {
        expect(ref.current).toBeTruthy();
      });

      const button = document.querySelector('assist-button');
      const shadowRoot = button?.shadowRoot;
      const buttonElement = shadowRoot?.querySelector(
        'button'
      ) as HTMLButtonElement;

      expect(buttonElement?.getAttribute('aria-expanded')).toBe('false');

      ref.current.setExpanded(true);

      await waitFor(() => {
        expect(buttonElement?.getAttribute('aria-expanded')).toBe('true');
      });
    });
  });
});
