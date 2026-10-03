import { useMemo } from 'react';
import type { MediaItem } from '@shared/types';
import { createStore } from '../services/library/localStore';

// Posição de reprodução (só VOD), por URL, com o item para montar "Continue assistindo".
type Entry = { t: number; d: number; at: number; item?: MediaItem };
const store = createStore<Record<string, Entry>>('nexora.progress.v1', {});

export const loadPos = (url: string) => store.read()[url]?.t ?? 0;

export function savePos(url: string, t: number, d: number, item?: MediaItem) {
  if (!isFinite(d) || d <= 0) return;
  const m = { ...store.read() };
  if (t < 5 || t > d - 30) delete m[url]; else m[url] = { t, d, at: Date.now(), item };
  const keys = Object.keys(m);
  if (keys.length > 200) keys.sort((a, b) => m[a].at - m[b].at).slice(0, keys.length - 200).forEach((k) => delete m[k]);
  store.write(m);
}

/** Itens em andamento, mais recentes primeiro, com `progress` (0..1). */
export function useContinue(): MediaItem[] {
  const all = store.use();
  return useMemo(() => Object.values(all).filter((e) => e.item).sort((a, b) => b.at - a.at).slice(0, 20)
    .map((e) => ({ ...e.item!, progress: e.t / e.d })), [all]);
}
