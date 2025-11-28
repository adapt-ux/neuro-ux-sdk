export interface AssistToggleOptions {
  variant?: 'floating' | 'fixed';
}

export interface AssistButtonOptions {
  variant?: 'floating' | 'inline';
  label?: string;
  ariaLabel?: string;
}

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

export interface AssistAdaptation {
  calmMode?: boolean;
  contrast?: 'high' | 'low' | 'normal';
  focusMode?: boolean;
}
