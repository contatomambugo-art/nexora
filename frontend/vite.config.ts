import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  base: './', // caminhos relativos: funciona em subpasta, PWA e Capacitor
  plugins: [react()],
  resolve: { alias: { '@shared': fileURLToPath(new URL('../shared', import.meta.url)) } },
  server: { host: true, port: 5173, fs: { allow: ['..'] } },
  build: { target: 'es2019' }, // TVs/WebViews mais antigos
});
