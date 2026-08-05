# FUN-005 — Frontend HTTP Client Integration — Relatório

**Status:** Concluída (escopo híbrido deliberado — ver Seção 2). **Natureza:** quinta Sprint funcional — nenhuma arquitetura, ADR, Manager, Repository Interface, Service, Command, Event ou Entity foi alterada.

---

## 1. Auditoria

Estado de `apps/web` antes desta Sprint (FUN-001/FUN-002): `core/managers/buildManagers.ts` construía, em processo, os sete Managers da plataforma (`BusinessProfileManager`, `BrandingManager`, `CRMManager`, `CommunicationManager`, `AnalyticsManager`, `AutomationManager`, `KnowledgeManager`), cada um sobre Fakes em memória (`*/testing`). `core/managers/ManagerContext.tsx` expunha esse registro via Context; `core/managers/seedDemoData.ts` populava os sete domínios através de Commands reais dos próprios Managers; `core/query/useDashboardBootstrap.ts` (TanStack Query, `staleTime: Infinity`) rodava `seedDemoData` uma vez por sessão; `useBusinessProfileSummary`, `useBrandIdentity`, `useMoveOpportunity` chamavam Managers diretamente; nenhum widget/página importava um Manager fora desses hooks — a única superfície de acoplamento real era essa dúzia de arquivos em `core/`.

Após FUN-004, `apps/api` (Fastify) já expõe os 15 endpoints HTTP dos três domínios com persistência real (`@abp/persistence`, FUN-003): Business Profile, Branding, CRM. Communication, Analytics, Automation, Knowledge **não têm nenhuma API própria** — continuam apenas como Fakes em memória, sem SQLite, sem `apps/api`.

**Decisão de escopo desta Sprint, ver Seção 2.**

---

## 2. Decisão de Escopo — Migração Híbrida (Três Domínios via HTTP, Quatro via Fake)

A instrução da Sprint ("toda comunicação com os domínios deverá ocorrer através da API") pressupõe uma API disponível para todo domínio. Isso não é verdade hoje: apenas Business Profile, Branding e CRM têm endpoint real (FUN-004); os outros quatro nunca ganharam persistência real nem rota HTTP em nenhuma Sprint anterior. Inventar uma API para eles seria uma Sprint de Backend fora do escopo desta ("Frontend Staff Engineer", não "Backend Engineer" — regra explícita do PAPEL desta Sprint), e simular uma API que não existe (ex.: um novo conjunto de Fakes que finge ser HTTP) violaria a regra "nunca reconstruir Entities"/"nunca simular funcionalidade que não existe" já disciplinada desde a FUN-001.

**Decisão:** migrar para HTTP real exatamente os três domínios que já têm uma API real correspondente (Business Profile, Branding, CRM); manter os quatro restantes (Communication, Analytics, Automation, Knowledge) exatamente como estavam — Managers Fake em processo, documentado como tal em `buildManagers.ts` e nesta Seção, nunca apresentado como migrado. Este é o mesmo padrão incremental já usado pela FUN-003 (só 3 dos 13 domínios ganharam SQLite) e pela FUN-004 (só esses mesmos 3 ganharam API) — a Sprint estende a mesma fronteira, não a redesenha. Migrar os quatro restantes, quando ganharem API própria, segue exatamente o mesmo padrão já demonstrado aqui (Seção 13).

---

## 3. Cliente HTTP — Estrutura Criada

```
apps/web/src/core/http/
  ApiClient.ts              — única classe que chama fetch() em todo apps/web
  ApiError.ts               — ApiError (resposta HTTP não-ok) + ApiNetworkError (falha de rede/timeout)
  config.ts                 — resolveApiClientConfig(): baseUrl (VITE_ABP_API_BASE_URL) + timeoutMs
  client.ts                 — export const apiClient = new ApiClient(resolveApiClientConfig())
  undefinedOn404.ts          — 404 tratado como "nenhum dado ainda", nunca como erro
  clients/
    businessProfileClient.ts — espelha apps/api/src/routes/businessProfile.ts, rota a rota
    brandingClient.ts        — espelha apps/api/src/routes/branding.ts
    crmClient.ts              — espelha apps/api/src/routes/crm.ts
  dtos/
    businessProfile.dto.ts, branding.dto.ts, crm.dto.ts — cópias campo-a-campo dos DTOs de apps/api
  testing/
    demoApiFetchMock.ts       — mock de fetch compartilhado entre os testes desta Sprint (Seção 10)
```

