import type { Preset, StyleMapping } from '../styling-types';

/**
 * Base preset definitions
 */
export const basePresets: Preset[] = [
  {
    name: 'calmMode',
    styleState: {
      calmMode: true,
    },
  },
  {
    name: 'highContrast',
    styleState: {
      contrast: 'high',
    },
  },
  {
    name: 'focusMode',
    styleState: {
      focusMode: true,
    },
  },
];

/**
 * Default style mappings
 * Maps logical style properties to CSS variable definitions
 */
export const defaultMappings: StyleMapping = {
  calmMode: {
    true: {
      '--neuroux-bg': '#f4f6ff',
      '--neuroux-color-accent': '#88aaff',
      '--neuroux-text': '#1a1a2e',
      '--neuroux-border': '#d0d8ff',
    },
    false: {
      '--neuroux-bg': '#ffffff',
      '--neuroux-color-accent': '#636e72',
      '--neuroux-text': '#111111',
      '--neuroux-border': '#e0e0e0',
    },
  },
  contrast: {
    low: {
      '--neuroux-contrast': '1.1',
      '--neuroux-text': '#666666',
      '--neuroux-bg': '#f5f5f5',
    },
    normal: {
      '--neuroux-contrast': '1.2',
      '--neuroux-text': '#333333',
      '--neuroux-bg': '#ffffff',
    },
    high: {
      '--neuroux-contrast': '1.4',
      '--neuroux-text': '#000000',
      '--neuroux-bg': '#ffffff',
    },
  },
  focusMode: {
    true: {
      '--neuroux-focus-ring': '0 0 0 2px #0044ff',
      '--neuroux-focus-opacity': '1',
      '--neuroux-focus-outline': '2px solid #0044ff',
    },
    false: {
      '--neuroux-focus-ring': 'none',
      '--neuroux-focus-opacity': '0.7',
      '--neuroux-focus-outline': '1px solid #ccc',
    },
  },
};
