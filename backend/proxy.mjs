// Proxy de desenvolvimento (sem dependências): contorna CORS ao baixar listas M3U no navegador.
// Uso: node backend/proxy.mjs   →  VITE_PROXY_URL=http://127.0.0.1:8787/ no frontend.
// ATENÇÃO: escuta só em 127.0.0.1. Não exponha publicamente sem autenticação/allowlist (risco de SSRF).
import http from 'node:http';
import { Readable } from 'node:stream';

const PORT = process.env.PORT || 8787, HOST = process.env.HOST || '127.0.0.1';
http.createServer(async (req, res) => {
  const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' };
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); return res.end(); }
  try {
    const target = new URL(new URL(req.url, 'http://x').searchParams.get('url'));
    if (!/^https?:$/.test(target.protocol)) throw new Error('protocolo inválido');
    const r = await fetch(target, { headers: { 'user-agent': 'NEXORA/0.1' } });
    res.writeHead(r.status, { ...cors, 'content-type': r.headers.get('content-type') || 'text/plain' });
    Readable.fromWeb(r.body).pipe(res);
  } catch (e) { res.writeHead(400, cors); res.end(String(e.message)); }
}).listen(PORT, HOST, () => console.log(`NEXORA proxy: http://${HOST}:${PORT}/?url=`));
