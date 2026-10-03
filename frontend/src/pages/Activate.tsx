import { useEffect, useMemo, useRef, useState } from 'react';
import { useInitialFocus } from '../navigation/FocusProvider';
import { QrCode } from '../components/QrCode';
import { FocusableButton } from '../components/FocusableButton';
import { EmptyState } from '../components/EmptyState';
import { activationEnabled, activationPageUrl, pollDevice, registerDevice, type PendingSource } from '../services/activation/activationApi';
import { getDevice } from '../services/activation/device';
import { addSource } from '../services/sources/sourceStore';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const isHttp = (u?: string) => /^https?:\/\/\S+$/i.test(u ?? '');
const valid = (s: PendingSource) => !!s.name && (s.kind === 'm3u' ? isHttp(s.url) : isHttp(s.host) && !!s.username && !!s.password);

/** Ativação por QR: o celular envia a fonte; a TV a recebe por polling a cada 3s enquanto esta tela está aberta. */
export default function Activate({ onDone }: { onDone: () => void }) {
  const device = useMemo(getDevice, []);
  const ref = useRef<HTMLDivElement>(null);
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<string[]>([]);
  const [attempt, setAttempt] = useState(0);
  useInitialFocus(ref, true);

  useEffect(() => {
    if (!activationEnabled) return;
    let dead = false;
    setError(null);
    (async () => {
      try {
        setCode((await registerDevice(device)).code);
        for (let fails = 0; !dead;) {
          await sleep(3000);
          if (dead) return;
          try {
            const r = await pollDevice(device);
            fails = 0; if (dead) return;
            setCode(r.code);
            for (const s of r.sources) if (valid(s)) { addSource(s); setAdded((a) => [...a, s.name]); }
          } catch (e) {
            if (e instanceof Error && e.message === 'reregister') setCode((await registerDevice(device)).code);
            else if (++fails >= 3) throw e;
          }
        }
      } catch (e) { if (!dead) setError(e instanceof Error ? e.message : 'Falha na ativação.'); }
    })();
    return () => { dead = true; };
  }, [device, attempt]);

  if (!activationEnabled) return <EmptyState title="Ativação por QR não configurada"
    message="Defina VITE_ACTIVATION_URL (endereço do backend de ativação) em frontend/.env.local e rode node backend/server.mjs. Veja docs/ACTIVATION.md." />;

  return (
    <div ref={ref} className="page activate">
      <QrCode value={activationPageUrl(device.id)} label="QR Code de ativação" />
      <div className="activate__info">
        <h2>Ativar dispositivo</h2>
        <div><small>ID do dispositivo</small><div className="activate__id">{device.id}</div></div>
        <div><small>Código (uso único)</small><div className="activate__code">{code ? `${code.slice(0, 3)} ${code.slice(3)}` : '··· ···'}</div></div>
        <ol>
          <li>No celular, leia o QR Code (ou abra o endereço de ativação).</li>
          <li>Informe o código acima e os dados da sua fonte (M3U ou Xtream).</li>
          <li>A fonte aparece aqui automaticamente.</li>
        </ol>
        {error && <><p className="pin__err" role="alert">{error}</p><FocusableButton onClick={() => setAttempt((a) => a + 1)}>Tentar novamente</FocusableButton></>}
        {added.length > 0 && <><p className="activate__ok" role="status">Fonte adicionada e em uso: {added.join(', ')}</p><FocusableButton onClick={onDone}>Ir para o início</FocusableButton></>}
      </div>
    </div>
  );
}
