import { Injectable } from '@angular/core';
import { createNeuroUX } from '@adapt-ux/neuro-core';

@Injectable({ providedIn: 'root' })
export class NeuroUXService {
  ux = createNeuroUX();

  init() {
    this.ux.init();
  }
  destroy() {
    this.ux.destroy();
  }
  get state() {
    return this.ux.getState();
  }
}