`ApiClient` tem três métodos públicos (`get`/`post`/`patch`) e um único método privado `request` — nenhum outro arquivo de `apps/web` chama `fetch` diretamente (confirmado por busca literal por `fetch(` em todo `src/`, único acerto real é dentro de `ApiClient.ts`). Timeout via `AbortController` (`timeoutMs` centralizado em `config.ts`); serialização/desserialização JSON; tratamento de status 204 (retorna `undefined`, nunca tenta `response.json()` num corpo vazio).

**Nomeação de arquivo `client.ts` em vez de `apiClient.ts`:** o sistema de arquivos deste ambiente Windows é case-insensitive — `apiClient.ts` colidiria com `ApiClient.ts` já existente no mesmo diretório. Resolvido nomeando o singleton `client.ts`; nenhum impacto de import (`import { apiClient } from "../client.js"`), decisão puramente de nomenclatura de arquivo.

---

## 4. Configuração

Único ponto de leitura de `import.meta.env` de toda a camada HTTP: `core/http/config.ts`. `VITE_ABP_API_BASE_URL` seleciona o ambiente (Development/Testing/Production apontam para URLs diferentes via `.env`/variável de ambiente do processo Vite); ausente, cai para `http://127.0.0.1:3001` (a mesma porta padrão de `apps/api`, FUN-004). `vite-env.d.ts` declara `ImportMetaEnv.VITE_ABP_API_BASE_URL` para tipagem estrita. Nenhuma URL é montada fora deste arquivo — todo `clients/*.ts` recebe a base já resolvida através do singleton `apiClient`.

---

## 5. DTOs — Duplicação Deliberada, Não Compartilhamento

`core/http/dtos/*.dto.ts` são cópias campo-a-campo de `apps/api/src/dtos/*.dto.ts` — mesmos nomes de interface (`BusinessProfileResponseDto`, `OpportunityResponseDto`, etc.), nunca um `import` cruzado entre os dois apps (nenhum precedente disso existe no monorepo) e nunca um novo pacote `@abp/http-contracts` compartilhado (introduzir um pacote novo para dois consumidores seria a "abstração prematura" que a disciplina geral deste projeto já rejeita, e nenhuma Sprint pediu esse pacote). Cada lado do contrato é dono da sua própria cópia; divergência futura entre os dois será pega por teste de integração (Seção 10), não por tipo compartilhado — o mesmo trade-off que qualquer contrato HTTP real entre dois serviços possui. `apps/web` não importa `@abp/business-profile`, `@abp/branding` nem `@abp/crm-hub` em lugar nenhum (Seção 8) — os únicos tipos de domínio que o Frontend conhece, para estes três domínios, são estes DTOs.

---

## 6. Hooks e Queries Migrados

| Hook | Antes (Manager) | Depois (HTTP) |
|---|---|---|
| `useBusinessProfileSummary` | `businessProfile.currentClassification/currentMaturity/currentStage` | `businessProfileClient.currentClassification/currentMaturity/currentStage` (3 GETs paralelos via `Promise.all`) |
| `useBrandIdentity` | `branding.currentTheme/currentLogo` | `brandingClient.currentTheme/currentLogo` (2 GETs paralelos) |
| `useMoveOpportunity` | `crm.moveOpportunity(...)` em processo | `crmClient.moveOpportunity(...)` → `POST /crm/opportunities/:id/move` |
| `useDashboardBootstrap` | `seedDemoData(managers)` — 7 Managers | `seedDemoData(managers)` — híbrido: 3 domínios via `core/http/clients/*`, 4 via `ManagerRegistry` (Seção 2) |

