// Navegação espacial: escolhe o próximo elemento focável pela geometria na tela.
// Qualquer elemento com [data-focusable] participa — não há mapa manual de vizinhos.
export type Dir = 'up' | 'down' | 'left' | 'right';
export const FOCUSABLE = '[data-focusable]:not([data-disabled="true"])';

export function focusEl(el: HTMLElement, dir?: Dir) {
  el.focus({ preventScroll: true });
  const vertical = dir === 'up' || dir === 'down';
  el.scrollIntoView({ block: vertical || !dir ? 'center' : 'nearest', inline: vertical ? 'nearest' : 'center', behavior: 'smooth' });
}

export function focusFirst(scope: ParentNode | null | undefined) {
  const el = scope?.querySelector<HTMLElement>(FOCUSABLE);
  if (el) focusEl(el);
}

export function findNext(from: HTMLElement, dir: Dir, scope: ParentNode): HTMLElement | null {
  const a = from.getBoundingClientRect();
  const ax = a.left + a.width / 2, ay = a.top + a.height / 2;
  const horizontal = dir === 'left' || dir === 'right';
  let best: HTMLElement | null = null, bestScore = Infinity;
  scope.querySelectorAll<HTMLElement>(FOCUSABLE).forEach((el) => {
    if (el === from) return;
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height) return;
    const dx = r.left + r.width / 2 - ax, dy = r.top + r.height / 2 - ay;
    const main = horizontal ? (dir === 'right' ? dx : -dx) : dir === 'down' ? dy : -dy;
    if (main <= 1) return;
    const cross = Math.abs(horizontal ? dy : dx);
    if (horizontal && cross > a.height) return; // esquerda/direita ficam na mesma linha
    const score = main + cross * 3;
    if (score < bestScore) { bestScore = score; best = el; }
  });
  return best;
}
