import { useRef } from 'react';
import { useInitialFocus } from '../navigation/FocusProvider';
import { Profile } from '../components/Profile';
import { useActiveProfile, useProfiles } from '../profiles/profileStore';
import { useSwitchProfile } from '../profiles/useSwitchProfile';

/** Tela "Quem está assistindo?" ao abrir o app (só quando há mais de um perfil). */
export default function ProfilePicker({ onDone }: { onDone: () => void }) {
  const profiles = useProfiles();
  const active = useActiveProfile();
  const ref = useRef<HTMLDivElement>(null);
  const { switchTo, dialog } = useSwitchProfile(onDone);
  useInitialFocus(ref, true);
  return (
    <div ref={ref} className="picker">
      <div className="sidebar__brand"><span className="logo-n">N</span>NEXORA</div>
      <h2>Quem está assistindo?</h2>
      <div className="profiles">
        {profiles.map((p) => <Profile key={p.id} profile={p} selected={p.id === active.id} onSelect={() => switchTo(p)} />)}
      </div>
      {dialog}
    </div>
  );
}
