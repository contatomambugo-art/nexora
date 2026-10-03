import { useState } from 'react';
import type { UserProfile } from '@shared/types';
import { PinDialog } from '../components/PinDialog';
import { setActiveId } from './active';
import { useActiveProfile } from './profileStore';
import { hasPin, verifyPin } from './parentalStore';

/** Trocar de perfil. Sair de um perfil infantil para um adulto exige o PIN (se definido). */
export function useSwitchProfile(onSwitched?: () => void) {
  const active = useActiveProfile();
  const [pending, setPending] = useState<UserProfile | null>(null);
  const doSwitch = (p: UserProfile) => { setActiveId(p.id); setPending(null); onSwitched?.(); };
  const switchTo = (p: UserProfile) => {
    if (p.id === active.id) { onSwitched?.(); return; }
    if (active.isKids && !p.isKids && hasPin()) setPending(p); else doSwitch(p);
  };
  const dialog = pending && (
    <PinDialog title="PIN para trocar de perfil" onCancel={() => setPending(null)}
      onComplete={(pin) => { const e = verifyPin(pin); if (e) return e; doSwitch(pending); }} />
  );
  return { switchTo, dialog };
}
