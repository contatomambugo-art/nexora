import type { ContentRowData, HomeData, MediaItem } from '@shared/types';

export function buildHome(items: MediaItem[], sourceName: string): HomeData {
  const live = items.filter((i) => i.kind === 'channel');
  const movies = items.filter((i) => i.kind === 'movie');
  const series = items.filter((i) => i.kind === 'series');
  const rows: ContentRowData[] = [];
  if (live.length) rows.push({ id: 'live', title: 'TV ao vivo', variant: 'channel', items: live.slice(0, 40) });
  if (movies.length) rows.push({ id: 'movies', title: 'Filmes', variant: 'poster', items: movies.slice(0, 40) });
  if (series.length) rows.push({ id: 'series', title: 'Séries', variant: 'poster', items: series.slice(0, 40) });
  const first = movies[0] ?? series[0] ?? live[0];
  return {
    hero: { eyebrow: `Sua fonte · ${sourceName}`, title: first.title, hue: first.hue, item: first,
      description: `${items.length.toLocaleString('pt-BR')} itens carregados da sua lista.` },
    rows, library: { live, movies, series },
  };
}
