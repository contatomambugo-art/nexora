import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { FocusableButton } from './FocusableButton';

/** Teclado numérico navegável pelo controle remoto (teclas 0–9 do teclado também funcionam).
 *  `onComplete` recebe os 4 dígitos e retorna uma mensagem de erro, ou nada se aceito. */
export function PinDialog({ title, onCancel, onComplete }: { title: string; onCancel: () => void; onComplete: (pin: string) => string | void }) {
  const [pin, setPin] = useState('');
  const [err, setErr] = useState('');
  const push = (d: string) => setPin((p) => (p.length < 4 ? p + d : p));

  useEffect(() => {
    if (pin.length !== 4) return;
    const e = onComplete(pin);
    if (e) { setErr(e); setPin(''); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);
  useEffect(() => {
    const on = (e: KeyboardEvent) => { if (/^\d$/.test(e.key)) push(e.key); };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, []);

  return (
    <Modal title={title} onClose={onCancel}>
      <div className="pin__dots" aria-label={`${pin.length} de 4 dígitos`}>{[0, 1, 2, 3].map((i) => (i < pin.length ? '●' : '○')).join(' ')}</div>
      <p className="pin__err" role="alert">{err}</p>
      <div className="pin__pad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => <FocusableButton key={d} variant="ghost" onClick={() => push(d)}>{d}</FocusableButton>)}
        <FocusableButton variant="ghost" onClick={() => setPin((p) => p.slice(0, -1))}>⌫</FocusableButton>
        <FocusableButton variant="ghost" onClick={() => push('0')}>0</FocusableButton>
        <FocusableButton variant="ghost" onClick={onCancel}>Cancelar</FocusableButton>
      </div>
    </Modal>
  );
}
