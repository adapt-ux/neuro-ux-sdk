import { describe, it, expect, vi } from 'vitest';
import { createStateContainer } from './state';

describe('createStateContainer', () => {
  describe('getState', () => {
    it('should return the initial state', () => {
      const initialState = { count: 0, name: 'test' };
      const state = createStateContainer(initialState);

      expect(state.getState()).toEqual(initialState);
    });

    it('should return a copy of the state, not the original reference', () => {
      const initialState = { count: 0 };
      const state = createStateContainer(initialState);
      const currentState = state.getState();

      expect(currentState).not.toBe(initialState);
      expect(currentState).toEqual(initialState);
    });

    it('should return the updated state after setState', () => {
      const state = createStateContainer({ count: 0 });
      state.setState({ count: 5 });

      expect(state.getState()).toEqual({ count: 5 });
    });
  });

  describe('setState', () => {
    it('should update the state with a partial patch', () => {
      const state = createStateContainer({ count: 0, name: 'initial' });
      state.setState({ count: 10 });

      expect(state.getState()).toEqual({ count: 10, name: 'initial' });
    });

    it('should merge multiple updates', () => {
      const state = createStateContainer({ a: 1, b: 2, c: 3 });
      state.setState({ a: 10 });
      state.setState({ b: 20 });

      expect(state.getState()).toEqual({ a: 10, b: 20, c: 3 });
    });

    it('should notify all subscribers when state changes', () => {
      const state = createStateContainer({ count: 0 });
      const subscriber1 = vi.fn();
      const subscriber2 = vi.fn();

      state.subscribe(subscriber1);
      state.subscribe(subscriber2);

      state.setState({ count: 5 });

      expect(subscriber1).toHaveBeenCalledWith({ count: 5 });
      expect(subscriber2).toHaveBeenCalledWith({ count: 5 });
    });

    it('should notify subscribers with the complete updated state', () => {
      const state = createStateContainer({ a: 1, b: 2 });
      const subscriber = vi.fn();

      state.subscribe(subscriber);
      state.setState({ a: 10 });

      expect(subscriber).toHaveBeenCalledWith({ a: 10, b: 2 });
    });

    it('should not modify the original state', () => {
      const initialState = { count: 0 };
      const state = createStateContainer(initialState);
      state.setState({ count: 5 });

      expect(initialState).toEqual({ count: 0 });
    });

    it('should allow updating with empty object without breaking', () => {
      const state = createStateContainer({ count: 0 });
      const subscriber = vi.fn();

      state.subscribe(subscriber);
      state.setState({});

      expect(state.getState()).toEqual({ count: 0 });
      expect(subscriber).toHaveBeenCalledWith({ count: 0 });
    });
  });

  describe('subscribe', () => {
    it('should register a subscriber', () => {
      const state = createStateContainer({ count: 0 });
      const subscriber = vi.fn();

      state.subscribe(subscriber);
      state.setState({ count: 1 });

      expect(subscriber).toHaveBeenCalledWith({ count: 1 });
    });

    it('should register multiple subscribers', () => {
      const state = createStateContainer({ count: 0 });
      const subscriber1 = vi.fn();
      const subscriber2 = vi.fn();
      const subscriber3 = vi.fn();

      state.subscribe(subscriber1);
      state.subscribe(subscriber2);
      state.subscribe(subscriber3);

      state.setState({ count: 1 });

      expect(subscriber1).toHaveBeenCalledTimes(1);
      expect(subscriber2).toHaveBeenCalledTimes(1);
      expect(subscriber3).toHaveBeenCalledTimes(1);
    });

    it('should return an unsubscribe function', () => {
      const state = createStateContainer({ count: 0 });
      const subscriber = vi.fn();

      const unsubscribe = state.subscribe(subscriber);

      state.setState({ count: 1 });
      expect(subscriber).toHaveBeenCalledTimes(1);

      unsubscribe();

      state.setState({ count: 2 });
      expect(subscriber).toHaveBeenCalledTimes(1); // Should not be called again
    });

    it('should notify subscribers immediately after subscription if state changes', () => {
      const state = createStateContainer({ count: 0 });
      const subscriber = vi.fn();

      state.subscribe(subscriber);
      state.setState({ count: 1 });

      expect(subscriber).toHaveBeenCalledWith({ count: 1 });
    });

    it('should not notify subscribers after unsubscribe', () => {
      const state = createStateContainer({ count: 0 });
      const subscriber1 = vi.fn();
      const subscriber2 = vi.fn();

      const unsubscribe1 = state.subscribe(subscriber1);
      state.subscribe(subscriber2);

      state.setState({ count: 1 });
      expect(subscriber1).toHaveBeenCalledTimes(1);
      expect(subscriber2).toHaveBeenCalledTimes(1);

      unsubscribe1();

      state.setState({ count: 2 });
      expect(subscriber1).toHaveBeenCalledTimes(1);
      expect(subscriber2).toHaveBeenCalledTimes(2);
    });

    it('should allow multiple unsubscribes without error', () => {
      const state = createStateContainer({ count: 0 });
      const subscriber = vi.fn();

      const unsubscribe = state.subscribe(subscriber);
      unsubscribe();
      unsubscribe(); // Calling again should not cause an error

      expect(() => unsubscribe()).not.toThrow();
    });
  });

  describe('integration', () => {
    it('should work correctly with multiple subscribers and updates', () => {
      const state = createStateContainer({ count: 0, name: 'initial' });
      const subscribers = Array.from({ length: 5 }, () => vi.fn());

      subscribers.forEach((sub) => state.subscribe(sub));

      state.setState({ count: 1 });
      subscribers.forEach((sub) => {
        expect(sub).toHaveBeenCalledWith({ count: 1, name: 'initial' });
      });

      const unsubscribe = state.subscribe(subscribers[0]);
      unsubscribe();

      state.setState({ count: 2 });
      expect(subscribers[0]).toHaveBeenCalledTimes(1); // Should not be called again
      subscribers.slice(1).forEach((sub) => {
        expect(sub).toHaveBeenCalledTimes(2);
      });
    });

    it('should maintain state immutability', () => {
      const initialState = { nested: { value: 1 } };
      const state = createStateContainer(initialState);
      const subscriber = vi.fn();

      state.subscribe(subscriber);
      state.setState({ nested: { value: 2 } });

      const currentState = state.getState();
      expect(currentState.nested).not.toBe(initialState.nested);
    });
  });
});
