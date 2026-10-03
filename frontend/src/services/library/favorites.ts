import type { MediaItem } from '@shared/types';
import { createStore } from './localStore';

const store = createStore<MediaItem[]>('nexora.favorites.v1', []);
export const favKey = (i: MediaItem) => i.streamUrl ?? i.id;

export function toggleFavorite(item: MediaItem) {
  const list = store.read(), k = favKey(item);
  const { progress: _p, ...snapshot } = item; // guarda só os dados do item
  store.write(list.some((x) => favKey(x) === k) ? list.filter((x) => favKey(x) !== k) : [snapshot, ...list]);
}
export const useFavorites = () => store.use();
export const useIsFavorite = (item: MediaItem) => store.use().some((x) => favKey(x) === favKey(item));
