import { useCallback, useEffect, useRef, useState } from 'react';
import type { MediaItem } from '@shared/types';
import { isBack, useBack } from '../navigation/FocusProvider';
import { FocusableButton } from '../components/FocusableButton';
import { ensureEpg, epgKey, useEpgState } from '../services/epg/epgService';
import { nowNext } from '../services/epg/xmltv';
import { fmtTime } from '../utils/format';
import { attachStream, mixedContent, playbackUrl } from './stream';
import { loadPos, savePos } from './progress';
import { toggleFavorite, useIsFavorite } from '../services/library/favorites';

const SEEK = 10;

export function PlayerScreen({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  const url = item.streamUrl!;
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<number>();
  const lastSave = useRef(0);
  const attached = useRef(false);
  const [paused, setPaused] = useState(false);
  const [buffering, setBuffering] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState({ t: 0, d: 0 });
  const [shown, setShown] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const fav = useIsFavorite(item);
  const epg = useEpgState();
  useEffect(() => { if (item.kind === 'channel') ensureEpg(); }, [item]);
  const { cur, next } = item.kind === 'channel' ? nowNext(epg.data, epgKey(item), Date.now()) : {};
  const live = item.kind === 'channel' || time.d === Infinity;
  const visible = shown || paused || !!error;

  useBack(() => { onClose(); return true; });

  const reveal = useCallback(() => {
    setShown(true);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setShown(false), 4000);
  }, []);
  const toggle = useCallback(() => { const v = video.current; if (v) { if (v.paused) v.play().catch(() => {}); else v.pause(); } }, []);
  const skip = useCallback((s: number) => { const v = video.current; if (v) v.currentTime = Math.max(0, v.currentTime + s); }, []);

  // foco: entra no botão Play; ao sair, salva posição e devolve o foco
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const v = video.current!;
    root.current?.querySelector<HTMLElement>('[data-player-play]')?.focus({ preventScroll: true });
    reveal();
    return () => {
      window.clearTimeout(hideTimer.current);
      if (item.kind !== 'channel') savePos(url, v.currentTime, v.duration, item);
      prev?.focus({ preventScroll: true });
    };
  }, [item, url, reveal]);

  // conecta o stream (e reconecta em "Tentar novamente")
  useEffect(() => {
    const v = video.current!;
    setError(null); setBuffering(true);
    if (mixedContent(url)) { setError('Este site usa HTTPS e a fonte usa HTTP, e o navegador bloqueia isso. Use o app Android/TV ou uma fonte HTTPS.'); return; }
    let dead = false, detach = () => {};
    attached.current = true;
    attachStream(v, playbackUrl(item), setError).then((d) => { if (dead) d(); else detach = d; });
    const resume = item.kind === 'channel' ? 0 : loadPos(url);
    const onMeta = () => { if (resume > 5 && v.duration > resume + 10) v.currentTime = resume; };
    v.addEventListener('loadedmetadata', onMeta, { once: true });
    return () => { dead = true; attached.current = false; detach(); v.removeEventListener('loadedmetadata', onMeta); };
  }, [item, url, attempt]);

  // teclas: com controles ocultos, 1ª tecla só revela (←/→ pulam, Enter pausa); teclas de mídia do controle remoto
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (['MediaPlayPause', 'MediaPlay', 'MediaPause'].includes(e.key)) { e.preventDefault(); toggle(); reveal(); return; }
      if (e.key === 'MediaRewind') { skip(-SEEK); reveal(); return; }
      if (e.key === 'MediaFastForward') { skip(SEEK); reveal(); return; }
      if (visible) { reveal(); return; }
      if (isBack(e)) return;
      e.preventDefault(); e.stopImmediatePropagation();
      if (e.key === 'Enter') toggle();
      else if (!live && e.key === 'ArrowLeft') skip(-SEEK);
      else if (!live && e.key === 'ArrowRight') skip(SEEK);
      reveal();
      root.current?.querySelector<HTMLElement>('[data-player-play]')?.focus({ preventScroll: true });
    };
    window.addEventListener('keydown', on, true);
    return () => window.removeEventListener('keydown', on, true);
  }, [visible, live, toggle, skip, reveal]);

  const onTime = () => {
    const v = video.current!;
    setTime({ t: v.currentTime, d: v.duration });
    if (item.kind !== 'channel' && Date.now() - lastSave.current > 5000) { lastSave.current = Date.now(); savePos(url, v.currentTime, v.duration, item); }
  };
  const onVideoError = () => {
    if (!attached.current) return;
    setError(video.current?.error?.code === 4 ? 'Formato não suportado pelo navegador (ex.: MKV). Tente no app Android/TV.' : 'Falha ao reproduzir este conteúdo.');
  };
  const pct = time.d > 0 && isFinite(time.d) ? (time.t / time.d) * 100 : 0;

  return (
    <div ref={root} className="player" data-focus-scope="player">
      <video ref={video} className="player__video" autoPlay playsInline muted={muted}
        onPlaying={() => { setPaused(false); setBuffering(false); }} onPause={() => setPaused(true)}
        onWaiting={() => setBuffering(true)} onCanPlay={() => setBuffering(false)}
        onTimeUpdate={onTime} onError={onVideoError} onEnded={() => { savePos(url, 0, 1); setShown(true); }} />
      {buffering && !error && <div className="player__spinner spinner" role="status" aria-label="Carregando" />}
      {error ? (
        <div className="player__error" role="alert">
          <h2>Não foi possível reproduzir</h2><p>{error}</p>
          <div className="modal__actions">
            <FocusableButton onClick={() => setAttempt((a) => a + 1)}>Tentar novamente</FocusableButton>
            <FocusableButton variant="ghost" onClick={onClose}>Fechar</FocusableButton>
          </div>
        </div>
      ) : (
        <div className={`player__ui${visible ? '' : ' player__ui--hidden'}`}>
          <div className="player__top"><strong>{item.title}</strong>{live && <span className="card__badge player__live">AO VIVO</span>}
            {cur && <span className="player__epg">Agora: {cur.title}{next ? ` · A seguir: ${next.title}` : ''}</span>}</div>
          <div className="player__bottom">
            {!live && (
              <div className="player__progress">
                <div className="player__bar"><i style={{ width: `${pct}%` }} /></div>
                <span>{fmtTime(time.t)} / {fmtTime(time.d)}</span>
              </div>
            )}
            <div className="player__buttons">
              {!live && <FocusableButton variant="ghost" onClick={() => skip(-SEEK)}>−{SEEK}s</FocusableButton>}
              <FocusableButton data-player-play="" onClick={toggle}>{paused ? '▶ Reproduzir' : '⏸ Pausar'}</FocusableButton>
              {!live && <FocusableButton variant="ghost" onClick={() => skip(SEEK)}>+{SEEK}s</FocusableButton>}
              <FocusableButton variant="ghost" onClick={() => toggleFavorite(item)}>{fav ? '★ Na lista' : '＋ Minha Lista'}</FocusableButton>
              <FocusableButton variant="ghost" onClick={() => setMuted((m) => !m)}>{muted ? 'Ativar som' : 'Mudo'}</FocusableButton>
              <FocusableButton variant="ghost" onClick={onClose}>Fechar</FocusableButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
