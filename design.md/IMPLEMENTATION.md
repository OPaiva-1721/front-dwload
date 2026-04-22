# Plano de Implementação — Marco 6: Frontend React

**Referência:** `2026-04-22-dwload-design.md`
**Repo alvo:** `dwload-web` (novo repositório)
**Estimativa total:** 4-5 dias em dedicação parcial
**Pré-requisito do spec:** nenhum — o front pode começar antes do back ficar
pronto, usando mocks. Isso permite trabalhar em paralelo com o Marco 1-5.

---

## Filosofia do plano

1. **Vertical slices.** Cada task entrega algo visível funcionando de ponta
   a ponta, não "a camada X inteira". Você nunca fica com código parado
   esperando outra parte pra ganhar sentido.
2. **Mock primeiro, integração depois.** Os primeiros 3 dias o front não
   precisa do back rodando — funciona com mock de SSE local. Isso destrava
   você e isola bugs de UI dos de integração.
3. **Preserva o visual.** O HTML atual já é bonito. A task de porting é
   mecânica (copiar CSS), não redesign.
4. **Commits pequenos.** Cada task vira 1-3 commits. Se algo der errado,
   `git revert` de uma task não quebra outra.

---

## Task 0 — Preparação (30 min)

**Objetivo:** ter o repo limpo e o HTML atual como referência consultável.

- [ ] Criar repo novo `dwload-web` no GitHub (público ou privado, tanto faz).
- [ ] `git clone` local.
- [ ] Criar pasta `reference/` no repo com cópia do `DWLOAD_Standalone.html`
      original (pra consultar CSS/lógica durante o porting, não entra no
      bundle final).
- [ ] Criar `.gitignore` padrão Node.
- [ ] Primeiro commit: `chore: reference HTML`.

**Critério de pronto:** repo criado, HTML original salvo em `reference/`,
primeiro commit feito.

---

## Task 1 — Scaffold Vite + React + TS (1h)

**Objetivo:** projeto rodando em `localhost:5173` com Hello World.

```bash
pnpm create vite . --template react-ts
pnpm install
pnpm dev
```

- [ ] Limpar `src/App.tsx` do boilerplate Vite (logos, contador).
- [ ] Configurar `tsconfig.json` em modo `strict: true`.
- [ ] Adicionar path aliases: `@/` apontando pra `src/`.
- [ ] Configurar Vite: `vite.config.ts` com alias + `server.port: 5173`.
- [ ] Commit: `chore: scaffold vite + react + ts`.

**Critério de pronto:** `pnpm dev` abre página vazia em `localhost:5173`,
zero erros no console, `@/` funciona em imports.

---

## Task 2 — Estrutura de pastas + dependências core (1h)

**Objetivo:** deixar a arquitetura de pastas pronta pra preencher.

Instalar dependências:

```bash
pnpm add react-router-dom zustand @tanstack/react-query zod react-hook-form @hookform/resolvers
pnpm add -D @types/node vitest @testing-library/react @testing-library/jest-dom jsdom
```

Criar esqueleto de pastas (vazias com um `.gitkeep` ou um `index.ts`
comentado):

```
src/
├── app/           (App.tsx, Layout.tsx, providers.tsx, router.tsx)
├── features/
│   ├── download/  (components/, hooks/, api/, schemas/, store.ts)
│   ├── history/
│   └── tweaks/
├── components/    (Cursor, BackgroundCanvas, ProgressBar, StepsIndicator)
├── styles/        (tokens.css, reset.css, fonts.css)
├── lib/           (sse.ts, apiClient.ts, env.ts)
└── main.tsx
```

- [ ] Criar todas as pastas acima.
- [ ] `src/main.tsx` renderizando `<App />` placeholder.
- [ ] Commit: `chore: project structure and dependencies`.

**Critério de pronto:** `pnpm dev` continua funcionando; estrutura de
pastas espelha o spec.

---

## Task 3 — Design tokens + fontes + reset CSS (2h)

**Objetivo:** ter a paleta OKLCH e as fontes disponíveis globalmente.

Fonte principal do trabalho: o `<style>` do HTML original.

- [ ] Extrair as variáveis `:root { --bg, --fg, --accent, ... }` do HTML
      pra `src/styles/tokens.css`. Manter os valores OKLCH exatos.
- [ ] Criar `src/styles/reset.css` (minimal modern reset).
- [ ] Criar `src/styles/fonts.css` importando JetBrains Mono e Space
      Grotesk via `@import` do Google Fonts (em vez de embutir como no
      HTML standalone — menos 300KB no bundle).