Nenhum hook mudou sua assinatura pública (`queryKey`, formato de retorno) — `CRMPage`/`BrandingPage`/`BusinessProfilePage`/os cinco widgets do Dashboard continuam consumindo exatamente a mesma forma de dado que consumiam antes (confirmado por leitura direta de cada um, nenhum precisou de alteração de lógica, apenas texto de `PageHeader description`, Seção 8).

`useBusinessProfileSummary` desembrulha `maturity`/`stage` do DTO (`{maturity: string}`→`string`, `{stage: string}`→`string`) para preservar exatamente o formato escalar que o widget já esperava — a única adaptação de forma necessária em toda a migração, documentada no próprio arquivo.

---

## 7. Mutações

Única mutação de demonstração da plataforma (`useMoveOpportunity`, FUN-002) migrada de `CRMManager.moveOpportunity` em processo para `POST /crm/opportunities/:id/move` via `crmClient`. `onSuccess` continua atualizando o cache do TanStack Query diretamente (`queryClient.setQueryData<DemoSnapshot>(["dashboard", "bootstrap"], ...)`), sem refazer o bootstrap — mesmo comportamento e mesma razão já documentada na FUN-002 (evitar duplicar dado, ADR-001 do Business Profile Engine).

---

## 8. Remoção de Acoplamento

- `buildManagers.ts` — `ManagerRegistry` reduzido de 7 para 4 campos (`communication`/`analytics`/`automation`/`knowledge`); construção de `BusinessProfileManager`/`BrandingManager`/`CRMManager` removida por completo, junto de todos os `Fake*Repository`/`*Service` que só existiam para alimentá-los.
- `apps/web/package.json` — `@abp/business-profile`, `@abp/branding`, `@abp/crm-hub` removidos de `dependencies`.
- `apps/web/tsconfig.json` — as três referências de projeto correspondentes removidas.
- Confirmado por busca literal em todo `apps/web/src`: nenhum import real de `@abp/business-profile`/`@abp/branding`/`@abp/crm-hub` restante (os únicos acertos de grep são prosa dentro de doc-comments, ex. em `buildManagers.ts`, explicando a própria migração).
- `CRMPage.tsx`/`BrandingPage.tsx`/`BusinessProfilePage.tsx` — apenas o texto do `PageHeader description` foi atualizado (ex.: "…consumido via API HTTP (apps/api)."); nenhuma mudança de lógica, layout ou import de componente.

---

## 9. Erros e Loading

`ApiError` (resposta HTTP não-ok) carrega `statusCode`/`code`/`message`/`correlationId` — o mesmo corpo padronizado que `apps/api`'s `errorHandler` já produz (FUN-004), nunca reinventado no cliente. `toUserMessage()` centraliza a tradução 400/404/409/422/500+ em texto de UI seguro (nunca a mensagem técnica original, mesma disciplina de "nunca stack trace na fronteira" já aplicada do lado do servidor). `ApiNetworkError`, distinto, cobre falha de rede/timeout — nunca chegou a existir uma resposta HTTP.

`undefinedOn404` reverte, no cliente, a tradução que `apps/api` fez de "nenhum dado ainda" para 404 HTTP — preservando exatamente a UX que os métodos `current*` dos Managers já tinham antes desta Sprint (retornar `undefined`, nunca lançar). `AsyncState` (padrão já estabelecido pela FUN-001/FUN-002) continua sendo o único componente de loading/erro/retry — nenhuma duplicação de estado manual introduzida.

---

## 10. Testes

