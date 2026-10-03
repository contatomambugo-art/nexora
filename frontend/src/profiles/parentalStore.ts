import { createStore } from '../services/library/localStore';

// Trava "suave": protege contra crianças, não contra quem tem acesso técnico ao aparelho.
// O PIN fica salvo com hash simples (crypto.subtle não existe em contexto http do WebView).
type Parental = { pin: string | null; showAdult: boolean };
const store = createStore<Parental>('nexora.parental.v1', { pin: null, showAdult: false }, false);

const hash = (pin: string) => { let x = 5381; const s = `nexora:${pin}`; for (let i = 0; i < s.length; i++) x = ((x << 5) + x + s.charCodeAt(i)) >>> 0; return x.toString(36); };
let fails = 0, lockUntil = 0; // bloqueio de tentativas (em memória)

export const useParental = () => store.use();
export const hasPin = () => !!store.read().pin;
/** null = PIN correto; senão, a mensagem de erro. 5 erros bloqueiam por 30s. */
export function verifyPin(pin: string): string | null {
  if (Date.now() < lockUntil) return `Muitas tentativas. Aguarde ${Math.ceil((lockUntil - Date.now()) / 1000)}s.`;
  if (store.read().pin === hash(pin)) { fails = 0; return null; }
  if (++fails >= 5) { fails = 0; lockUntil = Date.now() + 30000; return 'Muitas tentativas. Aguarde 30s.'; }
  return 'PIN incorreto.';
}
export const setPin = (pin: string) => store.write({ ...store.read(), pin: hash(pin) });
export const clearPin = () => store.write({ pin: null, showAdult: false });
export const setShowAdult = (v: boolean) => store.write({ ...store.read(), showAdult: v });