- [ ] Importar os três em `src/main.tsx` na ordem: reset → fonts → tokens.
- [ ] Teste visual: colocar um `<h1>` temporário no App com cor `var(--fg)`
      e fonte mono — confirmar que aparece com visual correto.
- [ ] Commit: `feat(styles): design tokens, fonts, reset`.

**Critério de pronto:** abrir `localhost:5173` e ver um `<h1>` na cor e
fonte corretas do DWLOAD.

---

## Task 4 — Cursor customizado (1h)

**Objetivo:** o cursor circular com blend mode difference do DWLOAD
funcionando em toda a aplicação.

- [ ] Criar `src/components/Cursor.tsx` portando a lógica do HTML original
      (useEffect com mousemove listener, useState pra position, CSS com
      `mix-blend-mode: difference`).
- [ ] Criar `src/components/Cursor.module.css` com os estilos do cursor.
- [ ] Renderizar `<Cursor />` no `App.tsx`.
- [ ] Adicionar `cursor: none` no body (via reset.css ou App).
- [ ] Teste manual: mover mouse, cursor customizado deve aparecer.
- [ ] Commit: `feat(components): custom cursor`.

**Critério de pronto:** cursor do sistema some, cursor customizado
aparece e segue o mouse com blend mode correto.

---

## Task 5 — Canvas de fundo (estrelas + hyperspace) (3h)

**Objetivo:** o canvas animado do DWLOAD como componente isolado e
controlável via props.

Essa é a task mais mecânica mas a mais visualmente impactante.

- [ ] Criar `src/components/BackgroundCanvas.tsx`.
- [ ] Portar a função `initBg()` do HTML original pra dentro de um
      `useEffect`.
- [ ] Props iniciais: `density` (número de estrelas), `speed` (velocidade
      base), `mode` (`"idle" | "hyperspace"`).
- [ ] Cleanup correto no `useEffect`: cancelar `requestAnimationFrame`,
      remover listeners de resize ao desmontar.
- [ ] Renderizar no App, com modo fixo `"idle"` por enquanto.
- [ ] Teste manual: estrelas aparecem e se movem suavemente, não crasha
      em resize da janela.
- [ ] Commit: `feat(components): animated background canvas`.

**Critério de pronto:** fundo animado do DWLOAD rodando, sem memory
leaks, respondendo a resize.

---

## Task 6 — Layout base: Header + Scene (2h)

**Objetivo:** o shell visual do DWLOAD — header com nav + área principal
centralizada.

- [ ] Criar `src/app/Layout.tsx` com header (logo "DWLOAD" + nav items
      "HISTORY" / "TWEAKS") e um `<main>` que recebe `children`.
- [ ] Criar `src/app/Layout.module.css` portando o CSS do header do HTML.
- [ ] Usar `<Outlet />` do React Router no lugar do `children`.
- [ ] Criar `src/app/router.tsx` com rota `/` apontando pra placeholder.
- [ ] Integrar Layout + Router em `App.tsx`.
- [ ] Commit: `feat(app): base layout with header and router`.

**Critério de pronto:** header DWLOAD aparece com nav clicável (links
mortos ainda), área principal vazia.

---

## Task 7 — Download feature: formulário (Idle view) (4h)

**Objetivo:** a tela inicial com URL input, format picker (MP4/MP3),
quality picker (chips) e botão Launch. Sem nenhuma lógica de submit ainda.

- [ ] `features/download/store.ts` com Zustand: `{ url, format, quality,
      setUrl, setFormat, setQuality }`.
- [ ] `features/download/components/UrlInput.tsx` — input estilizado com
      a scan line animation.
- [ ] `features/download/components/FormatPicker.tsx` — toggle MP4/MP3.
- [ ] `features/download/components/QualityPicker.tsx` — chips dinâmicos
      (2160p/1080p/720p/480p pra MP4, 320k/256k/192k/128k pra MP3).
- [ ] `features/download/components/LaunchButton.tsx` — botão com hover
      effect.
- [ ] `features/download/components/IdleView.tsx` compondo os quatro
      acima.
- [ ] `features/download/components/DownloadPanel.tsx` que será o
      container glassmorphism; por enquanto só renderiza `<IdleView />`.
- [ ] Conectar `DownloadPanel` ao rota `/` no router.
- [ ] Ao clicar Launch, só `console.log` do estado atual (fake submit).
- [ ] Commit: `feat(download): idle view with form controls`.

