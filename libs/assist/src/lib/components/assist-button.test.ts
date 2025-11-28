import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AssistButton } from './assist-button';

describe('AssistButton', () => {
  beforeEach(() => {
    // Clean up any existing instances
    document.body.innerHTML = '';
  });

  afterEach(() => {
    // Clean up after each test
    document.body.innerHTML = '';
  });

  describe('Web Component registration', () => {
    it('should register the custom element', () => {
      expect(customElements.get('assist-button')).toBe(AssistButton);
    });
  });

  describe('initialization', () => {
    it('should create an assist-button element', () => {
      const button = document.createElement('assist-button');
      expect(button).toBeInstanceOf(AssistButton);
    });

    it('should have default variant of floating', () => {
      const button = document.createElement('assist-button') as AssistButton;
      document.body.appendChild(button);
      
      expect(button.getAttribute('variant')).toBeNull();
      // Default is floating
      const shadowRoot = button.shadowRoot;
      expect(shadowRoot?.querySelector('.assist-button--floating')).toBeTruthy();
    });

    it('should apply inline variant when specified', () => {
      const button = document.createElement('assist-button') as AssistButton;
      button.setAttribute('variant', 'inline');
      document.body.appendChild(button);
      
      const shadowRoot = button.shadowRoot;
      expect(shadowRoot?.querySelector('.assist-button--inline')).toBeTruthy();
    });

    it('should have default label', () => {
      const button = document.createElement('assist-button') as AssistButton;
      document.body.appendChild(button);
      
      const shadowRoot = button.shadowRoot;
      const buttonElement = shadowRoot?.querySelector('button');
      expect(buttonElement?.textContent).toBe('⚙️');
    });

    it('should use custom label when specified', () => {
      const button = document.createElement('assist-button') as AssistButton;
      button.setAttribute('label', 'Settings');
      document.body.appendChild(button);
      
      const shadowRoot = button.shadowRoot;
      const buttonElement = shadowRoot?.querySelector('button');
      expect(buttonElement?.textContent).toBe('Settings');
    });

    it('should have appropriate ARIA attributes', () => {
      const button = document.createElement('assist-button') as AssistButton;
      document.body.appendChild(button);
      
      const shadowRoot = button.shadowRoot;
      const buttonElement = shadowRoot?.querySelector('button');
      
      expect(buttonElement?.getAttribute('aria-label')).toBe('Open assist menu');
      expect(buttonElement?.getAttribute('aria-haspopup')).toBe('true');
      expect(buttonElement?.getAttribute('aria-expanded')).toBe('false');
      expect(buttonElement?.getAttribute('type')).toBe('button');
    });

    it('should use custom aria-label when specified', () => {
      const button = document.createElement('assist-button') as AssistButton;
      button.setAttribute('aria-label', 'Custom label');
      document.body.appendChild(button);
      
      const shadowRoot = button.shadowRoot;
      const buttonElement = shadowRoot?.querySelector('button');
      expect(buttonElement?.getAttribute('aria-label')).toBe('Custom label');
    });
  });

  describe('events', () => {
    it('should dispatch assist:open event when clicked', () => {
      const button = document.createElement('assist-button') as AssistButton;
      document.body.appendChild(button);
      
      const handler = vi.fn();
      button.addEventListener('assist:open', handler);
      
      const shadowRoot = button.shadowRoot;
      const buttonElement = shadowRoot?.querySelector('button') as HTMLButtonElement;
      buttonElement.click();
      
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0]).toBeInstanceOf(CustomEvent);
    });

    it('should toggle aria-expanded when clicked', () => {
      const button = document.createElement('assist-button') as AssistButton;
      document.body.appendChild(button);
      
      const shadowRoot = button.shadowRoot;
      const buttonElement = shadowRoot?.querySelector('button') as HTMLButtonElement;
      
      expect(buttonElement.getAttribute('aria-expanded')).toBe('false');
      
      buttonElement.click();
      expect(buttonElement.getAttribute('aria-expanded')).toBe('true');
      
      buttonElement.click();
      expect(buttonElement.getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('public API', () => {
    it('should have setExpanded method', () => {
      const button = document.createElement('assist-button') as AssistButton;
      document.body.appendChild(button);
      
      expect(typeof button.setExpanded).toBe('function');
    });

    it('should update aria-expanded via setExpanded', () => {
      const button = document.createElement('assist-button') as AssistButton;
      document.body.appendChild(button);
      
      const shadowRoot = button.shadowRoot;
      const buttonElement = shadowRoot?.querySelector('button') as HTMLButtonElement;
      
      button.setExpanded(true);
      expect(buttonElement.getAttribute('aria-expanded')).toBe('true');
      
      button.setExpanded(false);
      expect(buttonElement.getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('attribute changes', () => {
    it('should update variant when attribute changes', () => {
      const button = document.createElement('assist-button') as AssistButton;
      document.body.appendChild(button);
      
      let shadowRoot = button.shadowRoot;
      expect(shadowRoot?.querySelector('.assist-button--floating')).toBeTruthy();
      
      button.setAttribute('variant', 'inline');
      shadowRoot = button.shadowRoot;
      expect(shadowRoot?.querySelector('.assist-button--inline')).toBeTruthy();
    });

    it('should update label when attribute changes', () => {
      const button = document.createElement('assist-button') as AssistButton;
      document.body.appendChild(button);
      
      let shadowRoot = button.shadowRoot;
      let buttonElement = shadowRoot?.querySelector('button');
      expect(buttonElement?.textContent).toBe('⚙️');
      
      button.setAttribute('label', 'New Label');
      shadowRoot = button.shadowRoot;
      buttonElement = shadowRoot?.querySelector('button');
      expect(buttonElement?.textContent).toBe('New Label');
    });

    it('should update aria-label when attribute changes', () => {
      const button = document.createElement('assist-button') as AssistButton;
      document.body.appendChild(button);
      
      let shadowRoot = button.shadowRoot;
      let buttonElement = shadowRoot?.querySelector('button');
      expect(buttonElement?.getAttribute('aria-label')).toBe('Open assist menu');
      
      button.setAttribute('aria-label', 'New Aria Label');
      shadowRoot = button.shadowRoot;
      buttonElement = shadowRoot?.querySelector('button');
      expect(buttonElement?.getAttribute('aria-label')).toBe('New Aria Label');
    });
  });

  describe('styling', () => {
    it('should use CSS variables for styling', () => {
      const button = document.createElement('assist-button') as AssistButton;
      document.body.appendChild(button);
      
      const shadowRoot = button.shadowRoot;
      const styles = shadowRoot?.querySelector('style');
      expect(styles?.textContent).toContain('var(--neuroux-');
    });

    it('should have floating positioning when variant is floating', () => {
      const button = document.createElement('assist-button') as AssistButton;
      button.setAttribute('variant', 'floating');
      document.body.appendChild(button);
      
      const shadowRoot = button.shadowRoot;
      const styles = shadowRoot?.querySelector('style');
      expect(styles?.textContent).toContain('position: fixed');
      expect(styles?.textContent).toContain('bottom:');
      expect(styles?.textContent).toContain('right:');
    });

    it('should have inline positioning when variant is inline', () => {
      const button = document.createElement('assist-button') as AssistButton;
      button.setAttribute('variant', 'inline');
      document.body.appendChild(button);
      
      const shadowRoot = button.shadowRoot;
      const styles = shadowRoot?.querySelector('style');
      expect(styles?.textContent).toContain('position: relative');
    });
  });
});
