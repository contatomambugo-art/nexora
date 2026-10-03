import { runBack } from '../navigation/FocusProvider';

/** Só faz algo dentro do app Android (Capacitor): liga o botão Voltar do controle remoto ao sistema de Back do app. */
export async function initNative() {
  const cap = (window as any).Capacitor; // eslint-disable-line @typescript-eslint/no-explicit-any
  if (!cap?.isNativePlatform?.()) return;
  const { App } = await import('@capacitor/app');
  App.addListener('backButton', () => { if (!runBack()) App.exitApp(); });
}
