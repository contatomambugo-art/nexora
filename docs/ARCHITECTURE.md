# Arquitetura — NEXORA v0.1 (fundação)

## Camadas (frontend)
1. **pages/** — telas (Home, Catalog). Carregadas com lazy.
2. **layouts/** — `TvLayout` (sidebar + header + área rolável).
3. **components/** — Header, Sidebar, ContentRow, ContentCard, ChannelCard, Hero, Category, Profile, Button, FocusableButton, Modal, Loading, EmptyState, ErrorState.
4. **navigation/** — roteador por hash, `FocusProvider` (teclado/controle), `spatial.ts` (algoritmo de vizinho mais próximo).
5. **services/** — `CatalogProvider` (interface) + `mockProvider`. Único ponto de troca em `services/index.ts`.
6. **state/** — hooks (`useAsync`, `useHome` com cache, `useProgressive`).
7. **data/mock/** — dados fictícios, marcados `isMock`.
8. **shared/** — tipos usados por frontend e futuro backend.

## Sistema de foco
- Todo elemento navegável recebe `data-focusable` e `tabIndex=-1`; o foco é o foco real do DOM (acessível).
- Setas: escolhe o candidato na direção com menor `distância principal + 3 × desvio lateral`; esquerda/direita ficam na mesma linha.
- Enter dispara `click`. Back (Esc, Backspace, keyCodes 4/10009/461) percorre uma pilha de tratadores: Modal fecha; conteúdo devolve o foco ao menu.
- Modal usa `data-focus-scope` para prender o foco e restaura o foco anterior ao fechar.
- Estados: foco (anel branco + brilho + escala) e seleção (`data-selected`, fundo/barra violeta) são distintos.

## Performance
Rotas lazy, linhas progressivas, `memo` nos cards, animações só com transform/box-shadow, `rem` escalável para 4K, `build.target es2019` para WebViews antigos. Para catálogos reais grandes: virtualizar a lista dentro de `ContentRow` (o algoritmo de foco já é independente da estrutura).

## Limitações conhecidas
A busca de foco varre o DOM a cada tecla (ok para centenas de itens; com virtualização o conjunto cai). Fonte vem da web; para TVs offline, empacotar localmente.
