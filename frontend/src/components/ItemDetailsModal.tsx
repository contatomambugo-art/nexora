import { useState } from 'react';
import type { MediaItem } from '@shared/types';
import { Modal } from './Modal';
import { FocusableButton } from './FocusableButton';
import { PlayerScreen } from '../player/PlayerScreen';
import { toggleFavorite, useIsFavorite } from '../services/library/favorites';

/** Canal real toca direto; filmes/séries abrem detalhes (Assistir/Continuar, Minha Lista). */
export function ItemDetailsModal({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  const [playing, setPlaying] = useState(false);
  const fav = useIsFavorite(item);
  if (item.streamUrl && (item.kind === 'channel' || playing))
    return <PlayerScreen item={item} onClose={item.kind === 'channel' ? onClose : () => setPlaying(false)} />;
  return (
    <Modal title={item.title} onClose={onClose}>
      <p>{item.streamUrl ? (item.group ?? '') : 'Conteúdo MOCK. Configure uma fonte em Configurações para assistir.'}</p>
      <div className="modal__actions">
        {item.streamUrl && <FocusableButton onClick={() => setPlaying(true)}>{item.progress ? '▶ Continuar' : '▶ Assistir'}</FocusableButton>}
        <FocusableButton variant="ghost" onClick={() => toggleFavorite(item)}>{fav ? '★ Na minha lista' : '＋ Minha Lista'}</FocusableButton>
        <FocusableButton variant="ghost" onClick={onClose}>Fechar</FocusableButton>
      </div>
    </Modal>
  );
}
