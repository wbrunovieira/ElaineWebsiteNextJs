# Plano de Implementação — Área Administrativa da Elaine

Painel `/admin` protegido por senha simples para a cliente editar **textos, fotos e vídeos** de seções específicas do site, sem precisar de deploy.

- **Fase 1:** Auth + edição de texto + fotos (upload/excluir/reordenar)
- **Fase 2:** Vídeos (Video Testimonials) via Mux (upload/excluir, com transcodificação)

> Pré-requisito já concluído: correção do case dos nomes das fotos da galeria
> (`.JPG` → `.jpg`), commit `2ab1166`, deploy de produção verificado.

---

## Seções editáveis (mapeamento → componente)

| Seção no site | Componente | Conteúdo editável |
|---|---|---|
| Our Photo Gallery | `PhotoGallery.tsx` | fotos: add / excluir / reordenar / alt |
| Transformative Stories | `TestimonialsSection.tsx` (escritos) | `name`, `city`, `content` |
| Video Testimonials | `TestimonialsSection.tsx` (vídeos) | vídeos: add / excluir (**Fase 2 / Mux**) |
| Event Locations: On-Site Details | `LocationSection.tsx` | `name`, `directionsUrl`, `embedUrl` |
| Cards de sessão ("Coming soon") | `CTASection.tsx` | `title`, `description`, `price`, `link`, `date`, `local`, `time` |

---

## Decisões de arquitetura

| Item | Escolha | Porquê |
|---|---|---|
| Conteúdo (texto + refs de mídia + ordem) | 1 `content.json` no **Vercel Blob** (público, `addRandomSuffix:false` → URL estável) | Um só produto, leitura cacheável, escrita = overwrite |
| Fotos | Compressão no browser → upload **direto** pro Blob | Contorna limite de 4.5 MB da função; original já entra leve |
| Vídeos (Fase 2) | **Mux** (upload chunked + HLS adaptativo + poster) | Único caminho sustentável p/ vídeo pesado de celular |
| Auth | Senha única (`ADMIN_PASSWORD`) → cookie httpOnly assinado (JWT `jose`) → barrado no `middleware.ts` | "Senha simples", edge-compatible |
| Publicação | `revalidateTag('content')` ao salvar | Conteúdo no ar sem novo deploy |

**Dependências novas**
- Fase 1: `jose`, `@vercel/blob`, `browser-image-compression`
- Fase 2: `@mux/mux-node`, `@mux/mux-player-react`, `@mux/upchunk`
- Testes: `vitest`, `@vitest/coverage-v8`, `msw` (mock de Blob/Mux), `supertest` ou fetch nativo p/ e2e

**Env vars**
- `ADMIN_PASSWORD`, `AUTH_SECRET`, `BLOB_READ_WRITE_TOKEN`, `NEXT_PUBLIC_CONTENT_URL`
- Fase 2: `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`, `MUX_WEBHOOK_SECRET`

---

## Modelo de dados (`content.json`)

```jsonc
{
  "gallery": [
    { "id": "p1", "url": "...blob/photo1.jpg", "width": 1200, "height": 800,
      "alt": "Kundalini energy awakening", "blurDataURL": "data:image/...", "order": 0 }
  ],
  "stories": [
    { "id": "s1", "name": "Enda", "city": "Fort Lauderdale - FL", "content": "..." }
  ],
  "videoTestimonials": [
    { "id": "v1", "muxPlaybackId": "abc123", "muxAssetId": "...", "title": "", "status": "ready" }
  ],
  "locations": [
    { "id": "l1", "name": "Fun&Flow - Fort Lauderdale, FL",
      "directionsUrl": "https://maps.google...", "embedUrl": "https://maps.google.../embed..." }
  ],
  "sessions": [
    { "id": "c1", "type": "in-person", "title": "In-Person Session", "local": "Fort Lauderdale",
      "time": "1:00 PM", "description": "Join us...", "price": "$80.00",
      "date": "Coming soon", "link": "https://eventbrite..." }
  ]
}
```

---

## Estrutura de arquivos

