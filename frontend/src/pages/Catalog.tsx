import { useMemo, useRef, useState } from 'react';
import type { ContentRowData, MediaItem } from '@shared/types';
import { ROUTES, type RouteId } from '../navigation/routes';
import { useHome } from '../state/hooks';
import { useContentFilter } from '../profiles/filter';
import { useFavorites } from '../services/library/favorites';
import { kindRows } from '../utils/rows';
import { useInitialFocus } from '../navigation/FocusProvider';
import { Category } from '../components/Category';
import { ContentRow } from '../components/ContentRow';
import { ItemDetailsModal } from '../components/ItemDetailsModal';
import { Loading } from '../components/Loading';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';

const MOCK_CATEGORIES = ['Todos', 'Ação', 'Comédia', 'Drama', 'Documentário', 'Infantil']; // MOCK
const PAGE_CAP = 120; // até haver virtualização, limita os nós do DOM

const topGroups = (items: MediaItem[], n = 8) => {
  const m = new Map<string, number>();
  items.forEach((i) => m.set(i.group ?? 'Outros', (m.get(i.group ?? 'Outros') ?? 0) + 1));
  return [...m].sort((a, b) => b[1] - a[1]).slice(0, n).map((x) => x[0]);
};

/** TV ao Vivo, Filmes, Séries e Minha Lista. Com fonte real, as categorias são os grupos da lista. */
export default function Catalog({ route }: { route: RouteId }) {
  const isList = route === 'mylist';
  const { data, loading, error, reload } = useHome();
  const favs = useFavorites();
  const allow = useContentFilter();
  const ref = useRef<HTMLDivElement>(null);
  const [cat, setCat] = useState('Todos');
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const lib = data?.library?.[route as 'live' | 'movies' | 'series'];
  const cats = useMemo(() => (lib ? ['Todos', ...topGroups(lib)] : MOCK_CATEGORIES), [lib]);
  useInitialFocus(ref, isList || !!data);

  if (!isList && loading) return <Loading />;
  if (!isList && (error || !data)) return <ErrorState message={error?.message ?? 'Falha ao carregar.'} onRetry={reload} />;

  let rows: ContentRowData[];
  if (isList) rows = kindRows(favs.filter(allow));
  else {
    const label = ROUTES.find((r) => r.id === route)!.label;
    const row: ContentRowData | undefined = lib
      ? { id: route, title: `${label} · ${cat}`, variant: route === 'live' ? 'channel' : 'poster',
          items: lib.filter((i) => cat === 'Todos' || i.group === cat).slice(0, PAGE_CAP) }
      : data!.rows.find((r) => r.id === route);
    rows = row && row.items.length ? [lib ? row : { ...row, title: `${row.title} · ${cat}` }] : [];
  }
  if (!rows.length) return <EmptyState title={isList ? 'Sua lista está vazia' : 'Nada por aqui ainda'}
    message={isList ? 'Abra um filme, série ou canal e escolha “＋ Minha Lista”.' : 'Nenhum item nesta seção da sua fonte.'} />;
  return (
    <div ref={ref} className="page">
      {!isList && <div className="chips">{cats.map((c) => <Category key={c} label={c} selected={c === cat} onSelect={() => setCat(c)} />)}</div>}
      {rows.map((r) => <ContentRow key={r.id} row={r} onSelect={setSelected} wrap />)}
      {selected && <ItemDetailsModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
