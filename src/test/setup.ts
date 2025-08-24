import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import useBattleStore from '../store/battleStore';

// Extend vitest's expect with jest-dom matchers
expect.extend(matchers);

// Mock browser-specific APIs
if (typeof navigator !== 'undefined' && !navigator.vibrate) {
  navigator.vibrate = vi.fn();
}

// Reset the store's initial state before each test
const initialStoreState = useBattleStore.getState();

// Mock timers to control setTimeout
vi.useFakeTimers();

afterEach(() => {
  // Clean up JSDOM
  cleanup();
  // Reset store state
  useBattleStore.setState(initialStoreState, true);
  // Clear any mocked timers
  vi.clearAllMocks();
});
