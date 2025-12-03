import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { normalizeConfig, loadConfig, NeuroUXConfig, NormalizedConfig } from './config-loader';
import { defaultConfig } from './defaults';

describe('config-loader', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe('normalizeConfig', () => {
    it('should return default config when no config is provided', () => {
      const result = normalizeConfig();
      expect(result).toEqual(defaultConfig);
    });

    it('should return default config when empty object is provided', () => {
      const result = normalizeConfig({});
      expect(result).toEqual(defaultConfig);
    });

    it('should merge user config with defaults', () => {
      const userConfig: NeuroUXConfig = {
        profile: 'custom-profile',
        rules: [
          {
            when: { idle: true },
            apply: { calmMode: true },
          },
        ],
        signals: ['idle', 'scroll'],
        styling: { theme: 'dark' },
        features: { animations: true },
      };

      const result = normalizeConfig(userConfig);

      expect(result.profile).toBe('custom-profile');
      expect(result.rules).toEqual(userConfig.rules);
      expect(result.signals).toEqual(['idle', 'scroll']);
      expect(result.styling).toEqual({ theme: 'dark' });
      expect(result.features).toEqual({ animations: true });
    });

    it('should apply default values for missing properties', () => {
      const userConfig: NeuroUXConfig = {
        profile: 'test-profile',
      };

      const result = normalizeConfig(userConfig);

      expect(result.profile).toBe('test-profile');
      expect(result.rules).toEqual(defaultConfig.rules);
      expect(result.signals).toEqual(defaultConfig.signals);
      expect(result.styling).toEqual(defaultConfig.styling);
      expect(result.features).toEqual(defaultConfig.features);
    });

    it('should trim profile string', () => {
      const userConfig: NeuroUXConfig = {
        profile: '  test-profile  ',
      };

      const result = normalizeConfig(userConfig);
      expect(result.profile).toBe('test-profile');
    });

    it('should use default profile when profile is empty string', () => {
      const userConfig: NeuroUXConfig = {
        profile: '',
      };

      const result = normalizeConfig(userConfig);
      expect(result.profile).toBe(defaultConfig.profile);
    });

    it('should use default profile when profile is only whitespace', () => {
      const userConfig: NeuroUXConfig = {
        profile: '   ',
      };

      const result = normalizeConfig(userConfig);
      expect(result.profile).toBe(defaultConfig.profile);
    });
  });

  describe('validation warnings', () => {
    it('should warn when rules is not an array', () => {
      normalizeConfig({ rules: 'invalid' as any });
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid config: "rules" must be an array')
      );
    });

    it('should warn when signals is not an array', () => {
      normalizeConfig({ signals: 'invalid' as any });
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid config: "signals" must be an array')
      );
    });

    it('should warn when styling is not an object', () => {
      normalizeConfig({ styling: 'invalid' as any });
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid config: "styling" must be an object')
      );
    });

    it('should warn when styling is an array', () => {
      normalizeConfig({ styling: [] as any });
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid config: "styling" must be an object')
      );
    });

    it('should warn when styling is null', () => {
      normalizeConfig({ styling: null as any });
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid config: "styling" must be an object')
      );
    });

    it('should warn when features is not an object', () => {
      normalizeConfig({ features: 'invalid' as any });
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid config: "features" must be an object')
      );
    });

    it('should warn when features is an array', () => {
      normalizeConfig({ features: [] as any });
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid config: "features" must be an object')
      );
    });

    it('should warn when features is null', () => {
      normalizeConfig({ features: null as any });
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid config: "features" must be an object')
      );
    });

    it('should warn when profile is not a string', () => {
      normalizeConfig({ profile: 123 as any });
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid config: "profile" must be a non-empty string')
      );
    });

    it('should warn when profile is empty string', () => {
      normalizeConfig({ profile: '' });
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid config: "profile" must be a non-empty string')
      );
    });

    it('should not throw errors, only warn', () => {
      expect(() => {
        normalizeConfig({
          rules: 'invalid' as any,
          signals: 'invalid' as any,
          styling: 'invalid' as any,
          features: 'invalid' as any,
          profile: 123 as any,
        });
      }).not.toThrow();
    });

    it('should use defaults when invalid values are provided', () => {
      const result = normalizeConfig({
        rules: 'invalid' as any,
        signals: 'invalid' as any,
        styling: 'invalid' as any,
        features: 'invalid' as any,
      });

      expect(result.rules).toEqual(defaultConfig.rules);
      expect(result.signals).toEqual(defaultConfig.signals);
      expect(result.styling).toEqual(defaultConfig.styling);
      expect(result.features).toEqual(defaultConfig.features);
    });
  });

  describe('config merging', () => {
    it('should merge partial styling config', () => {
      const userConfig: NeuroUXConfig = {
        styling: {
          theme: 'dark',
          fontSize: 16,
        },
      };

      const result = normalizeConfig(userConfig);
      expect(result.styling).toEqual({
        theme: 'dark',
        fontSize: 16,
      });
    });

    it('should merge partial features config', () => {
      const userConfig: NeuroUXConfig = {
        features: {
          animations: true,
          soundEffects: false,
        },
      };

      const result = normalizeConfig(userConfig);
      expect(result.features).toEqual({
        animations: true,
        soundEffects: false,
      });
    });

    it('should handle empty arrays', () => {
      const userConfig: NeuroUXConfig = {
        rules: [],
        signals: [],
      };

      const result = normalizeConfig(userConfig);
      expect(result.rules).toEqual([]);
      expect(result.signals).toEqual([]);
    });

    it('should handle complex rules', () => {
      const userConfig: NeuroUXConfig = {
        rules: [
          {
            when: { idle: true },
            apply: { calmMode: true },
          },
          {
            when: { focus: { $gt: 0.5 } },
            apply: { highlight: true },
          },
        ],
      };

      const result = normalizeConfig(userConfig);
      expect(result.rules).toHaveLength(2);
      expect(result.rules[0]).toEqual({
        when: { idle: true },
        apply: { calmMode: true },
      });
    });

    it('should handle string signals (backward compatibility)', () => {
      const userConfig: NeuroUXConfig = {
        signals: ['idle', 'scroll', 'focus'],
      };

      const result = normalizeConfig(userConfig);
      expect(result.signals).toEqual(['idle', 'scroll', 'focus']);
    });
  });

  describe('loadConfig (alias)', () => {
    it('should be an alias for normalizeConfig', () => {
      const userConfig: NeuroUXConfig = {
        profile: 'test',
      };

      const result1 = normalizeConfig(userConfig);
      const result2 = loadConfig(userConfig);

      expect(result1).toEqual(result2);
    });
  });

  describe('SSR compatibility', () => {
    it('should work without window object', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      expect(() => {
        normalizeConfig({ profile: 'test' });
      }).not.toThrow();

      global.window = originalWindow;
    });

    it('should work with undefined config in SSR context', () => {
      expect(() => {
        normalizeConfig(undefined as any);
      }).not.toThrow();
    });
  });
});
