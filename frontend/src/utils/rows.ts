import type { ContentRowData, MediaItem } from '@shared/types';

/** Agrupa itens em linhas por tipo (canais usam cards de canal; filmes/séries, pôsteres). */
export function kindRows(items: MediaItem[], cap = 60): ContentRowData[] {
  const by = (k: MediaItem['kind']) => items.filter((i) => i.kind === k).slice(0, cap);
  return ([
    { id: 'k-live', title: 'Canais', variant: 'channel', items: by('channel') },
    { id: 'k-movie', title: 'Filmes', variant: 'poster', items: by('movie') },
    { id: 'k-series', title: 'Séries', variant: 'poster', items: by('series') },
  ] as ContentRowData[]).filter((r) => r.items.length);
}
