import { lazy, Suspense, useEffect, useState } from 'react';
import { FocusProvider } from './navigation/FocusProvider';
import { useRoute } from './navigation/routes';
import { TvLayout } from './layouts/TvLayout';
import { Loading } from './components/Loading';
import { PinDialog } from './components/PinDialog';
import { useActiveProfile, useProfiles } from './profiles/profileStore';
import { useParental, verifyPin } from './profiles/parentalStore';
import ProfilePicker from './pages/ProfilePicker';

const Home = lazy(() => import('./pages/Home'));
const Catalog = lazy(() => import('./pages/Catalog'));
const Guide = lazy(() => import('./pages/Guide'));
const Search = lazy(() => import('./pages/Search'));
const Settings = lazy(() => import('./pages/Settings'));
const Activate = lazy(() => import('./pages/Activate'));
const Profiles = lazy(() => import('./pages/Profiles'));

export function App() {
  const { route, navigate } = useRoute();
  const profile = useActiveProfile();
  const profiles = useProfiles();
  const par = useParental();
  const [picked, setPicked] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const gated = route === 'settings' || route === 'profiles' || route === 'activate'; // áreas dos pais
  useEffect(() => { setUnlocked(false); }, [profile.id]);
  useEffect(() => { if (!gated) setUnlocked(false); }, [gated]);

  if (!picked && profiles.length > 1) return <FocusProvider><ProfilePicker onDone={() => setPicked(true)} /></FocusProvider>;

  const locked = gated && !!profile.isKids && !!par.pin && !unlocked;
  return (
    <FocusProvider>
      <TvLayout route={route} onNavigate={navigate}>
        {locked ? (
          <PinDialog title="PIN dos pais" onCancel={() => navigate('home')}
            onComplete={(p) => { const e = verifyPin(p); if (e) return e; setUnlocked(true); }} />
        ) : (
          <Suspense fallback={<Loading />}>
            {route === 'home' ? <Home />
              : route === 'epg' ? <Guide />
              : route === 'search' ? <Search />
              : route === 'profiles' ? <Profiles />
              : route === 'activate' ? <Activate onDone={() => navigate('home')} />
              : route === 'settings' ? <Settings onDone={() => navigate('home')} />
              : <Catalog key={route} route={route} />}
          </Suspense>
        )}
      </TvLayout>
    </FocusProvider>
  );
}
