import type { CSSProperties } from 'react';
import type { UserProfile } from '@shared/types';

export function Avatar({ profile, large }: { profile: UserProfile; large?: boolean }) {
  return <span className={`avatar${large ? ' avatar--lg' : ''}`} style={{ '--hue': profile.hue } as CSSProperties}>{profile.name[0]}</span>;
}
export function Profile({ profile, selected, onSelect }: { profile: UserProfile; selected: boolean; onSelect: () => void }) {
  return (
    <div className="profile" data-focusable="" tabIndex={-1} role="button" data-selected={selected ? 'true' : undefined} onClick={onSelect}>
      <Avatar profile={profile} large /><span>{profile.name}</span>
    </div>
  );
}
