import { useMemo, useRef, useState } from 'react';
import type { ContentRowData, MediaItem } from '@shared/types';
import { useContentFilter } from '../profiles/filter';
import { useContinue } from '../player/progress';
import { useFavorites } from '../services/library/favorites';
import { useHome, useProgressive } from '../state/hooks';
import { useInitialFocus } from '../navigation/FocusProvider';
import { Hero } from '../components/Hero';
import { ContentRow } from '../components/ContentRow';
import { ItemDetailsModal } from '../components/ItemDetailsModal';
import { Loading } from '../components/Loading';
import { ErrorState } from '../components/ErrorState';

export default function Home() {
  const { data, loading, error, reload } = useHome();
  const ref = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const cont = useContinue();
  const favs = useFavorites();
  const allow = useContentFilter();
  // linhas pessoais (continuar, minha lista, canais favoritos) vêm na frente e substituem as de mesmo id
  const rows = useMemo<ContentRowData[]>(() => {
    if (!data) return [];
    const top: ContentRowData[] = [];
    const c = cont.filter(allow), f = favs.filter(allow);
    if (c.length) top.push({ id: 'continue', title: 'Continue assistindo', variant: 'wide', items: c });
    const vod = f.filter((i) => i.kind !== 'channel'), tv = f.filter((i) => i.kind === 'channel');
    if (vod.length) top.push({ id: 'mylist', title: 'Minha Lista', variant: 'poster', items: vod.slice(0, 40) });
    if (tv.length) top.push({ id: 'fav-live', title: 'Canais favoritos', variant: 'channel', items: tv.slice(0, 40) });
    const skip = new Set(top.map((r) => r.id));
    return [...top, ...data.rows.filter((r) => !skip.has(r.id))];
  }, [data, cont, favs, allow]);
  const visible = useProgressive(rows.length);
  useInitialFocus(ref, !!data);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error?.message ?? 'Falha ao carregar.'} onRetry={reload} />;
  return (
    <div ref={ref}>
      <Hero hero={data.hero} onPlay={() => setSelected(data.hero.item)} />
      {rows.slice(0, visible).map((row) => <ContentRow key={row.id} row={row} onSelect={setSelected} />)}
      {selected && <ItemDetailsModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
