import type { CSSProperties } from 'react';
import type { HeroData } from '@shared/types';
import { FocusableButton } from './FocusableButton';

export function Hero({ hero, onPlay }: { hero: HeroData; onPlay: () => void }) {
  return (
    <section className="hero" style={{ '--hue': hero.hue } as CSSProperties}>
      <span className="hero__eyebrow">{hero.eyebrow}</span>
      <h2 className="hero__title">{hero.title}</h2>
      <p className="hero__desc">{hero.description}</p>
      <div className="hero__actions">
        <FocusableButton onClick={onPlay}>▶ Assistir</FocusableButton>
        <FocusableButton variant="ghost" onClick={onPlay}>Mais informações</FocusableButton>
      </div>
    </section>
  );
}
