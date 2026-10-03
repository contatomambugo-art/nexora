import { useMemo, useSyncExternalStore } from 'react';
import type { Source } from '@shared/types';

// Fontes ficam só neste dispositivo (localStorage). Credenciais Xtream em texto puro: aceitável na v1, revisar com backend.
const KEY = 'nexora.sources.v1';
export interface SourcesState { sources: Source[]; activeId: string | null }
const EMPTY: SourcesState = { sources: [], activeId: null };
const listeners = new Set<() => void>();

const parse = (raw: string | null): SourcesState => { try { return raw ? JSON.parse(raw) : EMPTY; } catch { return EMPTY; } };
export const loadState = () => parse(localStorage.getItem(KEY));
function save(s: SourcesState) { localStorage.setItem(KEY, JSON.stringify(s)); listeners.forEach((f) => f()); }

export const subscribe = (f: () => void) => { listeners.add(f); return () => { listeners.delete(f); }; };
export const getActive = () => { const s = loadState(); return s.sources.find((x) => x.id === s.activeId) ?? null; };

export function addSource(src: Omit<Source, 'id'>) {
  const s = loadState(); const id = `s${Date.now()}`;
  save({ sources: [...s.sources, { ...src, id }], activeId: id });
}
export function removeSource(id: string) {
  const s = loadState();
  save({ sources: s.sources.filter((x) => x.id !== id), activeId: s.activeId === id ? null : s.activeId });
}
export const setActive = (id: string | null) => save({ ...loadState(), activeId: id });

export function useSources(): SourcesState {
  const raw = useSyncExternalStore(subscribe, () => localStorage.getItem(KEY));
  return useMemo(() => parse(raw), [raw]);
}
