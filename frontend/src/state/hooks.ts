import { useEffect, useMemo, useState } from 'react';
import type { HomeData } from '@shared/types';
import { catalog } from '../services';
import { subscribe } from '../services/sources/sourceStore';
import { useActiveProfile } from '../profiles/profileStore';
import { useParental } from '../profiles/parentalStore';
import { applyParental } from '../profiles/filter';

export function useAsync<T>(fn: () => Promise<T>) {
  const [s, set] = useState<{ data?: T; error?: Error; loading: boolean }>({ loading: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    let live = true;
    set({ loading: true });
    fn().then((data) => live && set({ data, loading: false }), (error) => live && set({ error, loading: false }));
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);
  return { ...s, reload: () => setN((x) => x + 1) };
}

let homeCache: Promise<HomeData> | null = null; // compartilhado entre páginas
subscribe(() => { homeCache = null; }); // trocar de fonte invalida o cache
export function useHome() {
  const r = useAsync(() => {
    if (!homeCache) homeCache = catalog.getHome().catch((e) => { homeCache = null; throw e; });
    return homeCache;
  });
  const kids = !!useActiveProfile().isKids, { showAdult } = useParental();
  const data = useMemo(() => (r.data ? applyParental(r.data, kids, showAdult) : undefined), [r.data, kids, showAdult]);
  return { ...r, data, reload: () => { homeCache = null; r.reload(); } };
}

/** Renderização progressiva: libera 1 linha por vez para não travar TVs fracas. */
export function useProgressive(total: number, initial = 2) {
  const [n, setN] = useState(initial);
  useEffect(() => {
    if (n >= total) return;
    const id = setTimeout(() => setN(n + 1), 120);
    return () => clearTimeout(id);
  }, [n, total]);
  return Math.min(n, total);
}
