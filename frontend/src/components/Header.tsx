import { useState } from 'react';
import { Avatar, Profile } from './Profile';
import { FocusableButton } from './FocusableButton';
import { Modal } from './Modal';
import { useActiveProfile, useProfiles } from '../profiles/profileStore';
import { useSwitchProfile } from '../profiles/useSwitchProfile';

export function Header({ title }: { title: string }) {
  const [open, setOpen] = useState(false);
  const profile = useActiveProfile();
  const profiles = useProfiles();
  const { switchTo, dialog } = useSwitchProfile(() => setOpen(false));
  return (
    <header className="header">
      <h1>{title}</h1>
      <FocusableButton variant="ghost" onClick={() => setOpen(true)} aria-label="Trocar perfil"><Avatar profile={profile} />{profile.name}</FocusableButton>
      {open && (
        <Modal title="Quem está assistindo?" onClose={() => setOpen(false)}>
          <div className="profiles">
            {profiles.map((p) => <Profile key={p.id} profile={p} selected={p.id === profile.id} onSelect={() => switchTo(p)} />)}
          </div>
        </Modal>
      )}
      {dialog}
    </header>
  );
}
