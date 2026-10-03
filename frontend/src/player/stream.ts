import type { MediaItem } from '@shared/types';

/** Site em HTTPS não pode carregar stream HTTP (conteúdo misto bloqueado pelo navegador). */
export const mixedContent = (u: string) => location.protocol === 'https:' && /^http:/i.test(u);

/** Canais Xtream costumam vir como .ts; o mesmo caminho em .m3u8 é o que o navegador toca. */
export function playbackUrl(item: MediaItem): string {
  const u = item.streamUrl!;
  return item.kind === 'channel' && /\/live\/[^/]+\/[^/]+\/\d+\.ts(\?.*)?$/i.test(u) ? u.replace(/\.ts(\?.*)?$/i, '.m3u8$1') : u;
}

/** Conecta o stream ao <video>. HLS usa hls.js (carregado sob demanda) exceto onde o navegador já toca nativamente. */
export async function attachStream(video: HTMLVideoElement, url: string, onError: (m: string) => void): Promise<() => void> {
  const isHls = /\.m3u8(\?|#|$)/i.test(url);
  if (isHls && !video.canPlayType('application/vnd.apple.mpegurl')) {
    const { default: Hls } = await import('hls.js');
    if (Hls.isSupported()) {
      const hls = new Hls({ backBufferLength: 30, maxBufferLength: 30 });
      let retries = 0;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_e, d) => {
        if (!d.fatal) return;
        if (d.type === Hls.ErrorTypes.NETWORK_ERROR) {
          if (++retries <= 3) hls.startLoad(); else onError('Sem resposta do servidor do stream (rede ou CORS).');
        } else if (d.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
        else { hls.destroy(); onError('Falha ao reproduzir o stream.'); }
      });
      return () => hls.destroy();
    }
  }
  video.src = url;
  return () => { video.removeAttribute('src'); video.load(); };
}
