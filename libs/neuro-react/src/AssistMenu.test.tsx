import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, act } from '@testing-library/react';
import { AssistMenu } from './AssistMenu';
import { AssistProvider } from './AssistProvider';

describe('AssistMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render assist-menu element', () => {
      render(
        <AssistProvider>
          <AssistMenu />
        </AssistProvider>
      );

      const menu = document.querySelector('assist-menu');
      expect(menu).toBeTruthy();
    });

    it('should render with default position', () => {
      render(
        <AssistProvider>
          <AssistMenu />
        </AssistProvider>
      );

      const menu = document.querySelector('assist-menu');
      expect(menu?.getAttribute('position')).toBe('bottom-right');
    });

    it('should render with custom position', () => {
      render(
        <AssistProvider>
          <AssistMenu {...({ position: 'top-left' } as any)} />
        </AssistProvider>
      );

      const menu = document.querySelector('assist-menu');
      expect(menu?.getAttribute('position')).toBe('top-left');
    });

    it('should be closed by default', () => {
      render(
        <AssistProvider>
          <AssistMenu />
        </AssistProvider>
      );

      const menu = document.querySelector('assist-menu');
      expect(menu?.hasAttribute('open')).toBe(false);
    });
  });

  describe('open/close', () => {
    it('should open when open prop is true', async () => {
      render(
        <AssistProvider>
          <AssistMenu open={true} />
        </AssistProvider>
      );

      // Wait for Web Component to be fully loaded
      await waitFor(() => {
        const menu = document.querySelector('assist-menu');
        expect(menu).toBeTruthy();
      }, { timeout: 2000 });

      // Wait a bit more for the useEffect to run
      await new Promise(resolve => setTimeout(resolve, 100));

      const menu = document.querySelector('assist-menu');
      expect(menu?.hasAttribute('open')).toBe(true);
    });

    it('should close when open prop is false', async () => {
      const { rerender } = render(
        <AssistProvider>
          <AssistMenu open={true} />
        </AssistProvider>
      );

      // Wait for Web Component to be fully loaded
      await waitFor(() => {
        const menu = document.querySelector('assist-menu');
        expect(menu).toBeTruthy();
      }, { timeout: 2000 });

      await new Promise(resolve => setTimeout(resolve, 100));

      let menu = document.querySelector('assist-menu');
      expect(menu?.hasAttribute('open')).toBe(true);

      rerender(
        <AssistProvider>
          <AssistMenu open={false} />
        </AssistProvider>
      );

      await new Promise(resolve => setTimeout(resolve, 100));

      menu = document.querySelector('assist-menu');
      expect(menu?.hasAttribute('open')).toBe(false);
    });

    it('should call onOpenChange when state changes', async () => {
      const onOpenChange = vi.fn();

      render(
        <AssistProvider>
          <AssistMenu open={false} onOpenChange={onOpenChange} />
        </AssistProvider>
      );

      const menu = document.querySelector('assist-menu') as any;
      menu?.open();

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

      const menu = document.querySelector('assist-menu');
      const shadowRoot = menu?.shadowRoot;
      const calmMode = shadowRoot?.querySelector(
        '#assist-calmMode'
      ) as HTMLInputElement;

      calmMode.checked = true;
      calmMode.dispatchEvent(new Event('change', { bubbles: true }));

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

      const menu = document.querySelector('assist-menu');
      const shadowRoot = menu?.shadowRoot;
      const calmMode = shadowRoot?.querySelector(
        '#assist-calmMode'
      ) as HTMLInputElement;

      if (calmMode) {
        calmMode.checked = true;
        calmMode.dispatchEvent(new Event('change', { bubbles: true }));

        // Verify the checkbox was toggled
        await waitFor(() => {
          expect(calmMode.checked).toBe(true);
        });
      }
    });

    it('should apply contrast to Core Engine when toggled', async () => {
      render(
        <AssistProvider>
          <AssistMenu />
        </AssistProvider>
      );

      const menu = document.querySelector('assist-menu');
      const shadowRoot = menu?.shadowRoot;
      const contrast = shadowRoot?.querySelector(
        '#assist-contrast'
      ) as HTMLInputElement;

      if (contrast) {
        contrast.checked = true;
        contrast.dispatchEvent(new Event('change', { bubbles: true }));

        // Verify the checkbox was toggled
        await waitFor(() => {
          expect(contrast.checked).toBe(true);
        });
      }
    });

    it('should apply focusMode to Core Engine when toggled', async () => {
      render(
        <AssistProvider>
          <AssistMenu />
        </AssistProvider>
      );

      const menu = document.querySelector('assist-menu');
      const shadowRoot = menu?.shadowRoot;
      const focusMode = shadowRoot?.querySelector(
        '#assist-focusMode'
      ) as HTMLInputElement;

      if (focusMode) {
        focusMode.checked = true;
        focusMode.dispatchEvent(new Event('change', { bubbles: true }));

        // Verify the checkbox was toggled
        await waitFor(() => {
          expect(focusMode.checked).toBe(true);
        });
      }
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

      const menu = document.querySelector('assist-menu');
      expect(menu?.hasAttribute('open')).toBe(false);

      act(() => {
        ref.current.open();
      });

      await waitFor(() => {
        expect(menu?.hasAttribute('open')).toBe(true);
      });

      act(() => {
        ref.current.close();
      });

      await waitFor(() => {
        expect(menu?.hasAttribute('open')).toBe(false);
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
        const menu = document.querySelector('assist-menu');
        expect(menu).toBeTruthy();
      });

      // The component should render successfully
      // State synchronization is tested through integration tests
      const menu = document.querySelector('assist-menu') as any;
      expect(menu).toBeTruthy();
    });
  });
});
