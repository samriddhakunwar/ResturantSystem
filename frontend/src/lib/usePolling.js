// ─── usePolling ───────────────────────────────────────────────────────────────
// Run `fn` now and every `ms` while `enabled`. Pauses while the tab is hidden
// (no point polling a phone in a pocket) and catches up when it's shown again.
import { useEffect, useRef } from 'react';

export default function usePolling(fn, ms, enabled = true) {
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  });

  useEffect(() => {
    if (!enabled) return undefined;
    let timer = null;
    const tick = () => {
      if (document.visibilityState === 'visible') fnRef.current();
    };
    const start = () => {
      clearInterval(timer);
      timer = setInterval(tick, ms);
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        fnRef.current();
        start();
      }
    };
    fnRef.current();
    start();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [ms, enabled]);
}
