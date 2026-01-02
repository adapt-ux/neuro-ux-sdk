import { useContext } from 'react';
import { NeuroUXContext } from '../NeuroUXProvider';
import type { NeuroUXInstance } from '../NeuroUXProvider';

/**
 * useNeuroUX - React hook to access the NeuroUX instance from context
 * 
 * @throws {Error} If used outside of NeuroUXProvider
 * @returns {NeuroUXInstance} The NeuroUX engine instance
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const neuro = useNeuroUX();
 *   const state = neuro.getState();
 *   return <div>Profile: {state.profile}</div>;
 * }
 * ```
 */
export function useNeuroUX(): NeuroUXInstance {
  const context = useContext(NeuroUXContext);
  
  if (!context) {
    throw new Error('useNeuroUX must be used within a NeuroUXProvider');
  }
  
  return context;
}
