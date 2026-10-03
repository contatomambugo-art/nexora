# NEXORA — Sua tela. Sua experiência.

Player/plataforma de mídia pessoal. **Não fornece conteúdo**: o usuário configura a própria fonte (M3U, M3U8, Xtream Codes — módulos futuros).

> Etapa 1 (fundação): estrutura, design system, navegação, layout de TV, Home com dados MOCK e foco por controle remoto.

## Stack
React 18 + TypeScript + Vite. Única dependência de runtime além do React: nenhuma. Navegação espacial, roteador e estado são próprios (sem libs). Fonte: Montserrat (Google Fonts, com fallback de sistema).

## Instalar e executar
```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + build de produção
npm run preview
npm run typecheck
```
Teste no navegador só com teclado: setas, Enter (OK) e Esc/Backspace (Back).

## Estrutura
```
nexora/
  frontend/   app React (src: pages, components, layouts, navigation, services, state, data/mock, styles; player, catalog, profiles, settings, remote-control, utils reservados)
  backend/    placeholder (não implementado)
  shared/     tipos compartilhados (types.ts)
  database/   placeholder
  docs/       ARCHITECTURE.md
```

## Decisões técnicas
- Tokens de design centralizados em `src/styles/tokens.css`; componentes usam apenas `var(--...)`.
- Foco: um único listener global + algoritmo geométrico sobre elementos `[data-focusable]`.
- Dados atrás de `CatalogProvider` (`services/`): trocar mock por M3U/Xtream não muda a UI.
- Páginas com `React.lazy`, linhas liberadas progressivamente, cards com `React.memo`, imagens `loading="lazy"`.
- Cores seguem a marca: primária #6C63FF (acento), secundária #FF6B3D usada só em detalhes (badge AO VIVO).

## Próximos módulos
Fontes M3U/M3U8 → Xtream → player real → EPG → perfis/controle parental → ativação (Device ID/QR) → backend/licença.

## Módulo 2 — Fontes M3U / Xtream (implementado)
- Configurações → informe uma lista M3U/M3U8 ou credenciais Xtream (convertidas para a lista `get.php`, mesmo parser).
- Fontes ficam no `localStorage` do aparelho. Sem fonte ativa, o app usa os dados MOCK.
- Navegadores bloqueiam muitas listas por CORS: rode `node backend/proxy.mjs` e crie `frontend/.env.local` com `VITE_PROXY_URL=http://127.0.0.1:8787/`.
- Tipo (canal/filme/série) é inferido por URL (`/movie/`, `/series/`) e nome do grupo; ajustável em `services/m3u/parseM3U.ts`.
- Próximo: player real (HLS).

## Módulo 3 — Player (implementado)
- Itens de fonte real abrem o player em tela cheia (`frontend/src/player`). HLS via `hls.js` (carregado sob demanda); MP4/outros pelo `<video>` nativo.
- Controle remoto: com controles ocultos, ←/→ pulam 10s (VOD) e Enter pausa; qualquer tecla revela os controles; Back fecha. Teclas de mídia (Play/Pause, Rewind, FastForward) também funcionam.
- VOD retoma de onde parou (posição por URL no `localStorage`); canais ao vivo não salvam posição.
- Limitações: o servidor do stream precisa permitir CORS para o navegador (o proxy não serve para vídeo); HTTP em site HTTPS é bloqueado; MKV não toca em navegadores. No app Android essas restrições não existem.

## Módulo 4 — PWA e Android TV (implementado)
Veja `docs/ANDROID.md`. Web: manifest, service worker e ícones da marca. Android: Capacitor com patch para Android TV (`npm run android:add`).

## Módulo 5 — Minha Lista, Continue assistindo e Busca (implementado)
- **Minha Lista:** em detalhes (filmes/séries) ou no player (qualquer item), botão "＋ Minha Lista". Página própria e linha na Home. Dados no `localStorage`.
- **Continue assistindo:** linha na Home com barra de progresso, alimentada pela posição salva no player. Canais ao vivo tocam direto ao selecionar.
- **Buscar:** busca por título e categoria, sem acento/caixa, agrupada em Canais/Filmes/Séries. No teclado da TV, pode ser necessário pressionar OK no campo para abrir o teclado do aparelho (validar na TV).

## Módulo 6 — Perfis e controle parental (implementado)
- Até 6 perfis, cada um com **Minha Lista** e **Continue assistindo** próprios (o Perfil 1 preserva os dados antigos). Tela "Quem está assistindo?" ao abrir, quando há mais de um perfil.
- **Perfil infantil:** só categorias infantis (por palavras no nome do grupo) e nunca conteúdo adulto. Dados MOCK não são filtrados.
- **PIN (4 dígitos, teclado navegável):** exigido para sair de perfil infantil, abrir Configurações/Perfis em perfil infantil, criar/remover perfis, remover o PIN e liberar conteúdo adulto. 5 erros bloqueiam por 30s (em memória).
- Limites: detecção por palavras pode errar; PIN é trava suave contra crianças, guardado só no aparelho.

## Módulo 7 — Guia de programação / EPG (implementado)
- Página **Guia (EPG)**: por canal, o programa de agora (com barra de progresso) e o seguinte; Enter abre o canal. Filtro Todos/Favoritos. No player de canais, o topo mostra "Agora / A seguir".
- Fonte do guia: Xtream → `xmltv.php`; M3U → `url-tvg` do cabeçalho `#EXTM3U`. Canais casam pelo `tvg-id`. Aceita `.gz`.
- Lê só a janela de -1h a +10h (guias XMLTV são grandes), em memória, com cache de 6h; após falha, tenta de novo só depois de 5 min. Sem fonte configurada, usa guia MOCK.
- Limites: guia grande pode pesar em TV fraca (candidato a processamento no backend); sem grade de linha do tempo nesta versão.

## Módulo 8 — Ativação por QR Code e backend mínimo (implementado)
Tela **Ativar por QR** (QR + ID + código) e `backend/server.mjs` (sem dependências). Detalhes e modelo de segurança em `docs/ACTIVATION.md`. Em perfil infantil com PIN, a tela fica protegida como Configurações e Perfis.

## Status
Módulos 1–8 concluídos. Próxima etapa: **teste em TV real** e ajustes (foco, desempenho do HLS, teclado de busca, ícones nativos).
