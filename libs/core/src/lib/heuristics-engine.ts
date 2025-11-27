import { SignalsRegistry, SignalValue } from './signals/signals-registry';
import { createEventBus } from './event-bus';

/**
 * Event bus interface
 */
interface EventBus {
  on(event: string, cb: (...args: any[]) => void): () => void;
  off(event: string, cb: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;
}

/**
 * State structure that heuristics can access
 */
export interface HeuristicsState {
  signals: Record<string, SignalValue>;
  profile?: string;
  [key: string]: any;
}

/**
 * Previous heuristic values for comparison
 */
export interface HeuristicPrevious {
  [heuristicName: string]: SignalValue;
}

/**
 * Heuristic function that evaluates state and returns a derived signal value
 */
export type HeuristicFunction = (
  state: HeuristicsState,
  previous: HeuristicPrevious
) => SignalValue;

/**
 * Heuristic definition
 */
export interface Heuristic {
  name: string;
  evaluate: HeuristicFunction;
}

/**
 * Heuristics Engine interface
 */
export interface HeuristicsEngine {
  /**
   * Register a new heuristic
   */
  register(heuristic: Heuristic): void;

  /**
   * Evaluate all heuristics and emit updates
   */
  evaluate(state: HeuristicsState): void;

  /**
   * Get current heuristic values
   */
  getValues(): Record<string, SignalValue>;

