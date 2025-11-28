import { useContext } from 'react';
import { NeuroContext } from './AssistProvider';
import type { NeuroUXInstance } from './AssistProvider';

export function useNeuroUX(): NeuroUXInstance {
  const context = useContext(NeuroContext);
  
  if (!context) {
    throw new Error('useNeuroUX must be used within an AssistProvider');
  }
  
  return context;
}
