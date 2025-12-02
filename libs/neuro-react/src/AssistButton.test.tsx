import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';
import { AssistButton } from './AssistButton';
import { AssistProvider } from './AssistProvider';

describe('AssistButton', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('rendering', () => {
    it('should render button element', async () => {
      render(
        <AssistProvider>
          <AssistButton />
        </AssistProvider>
      );

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toBeTruthy();
      });
    });

    it('should render with default variant floating', async () => {
      render(
        <AssistProvider>
          <AssistButton />
        </AssistProvider>
      );

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button.className).toContain('assist-button--floating');
      });
    });

    it('should render with inline variant', async () => {
      render(
        <AssistProvider>
          <AssistButton variant="inline" />
        </AssistProvider>
      );

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button.className).toContain('assist-button--inline');
      });
    });

    it('should render with custom label', async () => {
      render(
        <AssistProvider>
          <AssistButton label="Settings" />
        </AssistProvider>
      );

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button.textContent).toBe('Settings');
      });
    });

    it('should render with custom aria-label', async () => {
      render(
        <AssistProvider>
          <AssistButton ariaLabel="Custom label" />
        </AssistProvider>
      );

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button.getAttribute('aria-label')).toBe('Custom label');
      });
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

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toBeTruthy();
      });

      const button = screen.getByRole('button');
      button.click();

      await waitFor(() => {
        expect(onClick).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('ref API', () => {
    it('should expose setExpanded method via ref', async () => {
      const ref = { current: null } as any;

      render(
        <AssistProvider>
          <AssistButton ref={ref} />
        </AssistProvider>
      );

      await waitFor(() => {
        expect(ref.current).toBeTruthy();
        expect(typeof ref.current.setExpanded).toBe('function');
      });
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

      const button = screen.getByRole('button');
      expect(button.getAttribute('aria-expanded')).toBe('false');

      ref.current.setExpanded(true);

      await waitFor(() => {
        expect(button.getAttribute('aria-expanded')).toBe('true');
      });
    });
  });
});