**Camada HTTP (nova, cobrindo exatamente o que a Sprint pediu):**
- `ApiClient.test.ts` (9 testes) — GET/POST/PATCH, serialização de corpo, resposta 204, `ApiError` com corpo padronizado, `ApiError` com corpo não-JSON (fallback), `ApiNetworkError` em falha de `fetch`, e a regressão descrita na Seção 11 (POST sem corpo nunca envia `Content-Type`).
- `ApiError.test.ts` (10 testes) — `isNotFound()`, `toUserMessage()` para cada statusCode (nunca vazando a mensagem técnica), `ApiNetworkError`.
- `undefinedOn404.test.ts` (4 testes) — 404 vira `undefined`; qualquer outro `ApiError` e qualquer erro não-`ApiError` são repropagados.

**Hooks (novos):**
- `useBusinessProfileSummary.test.tsx` (3 testes) — combinação dos 3 GETs paralelos, 404 parcial tratado como campo `undefined`, `enabled: false` quando `profileId` ausente (fetch nunca chamado).
- `useBrandIdentity.test.tsx` (2 testes) — combinação dos 2 GETs, 404 em ambos.

**Mockagem exclusiva da camada HTTP (regra explícita da Sprint), nenhum Manager mockado, em todos os testes reescritos:**
- `buildManagers.test.ts` — reduzido aos 4 domínios ainda em `ManagerRegistry`.
- `seedDemoData.test.ts`, `useDashboardBootstrap.test.tsx`, `CRMPage.test.tsx`, `DashboardPage.test.tsx`, `routes.test.tsx` — `vi.stubGlobal("fetch", ...)` via `createDemoApiFetchMock` (`core/http/testing/demoApiFetchMock.ts`, único roteador de mock compartilhado entre estes cinco arquivos, cobrindo as 8 rotas reais que `seedDemoData`/`useMoveOpportunity` exercitam).

**Cache** — coberto indiretamente por `CRMPage.test.tsx` (mutação `moveOpportunity` reflete no cache sem refazer o bootstrap) e por `useDashboardBootstrap`'s `staleTime: Infinity` (comportamento inalterado desde a FUN-002).

**Integração de página** — `routes.test.tsx`/`DashboardPage.test.tsx`/`CRMPage.test.tsx` renderizam a árvore React real (`AppProviders` → Router → Página) contra `fetch` mockado, validando o caminho completo Hook → HTTP Client → Componente.

```
pnpm typecheck   → 22/22 pacotes + apps, sucesso
pnpm build       → sucesso (apps/web: 385 módulos, bundle produzido normalmente)
pnpm lint        → sucesso, zero warning
pnpm test        → 423/423 testes, 122/122 arquivos de teste (396 já existentes/ajustados + 27 novos desta Sprint)
```

---

## 11. Validação Manual — Backend e Frontend Reais, Juntos

`apps/api` iniciado como processo real (`pnpm --filter @abp/api start`, `ABP_ENV=testing`, `ABP_DATABASE_PATH=:memory:`, porta 3055) — não um mock, o mesmo servidor Fastify da FUN-004. Sequência completa de `seedDemoData` reproduzida via chamadas HTTP reais (`Invoke-RestMethod`/`fetch` em Node, fora de qualquer framework de teste): `POST /business-profiles` → `validate` → `finalize` → `GET stage`; `POST /branding/identity`; `POST /crm/organizations` → `POST /crm/opportunities` → `POST /crm/leads` → `POST /crm/opportunities/:id/move`; `GET /business-profiles/by-tenant/:tenantId` inexistente → 404 real.

**Bug real encontrado e corrigido durante esta validação, não durante o desenvolvimento inicial:** `ApiClient.request()` enviava `Content-Type: application/json` mesmo quando o corpo era `undefined` (caso de `businessProfileClient.validate()`/`.finalize()`, que fazem `POST` sem payload). O parser JSON estrito do Fastify rejeita isso com `400 FST_ERR_CTP_EMPTY_JSON_BODY` ("Body cannot be empty when content-type is set to 'application/json'"). **Nenhum teste unitário pegou isso** — todos os mocks de `fetch` desta Sprint (Seção 10) aceitam qualquer header sem validar o parsing real do servidor; só uma chamada HTTP real contra `apps/api` genuíno expôs a falha. Corrigido em `ApiClient.ts` (`headers` só inclui `Content-Type` quando `init.body !== undefined`), coberto por teste de regressão (`ApiClient.test.ts`) e reconfirmado contra o servidor real após a correção.

