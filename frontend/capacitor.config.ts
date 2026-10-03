import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.nexora.player',
  appName: 'NEXORA',
  webDir: 'dist',
  // http: evita bloqueio de conteúdo misto (streams http://) dentro do WebView
  server: { androidScheme: 'http', cleartext: true },
  // CapacitorHttp roteia fetch/XHR pelo código nativo, contornando CORS (listas e segmentos HLS)
  plugins: { CapacitorHttp: { enabled: true } },
};
export default config;
