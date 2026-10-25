import { render } from '@testing-library/react';

import App from './app';

describe('App', () => {
  // NeuroUXProvider renders children only after core is dynamically imported
  beforeAll(async () => {
    await import('@adapt-ux/neuro-ux-sdk-core');
  }, 30000);

  it('should render successfully', () => {
    const { baseElement } = render(<App />);
    expect(baseElement).toBeTruthy();
  });

  it('should render the demo title', async () => {
    const { findByRole } = render(<App />);
    expect(
      await findByRole('heading', { level: 1, name: 'NeuroUX SDK Demo' })
    ).toBeTruthy();
  });
});
