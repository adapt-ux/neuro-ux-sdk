import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AssistMenu } from './assist-menu';

describe('AssistMenu', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Web Component registration', () => {
    it('should register the custom element', () => {
      expect(customElements.get('assist-menu')).toBe(AssistMenu);
    });
  });

  describe('initialization', () => {
    it('should create an assist-menu element', () => {
      const menu = document.createElement('assist-menu');
      expect(menu).toBeInstanceOf(AssistMenu);
    });

    it('should have default options', () => {
      const menu = document.createElement('assist-menu') as AssistMenu;
      document.body.appendChild(menu);
      
      const shadowRoot = menu.shadowRoot;
      const options = shadowRoot?.querySelectorAll('.assist-menu__item');
      expect(options?.length).toBe(3); // calmMode, contrast, focusMode
    });

    it('should be closed by default', () => {
      const menu = document.createElement('assist-menu') as AssistMenu;
      document.body.appendChild(menu);
      
      const shadowRoot = menu.shadowRoot;
      const menuContainer = shadowRoot?.querySelector('.assist-menu');
      expect(menuContainer?.classList.contains('assist-menu--closed')).toBe(true);
      expect(menuContainer?.classList.contains('assist-menu--open')).toBe(false);
    });

    it('should have appropriate ARIA attributes', () => {
      const menu = document.createElement('assist-menu') as AssistMenu;
      document.body.appendChild(menu);
      
      const shadowRoot = menu.shadowRoot;
      const menuContainer = shadowRoot?.querySelector('.assist-menu');
      expect(menuContainer?.getAttribute('role')).toBe('menu');
      expect(menuContainer?.getAttribute('aria-label')).toBe('Assist options');
    });

    it('should have default position of bottom-right', () => {
      const menu = document.createElement('assist-menu') as AssistMenu;
      document.body.appendChild(menu);
      
      const shadowRoot = menu.shadowRoot;
      const menuContainer = shadowRoot?.querySelector('.assist-menu');
      expect(menuContainer?.classList.contains('assist-menu--bottom-right')).toBe(true);
    });
  });

  describe('options', () => {
    it('should render all default options', () => {
      const menu = document.createElement('assist-menu') as AssistMenu;
      document.body.appendChild(menu);
      
      const shadowRoot = menu.shadowRoot;
      const calmMode = shadowRoot?.querySelector('#assist-calmMode');
      const contrast = shadowRoot?.querySelector('#assist-contrast');
      const focusMode = shadowRoot?.querySelector('#assist-focusMode');
      
      expect(calmMode).toBeTruthy();
      expect(contrast).toBeTruthy();
      expect(focusMode).toBeTruthy();
    });

    it('should render option labels and descriptions', () => {
      const menu = document.createElement('assist-menu') as AssistMenu;
      document.body.appendChild(menu);
      
      const shadowRoot = menu.shadowRoot;
      const calmModeLabel = shadowRoot?.querySelector('label[for="assist-calmMode"]');
      expect(calmModeLabel?.textContent).toContain('Calm Mode');
    });

    it('should have unchecked options by default', () => {
      const menu = document.createElement('assist-menu') as AssistMenu;
      document.body.appendChild(menu);
      
      const shadowRoot = menu.shadowRoot;
      const calmMode = shadowRoot?.querySelector('#assist-calmMode') as HTMLInputElement;
      expect(calmMode?.checked).toBe(false);
    });
  });

  describe('open/close', () => {
    it('should open when open() is called', () => {
      const menu = document.createElement('assist-menu') as AssistMenu;
      document.body.appendChild(menu);
      
      menu.open();
      
      const shadowRoot = menu.shadowRoot;
      const menuContainer = shadowRoot?.querySelector('.assist-menu');
      expect(menuContainer?.classList.contains('assist-menu--open')).toBe(true);
      expect(menuContainer?.classList.contains('assist-menu--closed')).toBe(false);
      expect(menu.hasAttribute('open')).toBe(true);
    });

    it('should close when close() is called', () => {
      const menu = document.createElement('assist-menu') as AssistMenu;
      document.body.appendChild(menu);
      
      menu.open();
      menu.close();
      
      const shadowRoot = menu.shadowRoot;
      const menuContainer = shadowRoot?.querySelector('.assist-menu');
      expect(menuContainer?.classList.contains('assist-menu--closed')).toBe(true);
      expect(menuContainer?.classList.contains('assist-menu--open')).toBe(false);
      expect(menu.hasAttribute('open')).toBe(false);
    });

    it('should toggle when toggle() is called', () => {
      const menu = document.createElement('assist-menu') as AssistMenu;
      document.body.appendChild(menu);
      
      expect(menu.hasAttribute('open')).toBe(false);
      
      menu.toggle();
      expect(menu.hasAttribute('open')).toBe(true);
      
      menu.toggle();
      expect(menu.hasAttribute('open')).toBe(false);
    });

    it('should open when open attribute is set', () => {
      const menu = document.createElement('assist-menu') as AssistMenu;
      menu.setAttribute('open', '');
      document.body.appendChild(menu);
      
      const shadowRoot = menu.shadowRoot;
      const menuContainer = shadowRoot?.querySelector('.assist-menu');
      expect(menuContainer?.classList.contains('assist-menu--open')).toBe(true);
    });
  });

  describe('option changes', () => {
    it('should dispatch assist:option-changed event when option is toggled', () => {
      const menu = document.createElement('assist-menu') as AssistMenu;
      document.body.appendChild(menu);
      
      const handler = vi.fn();
      menu.addEventListener('assist:option-changed', handler);
      
      const shadowRoot = menu.shadowRoot;
      const calmMode = shadowRoot?.querySelector('#assist-calmMode') as HTMLInputElement;
      calmMode.checked = true;
      calmMode.dispatchEvent(new Event('change'));
      
      expect(handler).toHaveBeenCalledTimes(1);
      const event = handler.mock.calls[0][0] as CustomEvent;
      expect(event.detail.optionId).toBe('calmMode');
      expect(event.detail.checked).toBe(true);
    });

    it('should update aria-checked when option is toggled', () => {
      const menu = document.createElement('assist-menu') as AssistMenu;
      document.body.appendChild(menu);
      
      const shadowRoot = menu.shadowRoot;
      const calmModeItem = shadowRoot?.querySelector('[data-option-id="calmMode"]');
      const calmMode = shadowRoot?.querySelector('#assist-calmMode') as HTMLInputElement;
      
      expect(calmModeItem?.getAttribute('aria-checked')).toBe('false');
      
      calmMode.checked = true;
      calmMode.dispatchEvent(new Event('change'));
      
      expect(calmModeItem?.getAttribute('aria-checked')).toBe('true');
    });
  });

  describe('public API', () => {
    it('should have setOptionChecked method', () => {
      const menu = document.createElement('assist-menu') as AssistMenu;
      document.body.appendChild(menu);
      
      expect(typeof menu.setOptionChecked).toBe('function');
    });

    it('should update checkbox state via setOptionChecked', () => {
      const menu = document.createElement('assist-menu') as AssistMenu;
      document.body.appendChild(menu);
      
      const shadowRoot = menu.shadowRoot;
      const calmMode = shadowRoot?.querySelector('#assist-calmMode') as HTMLInputElement;
      
      menu.setOptionChecked('calmMode', true);
      expect(calmMode.checked).toBe(true);
      
      menu.setOptionChecked('calmMode', false);
      expect(calmMode.checked).toBe(false);
    });

    it('should have getOptionChecked method', () => {
      const menu = document.createElement('assist-menu') as AssistMenu;
      document.body.appendChild(menu);
      
      expect(typeof menu.getOptionChecked).toBe('function');
    });

    it('should return checkbox state via getOptionChecked', () => {
      const menu = document.createElement('assist-menu') as AssistMenu;
      document.body.appendChild(menu);
      
      expect(menu.getOptionChecked('calmMode')).toBe(false);
      
      menu.setOptionChecked('calmMode', true);
      expect(menu.getOptionChecked('calmMode')).toBe(true);
    });
  });

  describe('position', () => {
    it('should update position when attribute changes', () => {
      const menu = document.createElement('assist-menu') as AssistMenu;
      document.body.appendChild(menu);
      
      let shadowRoot = menu.shadowRoot;
      let menuContainer = shadowRoot?.querySelector('.assist-menu');
      expect(menuContainer?.classList.contains('assist-menu--bottom-right')).toBe(true);
      
      menu.setAttribute('position', 'top-left');
      shadowRoot = menu.shadowRoot;
      menuContainer = shadowRoot?.querySelector('.assist-menu');
      expect(menuContainer?.classList.contains('assist-menu--top-left')).toBe(true);
    });
  });

  describe('keyboard and outside click', () => {
    it('should close when Escape key is pressed', () => {
      const menu = document.createElement('assist-menu') as AssistMenu;
      document.body.appendChild(menu);
      menu.open();
      
      expect(menu.hasAttribute('open')).toBe(true);
      
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      
      expect(menu.hasAttribute('open')).toBe(false);
    });

    it('should close when clicking outside', () => {
      const menu = document.createElement('assist-menu') as AssistMenu;
      document.body.appendChild(menu);
      menu.open();
      
      expect(menu.hasAttribute('open')).toBe(true);
      
      // Click outside the menu
      document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      
      expect(menu.hasAttribute('open')).toBe(false);
    });
  });

  describe('styling', () => {
    it('should use CSS variables for styling', () => {
      const menu = document.createElement('assist-menu') as AssistMenu;
      document.body.appendChild(menu);
      
      const shadowRoot = menu.shadowRoot;
      const styles = shadowRoot?.querySelector('style');
      expect(styles?.textContent).toContain('var(--neuroux-');
    });
  });
});
