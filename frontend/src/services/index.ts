import type { CatalogProvider } from './catalog/CatalogProvider';
import { mockCatalogProvider } from './catalog/mockProvider';
import { m3uProvider } from './catalog/m3uProvider';
import { getActive } from './sources/sourceStore';

// Fonte ativa (M3U/Xtream) se existir; senão, dados de demonstração.
export const catalog: CatalogProvider = {
  getHome: () => { const s = getActive(); return (s ? m3uProvider(s) : mockCatalogProvider).getHome(); },
};
