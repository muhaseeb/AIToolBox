"use client";

import { useCallback, useEffect, useState } from "react";

export function useLocalStore<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, [key]);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          /* ignore */
        }
        return resolved;
      });
    },
    [key]
  );

  return { value, set, ready };
}

export function useSavedTools() {
  const store = useLocalStore<string[]>("aitoolbox:saved", []);
  const toggle = useCallback(
    (slug: string) => {
      store.set((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
    },
    [store]
  );
  const has = useCallback((slug: string) => store.value.includes(slug), [store.value]);
  return { value: store.value, set: store.set, ready: store.ready, toggle, has };
}

export function useCompareList() {
  const store = useLocalStore<string[]>("aitoolbox:compare", []);
  const toggle = useCallback(
    (slug: string) => {
      store.set((prev) => {
        if (prev.includes(slug)) return prev.filter((s) => s !== slug);
        if (prev.length >= 4) return prev;
        return [...prev, slug];
      });
    },
    [store]
  );
  const clear = useCallback(() => store.set([]), [store]);
  const has = useCallback((slug: string) => store.value.includes(slug), [store.value]);
  return { value: store.value, set: store.set, ready: store.ready, toggle, clear, has, max: 4 };
}
