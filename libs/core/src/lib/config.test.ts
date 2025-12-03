import { describe, it, expect } from 'vitest';
import { loadConfig, NeuroUXConfig } from './config';

describe('loadConfig', () => {
  it('should return default configuration when no configuration is provided', () => {
    const config = loadConfig();

    expect(config).toEqual({
      profile: 'default',
      signals: [],
      rules: [],
      styling: {},
      features: {},
    });
  });

  it('should return default configuration when an empty object is provided', () => {
    const config = loadConfig({});

    expect(config).toEqual({
      profile: 'default',
      signals: [],
      rules: [],
      styling: {},
      features: {},
    });
  });

  it('should merge user configuration with defaults', () => {
    const userConfig: NeuroUXConfig = {
      profile: 'custom-profile',
      signals: ['signal1', 'signal2'],
      rules: [{ id: 'rule1' }],
    };

    const config = loadConfig(userConfig);

    expect(config.profile).toBe('custom-profile');
    expect(config.signals).toEqual(['signal1', 'signal2']);
    expect(config.rules).toEqual([{ id: 'rule1' }]);
    expect(config.styling).toEqual({});
    expect(config.features).toEqual({});
  });

  it('should use default values for signals when not provided', () => {
    const userConfig: NeuroUXConfig = {
      profile: 'test-profile',
    };

    const config = loadConfig(userConfig);

    expect(config.signals).toEqual([]);
    expect(config.profile).toBe('test-profile');
  });

  it('should use default values for rules when not provided', () => {
    const userConfig: NeuroUXConfig = {
      profile: 'test-profile',
      signals: ['signal1'],
    };

    const config = loadConfig(userConfig);

    expect(config.rules).toEqual([]);
    expect(config.signals).toEqual(['signal1']);
  });

  it('should override default values when provided', () => {
    const userConfig: NeuroUXConfig = {
      profile: 'new-profile',
      signals: ['new-signal'],
      rules: [{ id: 'new-rule' }],
    };

    const config = loadConfig(userConfig);

    expect(config.profile).toBe('new-profile');
    expect(config.signals).toEqual(['new-signal']);
    expect(config.rules).toEqual([{ id: 'new-rule' }]);
  });

  it('should return a valid NormalizedConfig object', () => {
    const config = loadConfig();

    expect(config).toHaveProperty('profile');
    expect(config).toHaveProperty('signals');
    expect(config).toHaveProperty('rules');
    expect(config).toHaveProperty('styling');
    expect(config).toHaveProperty('features');
    expect(typeof config.profile).toBe('string');
    expect(Array.isArray(config.signals)).toBe(true);
    expect(Array.isArray(config.rules)).toBe(true);
    expect(typeof config.styling).toBe('object');
    expect(typeof config.features).toBe('object');
  });
});
