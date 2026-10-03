// Perfil ativo (id) — módulo sem dependências para evitar import circular com os stores.
const KEY = 'nexora.activeProfile';
const listeners = new Set<() => void>();
export const getActiveId = () => localStorage.getItem(KEY) ?? 'default'; // 'default' = dados legados do Perfil 1
export function setActiveId(id: string) { localStorage.setItem(KEY, id); listeners.forEach((f) => f()); }
export const subscribeActive = (f: () => void) => { listeners.add(f); return () => { listeners.delete(f); }; };
