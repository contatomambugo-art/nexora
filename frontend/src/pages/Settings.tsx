import { useRef, useState } from 'react';
import type { SourceKind } from '@shared/types';
import { addSource, removeSource, setActive, useSources } from '../services/sources/sourceStore';
import { useInitialFocus } from '../navigation/FocusProvider';
import { Category } from '../components/Category';
import { FocusableButton } from '../components/FocusableButton';
import { TextField } from '../components/TextField';

const EMPTY = { name: '', url: '', host: '', username: '', password: '' };
const isUrl = (v: string) => /^https?:\/\/.+/i.test(v.trim());

export default function Settings({ onDone }: { onDone: () => void }) {
  const { sources, activeId } = useSources();
  const [kind, setKind] = useState<SourceKind>('m3u');
  const [f, setF] = useState(EMPTY);
  const ref = useRef<HTMLDivElement>(null);
  useInitialFocus(ref, true);
  const on = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const valid = f.name.trim() && (kind === 'm3u' ? isUrl(f.url) : isUrl(f.host) && f.username && f.password);

  const submit = () => {
    addSource(kind === 'm3u'
      ? { name: f.name.trim(), kind, url: f.url.trim() }
      : { name: f.name.trim(), kind, host: f.host.trim(), username: f.username, password: f.password });
    setF(EMPTY); onDone();
  };

  return (
    <div ref={ref} className="page form">
      <h2>Fonte de conteúdo</h2>
      <p className="hint">O NEXORA é apenas o player: ele não fornece listas, canais ou filmes. Informe uma fonte que você tem direito de usar.</p>
      <div className="chips chips--flush">
        <Category label="Lista M3U / M3U8" selected={kind === 'm3u'} onSelect={() => setKind('m3u')} />
        <Category label="Xtream Codes" selected={kind === 'xtream'} onSelect={() => setKind('xtream')} />
      </div>
      <TextField label="Nome" value={f.name} onChange={on('name')} placeholder="Minha lista" />
      {kind === 'm3u'
        ? <TextField label="URL da lista" value={f.url} onChange={on('url')} placeholder="https://..." inputMode="url" />
        : <>
            <TextField label="Servidor" value={f.host} onChange={on('host')} placeholder="http://servidor:porta" inputMode="url" />
            <TextField label="Usuário" value={f.username} onChange={on('username')} />
            <TextField label="Senha" value={f.password} onChange={on('password')} type="password" />
          </>}
      <div className="form__actions"><FocusableButton disabled={!valid} onClick={submit}>Adicionar e usar</FocusableButton></div>

      <h2>Suas fontes</h2>
      <ul className="sources">
        <li><span>Dados de demonstração (MOCK)</span>
          <FocusableButton variant="ghost" selected={activeId === null} onClick={() => { setActive(null); onDone(); }}>{activeId === null ? 'Em uso' : 'Usar'}</FocusableButton></li>
        {sources.map((s) => (
          <li key={s.id}><span>{s.name} · {s.kind === 'm3u' ? 'M3U' : 'Xtream'}</span>
            <FocusableButton variant="ghost" selected={s.id === activeId} onClick={() => { setActive(s.id); onDone(); }}>{s.id === activeId ? 'Em uso' : 'Usar'}</FocusableButton>
            <FocusableButton variant="ghost" onClick={() => removeSource(s.id)}>Remover</FocusableButton></li>
        ))}
      </ul>
    </div>
  );
}
