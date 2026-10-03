import { Button, type ButtonProps } from './Button';
/** Botão que participa da navegação por controle remoto. */
export function FocusableButton({ disabled, ...rest }: ButtonProps) {
  return <Button data-focusable="" tabIndex={-1} disabled={disabled} data-disabled={disabled ? 'true' : undefined} {...rest} />;
}
