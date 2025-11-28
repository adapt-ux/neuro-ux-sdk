/**
 * AssistMenu - Panel with list of available assists
 *
 * Minimum options for v0.1:
 * - "Calm Mode"
 * - "Increase Contrast"
 * - "Focus Mode" (Highlights only the main content)
 *
 * Direct integration with Core Engine via custom events.
 */

export interface AssistOption {
  id: string;
  label: string;
  description?: string;
  checked?: boolean;
}

export interface AssistMenuOptions {
  options?: AssistOption[];
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export class AssistMenu extends HTMLElement {
  private _options: AssistOption[] = [
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
  private _position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' =
    'bottom-right';
  private _isOpen = false;
  private _menuContainer: HTMLElement | null = null;

  static get observedAttributes() {
    return ['open', 'position'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._position = (this.getAttribute('position') as any) || 'bottom-right';
    this._isOpen = this.hasAttribute('open');

    this.render();
    this.attachEventListeners();
    this.attachGlobalListeners();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;

    if (name === 'open') {
      this._isOpen = this.hasAttribute('open');
      this.updateVisibility();
    } else if (name === 'position') {
      this._position = (newValue as any) || 'bottom-right';
      this.updatePosition();
    }
  }

  private render() {
    if (!this.shadowRoot) return;

    const positionClass = `assist-menu--${this._position}`;
    const visibilityClass = this._isOpen
      ? 'assist-menu--open'
      : 'assist-menu--closed';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

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

        .assist-menu__item:focus {
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
      </style>
      <div class="assist-menu ${positionClass} ${visibilityClass}" role="menu" aria-label="Assist options">
        <div class="assist-menu__header">Accessibility Options</div>
        <ul class="assist-menu__list">
          ${this._options
            .map(
              (option) => `
            <li class="assist-menu__item" role="menuitemcheckbox" aria-checked="${
              option.checked ? 'true' : 'false'
            }" data-option-id="${option.id}">
              <input
                type="checkbox"
                class="assist-menu__checkbox"
                id="assist-${option.id}"
                ${option.checked ? 'checked' : ''}
                aria-label="${option.label}"
              />
              <label class="assist-menu__label" for="assist-${option.id}">
                <span class="assist-menu__label-text">${option.label}</span>
                ${
                  option.description
                    ? `<span class="assist-menu__label-desc">${option.description}</span>`
                    : ''
                }
              </label>
            </li>
          `
            )
            .join('')}
        </ul>
      </div>
    `;

    this._menuContainer = this.shadowRoot.querySelector('.assist-menu');
  }

  private attachEventListeners() {
    if (!this.shadowRoot) return;

    const checkboxes = this.shadowRoot.querySelectorAll(
      '.assist-menu__checkbox'
    );
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        const item = target.closest('[data-option-id]') as HTMLElement;
        const optionId = item?.getAttribute('data-option-id');

        if (optionId) {
          const checked = target.checked;
          item.setAttribute('aria-checked', String(checked));

          // Dispatch custom event for Core Engine integration
          const event = new CustomEvent('assist:option-changed', {
            bubbles: true,
            cancelable: true,
            detail: {
              optionId,
              checked,
            },
          });
          this.dispatchEvent(event);
        }
      });
    });
  }

  private attachGlobalListeners() {
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (
        this._isOpen &&
        !this.contains(e.target as Node) &&
        !this.isButtonClick(e.target as Node)
      ) {
        this.close();
      }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this._isOpen) {
        this.close();
      }
    });
  }

  private isButtonClick(target: Node | null): boolean {
    if (!target) return false;
    const button = (target as Element).closest?.('assist-button');
    return !!button;
  }

  private updateVisibility() {
    if (!this._menuContainer) return;

    if (this._isOpen) {
      this._menuContainer.classList.remove('assist-menu--closed');
      this._menuContainer.classList.add('assist-menu--open');
      this.setAttribute('aria-hidden', 'false');
    } else {
      this._menuContainer.classList.remove('assist-menu--open');
      this._menuContainer.classList.add('assist-menu--closed');
      this.setAttribute('aria-hidden', 'true');
    }
  }

  private updatePosition() {
    if (!this._menuContainer) return;

    // Remove all position classes
    this._menuContainer.classList.remove(
      'assist-menu--bottom-right',
      'assist-menu--bottom-left',
      'assist-menu--top-right',
      'assist-menu--top-left'
    );

    // Add new position class
    this._menuContainer.classList.add(`assist-menu--${this._position}`);
  }

  // Public API
  public open() {
    this._isOpen = true;
    this.setAttribute('open', '');
    this.updateVisibility();
  }

  public close() {
    this._isOpen = false;
    this.removeAttribute('open');
    this.updateVisibility();
  }

  public toggle() {
    if (this._isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  public setOptionChecked(optionId: string, checked: boolean) {
    if (!this.shadowRoot) return;

    const checkbox = this.shadowRoot.querySelector(
      `#assist-${optionId}`
    ) as HTMLInputElement;
    const item = checkbox?.closest('[data-option-id]') as HTMLElement;

    if (checkbox && item) {
      checkbox.checked = checked;
      item.setAttribute('aria-checked', String(checked));
    }
  }

  public getOptionChecked(optionId: string): boolean {
    if (!this.shadowRoot) return false;

    const checkbox = this.shadowRoot.querySelector(
      `#assist-${optionId}`
    ) as HTMLInputElement;
    return checkbox?.checked || false;
  }
}

customElements.define('assist-menu', AssistMenu);
