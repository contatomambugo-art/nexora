import { useCallback } from 'react';
import type { HomeData, MediaItem } from '@shared/types';
import { useActiveProfile } from './profileStore';
import { useParental } from './parentalStore';

// Heurística por palavras no nome do grupo/título: pode errar nos dois sentidos.
const ADULT = /\badult|\bxxx\b|porn|er[óo]tic|\bsex(o|y|ual)?\b|(^|[^\d])18\s*\+|\+\s*18/i;
const KIDS = /infantil|infantis|\bkids?\b|crian[cç]|desenho|cartoon|disney|nick|junior|\bbaby|anima[cç][aã]o/i;

export function isAllowed(i: MediaItem, kids: boolean, showAdult: boolean): boolean {
  if (i.isMock) return true; // dados de demonstração não são filtrados
  const text = `${i.group ?? ''} ${i.title}`;
  if (ADULT.test(text) && (kids || !showAdult)) return false;
  return !kids || KIDS.test(text);
}

export function applyParental(d: HomeData, kids: boolean, showAdult: boolean): HomeData {
  const ok = (i: MediaItem) => isAllowed(i, kids, showAdult);
  const rows = d.rows.map((r) => ({ ...r, items: r.items.filter(ok) })).filter((r) => r.items.length);
  const library = d.library && { live: d.library.live.filter(ok), movies: d.library.movies.filter(ok), series: d.library.series.filter(ok) };
  const heroItem = ok(d.hero.item) ? d.hero.item : rows[0]?.items[0] ?? d.hero.item;
  const hero = heroItem === d.hero.item ? d.hero : { ...d.hero, title: heroItem.title, hue: heroItem.hue, item: heroItem };
  return { hero, rows, library };
}

export function useContentFilter() {
  const kids = !!useActiveProfile().isKids, { showAdult } = useParental();
  return useCallback((i: MediaItem) => isAllowed(i, kids, showAdult), [kids, showAdult]);
}
