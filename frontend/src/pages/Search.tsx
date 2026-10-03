import { useDeferredValue, useMemo, useRef, useState } from 'react';
import type { MediaItem } from '@shared/types';
import { useHome } from '../state/hooks';
import { useInitialFocus } from '../navigation/FocusProvider';
import { kindRows } from '../utils/rows';
import { TextField } from '../components/TextField';
import { ContentRow } from '../components/ContentRow';
import { ItemDetailsModal } from '../components/ItemDetailsModal';
import { Loading } from '../components/Loading';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export default function Search() {
  const { data, loading, error, reload } = useHome();
  const ref = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState('');
  const dq = useDeferredValue(q);
  const [selected, setSelected] = useState<MediaItem | null>(null);

  // índice normalizado (sem acento/caixa) calculado uma vez por fonte
  const index = useMemo(() => {
    if (!data) return [];
    const all = data.library ? [...data.library.live, ...data.library.movies, ...data.library.series]
      : [...new Map(data.rows.flatMap((r) => r.items).map((i) => [i.id, i])).values()];
    return all.map((i) => ({ i, n: norm(`${i.title} ${i.group ?? ''}`) }));
  }, [data]);
  const results = useMemo(() => {
    const terms = norm(dq).split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    const out: MediaItem[] = [];
    for (const { i, n } of index) if (terms.every((t) => n.includes(t)) && out.push(i) >= 300) break;
    return out;
  }, [dq, index]);
  useInitialFocus(ref, !!data);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error?.message ?? 'Falha ao carregar.'} onRetry={reload} />;
  const rows = kindRows(results);
  return (
    <div ref={ref} className="page">
      <div className="search"><TextField label="Buscar" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filme, série ou canal" enterKeyHint="search" /></div>
      {!dq.trim() ? <p className="hint search__hint">Digite para buscar por título ou categoria.</p>
        : !rows.length ? <EmptyState title="Nenhum resultado" message={`Nada encontrado para “${dq.trim()}”.`} />
        : rows.map((r) => <ContentRow key={r.id} row={r} onSelect={setSelected} wrap />)}
      {selected && <ItemDetailsModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
