# DWLOAD Web

Frontend React do projeto DWLOAD — downloader de mídia (vídeo/áudio) de
plataformas públicas (YouTube, Instagram, TikTok, Twitter/X, Vimeo).
Modelo freemium, sem cobrança direta.

Este repositório é a **camada de apresentação**. O backend (DDD com 5
bounded contexts, Node + Fastify + BullMQ) vive em outro repo
(`video-downloader-api`). A comunicação é via REST + Server-Sent Events.

---

## Documentos obrigatórios

**Leia os dois antes de escrever qualquer código:**

1. `docs/DESIGN.md` — arquitetura geral do produto inteiro (front + back),
   stack completa, contratos HTTP, bounded contexts, decisões técnicas,
   justificativas. É o contrato arquitetural.

2. `docs/IMPLEMENTATION.md` — plano de 20 tasks para este repositório
   (Marco 6 do roadmap). Cada task tem objetivo, checklist, critério de
   pronto e mensagem de commit sugerida. **Execute em ordem.**

3. `reference/DWLOAD_Standalone.html` — a UI original a ser portada para
   React. Paleta OKLCH, fontes, animações, cursor, canvas — tudo vem
   daqui. Task 3 do plano extrai as variáveis CSS deste arquivo.

---

## Stack (já decidida — não mude sem perguntar)

- **Build:** Vite
- **Framework:** React 19 + TypeScript (modo strict)
- **Estilo:** CSS Modules + variáveis OKLCH
- **Estado de servidor:** TanStack Query
- **Estado de UI:** Zustand (+ persist middleware)
- **Roteamento:** React Router 7
- **Forms:** react-hook-form + Zod
- **SSE:** `EventSource` nativo (sem biblioteca)
- **Testes:** Vitest + Testing Library
- **Package manager:** pnpm

**Não instale** Tailwind, Next.js, Framer Motion, Redux, styled-components,
axios, ou qualquer lib equivalente às listadas acima sem pedir antes.

---

## Organização

Estrutura por feature (não por tipo):

```
src/
├── app/           Root, providers, router, layout
├── features/      Cada feature é autônoma
│   ├── download/  (principal)
│   ├── history/
│   └── tweaks/
├── components/    Componentes realmente reutilizáveis
├── styles/        tokens.css, reset.css, fonts.css
├── lib/           sse.ts, apiClient.ts, env.ts
└── main.tsx
```

Detalhes completos de cada pasta estão no `DESIGN.md` seção 7.

---

## Regras de execução

1. **Siga a ordem das tasks do `IMPLEMENTATION.md`.** Elas foram pensadas
   para sempre ter algo rodando e evitar retrabalho.

2. **Uma task = 1-3 commits.** Mensagens no formato `tipo(scope): mensagem`
   (convencional). Exemplos no plano.

3. **Pare a cada 3-5 tasks pra eu revisar** antes de seguir. Não rode
   as 20 de uma vez.

4. **Preserve o visual do HTML original.** Cores OKLCH exatas, animações,
   glassmorphism, cursor, canvas de estrelas. A Task 18 valida paridade
   visual; não chegue nela com desvios grandes.

5. **TypeScript strict:** zero `any`, zero `@ts-ignore`, zero warnings.
   Se precisar de `any` pra resolver algo, pergunte em vez de usar.

6. **Mock primeiro, integração depois.** As tasks 10-12 montam mocks de
   SSE e API. O front deve funcionar 100% sem o backend rodando até a
   Task 19.

7. **Não invente.** Se uma task exigir uma decisão que não está nos docs,
   **pare e pergunte** em vez de chutar. Exemplos típicos de coisas a
   perguntar: cor exata de estado de erro, texto de tooltip, comportamento
   de edge case não documentado, escolha entre duas libs equivalentes.

8. **Não saia do escopo da task atual.** Se perceber algo pra melhorar
   que pertence a outra task, anote num TODO no plano (comentário no
   commit) e siga. Não antecipe trabalho.

---

## Comandos esperados

```bash
pnpm install        # instala deps
pnpm dev            # dev server em localhost:5173
pnpm build          # build de produção
pnpm test           # roda vitest
pnpm test:watch     # vitest em watch mode
pnpm lint           # (adicionar ao configurar)
pnpm typecheck      # tsc --noEmit
```

---

## Variáveis de ambiente

Arquivo `.env.development` (commitado, valores de desenvolvimento):

```
VITE_API_URL=http://localhost:3000
VITE_USE_MOCK_SSE=true
```

Arquivo `.env.production` (configurado no Vercel, não commitar):

```
VITE_API_URL=https://api.dwload.app
VITE_USE_MOCK_SSE=false
```

Parse via Zod em `src/lib/env.ts` — se faltar var, falha no boot.

---

## O que está fora do escopo deste repo

- Backend, workers, Redis, MinIO → repo `video-downloader-api`
- Auth com senha/OAuth (v2)
- Billing, Stripe, Ko-fi integrado (v2+)
- i18n (PT-BR only na v1)
- PWA / service worker
- SSR / Next.js
- Testes E2E (Playwright fica pra v2)

Se algum desses aparecer numa task, é um erro do plano — pare e pergunte.

---

## Troubleshooting esperado

- **Cursor customizado não aparece:** `cursor: none` não foi aplicado no
  `body` (ver Task 4).
- **Canvas trava a UI:** reduzir densidade default ou adicionar
  `will-change: transform` no canvas (Task 5).
- **SSE não reconecta:** o wrapper em `src/lib/sse.ts` precisa tratar
  `onerror` e recriar o `EventSource` (Task 10).
- **Ordem dos imports CSS quebra visual:** reset.css → fonts.css →
  tokens.css, nessa ordem, no `main.tsx`.
- **Safari iOS com bugs no EventSource:** documentado como risco
  conhecido no plano; testar em device real antes do deploy.
