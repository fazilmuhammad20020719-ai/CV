import { useState, useCallback, useRef } from 'react';

const MAX_HISTORY = 100;
// Rapid changes (typing, dragging a slider) within this window become one undo step
const COALESCE_MS = 600;

/**
 * useState with undo/redo. `setState` accepts a value or updater like React's.
 * `reset` replaces the state and clears history (e.g. when switching CVs).
 */
export function useHistoryState(initial) {
  const [history, setHistory] = useState(() => ({
    past: [],
    present: typeof initial === 'function' ? initial() : initial,
    future: []
  }));
  const lastChangeRef = useRef(0);

  const setState = useCallback((valueOrUpdater) => {
    // Decided outside the updater, which React may run twice in StrictMode
    const now = Date.now();
    const withinBurst = now - lastChangeRef.current < COALESCE_MS;
    lastChangeRef.current = now;

    setHistory((h) => {
      const next =
        typeof valueOrUpdater === 'function' ? valueOrUpdater(h.present) : valueOrUpdater;
      if (next === h.present) return h;

      const coalesce = withinBurst && h.past.length > 0;
      return {
        past: coalesce ? h.past : [...h.past, h.present].slice(-MAX_HISTORY),
        present: next,
        future: []
      };
    });
  }, []);

  const undo = useCallback(() => {
    lastChangeRef.current = 0;
    setHistory((h) =>
      h.past.length === 0
        ? h
        : {
            past: h.past.slice(0, -1),
            present: h.past[h.past.length - 1],
            future: [h.present, ...h.future]
          }
    );
  }, []);

  const redo = useCallback(() => {
    lastChangeRef.current = 0;
    setHistory((h) =>
      h.future.length === 0
        ? h
        : {
            past: [...h.past, h.present],
            present: h.future[0],
            future: h.future.slice(1)
          }
    );
  }, []);

  const reset = useCallback((value) => {
    lastChangeRef.current = 0;
    setHistory({ past: [], present: value, future: [] });
  }, []);

  return {
    state: history.present,
    setState,
    undo,
    redo,
    reset,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0
  };
}