**Critério de pronto:** tela carrega com painel glass, usuário consegue
digitar URL, alternar MP4/MP3, escolher chip de qualidade, clicar Launch
e ver no console o estado.

---

## Task 8 — Download feature: Downloading view (3h)

**Objetivo:** tela de progresso com os 4 steps indicator e a progress bar.

- [ ] `components/StepsIndicator.tsx` recebendo `currentStep:
      "resolving" | "fetching" | "transcoding" | "packaging"` e `status:
      "active" | "pending" | "done"` por step.
- [ ] `components/ProgressBar.tsx` recebendo `percent: 0..100` e renderizando
      a barra com glow animation.
- [ ] `features/download/components/DownloadingView.tsx` compondo steps
      + progress bar + mensagem contextual.
- [ ] Adicionar estado local `jobState: "idle" | "downloading" | "done"`
      no `DownloadPanel`, por enquanto alternando com um botão de debug.
- [ ] Commit: `feat(download): downloading view with steps and progress`.

**Critério de pronto:** botão de debug alterna entre Idle e Downloading;
na Downloading aparecem os 4 steps e a barra.

---

## Task 9 — Download feature: Done view (2h)

**Objetivo:** tela de sucesso com Save File button + metadata do vídeo
(título, thumbnail, duração).

- [ ] `features/download/components/DoneView.tsx` com thumbnail, título,
      duração, tamanho do arquivo, botão Save File + botão Restart.
- [ ] Props: `result: { downloadUrl, title, duration, thumbnail, size,
      expiresAt }`.
- [ ] Save File é um `<a href={downloadUrl} download>`.
- [ ] Restart volta o jobState pra `"idle"` e reseta a store do form.
- [ ] Commit: `feat(download): done view with save file and restart`.

**Critério de pronto:** botão de debug agora tem 3 estados, Done mostra
thumbnail + botões funcionais (mesmo com dados fake).

---

## Task 10 — Mock SSE local (2h)

**Objetivo:** simular o servidor SSE pra desenvolver `useJobStream` sem
precisar do back rodando.

- [ ] Criar `src/lib/mockSse.ts` com uma função que retorna uma
      implementação fake de `EventSource` que emite eventos em sequência
      com delays (resolved → progress → progress → done).
- [ ] Criar `src/lib/sse.ts` com wrapper real baseado em `EventSource`
      (com reconnect, cleanup).
- [ ] Criar `src/lib/env.ts` parseando `import.meta.env` via Zod:
      `VITE_API_URL`, `VITE_USE_MOCK_SSE` (`"true"` ou `"false"`).
- [ ] O `sse.ts` exporta uma factory que escolhe entre real e mock
      baseado em `env.VITE_USE_MOCK_SSE`.
- [ ] Adicionar `.env.development` com `VITE_USE_MOCK_SSE=true`.
- [ ] Commit: `feat(lib): sse client with mock for local dev`.

**Critério de pronto:** setar `VITE_USE_MOCK_SSE=true`, chamar a factory
e ver eventos mock chegando num `console.log` dentro de um componente
de teste.

---

## Task 11 — `useJobStream` hook + integração Downloading (3h)

**Objetivo:** conectar a UI de Downloading à stream de eventos (mock por
enquanto).

- [ ] `features/download/hooks/useJobStream.ts`: recebe `jobId | null`,
      abre SSE, retorna `{ status, step, progress, result, error }`.
- [ ] Listeners para eventos `resolved`, `progress`, `done`, `failed`.
- [ ] Cleanup no unmount (fechar EventSource).
- [ ] Integrar no `DownloadPanel`: quando `jobState === "downloading"`,
      usar `useJobStream(currentJobId)` e passar `step`/`progress` pro
      `DownloadingView`.
- [ ] Ao receber `done`, transicionar pro estado `"done"` com o result.
- [ ] Commit: `feat(download): useJobStream hook and live progress`.

**Critério de pronto:** ao clicar Launch com mock SSE ligado, UI passa
Idle → Downloading (com progresso real do mock) → Done, sem botão de
debug.

---

## Task 12 — `useCreateDownload` mutation + API client (2h)

**Objetivo:** ter o POST `/downloads` pronto (falando com mock ou back
real via variável de ambiente).

- [ ] `src/lib/apiClient.ts` — wrapper de fetch com baseURL
      (`env.VITE_API_URL`) e error handling.
