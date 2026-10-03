import { FocusableButton } from './FocusableButton';
export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="state" role="alert"><h2>Algo deu errado</h2><p>{message}</p><FocusableButton onClick={onRetry}>Tentar novamente</FocusableButton></div>;
}
