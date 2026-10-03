// Contratos compartilhados entre frontend e (futuro) backend.
export type MediaKind = 'movie' | 'series' | 'channel';

export interface MediaItem {
  id: string;
  kind: MediaKind;
  title: string;
  subtitle?: string;
  imageUrl?: string; // opcional: sem imagem usamos gradiente gerado a partir de `hue`
  hue: number; // 0-360, usado no placeholder visual
  progress?: number; // 0..1 (Continue assistindo)
  isMock?: boolean;
  streamUrl?: string; // URL de reprodução (fontes reais)
  group?: string; // group-title da lista
  tvgId?: string; // id do canal no guia (EPG)
}

export interface ContentRowData {
  id: string;
  title: string;
  variant: 'poster' | 'wide' | 'channel';
  items: MediaItem[];
}

export interface HeroData {
  eyebrow: string;
  title: string;
  description: string;
  hue: number;
  item: MediaItem;
}

export interface HomeData {
  hero: HeroData;
  rows: ContentRowData[];
  /** Biblioteca completa (fontes reais); as páginas de catálogo filtram por grupo. */
  library?: { live: MediaItem[]; movies: MediaItem[]; series: MediaItem[] };
}

export interface UserProfile {
  id: string;
  name: string;
  hue: number;
  isKids?: boolean;
}

export type SourceKind = 'm3u' | 'xtream';
export interface Source {
  id: string;
  name: string;
  kind: SourceKind;
  url?: string; // m3u
  host?: string; username?: string; password?: string; // xtream
}

export interface Programme { start: number; stop: number; title: string; desc?: string } // epoch ms
export type EpgData = Record<string, Programme[]>; // por id do canal (tvg-id)
