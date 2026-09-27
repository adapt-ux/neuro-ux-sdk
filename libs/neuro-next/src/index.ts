// Client components
export {
  NeuroUXProvider,
  type NeuroUXProviderProps,
} from './client/NeuroUXProvider';
export { useNeuroUX } from './client/useNeuroUX';
export { NeuroUXToggle } from './client/NeuroUXToggle';
export { AssistButton } from './client/AssistButton';
export type { AssistButtonProps, AssistButtonRef } from './client/AssistButton';
export { AssistMenu } from './client/AssistMenu';
export type { AssistMenuProps, AssistMenuRef } from './client/AssistMenu';
export {
  AssistProvider,
} from './client/AssistProvider';

// Server components (explicit exports to avoid conflicts)
export {
  NeuroUXProvider as ServerNeuroUXProvider,
} from './server/NeuroUXProvider';
export {
  AssistProvider as ServerAssistProvider,
  type AssistProviderProps as ServerAssistProviderProps,
} from './server/AssistProvider';

// Types
export * from './types';
