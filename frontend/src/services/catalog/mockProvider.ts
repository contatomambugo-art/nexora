import type { CatalogProvider } from './CatalogProvider';
import { MOCK_HOME } from '../../data/mock/home';

export const mockCatalogProvider: CatalogProvider = {
  getHome: () => new Promise((resolve) => setTimeout(() => resolve(MOCK_HOME), 350)), // simula latência
};