- [ ] `features/download/api/downloadsApi.ts` com função
      `createDownload({ url, format, quality })`.
- [ ] `features/download/schemas/download.ts` com Zod schemas pro request
      e response (`DownloadRequest`, `DownloadJobCreated`).
- [ ] `features/download/hooks/useCreateDownload.ts` — TanStack mutation
      que chama `downloadsApi.createDownload` e retorna `{ mutate,
      isPending, data }`.
- [ ] Mock server: criar `src/lib/mockApi.ts` que intercepta chamadas
      quando `VITE_USE_MOCK_SSE=true` e devolve um `{ jobId: "mock-123" }`.
- [ ] Integrar no `DownloadPanel`: Launch agora chama
      `createDownload.mutate(form)` e, quando retorna, guarda `jobId` pra
      o `useJobStream` consumir.
- [ ] Commit: `feat(download): create download mutation with api client`.

**Critério de pronto:** clicar Launch → mutation dispara → jobId recebido
→ SSE abre → progresso aparece → done. Tudo com mock.

---

## Task 13 — History feature (3h)

**Objetivo:** rota `/history` mostrando downloads anteriores,
persistidos em localStorage.

- [ ] `features/history/store.ts` — Zustand com `persist` middleware,
      chave `dwload-history`, state `{ items: HistoryItem[], add, clear }`.
      `HistoryItem` = `{ id, url, title, format, quality, completedAt,
      downloadUrl? }`.
- [ ] Ao receber `done` no `useJobStream`, adicionar item ao history
      store.
- [ ] `features/history/components/HistoryList.tsx` renderizando items
      com título, thumbnail, data.
- [ ] Adicionar rota `/history` no router.
- [ ] Link "HISTORY" do header agora funciona.
- [ ] Botão "Clear all" na página.
- [ ] Commit: `feat(history): route with localStorage persistence`.

**Critério de pronto:** completar um download mock, abrir `/history`,
ver o item. Recarregar a página, item continua lá. Clear limpa.

---

## Task 14 — Tweaks panel (2h)

**Objetivo:** painel lateral que permite ajustar accent color, densidade
de estrelas, velocidade do canvas.

- [ ] `features/tweaks/store.ts` — Zustand com persist: `{ accent,
      density, speed, showPanel, toggle, set }`.
- [ ] `features/tweaks/TweaksPanel.tsx` com sliders e color picker.
- [ ] Tokens OKLCH dinâmicos: aplicar `--accent` no `:root` via efeito
      ao mudar o store.
- [ ] `BackgroundCanvas` recebe `density` e `speed` do store.
- [ ] Link "TWEAKS" do header abre/fecha o painel.
- [ ] Commit: `feat(tweaks): settings panel with persistence`.

**Critério de pronto:** abrir TWEAKS, mudar accent color, UI toda reage
instantaneamente. Recarregar, preferências persistem.

---

## Task 15 — Providers + QueryClient + Error Boundary (1h)

**Objetivo:** setup final de infra da aplicação.

- [ ] `src/app/providers.tsx` envolvendo children com
      `QueryClientProvider`, `ErrorBoundary` customizado (com fallback
      estilizado), `Suspense` se usar lazy loading.
- [ ] Configurar `QueryClient` com `retry: 2`, `staleTime: 0` pra mutations.
- [ ] Integrar `<Providers>` no `main.tsx`.
- [ ] Commit: `feat(app): providers and error boundary`.

**Critério de pronto:** se qualquer componente throw, aparece fallback
estilizado em vez de tela branca.

---

## Task 16 — Validação de URL + feedback de erros (2h)

**Objetivo:** não deixar usuário submeter URL inválida, e mostrar erros
do back de forma elegante.

- [ ] `features/download/schemas/download.ts` ganha validação Zod de URL
      (`z.string().url()`) + whitelist de domínios (youtube, instagram,
      tiktok, twitter, x, vimeo).
- [ ] `UrlInput` recebe `error?: string` e mostra mensagem vermelha.
- [ ] Launch button fica disabled se URL inválida.
- [ ] `useJobStream` propaga `error` do evento `failed`; UI mostra tela
      de erro com botão "Try again".
- [ ] Commit: `feat(download): url validation and error states`.

**Critério de pronto:** digitar "foo" não habilita Launch; digitar URL
de site não suportado mostra erro; simular failed no mock mostra tela
de erro.

---

## Task 17 — Testes unitários críticos (3h)

**Objetivo:** cobertura mínima de segurança nos componentes de maior
risco.

