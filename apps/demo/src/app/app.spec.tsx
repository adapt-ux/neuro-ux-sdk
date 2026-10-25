import { render } from '@testing-library/react';

import App from './app';

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<App />);
    expect(baseElement).toBeTruthy();
  });

  it('should render the demo title', async () => {
    const { findByRole } = render(<App />);
    // NeuroUXProvider renders children only after core is dynamically imported
    expect(
      await findByRole(
        'heading',
        { level: 1, name: 'NeuroUX SDK Demo' },
        { timeout: 10000 }
      )
    ).toBeTruthy();
  });
});
