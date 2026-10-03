import { memo, useEffect, useMemo, useRef, useState } from 'react';
import type { MediaItem, Programme } from '@shared/types';
import { useHome } from '../state/hooks';
import { useInitialFocus } from '../navigation/FocusProvider';
import { ensureEpg, epgKey, useEpgState } from '../services/epg/epgService';
import { nowNext } from '../services/epg/xmltv';
import { favKey, useFavorites } from '../services/library/favorites';
import { Category } from '../components/Category';
import { ItemDetailsModal } from '../components/ItemDetailsModal';
import { Loading } from '../components/Loading';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';

const hhmm = (t: number) => new Date(t).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const MAX_ROWS = 80;

interface RowProps { item: MediaItem; cur?: Programme; next?: Programme; now: number; onSelect: (i: MediaItem) => void }
const GuideRow = memo(function GuideRow({ item, cur, next, now, onSelect }: RowProps) {
  const pct = cur ? Math.min(100, Math.max(0, ((now - cur.start) / (cur.stop - cur.start)) * 100)) : 0;
  return (
    <div className="guide__row" data-focusable="" tabIndex={-1} role="button" aria-label={item.title} onClick={() => onSelect(item)}>
      <div className="guide__ch">{item.imageUrl && <img src={item.imageUrl} alt="" loading="lazy" decoding="async" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}<strong>{item.title}</strong></div>
      <div className="guide__col">
        {cur ? <><span>{cur.title}</span><small>{hhmm(cur.start)} – {hhmm(cur.stop)}</small><div className="card__progress"><i style={{ width: `${pct}%` }} /></div></> : <small>Sem programação agora</small>}
      </div>
      <div className="guide__col">{next && <><small>A seguir · {hhmm(next.start)}</small><span>{next.title}</span></>}</div>
    </div>
  );
});

/** Guia "Agora e a seguir" por canal. Enter abre o canal. */
export default function Guide() {
  const { data: home, loading, error, reload } = useHome();
  const epg = useEpgState();
  const favs = useFavorites();
  const ref = useRef<HTMLDivElement>(null);
  const [only, setOnly] = useState<'all' | 'fav'>('all');
  const [now, setNow] = useState(Date.now());
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const live = useMemo(() => home?.library?.live ?? home?.rows.find((r) => r.id === 'live')?.items ?? [], [home]);

  useEffect(() => { ensureEpg(); }, []);
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(id); }, []);
  const rows = useMemo(() => {
    const fk = new Set(favs.map(favKey));
    const res: { item: MediaItem; cur?: Programme; next?: Programme }[] = [];
    for (const item of live) {
      if (only === 'fav' && !fk.has(favKey(item))) continue;
      const nn = nowNext(epg.data, epgKey(item), now);
      if (nn.cur || nn.next) res.push({ item, ...nn });
      if (res.length >= MAX_ROWS) break;
    }
    return res;
  }, [live, epg.data, now, only, favs]);
  useInitialFocus(ref, rows.length > 0);

  if (loading || (epg.loading && !epg.data)) return <Loading label="Carregando guia…" />;
  if (error || !home) return <ErrorState message={error?.message ?? 'Falha ao carregar.'} onRetry={reload} />;
  if (epg.error && !epg.data) return <ErrorState message={epg.error} onRetry={() => ensureEpg(true)} />;
  return (
    <div ref={ref} className="page">
      <div className="chips">
        <Category label="Todos os canais" selected={only === 'all'} onSelect={() => setOnly('all')} />
        <Category label="Favoritos" selected={only === 'fav'} onSelect={() => setOnly('fav')} />
      </div>
      {rows.length ? <div className="guide">{rows.map((r) => <GuideRow key={r.item.id} {...r} now={now} onSelect={setSelected} />)}</div>
        : <EmptyState title="Sem programação" message={only === 'fav' ? 'Nenhum canal favorito com guia. Favorite canais pelo player.' : 'O guia não trouxe programas para estes canais (confira os tvg-id da lista).'} />}
      {selected && <ItemDetailsModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
