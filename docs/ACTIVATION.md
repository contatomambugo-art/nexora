# Ativação por QR Code / Device ID

## Fluxo
1. A TV cria **ID** (`NX-XXXX-XXXX`, público) e **chave secreta** (guardada só no aparelho) e se registra no backend.
2. A tela *Ativar por QR* mostra o QR (link `…/activate?id=ID`), o ID e um **código de 6 dígitos de uso único** (expira em 15 min).
3. No celular: abrir o link, digitar o código e os dados da fonte (M3U ou Xtream) → o backend guarda a fonte como *pendente*.
4. A TV consulta (polling 3s, só com a tela aberta) com a chave secreta; a fonte é entregue **uma única vez** e removida do servidor; a TV a adiciona e ativa.

## Rodar
```bash
node backend/server.mjs                      # PORT=8788 HOST=127.0.0.1 por padrão
# frontend/.env.local
VITE_ACTIVATION_URL=http://IP_DO_PC:8788     # o celular precisa alcançar esse endereço (rode com HOST=0.0.0.0 na rede local)
```
Em produção: HTTPS obrigatório (site HTTPS não fala com backend HTTP; e as credenciais trafegam pelo servidor).

## Segurança (o que existe e o que não)
- Código de uso único + expiração + 5 erros bloqueiam o ID por 5 min; limite de 20 envios/min por IP; corpo máx. 8 KB; só URLs http/https; o servidor **nunca** acessa as URLs enviadas (sem SSRF).
- A chave secreta impede que outra pessoa leia as fontes pendentes de um ID.
- Fontes (inclusive senhas Xtream) ficam **em memória** até a TV buscar (máx. 1 h) e somem ao reiniciar. Sem banco, contas, licenças ou pagamentos — fora do escopo desta versão.
