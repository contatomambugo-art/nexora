import { useEffect, useRef, type ReactNode } from 'react';
import { useBack } from '../navigation/FocusProvider';
import { focusFirst } from '../navigation/spatial';

/** Prende o foco (data-focus-scope), fecha com Back e devolve o foco ao elemento anterior. */
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useBack(() => { onClose(); return true; });
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    focusFirst(ref.current);
    return () => prev?.focus({ preventScroll: true });
  }, []);
  return (
    <div className="modal__backdrop">
      <div ref={ref} className="modal" role="dialog" aria-modal="true" aria-label={title} data-focus-scope="modal">
        <h2>{title}</h2>{children}
      </div>
    </div>
  );
}
