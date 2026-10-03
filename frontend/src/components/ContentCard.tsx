import { memo, type CSSProperties } from 'react';
import type { MediaItem } from '@shared/types';

interface Props { item: MediaItem; variant: 'poster' | 'wide'; onSelect: (item: MediaItem) => void }

export const ContentCard = memo(function ContentCard({ item, variant, onSelect }: Props) {
  return (
    <div className={`card card--${variant}`} data-focusable="" tabIndex={-1} role="button" aria-label={item.title}
      style={{ '--hue': item.hue } as CSSProperties} onClick={() => onSelect(item)}>
      {item.imageUrl && <img src={item.imageUrl} alt="" loading="lazy" decoding="async" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
      <div className="card__meta"><strong>{item.title}</strong><small>{item.subtitle}</small></div>
      {item.progress != null && <div className="card__progress"><i style={{ width: `${item.progress * 100}%` }} /></div>}
    </div>
  );
});
