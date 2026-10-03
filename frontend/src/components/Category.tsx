import { FocusableButton } from './FocusableButton';
export function Category({ label, selected, onSelect }: { label: string; selected: boolean; onSelect: () => void }) {
  return <FocusableButton variant="chip" className="chip" selected={selected} onClick={onSelect}>{label}</FocusableButton>;
}
