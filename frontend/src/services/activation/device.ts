// Identidade do aparelho: ID público (mostrado/QR) + chave secreta (autentica a busca de fontes no backend).
const KEY = 'nexora.device.v1', ALPHA = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // sem 0/O/1/I
export interface Device { id: string; key: string }

export function getDevice(): Device {
  try { const d = JSON.parse(localStorage.getItem(KEY) ?? 'null'); if (d?.id && d?.key) return d; } catch { /* gera novo */ }
  const rnd = (n: number) => Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => ALPHA[b % 32]).join('');
  const key = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('');
  const d = { id: `NX-${rnd(4)}-${rnd(4)}`, key };
  localStorage.setItem(KEY, JSON.stringify(d));
  return d;
}
