import { useEffect, useState, useRef } from 'react';
import { useSignals, useUIState, useNeuroUX } from '@adapt-ux/neuro-react';

interface EventItem {
  timestamp: string;
  type: string;
  data: unknown;
}

export function DebugPanel() {
  const [signals] = useSignals();
  const uiState = useUIState();
  const neuro = useNeuroUX();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [status, setStatus] = useState('Running');
  const [lastDecision, setLastDecision] = useState<unknown | null>(null);
  const [config, setConfig] = useState<unknown | null>(null);
  const maxEvents = 20;
  const eventLogRef = useRef<EventItem[]>([]);

  useEffect(() => {
    const addEvent = (type: string, data: unknown) => {
      const event: EventItem = {
        timestamp: new Date().toLocaleTimeString(),
        type,
        data,
      };
      eventLogRef.current = [event, ...eventLogRef.current].slice(0, maxEvents);
      setEvents([...eventLogRef.current]);
    };

    const unsub = neuro.subscribe((state) => {
      addEvent('state-change', state);
    });

    const cleanupSignal = neuro.on('signal:update', (data) => {
      addEvent('signal', data);
    });

    const cleanupUi = neuro.on('ui:update', (data) => {
      addEvent('ui-update', data);
    });

    const cleanupAdaptation = neuro.on('adaptation', (data) => {
      addEvent('adaptation', data);
      if (neuro.debug) {
        setLastDecision(neuro.debug.explainLastDecision());
      }
      setConfig(neuro.getConfig());
    });

    addEvent('init', { message: 'Demo initialized' });
    if (neuro.debug) {
      setLastDecision(neuro.debug.explainLastDecision());
    }
    setConfig(neuro.getConfig());

    return () => {
      unsub();
      cleanupSignal();
      cleanupUi();
      cleanupAdaptation();
    };
  }, [neuro]);

  const profile = neuro.getState().profile ?? 'default';
  const idleValue = signals.idle;
  const scrollValue = signals.scroll;

  const refreshDebug = () => {
    setLastDecision(neuro.debug.explainLastDecision());
    setConfig(neuro.getConfig());
  };

  return (
    <aside className="debug-panel">
      <h2>Debug Panel</h2>

      <div className="panel-section">
        <h3>Engine State</h3>
        <div className="state-display">
          <p>
            <strong>Profile:</strong> <span>{profile}</span>
          </p>
          <p>
            <strong>Status:</strong>{' '}
            <span style={{ color: status === 'Running' ? '#27ae60' : '#e74c3c' }}>
              {status}
            </span>
          </p>
        </div>
      </div>

      <div className="panel-section">
        <h3>Signal Snapshot</h3>
        <div className="state-display">
          <div>
            <strong>Idle:</strong>{' '}
            <span style={{ color: idleValue ? '#e74c3c' : '#27ae60' }}>
              {idleValue === undefined ? '-' : idleValue ? 'Idle' : 'Active'}
            </span>
          </div>
          <div>
            <strong>Scroll:</strong>{' '}
            <span>{scrollValue !== undefined ? `${scrollValue}px` : '-'}</span>
          </div>
        </div>
      </div>

      <div className="panel-section">
        <h3>UI Channel</h3>
        <div className="state-display">
          <pre style={{ margin: 0, fontSize: '0.85rem', overflow: 'auto' }}>
            {JSON.stringify(uiState, null, 2) || '{}'}
          </pre>
        </div>
      </div>

      {neuro.debug && (
        <>
          <div className="panel-section">
            <h3>Explain Last Decision</h3>
            <div className="state-display">
              <button
                type="button"
                className="toggle-btn"
                onClick={refreshDebug}
                style={{ marginBottom: '0.5rem' }}
              >
                Refresh
              </button>
              {lastDecision ? (
                <pre style={{ margin: 0, fontSize: '0.8rem', overflow: 'auto' }}>
                  {JSON.stringify(lastDecision, null, 2)}
                </pre>
              ) : (
                <p className="event-placeholder">No rule matched yet. Interact to trigger rules.</p>
              )}
            </div>
          </div>
          <div className="panel-section">
            <h3>Config (getConfig)</h3>
            <div className="state-display">
              <pre style={{ margin: 0, fontSize: '0.75rem', overflow: 'auto', maxHeight: '120px' }}>
                {config ? JSON.stringify(config, null, 2) : '-'}
              </pre>
            </div>
          </div>
        </>
      )}

      <div className="panel-section">
        <h3>Recent Events</h3>
        <div className="event-log">
          {events.length === 0 ? (
            <p className="event-placeholder">No events yet...</p>
          ) : (
            events.map((event, i) => (
              <div
                key={i}
                className={`event-item ${
                  event.type === 'error' ? 'error' : event.type === 'init' ? 'success' : ''
                }`}
              >
                <span className="event-timestamp">{event.timestamp}</span>
                <span className="event-type">[{event.type}]</span>
                <span className="event-data">
                  {typeof event.data === 'object'
                    ? JSON.stringify(event.data)
                    : String(event.data)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
