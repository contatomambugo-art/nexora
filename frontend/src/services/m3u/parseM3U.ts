import type { MediaItem, MediaKind } from '@shared/types';

const ATTR = /([\w-]+)="([^"]*)"/g;
const hue = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360; return h; };

/** Heurística de tipo: URL do Xtream (/movie/, /series/) e depois nome do grupo. */
function kindOf(url: string, group: string): MediaKind {
  if (/\/movie\//i.test(url) || /\b(filmes?|movies?|vod)\b/i.test(group)) return 'movie';
  if (/\/series\//i.test(url) || /\bs[eé]ries?\b/i.test(group)) return 'series';
  return 'channel';
}

/** Parser tolerante de M3U/M3U8 estendido (#EXTINF com tvg-*, group-title). */
export function parseM3U(text: string): MediaItem[] {
  const out: MediaItem[] = [];
  let meta: { title: string; attrs: Record<string, string> } | null = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('#EXTINF')) {
      const attrs: Record<string, string> = {};
      for (const m of line.matchAll(ATTR)) attrs[m[1].toLowerCase()] = m[2];
      const comma = line.lastIndexOf(',');
      meta = { title: (comma >= 0 ? line.slice(comma + 1).trim() : '') || attrs['tvg-name'] || 'Sem nome', attrs };
    } else if (!line.startsWith('#') && meta) {
      const group = meta.attrs['group-title'] || 'Outros';
      out.push({
        id: `src-${out.length}`, kind: kindOf(line, group), title: meta.title, subtitle: group, group,
        imageUrl: meta.attrs['tvg-logo'] || undefined, tvgId: meta.attrs['tvg-id'] || undefined, hue: hue(meta.title), streamUrl: line,
      });
      meta = null;
    }
  }
  return out;
}

/** URL do guia declarada no cabeçalho (#EXTM3U url-tvg="..."), se houver. */
export function parseM3UHeader(text: string): string | undefined {
  const head = text.slice(0, 2000).split(/\r?\n/).find((l) => l.trim().startsWith('#EXTM3U'));
  return head ? /(?:url-tvg|x-tvg-url)="([^",]+)/i.exec(head)?.[1] : undefined;
}