```
src/
  app/
    admin/
      login/page.tsx
      page.tsx                # dashboard: abas Galeria / Stories / Vídeos / Locais / Sessões
    api/admin/
      login/route.ts          # POST: valida senha → cookie JWT
      logout/route.ts
      content/route.ts        # GET conteúdo / PUT salva + revalidateTag
      upload/route.ts         # handleUpload → token de upload direto p/ Blob (fotos)
      blob/delete/route.ts    # DELETE foto do Blob
      mux/upload/route.ts     # [F2] cria direct upload no Mux
      mux/delete/route.ts     # [F2] deleta asset no Mux
    api/mux/webhook/route.ts  # [F2] Mux avisa quando vídeo está "ready"
  lib/
    content.ts                # getContent() (server, fetch c/ tag) + saveContent() + validação (zod)
    auth.ts                   # sign/verify JWT (jose) + compare de senha
  middleware.ts               # + proteção /admin e /api/admin
```

---

## Refatoração das seções (compartilhada)

1. `page.tsx` vira **server component async** → chama `getContent()` e passa dados como props.
2. Cada seção deixa de declarar array hardcoded e recebe via props (segue `'use client'` p/ GSAP).
3. `getContent()` lê `content.json` via `fetch(url, { next: { tags: ['content'] } })`. Salvar → `revalidateTag('content')`.
4. **Blur das fotos:** elimina arquivos `-blur.jpg`; `blurDataURL` (base64 ~12px) passa a vir do `content.json`, gerado no upload.
5. `next.config.ts`: adicionar `*.public.blob.vercel-storage.com` em `images.remotePatterns`; Fase 2 → liberar Mux no CSP (`media-src`/`connect-src`/`img-src`/`frame-src` → `*.mux.com`, `stream.mux.com`, `image.mux.com`).

---

## FASE 1 — Auth + Texto + Fotos

**Passo 1 — Migração/seed (uma vez)**
- Sobe as 13 fotos + logos atuais pro Blob; gera `blurDataURL` e captura `width/height`.
- Extrai texto atual (stories, locais, sessões) → escreve o primeiro `content.json`.

**Passo 2 — Auth**
- `/api/admin/login`: compara com `ADMIN_PASSWORD`, assina JWT (`AUTH_SECRET`), seta cookie httpOnly `Secure SameSite=Lax`.
- `middleware.ts`: `/admin*` (exceto `/admin/login`) e `/api/admin/*` sem cookie válido → redirect/401. Compõe com o roteamento de subdomínio já existente.

**Passo 3 — Dashboard**
- Stories / Sessões / Locais: formulários (add/editar/remover/reordenar) → `PUT /api/admin/content`.
- Galeria (upload):
  1. `browser-image-compression` → ~2400px máx, qualidade ~0.8, WebP.
  2. Lê `naturalWidth/Height` + gera `blurDataURL` (canvas ~12px).
  3. `upload()` (`@vercel/blob/client`) direto pro Blob via token de `/api/admin/upload`.
  4. Adiciona entrada na `gallery` e salva.
- Excluir foto: remove do array + `del()` no Blob + salva.

**Entregável F1:** Elaine edita os textos das 4 seções e gerencia a galeria sem deploy.

---

## FASE 2 — Vídeos (Video Testimonials) via Mux

**Passo 4 — Upload**
- `/api/admin/mux/upload` cria direct upload (Mux) e retorna URL.
- Browser envia com `@mux/upchunk` (chunked/resumable, aguenta arquivo grande). Barra de progresso.
- Mux transcodifica → HLS adaptativo + poster.

**Passo 5 — Webhook**
- `/api/mux/webhook` recebe `video.asset.ready`, valida assinatura (`MUX_WEBHOOK_SECRET`), grava `muxPlaybackId` + `status:"ready"`, `revalidateTag`.
- Card mostra "processando…" até `ready`.

**Passo 6 — Player e exclusão**
- `TestimonialsSection`: troca `react-player` por `@mux/mux-player-react` (poster + qualidade adaptativa de fábrica).
- Excluir vídeo: `/api/admin/mux/delete` (deleta asset) + remove do `content.json`.
- Migrar os 3 depoimentos atuais (`depoiment*.mp4`) pro Mux.

**Entregável F2:** Elaine sobe/remove vídeos; peso e transcodificação resolvidos pelo Mux.

---

## Testes (Vitest) — unitários + e2e no backend, com edge cases

Stack: **Vitest** + `@vitest/coverage-v8`. Mock de serviços externos (Blob, Mux) com **MSW**.
Dois projetos no `vitest.config.ts`: `unit` (rápido, isolado) e `e2e` (rotas reais via `next` em modo teste / handlers chamados diretamente). Meta de cobertura no backend: **≥ 90%** em `lib/` e `api/`.

