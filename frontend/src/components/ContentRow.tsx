import type { ContentRowData, MediaItem } from '@shared/types';
import { ContentCard } from './ContentCard';
import { ChannelCard } from './ChannelCard';

interface Props { row: ContentRowData; onSelect: (item: MediaItem) => void; wrap?: boolean }

export function ContentRow({ row, onSelect, wrap }: Props) {
  return (
    <section className="row" aria-label={row.title}>
      <h2 className="row__title">{row.title}</h2>
      <div className={`row__list${wrap ? ' row__list--wrap' : ''}`}>
        {row.items.map((it) => row.variant === 'channel'
          ? <ChannelCard key={it.id} item={it} onSelect={onSelect} />
          : <ContentCard key={it.id} item={it} variant={row.variant} onSelect={onSelect} />)}
      </div>
    </section>
  );
}
