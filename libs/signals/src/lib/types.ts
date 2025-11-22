export interface SignalContext {
  emit(value: unknown): void;
}

export interface Signal {
  start(): void;
  stop(): void;
}
