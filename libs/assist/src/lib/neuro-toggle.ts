export class NeuroToggle extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <button class="neuro-toggle">⚙️ UX</button>
    `;
  }
}

customElements.define('neuro-toggle', NeuroToggle);
