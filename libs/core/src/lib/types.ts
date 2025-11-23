export interface NeuroUXOptions {
  profile?: string;
  signals?: string[];
}

export interface NeuroUXInstance {
  init(): void;
  destroy(): void;
  getState(): unknown;
  on(event: string, handler: (...args: any[]) => void): void;
}