### Unitários — `lib/auth.ts`
- ✅ senha correta → token assinado válido; `verify` retorna payload.
- ✅ senha incorreta → rejeita.
- Edge: senha vazia / só espaços; `ADMIN_PASSWORD` não definida (deve falhar fechado, nunca liberar).
- Edge: token expirado → `verify` rejeita.
- Edge: token assinado com **outra** `AUTH_SECRET` → rejeita (proteção contra forja).
- Edge: token malformado / alg "none" → rejeita.
- Edge: comparação de senha resistente a timing (usar compare constante).

### Unitários — `lib/content.ts`
- ✅ `getContent()` parseia `content.json` válido.
- ✅ `saveContent()` serializa e chama overwrite do Blob + `revalidateTag('content')`.
- Edge: JSON corrompido/!parseável → erro tratado, **não** derruba a página (fallback seguro).
- Edge: validação **zod** rejeita schema inválido (faltando `id`, `price` não-string, `order` negativo, URL inválida em `link`/`embedUrl`).
- Edge: `gallery` vazia / `stories` vazia → renderiza sem quebrar.
- Edge: `blurDataURL` ausente → `next/image` sem placeholder (não pode lançar).
- Edge: IDs duplicados → rejeitar no save.

### e2e — rotas `api/admin/*`
- **Auth gate (o mais crítico):**
  - `GET /admin` e `PUT /api/admin/content` **sem** cookie → 401/redirect.
  - cookie inválido/expirado/forjado → 401.
  - cookie válido → 200.
- `POST /api/admin/login`:
  - credencial certa → 200 + Set-Cookie httpOnly/Secure/SameSite.
  - credencial errada → 401, **sem** Set-Cookie.
  - Edge: body ausente / content-type errado / payload gigante → 400, não 500.
  - Edge: brute force → (se houver) rate limit retorna 429.
- `PUT /api/admin/content`:
  - payload válido → 200, persiste, dispara revalidate.
  - Edge: payload inválido (zod) → 422 com mensagem, **não** grava.
  - Edge: Blob indisponível (MSW simula 500) → 502/erro tratado, estado anterior intacto.
- `POST /api/admin/upload` (token de upload):
  - autenticado → retorna token.
  - Edge: tipo de arquivo não permitido (ex.: `.exe`, `.svg`) → rejeita.
  - Edge: tamanho acima do limite → rejeita antes de emitir token.
  - não autenticado → 401.
- `DELETE /api/admin/blob/delete`:
  - remove do Blob + do `content.json`.
  - Edge: id inexistente → 404 idempotente (não 500).
  - Edge: delete no Blob falha mas item está no JSON → estados reconciliados (sem órfão silencioso).

### e2e — Fase 2 (Mux)
- `POST /api/admin/mux/upload` autenticado → retorna upload URL (MSW mocka Mux).
- `/api/mux/webhook`:
  - assinatura válida + `video.asset.ready` → grava `muxPlaybackId`, status `ready`.
  - Edge: **assinatura inválida** → 401, **não** grava (anti-spoof do webhook).
  - Edge: evento duplicado (Mux reenvia) → idempotente, sem duplicar item.
  - Edge: evento de asset desconhecido / `errored` → marca status `error`, não quebra.
- `DELETE /api/admin/mux/delete`:
  - deleta asset no Mux + remove do JSON.
  - Edge: asset já deletado no Mux → idempotente.

### Regressão — bug do case das fotos
- Teste que falha se algum `gallery[].url` apontar para extensão divergente do arquivo real (guard contra reintrodução do `.JPG`/`.jpg`).

### Scripts (`package.json`)
```jsonc
"test": "vitest run",
"test:watch": "vitest",
"test:cov": "vitest run --coverage"
```
CI: rodar `pnpm test:cov` no GitHub Actions / Vercel build step antes do deploy.

---

## Riscos / observações
- **Race de escrita** no `content.json`: editora única → ok; add lock otimista depois se necessário.
- **Custo Mux:** free trial; cobra por minuto codificado/streamado — barato no volume dela; única dependência fora da Vercel.
- **CSP:** atualizar p/ Blob (fotos) e Mux (vídeos) ou o player/imagens são bloqueados.
- **Backup:** versionar `content.json` (histórico do Blob) evita perda por edição errada.

---

## Pendência operacional (fora do código)
- **Desligar Web Analytics da Cloudflare** (beacon bloqueado por CSP): painel Cloudflare →
  *Analytics & Logs → Web Analytics → hostname `elainevieira-us.com` → desativar automatic setup/injection.*
  Remove o erro de CSP no console e elimina um script de terceiro.
