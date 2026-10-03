import { useCallback, useEffect, useState } from 'react';

export const ROUTES = [
  { id: 'home', label: 'Início', icon: '⌂' },
  { id: 'live', label: 'TV ao Vivo', icon: '◉' },
  { id: 'epg', label: 'Guia (EPG)', icon: '▤' },
  { id: 'movies', label: 'Filmes', icon: '▣' },
  { id: 'series', label: 'Séries', icon: '▶' },
  { id: 'mylist', label: 'Minha Lista', icon: '＋' },
  { id: 'search', label: 'Buscar', icon: '⌕' },
  { id: 'profiles', label: 'Perfis e PIN', icon: '☺' },
  { id: 'activate', label: 'Ativar por QR', icon: '▦' },
  { id: 'settings', label: 'Configurações', icon: '⚙' },
] as const;
export type RouteId = (typeof ROUTES)[number]['id'];

const read = (): RouteId => {
  const id = location.hash.replace('#/', '');
  return (ROUTES.find((r) => r.id === id)?.id ?? 'home') as RouteId;
};

/** Roteador mínimo baseado em hash (sem dependência externa). */
export function useRoute() {
  const [route, setRoute] = useState<RouteId>(read);
  useEffect(() => {
    const on = () => setRoute(read());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const navigate = useCallback((id: RouteId) => { location.hash = `#/${id}`; }, []);
  return { route, navigate };
}
