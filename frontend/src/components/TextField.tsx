import type { InputHTMLAttributes } from 'react';
/** Campo de texto que participa do foco por controle remoto (Enter abre o teclado do aparelho). */
export function TextField({ label, ...rest }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="field"><span>{label}</span>
      <input data-focusable="" tabIndex={-1} autoComplete="off" autoCapitalize="off" spellCheck={false} {...rest} />
    </label>
  );
}
