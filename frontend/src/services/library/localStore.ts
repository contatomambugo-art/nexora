import { useMemo, useSyncExternalStore } from 'react';
import { getActiveId, subscribeActive } from '../../profiles/active';

/** Mini store reativa sobre localStorage. `scoped` = dados separados por perfil (chave com sufixo do perfil). */
export function createStore<T>(base: string, empty: T, scoped = true) {
  const listeners = new Set<() => void>();
  const key = () => (scoped && getActiveId() !== 'default' ? `${base}.${getActiveId()}` : base);
  const parse = (raw: string | null): T => { try { return raw ? JSON.parse(raw) : empty; } catch { return empty; } };
  const subscribe = (f: () => void) => {
    listeners.add(f);
    const off = scoped ? subscribeActive(f) : () => {};
    return () => { listeners.delete(f); off(); };
  };
  return {
    read: (): T => parse(localStorage.getItem(key())),
    write(v: T) { try { localStorage.setItem(key(), JSON.stringify(v)); } catch { /* cota cheia */ } listeners.forEach((f) => f()); },
    use(): T { const raw = useSyncExternalStore(subscribe, () => localStorage.getItem(key())); return useMemo(() => parse(raw), [raw]); },
  };
}
