import type { EpgData, Programme } from '@shared/types';

const ENT: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'" };
const decode = (s: string) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&(amp|lt|gt|quot|apos|#39);/g, (_, e: string) => ENT[e]).trim();

/** "20261003180000 -0300" → epoch ms (sem fuso, assume UTC). */
export function xmltvTime(v: string): number {
  const m = /^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)?\s*([+-])?(\d\d)?(\d\d)?/.exec(v.trim());
  if (!m) return NaN;
  const off = m[7] ? (m[7] === '-' ? -1 : 1) * ((+m[8] || 0) * 60 + (+m[9] || 0)) : 0;
  return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0)) - off * 60000;
}

/** Lê só os <programme> dentro da janela [from, to] — guias XMLTV podem ter dezenas de MB. */
export function parseXmltv(text: string, from: number, to: number): EpgData {
  const out: EpgData = {};
  for (const m of text.matchAll(/<programme\s([^>]*)>([\s\S]*?)<\/programme>/g)) {
    const a: Record<string, string> = {};
    for (const x of m[1].matchAll(/(\w+)="([^"]*)"/g)) a[x[1]] = x[2];
    const start = xmltvTime(a.start ?? ''), stop = xmltvTime(a.stop ?? '');
    if (!a.channel || !(stop > from && start < to)) continue;
    const title = /<title[^>]*>([\s\S]*?)<\/title>/.exec(m[2]);
    const desc = /<desc[^>]*>([\s\S]*?)<\/desc>/.exec(m[2]);
    const p: Programme = { start, stop, title: title ? decode(title[1]) : 'Sem título', ...(desc ? { desc: decode(desc[1]) } : {}) };
    (out[a.channel] ??= []).push(p);
  }
  for (const k in out) out[k].sort((x, y) => x.start - y.start);
  return out;
}

export function nowNext(data: EpgData | null, key: string, now: number): { cur?: Programme; next?: Programme } {
  const l = data?.[key];
  if (!l) return {};
  const i = l.findIndex((p) => p.start <= now && now < p.stop);
  if (i >= 0) return { cur: l[i], next: l[i + 1] };
  return { next: l.find((p) => p.start > now) };
}
