import type { HomeData } from '@shared/types';
/** Contrato da camada de dados. M3U/Xtream/backend serão novas implementações — a UI não muda. */
export interface CatalogProvider {
  getHome(): Promise<HomeData>;
}
