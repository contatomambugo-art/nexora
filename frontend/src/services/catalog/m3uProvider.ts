import type { Source } from '@shared/types';
import type { CatalogProvider } from './CatalogProvider';
import { parseM3U, parseM3UHeader } from '../m3u/parseM3U';
import { registerEpgUrl } from '../epg/epgUrls';
import { buildHome } from '../m3u/buildHome';

const PROXY: string | undefined = (import.meta as unknown as { env: Record<string, string> }).env.VITE_PROXY_URL;

/** Xtream Codes expõe a lista no formato M3U; reaproveitamos o mesmo parser. */
export function sourceUrl(s: Source): string {
  if (s.kind === 'm3u') return s.url!;
  const q = `username=${encodeURIComponent(s.username!)}&password=${encodeURIComponent(s.password!)}&type=m3u_plus&output=m3u8`;
  return `${s.host!.replace(/\/+$/, '')}/get.php?${q}`;
}

export async function fetchText(url: string): Promise<string> {
  const get = async (u: string) => {
    const r = await fetch(u);
    if (!r.ok) throw new Error(`O servidor respondeu HTTP ${r.status}.`);
    if (/\.gz(\?|$)/i.test(url) && r.body && 'DecompressionStream' in window)
      return new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).text();
    return r.text();
  };
  try { return await get(url); }
  catch (e) {
    if (e instanceof TypeError) { // CORS/rede
      if (PROXY) return get(`${PROXY}?url=${encodeURIComponent(url)}`);
      throw new Error('Não foi possível baixar a lista (provável bloqueio de CORS). Rode o proxy local de backend/ e defina VITE_PROXY_URL.');
    }
    throw e;
  }
}

export const m3uProvider = (source: Source): CatalogProvider => ({
  async getHome() {
    const text = await fetchText(sourceUrl(source));
    registerEpgUrl(source.id, parseM3UHeader(text));
    const items = parseM3U(text);
    if (!items.length) throw new Error('Nenhum item encontrado. Verifique se a URL é de uma lista M3U válida.');
    return buildHome(items, source.name);
  },
});
