import { memo, type CSSProperties } from 'react';
import type { MediaItem } from '@shared/types';

export const ChannelCard = memo(function ChannelCard({ item, onSelect }: { item: MediaItem; onSelect: (i: MediaItem) => void }) {
  return (
    <div className="card card--channel" data-focusable="" tabIndex={-1} role="button" aria-label={item.title}
      style={{ '--hue': item.hue } as CSSProperties} onClick={() => onSelect(item)}>
      {item.imageUrl && <img src={item.imageUrl} alt="" loading="lazy" decoding="async" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
      <span className="card__badge">AO VIVO</span>
      <div className="card__meta"><strong>{item.title}</strong></div>
    </div>
  );
});
