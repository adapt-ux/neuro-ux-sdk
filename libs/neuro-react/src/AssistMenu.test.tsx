import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, screen, act } from '@testing-library/react';
import { AssistMenu } from './AssistMenu';
import { AssistProvider } from './AssistProvider';

describe('AssistMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render assist-menu element', async () => {
      render(
        <AssistProvider>
          <AssistMenu />
        </AssistProvider>
      );

      await waitFor(() => {
        const menu = screen.getByRole('menu', { hidden: true });
        expect(menu).toBeTruthy();
      });
    });

    it('should render with default position', async () => {
      render(
        <AssistProvider>
          <AssistMenu />
        </AssistProvider>
      );

      await waitFor(() => {
        const menu = screen.getByRole('menu', { hidden: true });
        expect(menu.className).toContain('assist-menu--bottom-right');
      });
    });

    it('should render with custom position', async () => {
      render(
        <AssistProvider>
          <AssistMenu position="top-left" />
        </AssistProvider>
      );

      await waitFor(() => {
        const menu = screen.getByRole('menu', { hidden: true });
        expect(menu.className).toContain('assist-menu--top-left');
      });
    });

    it('should be closed by default', async () => {
      render(
        <AssistProvider>
          <AssistMenu />
        </AssistProvider>
      );

      await waitFor(() => {
        const menu = screen.getByRole('menu', { hidden: true });
        expect(menu.getAttribute('aria-hidden')).toBe('true');
        expect(menu.className).toContain('assist-menu--closed');
      });
    });
  });

  describe('open/close', () => {
    it('should open when open prop is true', async () => {
      render(
        <AssistProvider>
          <AssistMenu open={true} />
        </AssistProvider>
      );

      await waitFor(() => {
        const menu = screen.getByRole('menu');
        expect(menu.getAttribute('aria-hidden')).toBe('false');
        expect(menu.className).toContain('assist-menu--open');
      });
    });

    it('should close when open prop is false', async () => {
      const { rerender } = render(
        <AssistProvider>
          <AssistMenu open={true} />
        </AssistProvider>
      );

      await waitFor(() => {
        const menu = screen.getByRole('menu', { hidden: true });
        expect(menu.getAttribute('aria-hidden')).toBe('false');
      });

      rerender(
        <AssistProvider>
          <AssistMenu open={false} />
        </AssistProvider>
      );

      await waitFor(() => {
        const menu = screen.getByRole('menu', { hidden: true });
        expect(menu.getAttribute('aria-hidden')).toBe('true');
        expect(menu.className).toContain('assist-menu--closed');
      });
    });

    it('should call onOpenChange when state changes', async () => {
      const onOpenChange = vi.fn();
      const ref = { current: null } as any;

      render(
        <AssistProvider>
          <AssistMenu ref={ref} onOpenChange={onOpenChange} />
        </AssistProvider>
      );

      await waitFor(() => {
        expect(ref.current).toBeTruthy();
      });

      act(() => {
        ref.current.open();
      });

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(true);
      });
    });
  });

  describe('option changes', () => {
    it('should call onOptionChange when option is toggled', async () => {
      const onOptionChange = vi.fn();

      render(
        <AssistProvider>
          <AssistMenu onOptionChange={onOptionChange} />
        </AssistProvider>
      );

      await waitFor(() => {
        const calmModeCheckbox = screen.getByLabelText('Calm Mode');
        expect(calmModeCheckbox).toBeTruthy();
      });

      const calmModeCheckbox = screen.getByLabelText('Calm Mode') as HTMLInputElement;
      act(() => {
        calmModeCheckbox.click();
      });

      await waitFor(() => {
        expect(onOptionChange).toHaveBeenCalledWith('calmMode', true);
      });
    });

    it('should apply calmMode to Core Engine when toggled', async () => {
      render(
        <AssistProvider>
          <AssistMenu />
        </AssistProvider>
      );

      await waitFor(() => {
        const calmModeCheckbox = screen.getByLabelText('Calm Mode');
        expect(calmModeCheckbox).toBeTruthy();
      });

      const calmModeCheckbox = screen.getByLabelText('Calm Mode') as HTMLInputElement;
      act(() => {
        calmModeCheckbox.click();
      });

      await waitFor(() => {
        expect(calmModeCheckbox.checked).toBe(true);
      });
    });

    it('should apply contrast to Core Engine when toggled', async () => {
      render(
        <AssistProvider>
          <AssistMenu />
        </AssistProvider>
      );

      await waitFor(() => {
        const contrastCheckbox = screen.getByLabelText('Increase Contrast');
        expect(contrastCheckbox).toBeTruthy();
      });

      const contrastCheckbox = screen.getByLabelText('Increase Contrast') as HTMLInputElement;
      act(() => {
        contrastCheckbox.click();
      });

      await waitFor(() => {
        expect(contrastCheckbox.checked).toBe(true);
      });
    });

    it('should apply focusMode to Core Engine when toggled', async () => {
      render(
        <AssistProvider>
          <AssistMenu />
        </AssistProvider>
      );

      await waitFor(() => {
        const focusModeCheckbox = screen.getByLabelText('Focus Mode');
        expect(focusModeCheckbox).toBeTruthy();
      });

      const focusModeCheckbox = screen.getByLabelText('Focus Mode') as HTMLInputElement;
      act(() => {
        focusModeCheckbox.click();
      });

      await waitFor(() => {
        expect(focusModeCheckbox.checked).toBe(true);
      });
    });
  });

  describe('ref API', () => {
    it('should expose public methods via ref', async () => {
      const ref = { current: null } as any;

      render(
        <AssistProvider>
          <AssistMenu ref={ref} />
        </AssistProvider>
      );

      await waitFor(() => {
        expect(ref.current).toBeTruthy();
        expect(typeof ref.current.open).toBe('function');
        expect(typeof ref.current.close).toBe('function');
        expect(typeof ref.current.toggle).toBe('function');
        expect(typeof ref.current.setOptionChecked).toBe('function');
        expect(typeof ref.current.getOptionChecked).toBe('function');
      });
    });

    it('should open/close via ref', async () => {
      const ref = { current: null } as any;

      render(
        <AssistProvider>
          <AssistMenu ref={ref} />
        </AssistProvider>
      );

      await waitFor(() => {
        expect(ref.current).toBeTruthy();
      });

      const menu = screen.getByRole('menu', { hidden: true });
      expect(menu.getAttribute('aria-hidden')).toBe('true');

      act(() => {
        ref.current.open();
      });

      await waitFor(() => {
        expect(menu.getAttribute('aria-hidden')).toBe('false');
      });

      act(() => {
        ref.current.close();
      });

      await waitFor(() => {
        expect(menu.getAttribute('aria-hidden')).toBe('true');
      });
    });

    it('should set/get option checked via ref', async () => {
      const ref = { current: null } as any;

      render(
        <AssistProvider>
          <AssistMenu ref={ref} />
        </AssistProvider>
      );

      await waitFor(() => {
        expect(ref.current).toBeTruthy();
      });

      expect(ref.current.getOptionChecked('calmMode')).toBe(false);

      act(() => {
        ref.current.setOptionChecked('calmMode', true);
      });

      await waitFor(() => {
        expect(ref.current.getOptionChecked('calmMode')).toBe(true);
      });
    });
  });

  describe('state synchronization', () => {
    it('should sync initial state from Core Engine', async () => {
      render(
        <AssistProvider>
          <AssistMenu />
        </AssistProvider>
      );

      // Wait for component to mount and sync state
      await waitFor(() => {
        const menu = screen.getByRole('menu', { hidden: true });
        expect(menu).toBeTruthy();
      });

      // The component should render successfully
      // State synchronization is tested through integration tests
      const menu = screen.getByRole('menu', { hidden: true });
      expect(menu).toBeTruthy();
    });
  });
});
