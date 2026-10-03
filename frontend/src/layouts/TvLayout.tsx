import type { ReactNode } from 'react';
import { ROUTES, type RouteId } from '../navigation/routes';
import { useBack } from '../navigation/FocusProvider';
import { focusEl } from '../navigation/spatial';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

interface Props { route: RouteId; onNavigate: (id: RouteId) => void; children: ReactNode }

export function TvLayout({ route, onNavigate, children }: Props) {
  // Back no conteúdo => volta o foco ao menu lateral
  useBack(() => {
    const active = document.activeElement;
    if (!active || document.querySelector('.sidebar')?.contains(active)) return false;
    const sel = document.querySelector<HTMLElement>('.sidebar [data-selected="true"]');
    if (sel) { focusEl(sel, 'left'); return true; }
    return false;
  });
  return (
    <div className="tv">
      <Sidebar route={route} onNavigate={onNavigate} />
      <div className="main">
        <Header title={ROUTES.find((r) => r.id === route)!.label} />
        <main className="main__scroll">{children}</main>
      </div>
    </div>
  );
}
