import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { AssistProvider } from './AssistProvider';

describe('AssistProvider (Next.js Server)', () => {
  describe('rendering', () => {
    it('should render children', () => {
      const { container } = render(
        <AssistProvider>
          <div>Test Content</div>
        </AssistProvider>
      );

      expect(container.textContent).toContain('Test Content');
    });

    it('should inject script tag with config', () => {
      const config = { profile: 'test-profile', signals: ['focus'] };
      const { container } = render(
        <AssistProvider config={config}>
          <div>Test</div>
        </AssistProvider>
      );

      const script = container.querySelector('script');
      expect(script).toBeTruthy();
      expect(script?.textContent).toContain('__NEURO_UX_CONFIG__');
      expect(script?.textContent).toContain('test-profile');
    });

    it('should use empty config when not provided', () => {
      const { container } = render(
        <AssistProvider>
          <div>Test</div>
        </AssistProvider>
      );

      const script = container.querySelector('script');
      expect(script).toBeTruthy();
      expect(script?.textContent).toContain('__NEURO_UX_CONFIG__');
      expect(script?.textContent).toContain('{}');
    });

    it('should stringify config correctly', () => {
      const config = {
        profile: 'test-profile',
        signals: ['focus', 'attention'],
        debug: true,
      };
      const { container } = render(
        <AssistProvider config={config}>
          <div>Test</div>
        </AssistProvider>
      );

      const script = container.querySelector('script');
      const scriptContent = script?.textContent || '';
      
      expect(scriptContent).toContain('test-profile');
      expect(scriptContent).toContain('focus');
      expect(scriptContent).toContain('attention');
      expect(scriptContent).toContain('true');
    });

    it('should handle complex config objects', () => {
      const config = {
        profile: 'custom',
        signals: ['signal1', 'signal2'],
        rules: [{ id: 'rule1' }],
      };
      const { container } = render(
        <AssistProvider config={config}>
          <div>Test</div>
        </AssistProvider>
      );

      const script = container.querySelector('script');
      expect(script).toBeTruthy();
      const scriptContent = script?.textContent || '';
      expect(scriptContent).toContain('custom');
      expect(scriptContent).toContain('signal1');
    });

    it('should render script before children', () => {
      const { container } = render(
        <AssistProvider config={{ profile: 'test' }}>
          <div>Child Content</div>
        </AssistProvider>
      );

      const script = container.querySelector('script');
      const child = container.querySelector('div');
      
      expect(script).toBeTruthy();
      expect(child).toBeTruthy();
      // Script should come before children in DOM order
      expect(container.firstChild).toBe(script);
    });
  });
});
