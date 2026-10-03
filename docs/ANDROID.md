# NEXORA — PWA e Android TV

## PWA (web)
- `frontend/public`: `manifest.webmanifest`, `sw.js`, ícones (`npm run icons` regenera).
- Instalável só em **HTTPS** (ou localhost). O service worker guarda apenas o casco do app; listas, streams e proxy nunca são cacheados.
- Deploy: `npm run build` → publicar `frontend/dist` (caminhos relativos, funciona em subpasta).

## Android / Android TV (Capacitor)
Pré-requisitos: Node 18+, JDK 17, Android Studio (SDK).
```bash
cd frontend && npm install
npm run build
npm run android:add     # cria frontend/android e aplica o patch de TV (leanback, banner, cleartext)
npm run android:open    # abre no Android Studio → Run / Build APK
# após mudar o código web:
npm run android:sync
```
Teste na TV via ADB: `adb connect IP_DA_TV` e instale o APK de debug.

## O que o app nativo resolve
- **http:** WebView em esquema `http` + `usesCleartextTraffic` → streams `http://` tocam.
- **CORS:** `CapacitorHttp` envia fetch/XHR pelo código nativo.
- **Back do controle:** `@capacitor/app` → mesmo sistema de Back da web; no início do app, sai.

## Pontos a validar na TV real (não testados)
- Desempenho do vídeo HLS com `CapacitorHttp` nos segmentos (se pesar, trocar por player nativo, ex.: ExoPlayer via plugin).
- Ícones nativos do launcher (hoje o padrão do Capacitor; só o banner de TV foi trocado) — usar `@capacitor/assets`.
- Fire TV e Smart TVs (Tizen/webOS) exigem empacotamentos próprios.
