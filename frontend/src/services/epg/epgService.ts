import { useSyncExternalStore } from 'react';
import type { EpgData, MediaItem } from '@shared/types';
import { getActive } from '../sources/sourceStore';
import { fetchText } from '../catalog/m3uProvider';
import { MOCK_HOME } from '../../data/mock/home';
import { getEpgUrl } from './epgUrls';
import { parseXmltv } from './xmltv';

const TTL = 6 * 3600e3, BACKOFF = 5 * 60e3, H = 3600e3;
let state: { key: string; data: EpgData; at: number } | null = null;
let inflight: Promise<void> | null = null;
let error: string | null = null, failedAt = 0, version = 0;
const subs = new Set<() => void>();
const bump = () => { version++; subs.forEach((f) => f()); };
const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };

export const epgKey = (i: MediaItem) => i.tvgId || i.id;

/** Guia de demonstração para os canais MOCK: um programa por hora. */
function mockEpg(): EpgData {
  const base = Math.floor(Date.now() / H) * H - H, out: EpgData = {};
  for (const it of MOCK_HOME.rows.find((r) => r.id === 'live')?.items ?? [])
    out[epgKey(it)] = Array.from({ length: 11 }, (_, k) => ({ start: base + k * H, stop: base + (k + 1) * H, title: `Programa Mock ${(k + it.hue) % 17 + 1}`, desc: 'MOCK' }));
  return out;
}

async function loadReal(): Promise<EpgData> {
  const s = getActive()!;
  const url = s.kind === 'xtream'
    ? `${s.host!.replace(/\/+$/, '')}/xmltv.php?username=${encodeURIComponent(s.username!)}&password=${encodeURIComponent(s.password!)}`
    : getEpgUrl(s.id);
  if (!url) throw new Error('Sua lista não informa um guia (url-tvg no cabeçalho #EXTM3U).');
  const now = Date.now();
  return parseXmltv(await fetchText(url), now - H, now + 10 * H);
}

/** Carrega o guia em segundo plano (cache de 6h; após falha, espera 5 min). Seguro chamar várias vezes. */
export function ensureEpg(force = false): Promise<void> {
  const key = getActive()?.id ?? 'mock';
  if (!force && state?.key === key && Date.now() - state.at < TTL) return Promise.resolve();
  if (!force && Date.now() - failedAt < BACKOFF) return Promise.resolve();
  if (inflight) return inflight;
  error = null;
  inflight = (async () => {
    try { state = { key, data: getActive() ? await loadReal() : mockEpg(), at: Date.now() }; }
    catch (e) { state = null; failedAt = Date.now(); error = e instanceof Error ? e.message : 'Falha ao carregar o guia.'; }
    finally { inflight = null; bump(); }
  })();
  bump();
  return inflight;
}

export function useEpgState() {
  useSyncExternalStore(subscribe, () => version);
  return { data: state?.data ?? null, error, loading: !!inflight };
}