  /**
   * Destroy the engine and clean up
   */
  destroy(): void;
}

/**
 * Focus Variability heuristic
 * Measures how frequently the focus signal oscillates
 * Returns a number between 0 (stable) and 1 (highly variable)
 */
function focusVariabilityHeuristic(
  state: HeuristicsState,
  previous: HeuristicPrevious
): SignalValue {
  const focusValue = state.signals.focus;
  const prevFocus = previous.focusStability;

  // If no focus signal exists, return neutral value
  if (focusValue === undefined) {
    return 0.5;
  }

  // Convert focus to number if boolean
  const currentFocus = typeof focusValue === 'boolean' ? (focusValue ? 1 : 0) : Number(focusValue);
  const prevFocusNum = prevFocus !== undefined
    ? (typeof prevFocus === 'boolean' ? (prevFocus ? 1 : 0) : Number(prevFocus))
    : currentFocus;

  // Calculate variability: difference between current and previous
  // Normalize to 0-1 range (assuming focus values are 0-1)
  const variability = Math.abs(currentFocus - prevFocusNum);
  
  // Use exponential smoothing for stability
  const prevVariability = previous.focusStability !== undefined
    ? Number(previous.focusStability)
    : 0.5;
  
  // Smooth the variability over time (alpha = 0.3 for responsiveness)
  const smoothed = prevVariability * 0.7 + variability * 0.3;
  
  return Math.min(1, Math.max(0, smoothed));
}

/**
 * Idle Burstiness heuristic
 * Measures gaps between idle events
 * Returns a number between 0 (regular) and 1 (bursty)
 */
function idleBurstinessHeuristic(
  state: HeuristicsState,
  previous: HeuristicPrevious
): SignalValue {
  const idleValue = state.signals.idle;
  const prevIdle = previous.idlePattern;

  // If no idle signal exists, return neutral value
  if (idleValue === undefined) {
    return 0.5;
  }

  // Convert idle to number if boolean
  const currentIdle = typeof idleValue === 'boolean' ? (idleValue ? 1 : 0) : Number(idleValue);
  const prevIdleNum = prevIdle !== undefined
    ? (typeof prevIdle === 'boolean' ? (prevIdle ? 1 : 0) : Number(prevIdle))
    : currentIdle;

  // Burstiness: measure transitions (idle -> active or active -> idle)
  // If state changed, that's a burst indicator
  const stateChanged = currentIdle !== prevIdleNum ? 1 : 0;
  
  // Use exponential smoothing
  const prevBurstiness = previous.idlePattern !== undefined
    ? Number(previous.idlePattern)
    : 0.5;
  
  const smoothed = prevBurstiness * 0.8 + stateChanged * 0.2;
  
  return Math.min(1, Math.max(0, smoothed));
}

/**
 * Scroll Behavior Intensity heuristic
 * Measures scroll speed and distance
 * Returns a number between 0 (slow/gentle) and 1 (fast/aggressive)
 */
function scrollBehaviorIntensityHeuristic(
  state: HeuristicsState,
  previous: HeuristicPrevious
): SignalValue {
  const scrollValue = state.signals.scroll;
  const prevScroll = previous.scrollAggression;

  // If no scroll signal exists, return neutral value
  if (scrollValue === undefined) {
    return 0.5;
  }

  // Convert scroll to number
  const currentScroll = Number(scrollValue);
  const prevScrollNum = prevScroll !== undefined ? Number(prevScroll) : currentScroll;

  // Intensity: rate of change (speed) + magnitude
  const scrollDelta = Math.abs(currentScroll - prevScrollNum);
  
  // Normalize: assume scroll values are typically 0-1000px, normalize to 0-1
  // For simplicity, we'll use a threshold-based approach
  const normalizedDelta = Math.min(1, scrollDelta / 100);
  
  // Use exponential smoothing
  const prevIntensity = previous.scrollAggression !== undefined
    ? Number(previous.scrollAggression)
    : 0.5;
  
  const smoothed = prevIntensity * 0.7 + normalizedDelta * 0.3;
  
  return Math.min(1, Math.max(0, smoothed));
}

/**
 * Interaction Density heuristic
 * Measures number of different signals firing in a time window
 * Returns a number between 0 (low density) and 1 (high density)
 */
function interactionDensityHeuristic(
  state: HeuristicsState,
  previous: HeuristicPrevious
): SignalValue {
  const signals = state.signals;
  
  // Count active signals (non-zero, non-false, non-empty)
  let activeCount = 0;
  let totalCount = 0;
  
  for (const [key, value] of Object.entries(signals)) {
    // Skip internal heuristics storage
    if (key === '_internalHeuristics') {
      continue;
    }
    
    totalCount++;
    
    // Consider signal active if it has a meaningful value
    if (typeof value === 'number' && value !== 0) {
      activeCount++;
    } else if (typeof value === 'boolean' && value === true) {
      activeCount++;
    } else if (typeof value === 'string' && value.length > 0) {
      activeCount++;
    }
  }
  
  // Density: ratio of active signals to total signals
  const density = totalCount > 0 ? activeCount / totalCount : 0.5;
  
  // Use exponential smoothing for stability
  const prevDensity = previous.interactionDensity !== undefined
    ? Number(previous.interactionDensity)
    : 0.5;
  
  const smoothed = prevDensity * 0.6 + density * 0.4;
  
  return Math.min(1, Math.max(0, smoothed));
}

/**
 * Creates a heuristics engine that evaluates behavioral patterns
 * and generates derived signals
 */
export function createHeuristicsEngine(
  signals: SignalsRegistry,
  eventBus: EventBus
): HeuristicsEngine {
  const heuristics: Heuristic[] = [];
  const previousValues: HeuristicPrevious = {};
  const eventBusInternal = createEventBus();

  // Register base heuristics
  heuristics.push(
    {
      name: 'focusStability',
      evaluate: focusVariabilityHeuristic,
    },
    {
      name: 'idlePattern',
      evaluate: idleBurstinessHeuristic,
    },
    {
      name: 'scrollAggression',
      evaluate: scrollBehaviorIntensityHeuristic,
    },
    {
      name: 'interactionDensity',
      evaluate: interactionDensityHeuristic,
    }
  );

  /**
   * Evaluate all heuristics and update signals
   */
  function evaluate(state: HeuristicsState): void {
    const updates: Record<string, SignalValue> = {};
    const changedHeuristics: Record<string, SignalValue> = {};

    for (const heuristic of heuristics) {
      try {
        const newValue = heuristic.evaluate(state, previousValues);
        const prevValue = previousValues[heuristic.name];

        // Check if value changed (with small threshold for numbers)
        let hasChanged = false;
        if (prevValue === undefined) {
          hasChanged = true;
        } else if (typeof newValue === 'number' && typeof prevValue === 'number') {
          hasChanged = Math.abs(newValue - prevValue) > 0.01;
        } else {
          hasChanged = newValue !== prevValue;
        }

        if (hasChanged) {
          previousValues[heuristic.name] = newValue;
          updates[heuristic.name] = newValue;
          changedHeuristics[heuristic.name] = newValue;

          // Register signal if it doesn't exist
          if (signals.get(heuristic.name) === undefined) {
            signals.register(heuristic.name, newValue);
          } else {
            // Update existing signal
            signals.update(heuristic.name, newValue);
          }
        }
      } catch (error) {
        // Silently handle heuristic errors to prevent engine crashes
        // In production, you might want to log this
        console.warn(`Heuristic "${heuristic.name}" evaluation failed:`, error);
      }
    }

    // Store previous values in internal state (hidden from user)
    const currentSignals = state.signals || {};
    const internalHeuristics = {
      ...currentSignals._internalHeuristics,
      ...previousValues,
    };

    // Update internal storage via signals (if needed, we can access it later)
    // Note: We don't expose _internalHeuristics as a regular signal

    // Emit heuristic:update event if any heuristics changed
    if (Object.keys(changedHeuristics).length > 0) {
      eventBus.emit('heuristic:update', {
        heuristics: changedHeuristics,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Get current heuristic values
   */
  function getValues(): Record<string, SignalValue> {
    return { ...previousValues };
  }

  /**
   * Register a new heuristic
   */
  function register(heuristic: Heuristic): void {
    // Validate heuristic
    if (!heuristic || !heuristic.name || typeof heuristic.evaluate !== 'function') {
      throw new Error('Invalid heuristic: must have name and evaluate function');
    }

    // Check for duplicates
    if (heuristics.some((h) => h.name === heuristic.name)) {
      throw new Error(`Heuristic "${heuristic.name}" is already registered`);
    }

    heuristics.push(heuristic);
  }

  /**
   * Destroy the engine
   */
  function destroy(): void {
    heuristics.length = 0;
    Object.keys(previousValues).forEach((key) => delete previousValues[key]);
  }

  return {
    register,
    evaluate,
    getValues,
    destroy,
  };
}
