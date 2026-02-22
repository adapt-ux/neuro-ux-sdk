import { useState } from 'react';
import {
  NeuroUXProvider,
  AssistButton,
  AssistMenu,
} from '@adapt-ux/neuro-react';
import { SignalBridge } from './SignalBridge';
import { DebugPanel } from './DebugPanel';

const DEMO_CONFIG = {
  profile: 'adhd',
  debug: true,
  rules: [
    {
      when: { signal: 'idle' as const, op: '===' as const, value: true },
      apply: { ui: { colorMode: 'calm' } },
    },
    {
      when: { signal: 'idle' as const, op: '===' as const, value: false },
      apply: { ui: { colorMode: 'neutral' } },
    },
    {
      when: { signal: 'scroll' as const, op: '>' as const, value: 100 },
      apply: { ui: { staticMode: true } },
    },
  ],
};

export function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <NeuroUXProvider config={DEMO_CONFIG}>
      <SignalBridge />

      <div className="app-container">
        <header>
          <h1>NeuroUX SDK Demo</h1>
          <p>
            Interactive testing environment for NeuroUX Core, Signals, Assist
            Menu, and UI adaptations
          </p>
        </header>

        <main>
          <section className="content">
            <div className="content-card">
              <h2>Interactive Area</h2>
              <p>Try these actions to see signals in action:</p>
              <ul>
                <li>🖱️ Move your mouse or click</li>
                <li>📜 Scroll the page</li>
                <li>⌨️ Press any key</li>
                <li>⏱️ Wait 3 seconds (idle detection)</li>
              </ul>
            </div>

            <div className="content-card">
              <h2>Assist Menu</h2>
              <p>
                Click the floating button (bottom-right) or the inline button below to open
                accessibility options: Calm Mode, Contrast, Focus Mode.
              </p>
              <div style={{ marginTop: '1rem' }}>
                <AssistButton
                  variant="inline"
                  label="⚙️ Open options"
                  onClick={() => setMenuOpen((prev) => !prev)}
                />
              </div>
            </div>

            <div className="content-card">
              <h2>Manual Toggles</h2>
              <p>Test UI channel updates via the Assist Menu or rules above.</p>
              <p className="hint">
                Rules: idle → calm/neutral mode. Scroll &gt; 100px → static mode.
              </p>
            </div>

            <div className="scrollable-area" id="scrollable-content">
              <h3>Scrollable Content</h3>
              <p>
                Scroll this section to see scroll velocity and direction
                detection.
              </p>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="spacer">
                  Block {i}
                </div>
              ))}
            </div>
          </section>

          <DebugPanel />
        </main>
      </div>

      <AssistButton
        variant="floating"
        label="⚙️"
        ariaLabel="Open assist menu"
        onClick={() => setMenuOpen((prev) => !prev)}
      />

      <AssistMenu
        open={menuOpen}
        onOpenChange={setMenuOpen}
        position="bottom-right"
      />
    </NeuroUXProvider>
  );
}

export default App;
