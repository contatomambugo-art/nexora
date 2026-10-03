import type { ButtonHTMLAttributes } from 'react';
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'nav' | 'chip';
  selected?: boolean;
}
export function Button({ variant = 'primary', selected, className = '', ...rest }: ButtonProps) {
  return <button className={`btn btn--${variant} ${className}`} data-selected={selected ? 'true' : undefined} {...rest} />;
}
