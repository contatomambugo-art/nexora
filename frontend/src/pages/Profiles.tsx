import { useRef, useState } from 'react';
import { useInitialFocus } from '../navigation/FocusProvider';
import { Avatar } from '../components/Profile';
import { Category } from '../components/Category';
import { FocusableButton } from '../components/FocusableButton';
import { PinDialog } from '../components/PinDialog';
import { TextField } from '../components/TextField';
import { addProfile, removeProfile, useActiveProfile, useProfiles } from '../profiles/profileStore';
import { clearPin, setPin, setShowAdult, useParental, verifyPin } from '../profiles/parentalStore';
import { useSwitchProfile } from '../profiles/useSwitchProfile';

type Dlg = { title: string; onComplete: (pin: string) => string | void } | null;

export default function Profiles() {
  const profiles = useProfiles();
  const active = useActiveProfile();
  const par = useParental();
  const ref = useRef<HTMLDivElement>(null);
  const { switchTo, dialog: switchDialog } = useSwitchProfile();
  const [name, setName] = useState('');
  const [kids, setKids] = useState(false);
  const [msg, setMsg] = useState('');
  const [dlg, setDlg] = useState<Dlg>(null);
  useInitialFocus(ref, true);

  /** Executa `run` direto se não há PIN; senão pede o PIN antes. */
  const guard = (run: () => void) => {
    setMsg('');
    if (!par.pin) return run();
    setDlg({ title: 'Digite o PIN', onComplete: (pin) => { const e = verifyPin(pin); if (e) return e; setDlg(null); run(); } });
  };
  const newPin = () => guard(() => setDlg({
    title: 'Novo PIN (4 números)',
    onComplete: (p1) => { setDlg({ title: 'Repita o PIN', onComplete: (p2) => {
      setDlg(null);
      if (p1 === p2) { setPin(p1); setMsg('PIN salvo.'); } else setMsg('Os PINs não conferem. Tente de novo.');
    } }); },
  }));
  const toggleAdult = () => {
    if (!par.pin && !par.showAdult) { setMsg('Defina um PIN antes de liberar conteúdo adulto.'); return; }
    guard(() => setShowAdult(!par.showAdult));
  };

  return (
    <div ref={ref} className="page form">
      <h2>Perfis</h2>
      <ul className="sources">
        {profiles.map((p) => (
          <li key={p.id}>
            <Avatar profile={p} /><span>{p.name}{p.isKids ? ' · Infantil' : ''}</span>
            <FocusableButton variant="ghost" selected={p.id === active.id} onClick={() => switchTo(p)}>{p.id === active.id ? 'Em uso' : 'Usar'}</FocusableButton>
            {p.id !== 'default' && <FocusableButton variant="ghost" onClick={() => guard(() => removeProfile(p.id))}>Remover</FocusableButton>}
          </li>
        ))}
      </ul>
      {profiles.length < 6 && (
        <>
          <TextField label="Novo perfil" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" maxLength={16} />
          <div className="chips chips--flush">
            <Category label="Adulto" selected={!kids} onSelect={() => setKids(false)} />
            <Category label="Infantil" selected={kids} onSelect={() => setKids(true)} />
          </div>
          <div className="form__actions">
            <FocusableButton disabled={!name.trim()} onClick={() => guard(() => { addProfile(name.trim(), kids); setName(''); setKids(false); })}>Criar perfil</FocusableButton>
          </div>
        </>
      )}

      <h2>Controle parental</h2>
      <p className="hint">
        Perfis infantis só mostram categorias infantis (reconhecidas pelo nome do grupo) e nunca conteúdo adulto. Com PIN definido, ele é pedido para sair de um perfil infantil,
        abrir Configurações e Perfis, criar/remover perfis e liberar conteúdo adulto. A detecção é por palavras e pode falhar; o PIN protege contra crianças, não contra quem tem acesso técnico ao aparelho.
      </p>
      <div className="form__actions">
        <FocusableButton onClick={newPin}>{par.pin ? 'Alterar PIN' : 'Definir PIN'}</FocusableButton>
        {par.pin && <FocusableButton variant="ghost" onClick={() => guard(() => { clearPin(); setMsg('PIN removido.'); })}>Remover PIN</FocusableButton>}
        <FocusableButton variant="ghost" onClick={toggleAdult}>Conteúdo adulto: {par.showAdult ? 'visível' : 'oculto'}</FocusableButton>
      </div>
      {msg && <p className="hint" role="status">{msg}</p>}
      {dlg && <PinDialog key={dlg.title} title={dlg.title} onCancel={() => setDlg(null)} onComplete={dlg.onComplete} />}
      {switchDialog}
    </div>
  );
}
