import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from 'react';
import { FOCUSABLE, findNext, focusEl, focusFirst, type Dir } from './spatial';

type BackHandler = () => boolean | void; // retornar true = tratado
const Ctx = createContext<{ pushBack: (h: BackHandler) => () => void } | null>(null);

const KEY_DIR: Record<string, Dir> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
// Back: Esc/Backspace (web), keyCodes de Android TV (4), Tizen (10009), webOS (461)
export const isBack = (e: KeyboardEvent) =>
  e.key === 'Escape' || e.key === 'Backspace' || e.key === 'GoBack' || [4, 10009, 461].includes(e.keyCode);

const currentScope = (): ParentNode => {
  const scopes = document.querySelectorAll('[data-focus-scope]'); // modal aberto prende o foco
  return scopes.length ? scopes[scopes.length - 1] : document.body;
};

const backStack: BackHandler[] = [];
/** Executa o Back (tecla ou botão nativo). Retorna true se algum tratador consumiu. */
export function runBack(): boolean {
  for (let i = backStack.length - 1; i >= 0; i--) if (backStack[i]() === true) return true;
  return false;
}

export function FocusProvider({ children }: { children: ReactNode }) {
  const pushBack = useCallback((h: BackHandler) => {
    backStack.push(h);
    return () => { const i = backStack.indexOf(h); if (i >= 0) backStack.splice(i, 1); };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const dir = KEY_DIR[e.key];
      const active = document.activeElement as HTMLElement | null;
      const typing = !!active?.matches('input,textarea');
      if (dir) {
        if (typing && (dir === 'left' || dir === 'right')) return; // cursor do campo
        e.preventDefault();
        const scope = currentScope();
        if (!active || !active.matches(FOCUSABLE) || !scope.contains(active)) return focusFirst(scope);
        const next = findNext(active, dir, scope);
        if (next) focusEl(next, dir);
      } else if (e.key === 'Enter') {
        if (typing) return;
        if (active?.matches(FOCUSABLE)) { e.preventDefault(); if (!e.repeat) active.click(); }
      } else if (isBack(e)) {
        if (typing && e.key === 'Backspace') return; // apagar texto, não voltar
        if (runBack()) e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return <Ctx.Provider value={{ pushBack }}>{children}</Ctx.Provider>;
}

/** Registra um tratador de Back. O mais recente (ex.: Modal) tem prioridade. */
export function useBack(handler: BackHandler) {
  const ctx = useContext(Ctx);
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => ctx?.pushBack(() => ref.current()), [ctx]);
}

/** Foca o primeiro item da página quando nada está focado (carga inicial). */
export function useInitialFocus(ref: React.RefObject<HTMLElement>, ready: boolean) {
  useEffect(() => {
    if (!ready) return;
    const id = requestAnimationFrame(() => {
      if (document.activeElement === document.body) focusFirst(ref.current);
    });
    return () => cancelAnimationFrame(id);
  }, [ready, ref]);
}
