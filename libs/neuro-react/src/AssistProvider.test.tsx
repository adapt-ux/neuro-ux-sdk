import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AssistProvider, NeuroContext } from './AssistProvider';
import type { NeuroUXInstance } from './AssistProvider';
import * as React from 'react';

describe('AssistProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should render children', () => {
      render(
        <AssistProvider>
          <div>Test Content</div>
        </AssistProvider>
      );

      expect(screen.getByText('Test Content')).toBeTruthy();
    });

    it('should create NeuroUX instance', () => {
      const createSpy = vi.spyOn(
        require('@adapt-ux/neuro-core'),
        'createNeuroUX'
      );

      render(
        <AssistProvider>
          <div>Test</div>
        </AssistProvider>
      );

      expect(createSpy).toHaveBeenCalledTimes(1);
    });

    it('should create NeuroUX instance with config', () => {
      const createSpy = vi.spyOn(
        require('@adapt-ux/neuro-core'),
        'createNeuroUX'
      );
      const config = { profile: 'test-profile' };

      render(
        <AssistProvider config={config}>
          <div>Test</div>
        </AssistProvider>
      );

      expect(createSpy).toHaveBeenCalledWith(config);
    });

    it('should provide NeuroUX instance via context', () => {
      let contextValue: NeuroUXInstance | null = null;

      const TestComponent = () => {
        contextValue = React.useContext(NeuroContext);
        return <div>Test</div>;
      };

      render(
        <AssistProvider>
          <TestComponent />
        </AssistProvider>
      );

      expect(contextValue).toBeTruthy();
      expect(contextValue).toHaveProperty('ui');
      expect(contextValue).toHaveProperty('styling');
      expect(contextValue).toHaveProperty('destroy');
    });
  });

  describe('cleanup', () => {
    it('should destroy NeuroUX instance on unmount', () => {
      const destroySpy = vi.fn();
      vi.spyOn(
        require('@adapt-ux/neuro-core'),
        'createNeuroUX'
      ).mockReturnValue({
        ui: { getAll: () => ({}) },
        styling: { apply: vi.fn() },
        destroy: destroySpy,
      });

      const { unmount } = render(
        <AssistProvider>
          <div>Test</div>
        </AssistProvider>
      );

      unmount();

      expect(destroySpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('styling integration', () => {
    it('should apply initial UI state if present', () => {
      const applySpy = vi.fn();
      const initialUi = { colorMode: 'calm' };

      vi.spyOn(
        require('@adapt-ux/neuro-core'),
        'createNeuroUX'
      ).mockReturnValue({
        ui: { getAll: () => initialUi },
        styling: { apply: applySpy },
        destroy: vi.fn(),
      });

      render(
        <AssistProvider>
          <div>Test</div>
        </AssistProvider>
      );

      expect(applySpy).toHaveBeenCalledWith(initialUi);
    });

    it('should not apply styling if UI state is empty', () => {
      const applySpy = vi.fn();

      vi.spyOn(
        require('@adapt-ux/neuro-core'),
        'createNeuroUX'
      ).mockReturnValue({
        ui: { getAll: () => ({}) },
        styling: { apply: applySpy },
        destroy: vi.fn(),
      });

      render(
        <AssistProvider>
          <div>Test</div>
        </AssistProvider>
      );

      expect(applySpy).not.toHaveBeenCalled();
    });
  });
});