Priorizar o que tem lógica, não o que é visual puro:

- [ ] `useJobStream.test.ts` — eventos chegam, state atualiza, cleanup
      ocorre no unmount.
- [ ] `useCreateDownload.test.ts` — mutation dispara, onSuccess seta
      jobId, onError seta error.
- [ ] `download/schemas/download.test.ts` — URLs válidas/inválidas,
      domínios whitelisted.
- [ ] `history/store.test.ts` — add, clear, persist/hydrate.
- [ ] Configurar `vitest.config.ts` com `jsdom` e setup do
      `@testing-library/jest-dom`.
- [ ] Rodar `pnpm test` no CI (GitHub Actions, workflow básico).
- [ ] Commit: `test: critical unit tests and ci setup`.

**Critério de pronto:** `pnpm test` passa local e no CI. Cobertura das
4 peças acima acima de 80%.

---

## Task 18 — Port final: revisar visual contra o HTML original (2h)

**Objetivo:** garantir paridade visual com o `DWLOAD_Standalone.html`.

- [ ] Abrir HTML original ao lado do `localhost:5173` e comparar:
      - Cores exatas (OKLCH conferem)
      - Espaçamentos (paddings, gaps)
      - Animações (progress bar glow, scan line, steps transition)
      - Tipografia (pesos, letter-spacing, uppercase)
      - Glassmorphism (blur, borders, shadows)
- [ ] Corrigir diferenças visuais. Esta task é puramente cosmética.
- [ ] Commit: `style: visual parity with original html`.

**Critério de pronto:** screenshot do app ao lado do HTML original são
visualmente indistinguíveis nos 3 estados (idle, downloading, done).

---

## Task 19 — Integração com back real (quando Marcos 1-5 estiverem prontos) (2h)

**Objetivo:** trocar mock por API real.

- [ ] Setar `VITE_USE_MOCK_SSE=false` e `VITE_API_URL=http://localhost:3000`
      em `.env.development`.
- [ ] Rodar back local (docker-compose up).
- [ ] Testar fluxo completo com URL real do YouTube.
- [ ] Ajustar schemas Zod se contratos divergirem do spec.
- [ ] Commit: `feat: integrate with real backend`.

**Critério de pronto:** download real de um vídeo do YouTube, do clique
ao arquivo salvo no disco.

---

## Task 20 — Deploy preview no Vercel (1h)

**Objetivo:** URL pública compartilhável.

- [ ] Conectar repo ao Vercel.
- [ ] Configurar env vars de produção (`VITE_API_URL` apontando pra
      `https://api.dwload.app` quando back estiver no ar; por enquanto
      pode manter mock).
- [ ] Primeiro deploy.
- [ ] Commit/push: Vercel deploya automaticamente.

**Critério de pronto:** URL pública do Vercel abre o app funcionando.

---

## Checklist final do Marco 6

- [ ] Todas as 20 tasks concluídas.
- [ ] `pnpm dev` sem warnings no console.
- [ ] `pnpm build` sem erros, bundle final < 300 KB gzipped.
- [ ] `pnpm test` passa.
- [ ] Paridade visual com HTML original confirmada.
- [ ] Deploy preview funcionando.

---

## Ordem sugerida de execução por dia

| Dia | Tasks | Foco |
|---|---|---|
| 1 | 0, 1, 2, 3, 4 | Setup + visual base (cursor, tokens) |
| 2 | 5, 6, 7 | Canvas + layout + formulário Idle |
| 3 | 8, 9, 10, 11 | Downloading/Done views + integração mock |
| 4 | 12, 13, 14, 15, 16 | Mutation + history + tweaks + validação |
| 5 | 17, 18, 19, 20 | Testes + polish + deploy |

---

## Pontos que podem atrapalhar

1. **Canvas performance em laptops fracos.** Se o canvas travar a UI,
   reduza densidade default ou use `will-change` estrategicamente.
2. **SSE no Safari mobile.** Safari iOS já teve bugs com EventSource;
   testar em device real ou em BrowserStack antes do deploy.
3. **Porting do CSS original.** Ele usa variáveis OKLCH que nem todos
   browsers antigos suportam — Vite não faz fallback automático.
   Aceitar que o app só funciona em browsers modernos (decisão
   consciente, DWLOAD é tool, não site público genérico).
4. **Ordem dos imports CSS em Vite.** Reset precisa vir primeiro. Se
   imports estiverem em ordem errada, override silencioso quebra visual.
