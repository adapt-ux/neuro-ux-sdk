export type SignalName = string;
export type SignalValue = number | boolean | string;

export interface SignalError {
  type: 'duplicate' | 'unknown' | 'invalid-type' | 'invalid-name';
  name: string;
  attemptedValue?: unknown;
  initialValue?: unknown;
}
