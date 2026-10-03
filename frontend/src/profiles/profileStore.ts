import { useSyncExternalStore } from 'react';
import type { UserProfile } from '@shared/types';
import { createStore } from '../services/library/localStore';
import { getActiveId, setActiveId, subscribeActive } from './active';

const MAX_PROFILES = 6;
const DEFAULT: UserProfile = { id: 'default', name: 'Perfil 1', hue: 250 };
const store = createStore<UserProfile[]>('nexora.profiles.v1', [DEFAULT], false);

export const useProfiles = () => store.use();
export function useActiveProfile(): UserProfile {
  const list = store.use();
  const id = useSyncExternalStore(subscribeActive, getActiveId);
  return list.find((p) => p.id === id) ?? list[0];
}

const hueOf = (s: string) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };
export function addProfile(name: string, isKids: boolean) {
  const l = store.read();
  if (l.length >= MAX_PROFILES) return;
  store.write([...l, { id: `p${Date.now()}`, name, hue: hueOf(name), isKids }]);
}
export function removeProfile(id: string) {
  if (id === 'default') return;
  store.write(store.read().filter((p) => p.id !== id));
  ['nexora.favorites.v1', 'nexora.progress.v1'].forEach((b) => localStorage.removeItem(`${b}.${id}`));
  if (getActiveId() === id) setActiveId('default');
}
