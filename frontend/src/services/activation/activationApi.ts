import type { Source } from '@shared/types';
import type { Device } from './device';

const BASE = (import.meta.env.VITE_ACTIVATION_URL as string | undefined)?.replace(/\/+$/, '');
export const activationEnabled = !!BASE;
export const activationPageUrl = (id: string) => `${BASE}/activate?id=${id}`;

export type PendingSource = Omit<Source, 'id'>;
interface Info { code: string; expiresAt: number }

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  let r: Response;
  try { r = await fetch(`${BASE}${path}`, init); } catch { throw new Error('Não foi possível falar com o servidor de ativação.'); }
  if (r.status === 404 || r.status === 401) throw new Error('reregister');
  if (!r.ok) throw new Error((await r.json().catch(() => null))?.error ?? `Servidor respondeu HTTP ${r.status}.`);
  return r.json();
}
export const registerDevice = (d: Device) =>
  call<Info>('/api/devices', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(d) });
export const pollDevice = (d: Device) =>
  call<Info & { sources: PendingSource[] }>(`/api/devices/${d.id}/poll`, { headers: { 'x-device-key': d.key } });
