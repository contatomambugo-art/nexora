import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import { App } from './App';
import { initNative } from './native/capacitor';

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);

initNative();
const native = !!(window as any).Capacitor?.isNativePlatform?.(); // eslint-disable-line @typescript-eslint/no-explicit-any
if ('serviceWorker' in navigator && import.meta.env.PROD && !native) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(() => {}); });
}
