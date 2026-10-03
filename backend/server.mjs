// Backend mínimo de ativação do NEXORA (sem dependências). Uso: node backend/server.mjs
// Fluxo: a TV se registra (ID + chave secreta), mostra QR/código; o celular abre /activate e envia a fonte; a TV busca (poll) e a entrega é única.
// V1: tudo em memória (reiniciar o servidor apaga pendências). Sem contas, licença ou pagamentos. Use atrás de HTTPS em produção.
import http from 'node:http';
import { readFileSync } from 'node:fs';
import { randomInt, timingSafeEqual } from 'node:crypto';

const PORT = process.env.PORT || 8788, HOST = process.env.HOST || '127.0.0.1';
const CODE_TTL = 15 * 60e3, PENDING_TTL = 3600e3, MAX_FAILS = 5, LOCK = 5 * 60e3, IDLE_TTL = 24 * 3600e3;
const ID_RE = /^NX-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/, KEY_RE = /^[0-9a-f]{32}$/;
const PAGE = readFileSync(new URL('./activate.html', import.meta.url));
const devices = new Map(), hits = new Map();
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type,x-device-key', 'access-control-allow-methods': 'GET,POST,OPTIONS' };

const rotate = (d) => { d.code = String(randomInt(0, 1_000_000)).padStart(6, '0'); d.codeExp = Date.now() + CODE_TTL; d.fails = 0; };
const same = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && timingSafeEqual(x, y); };
const fresh = (d) => { d.seen = Date.now(); if (Date.now() > d.codeExp) rotate(d); };
const send = (res, status, obj) => { res.writeHead(status, { ...CORS, 'content-type': 'application/json' }); res.end(JSON.stringify(obj)); };
async function readJson(req) {
  const chunks = []; let n = 0;
  for await (const c of req) { n += c.length; if (n > 8192) throw new Error('Requisição grande demais.'); chunks.push(c); }
  const t = Buffer.concat(chunks).toString(); return t ? JSON.parse(t) : {};
}
const isHttp = (u, max) => typeof u === 'string' && u.length <= max && /^https?:\/\/[^\s]+$/i.test(u);
function cleanSource(b) {
  const name = typeof b.name === 'string' ? b.name.trim().slice(0, 40) : '';
  if (!name) return null;
  if (b.kind === 'm3u' && isHttp(b.url, 500)) return { name, kind: 'm3u', url: b.url };
  if (b.kind === 'xtream' && isHttp(b.host, 200) && typeof b.username === 'string' && typeof b.password === 'string'
    && b.username && b.password && b.username.length <= 100 && b.password.length <= 100) return { name, kind: 'xtream', host: b.host, username: b.username, password: b.password };
  return null;
}
function limited(ip) { // 20 envios/min por IP
  const now = Date.now(), h = (hits.get(ip) ?? []).filter((t) => now - t < 60e3); h.push(now); hits.set(ip, h); return h.length > 20;
}

http.createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') { res.writeHead(204, CORS); return res.end(); }
    const p = new URL(req.url, 'http://x').pathname.split('/').filter(Boolean);
    if (req.method === 'GET' && (p[0] === 'activate' || !p.length)) { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }); return res.end(PAGE); }
    if (p[0] !== 'api' || p[1] !== 'devices') return send(res, 404, { error: 'Não encontrado.' });

    if (req.method === 'POST' && p.length === 2) { // registro da TV
      const { id, key } = await readJson(req);
      if (!ID_RE.test(id ?? '') || !KEY_RE.test(key ?? '')) return send(res, 400, { error: 'ID ou chave inválidos.' });
      let d = devices.get(id);
      if (!d) { d = { id, key, pending: [], fails: 0, lockUntil: 0, seen: Date.now() }; rotate(d); devices.set(id, d); }
      else if (!same(d.key, key)) return send(res, 409, { error: 'ID já em uso.' });
      fresh(d); return send(res, 200, { code: d.code, expiresAt: d.codeExp });
    }
    const d = devices.get(p[2] ?? '');
    if (req.method === 'GET' && p[3] === 'poll') { // a TV busca fontes pendentes
      if (!d) return send(res, 404, { error: 'Dispositivo não registrado.' });
      if (!same(d.key, req.headers['x-device-key'] ?? '')) return send(res, 401, { error: 'Chave inválida.' });
      fresh(d); d.pending = d.pending.filter((s) => Date.now() - s.at < PENDING_TTL);
      const sources = d.pending.splice(0).map(({ at, ...s }) => s);
      return send(res, 200, { sources, code: d.code, expiresAt: d.codeExp });
    }
    if (req.method === 'POST' && p[3] === 'sources') { // o celular envia a fonte
      if (limited(req.socket.remoteAddress ?? '?')) return send(res, 429, { error: 'Muitas tentativas. Aguarde um minuto.' });
      if (!d) return send(res, 404, { error: 'Dispositivo não encontrado. Confira o ID na TV.' });
      if (Date.now() < d.lockUntil) return send(res, 429, { error: 'Bloqueado por tentativas incorretas. Tente em alguns minutos.' });
      if (Date.now() > d.codeExp) { rotate(d); return send(res, 410, { error: 'Código expirado. Use o novo código da TV.' }); }
      const b = await readJson(req);
      if (!same(String(b.code ?? ''), d.code)) {
        if (++d.fails >= MAX_FAILS) { d.lockUntil = Date.now() + LOCK; rotate(d); }
        return send(res, 403, { error: 'Código incorreto.' });
      }
      const src = cleanSource(b);
      if (!src) return send(res, 400, { error: 'Dados da fonte inválidos (use URLs http/https).' });
      if (d.pending.length >= 5) return send(res, 429, { error: 'A TV ainda não recebeu as fontes anteriores.' });
      d.pending.push({ ...src, at: Date.now() }); rotate(d); // código de uso único
      return send(res, 200, { ok: true });
    }
    send(res, 404, { error: 'Não encontrado.' });
  } catch (e) { send(res, 400, { error: e instanceof SyntaxError ? 'JSON inválido.' : e.message }); }
}).listen(PORT, HOST, () => console.log(`NEXORA ativação: http://${HOST}:${PORT}/activate`));
setInterval(() => { for (const [id, d] of devices) if (Date.now() - d.seen > IDLE_TTL) devices.delete(id); }, 3600e3).unref();
