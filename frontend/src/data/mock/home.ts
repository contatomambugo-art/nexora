import type { HomeData, MediaItem, MediaKind } from '@shared/types';
// MOCK — todos os dados abaixo são fictícios e serão substituídos por um CatalogProvider real.
const make = (prefix: string, kind: MediaKind, label: string, n: number, hue0: number, progress = false): MediaItem[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `${prefix}-${i + 1}`, kind, title: `${label} ${i + 1}`, subtitle: 'MOCK',
    hue: (hue0 + i * 37) % 360, isMock: true, ...(progress ? { progress: ((i * 23) % 80 + 10) / 100 } : {}),
  }));

export const MOCK_HOME: HomeData = {
  hero: {
    eyebrow: 'Continue assistindo', title: 'Título Mock em Destaque',
    description: 'Conteúdo de demonstração. Nenhuma mídia real é carregada nesta etapa.', hue: 255,
    item: { id: 'hero-1', kind: 'series', title: 'Título Mock em Destaque', hue: 255, isMock: true },
  },
  rows: [
    { id: 'continue', title: 'Continue assistindo', variant: 'wide', items: make('c', 'series', 'Série Mock', 8, 200, true) },
    { id: 'suggestions', title: 'Sugestões para você', variant: 'poster', items: make('s', 'movie', 'Sugestão Mock', 12, 20) },
    { id: 'mylist', title: 'Minha Lista', variant: 'poster', items: make('l', 'movie', 'Item Mock', 8, 300) },
    { id: 'movies', title: 'Filmes', variant: 'poster', items: make('m', 'movie', 'Filme Mock', 14, 100) },
    { id: 'series', title: 'Séries', variant: 'poster', items: make('t', 'series', 'Série Mock', 14, 330) },
    { id: 'live', title: 'TV ao vivo', variant: 'channel', items: make('tv', 'channel', 'Canal Mock', 12, 180) },
  ],
};
