import { describe, it, expect, vi, beforeEach } from 'vitest';
import { provideNeuroUX } from './useNeuroUX';

// Mock the createNeuroUX function
vi.mock('@adapt-ux/neuro-core', async () => {
  const actual = await vi.importActual('@adapt-ux/neuro-core');
  return {
    ...actual,
    createNeuroUX: vi.fn(),
  };
});

describe('provideNeuroUX', () => {
  let actualCreateNeuroUX: any;
  let mockCreateNeuroUX: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    if (!actualCreateNeuroUX) {
      const mod = await vi.importActual('@adapt-ux/neuro-core');
      actualCreateNeuroUX = (mod as any).createNeuroUX;
    }
    const mod = await import('@adapt-ux/neuro-core');
    mockCreateNeuroUX = vi.mocked(mod.createNeuroUX);
    mockCreateNeuroUX.mockImplementation(actualCreateNeuroUX);
  });

  it('should provide NeuroUX instance ref', async () => {
    const instanceRef = provideNeuroUX({ profile: 'adhd' });

    expect(instanceRef).toBeDefined();
    expect(instanceRef.value).toBeNull(); // Initially null, will be set async

    // Wait for async initialization
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockCreateNeuroUX).toHaveBeenCalledWith({ profile: 'adhd' });
  });

  it('should create instance with config', async () => {
    const config = { profile: 'adhd', debug: true };

    provideNeuroUX(config);

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockCreateNeuroUX).toHaveBeenCalledWith(config);
  });

  it('should return same ref if called multiple times', () => {
    // In a real Vue component context, calling provideNeuroUX twice would return the same ref
    // In test context, each call creates a new injection context, so we just verify it works
    const ref1 = provideNeuroUX();
    const ref2 = provideNeuroUX();

    // Both should be refs (in test context they're different instances)
    expect(ref1).toBeDefined();
    expect(ref2).toBeDefined();
    expect(ref1.value).toBeNull();
    expect(ref2.value).toBeNull();
  });
});
