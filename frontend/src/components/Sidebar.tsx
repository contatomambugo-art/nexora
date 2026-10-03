import { ROUTES, type RouteId } from '../navigation/routes';
import { FocusableButton } from './FocusableButton';

export function Sidebar({ route, onNavigate }: { route: RouteId; onNavigate: (id: RouteId) => void }) {
  return (
    <nav className="sidebar" aria-label="Menu principal">
      <div className="sidebar__brand"><span className="logo-n">N</span>NEXORA</div>
      <ul>
        {ROUTES.map((r) => (
          <li key={r.id}>
            <FocusableButton variant="nav" selected={r.id === route} onClick={() => onNavigate(r.id)}>
              <span aria-hidden="true">{r.icon}</span>{r.label}
            </FocusableButton>
          </li>
        ))}
      </ul>
    </nav>
  );
}