**Prova completa do fluxo Frontend → HTTP → API → Manager → SQLite → Response → Frontend:** com o backend real já validado (parágrafo acima), a árvore React real (`AppProviders` → `DashboardPage`) foi renderizada em ambiente jsdom **sem nenhum mock de `fetch`**, apontando via `VITE_ABP_API_BASE_URL` para o backend real em execução — o mesmo `seedDemoData`/`useDashboardBootstrap`/hooks que rodam no navegador de produção. O dado exibido (`"Floricultura Bela Vista"`, `"Ana Ferreira"`, seções de Perfil Empresarial/Identidade de Marca) veio genuinamente de `apps/api` → `@abp/persistence` (SQLite `:memory:`) → resposta HTTP → `ApiClient` → hooks → componentes. Este smoke test foi temporário (`__e2e_smoke__.test.tsx`, apagado após a validação) — não faz parte da suíte permanente porque a regra explícita da Sprint é mockar `fetch` nos testes de repositório (Seção 10); ele serviu exclusivamente como a prova manual desta Seção.

---

## 12. Compatibilidade

Layout, rotas, navegação e widgets permanecem idênticos — nenhuma página, componente ou rota foi renomeada, movida ou reestruturada. As únicas alterações visíveis ao usuário são textuais (`PageHeader description` em três páginas, Seção 8), transparentes ao fluxo de uso. Nenhuma regressão encontrada em `pnpm test` (423/423) nem na validação manual (Seção 11).

---

## 13. Limitações

- **Migração híbrida, não total** — Communication, Analytics, Automation, Knowledge continuam via Manager Fake em processo (Seção 2); "toda comunicação através da API", tal como escrito na Sprint, só é verdade para os três domínios que já têm API.
- **DTOs duplicados, não versionados** — nenhum mecanismo automático detecta se `apps/api` e `apps/web` divergirem no formato de um DTO; hoje a única rede de proteção é teste de integração manual (Seção 11) mais o par de suítes de teste de cada app.
- **Sem autenticação/autorização** — herdado sem alteração da FUN-004; toda chamada HTTP desta Sprint é anônima.
- **Um único Tenant de demonstração (`tenant-demo`), hardcoded** — mesma limitação já registrada desde a FUN-001/FUN-002, herdada sem alteração; `seedDemoData` falha com 409 (ADR-001) se rodado duas vezes contra o mesmo banco persistente sem reiniciar o processo/banco — comportamento correto do domínio, não um bug desta Sprint, mas relevante para quem for reproduzir a validação manual da Seção 11.
- **`mapDomainError`/heurística de erro do lado do servidor não mudou** — `ApiError.toUserMessage()` depende inteiramente da classificação de status já feita por `apps/api` (FUN-004); qualquer limitação daquela heurística (documentada no relatório da FUN-004, Seção 12) se propaga para a mensagem exibida aqui.

## 14. Próximos Passos

- Estender `@abp/persistence`/`apps/api` aos quatro domínios ainda Fake (Communication, Analytics, Automation, Knowledge) e então migrá-los para `core/http/clients/*` seguindo exatamente o padrão desta Sprint — nenhum redesenho necessário.
- Introduzir seleção de Tenant real no Frontend (hoje `DEMO_TENANT_ID` fixo), quando uma Sprint de IAM/multi-tenant existir.
- Autenticação real no `ApiClient` (header `Authorization`, refresh de token), quando uma Sprint de IAM existir — o ponto de extensão é `ApiClient.request()`, já centralizado.
- Considerar geração automática de DTOs a partir do schema OpenAPI de `apps/api` (`/documentation/json`, já existente desde a FUN-004), eliminando o risco de divergência manual descrito na Seção 13 — decisão de tooling para uma Sprint futura, fora do escopo desta.
