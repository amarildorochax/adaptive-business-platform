# FUN-004 — Backend HTTP API Foundation — Relatório

**Status:** Concluída. **Natureza:** quarta Sprint funcional — nenhuma arquitetura, ADR, Manager, Repository Interface, Service, Command, Event ou Entity foi alterada.

---

## 1. Auditoria

`apps/` continha, antes desta Sprint, exclusivamente `web` (o app Vite/React já existente) e um `README.md` — nenhum servidor HTTP, nenhum adapter, nenhum bootstrap de rede em nenhum lugar do monorepo. Busca por Fastify/Express/Hono/Nest/Elysia em todo `package.json` do workspace: zero ocorrências reais (os únicos acertos de grep vieram de `node_modules` de dependências transitivas não relacionadas). **Nenhum servidor parcialmente implementado existia para ser reutilizado** — confirmado antes de qualquer linha de código ser escrita.

O que já existia e que esta Sprint reutiliza integralmente:
- `@abp/persistence` (FUN-003) — `createManagerRegistry('real', handle)`, a Composition Root que resolve `BusinessProfileManager`/`BrandingManager`/`CRMManager` sobre SQLite real; `createDatabase`/`resolvePersistenceConfig`/`runMigrations`.
- `@abp/infrastructure` — o tipo `CorrelationId` (`OBSERVABILITY_CONCRETE_STRUCTURE.md`, IMP-012), reaproveitado tal como está para o Correlation ID desta Sprint, nunca redefinido.
- Padrão de monorepo já estabelecido por `apps/web`: `package.json`/`tsconfig.json` por app, `eslint.config.js` próprio, `platform/tsconfig.json` como índice de referências de todo o workspace, `platform/vitest.config.ts` como único runner de teste.

---

## 2. Tecnologia — Escolha e Justificativa

**Nenhuma tecnologia HTTP já estava oficialmente decidida** por nenhum documento de `docs/architecture/` ou `docs/implementation/` — confirmado pela mesma busca documental já disciplinada em Sprints anteriores (FUN-003, Seção 2).

**Escolhida: Fastify**, com `@fastify/swagger` + `@fastify/swagger-ui` para OpenAPI. Justificativa, ponderando os quatro critérios pedidos:

- **Simplicidade** — nenhum decorator, nenhuma reflection, nenhuma classe obrigatória (diferente de Nest, que exigiria `experimentalDecorators`/`reflect-metadata`, nunca usados em nenhum outro pacote deste monorepo — introduzi-los agora seria a própria "tecnologia diferente sem justificativa" que esta Sprint proíbe). Rotas são funções simples, o mesmo estilo funcional já usado em todo Manager/Service da plataforma.
- **Performance** — um dos frameworks HTTP mais rápidos do ecossistema Node, com validação de schema compilada (Ajv) em vez de validação manual escrita à mão.
- **Arquitetura existente** — zero dependência nativa (aprendizado direto da FUN-003, Seção 2, onde `better-sqlite3` não compilou neste ambiente) — Fastify e seus plugins de swagger são 100% JavaScript/TypeScript puro, mesma garantia de instalação que todo o resto do monorepo já tem.
- **Facilidade de integração** — schema de validação por rota já produz, nativamente, o "tratamento de entrada" e a base do documento OpenAPI ao mesmo tempo — nenhuma ferramenta adicional, nenhuma anotação duplicada.

`fastify-plugin` (encapsulamento de plugin), `@fastify/swagger`/`@fastify/swagger-ui` (Seção 9) e `tsx` (execução TypeScript direta, mesmo papel que já cumpre em `@abp/persistence` desde a FUN-003) completam as dependências novas — nenhuma outra.

---

## 3. Estrutura Criada

Novo app `platform/apps/api` (`@abp/api`), seguindo exatamente o mesmo padrão de `apps/web`: `package.json`/`tsconfig.json` próprios, `eslint.config.js` próprio (idêntico ao de `apps/web`, trocando `globals.browser` por `globals.node` — nenhum código deste app roda em navegador), registrado em `platform/tsconfig.json`. Nenhuma segunda aplicação HTTP paralela — este é o único servidor de toda a plataforma.

```
apps/api/src/
  main.ts                      — processo real: buildServer() + listen() + shutdown gracioso (SIGINT/SIGTERM)
  server.ts                    — buildServer(options?) — composição única, reutilizada por main.ts e pelos testes
  config.ts                    — resolveApiConfig() (ABP_API_PORT/ABP_API_HOST)
  plugins/
    managers.ts                 — único ponto que chama createManagerRegistry (Seção 4)
    correlationId.ts            — Correlation ID por requisição (Seção 8)
    errorHandler.ts              — tratamento global de erro (Seção 6)
    openapi.ts                   — @fastify/swagger + swagger-ui (Seção 9)
  routes/
    health.ts, businessProfile.ts, branding.ts, crm.ts
  dtos/            — businessProfile.dto.ts, branding.dto.ts, crm.dto.ts
  mappers/         — um mapper por DTO, Entity → DTO
  errors/          — HttpError (hierarquia), mapDomainError (heurística, Seção 6)
  testing/
    buildTestServer.ts          — mesmo buildServer, banco :memory: isolado por teste
```

---

## 4. Composition Root — Reutilização Integral

`plugins/managers.ts` é o **único** lugar de toda a Sprint que chama `createManagerRegistry` — nenhuma rota, nenhum controller, instancia um Manager, um Service ou um Repository por conta própria. A chamada é literal e sem modificação: `createManagerRegistry('real', handle)`, a mesma função já testada pela FUN-003. Migrations (`runMigrations`) são aplicadas no boot, antes de qualquer rota aceitar tráfego — o servidor nunca fica no ar com um schema desatualizado. `fastify.decorate('managers', ...)` expõe o registro a toda rota via `fastify.managers`; `fastify.decorate('dbHandle', ...)` expõe a conexão para o `/ready` (Seção 7) e para o fechamento ordenado em `onClose`.

Todo Controller segue exatamente `HTTP → DTO → Manager → DTO → HTTP` — confirmado por leitura de cada um dos 15 handlers em `routes/*.ts`: nenhum importa um Service ou um Repository de nenhum pacote de domínio, apenas o Manager já resolvido via `fastify.managers`.

---

## 5. Endpoints Implementados

Quinze endpoints — cobertura completa dos três Managers priorizados (nenhum método público de nenhum dos três ficou sem rota correspondente):

| Domínio | Método | Rota | Manager |
|---|---|---|---|
| Business Profile | POST | `/business-profiles` | `createBusinessProfile` |
| Business Profile | GET | `/business-profiles/by-tenant/:tenantId` | `findProfile` |
| Business Profile | POST | `/business-profiles/:profileId/validate` | `validateProfile` |
| Business Profile | POST | `/business-profiles/:profileId/finalize` | `finalizeInitialProfile` |
| Business Profile | GET | `/business-profiles/:profileId/classification` | `currentClassification` |
| Business Profile | GET | `/business-profiles/:profileId/maturity` | `currentMaturity` |
| Business Profile | GET | `/business-profiles/:profileId/stage` | `currentStage` |
| Branding | POST | `/branding/logos` | `submitLogo` |
| Branding | GET | `/branding/logos/:tenantId` | `currentLogo` |
| Branding | POST | `/branding/identity` | `generateInitialBrandIdentity` |
| Branding | POST | `/branding/theme` | `regenerateTheme` |
| Branding | POST | `/branding/palette` | `updatePalette` |
| Branding | GET | `/branding/theme/:tenantId` | `currentTheme` |
| Branding | GET | `/branding/context/:profileId` | `businessContext` |
| CRM | POST | `/crm/leads` | `createLead` |
| CRM | POST | `/crm/leads/:leadId/convert` | `convertLead` |
| CRM | POST | `/crm/customers` | `createCustomer` |
| CRM | PATCH | `/crm/customers/:customerId` | `updateCustomer` |
| CRM | POST | `/crm/organizations` | `createOrganization` |
| CRM | POST | `/crm/contacts` | `createContact` |
| CRM | POST | `/crm/opportunities` | `createOpportunity` |
| CRM | POST | `/crm/opportunities/:opportunityId/move` | `moveOpportunity` |

Mais `GET /health` e `GET /ready` (Seção 7).

---

## 6. DTOs, Mapeamentos e Tratamento de Erros

**DTOs** — três arquivos (`dtos/{businessProfile,branding,crm}.dto.ts`), nenhum reaproveita `BusinessProfile`/`Logo`/`DesignToken`/`BrandTheme`/`Lead`/`Customer`/`Organization`/`Contact`/`Relationship`/`Opportunity` como payload HTTP. `Date` sempre vira `string` ISO 8601 na saída — JSON não tem tipo `Date`. **Mappers** — uma função por DTO de resposta (`mappers/*.mapper.ts`), cada uma testada isoladamente (Seção 10).

**Validação de entrada** — JSON Schema por rota (campo `schema.body` do Fastify), validado automaticamente antes do handler executar — nenhuma validação escrita manualmente à mão duplicando o schema.

**Tratamento de erro — quatro origens, cada uma tratada explicitamente (`plugins/errorHandler.ts`):**
1. Falha de schema do Fastify (`error.validation`) → sempre 400.
2. Erro de transporte do próprio Fastify (corpo malformado, `Content-Length` inválido, etc. — `error.code` inicia com `FST_`, `error.statusCode` já definido pelo framework) → o `statusCode` que o Fastify já atribuiu é respeitado diretamente. **Esta origem foi encontrada e corrigida durante a validação manual desta própria Sprint** — ver Seção 11.
3. `HttpError` (`errors/HttpError.ts`: `BadRequestError`/`NotFoundError`/`ConflictError`/`UnprocessableEntityError`/`InternalServerError`) — devolvido com seu `statusCode`/`code`/`message` exatos.
4. Qualquer outro erro → sempre 500, mensagem genérica ("Erro interno do servidor."); o erro real é logado apenas no servidor (`request.log.error`), nunca devolvido ao cliente — stack trace nunca atravessa a fronteira HTTP.

`mapDomainError` (`errors/mapDomainError.ts`) traduz o `Error` puro que todo Manager já lança (nenhum tem hierarquia de exceção tipada — "nunca alterar Managers/Services" impede esta Sprint de criar uma agora) por **reconhecimento de padrão de mensagem**, uma heurística documentada como tal, não uma inferência arbitrária: já sustentada por `FINAL_ARCHITECTURE_COMPLETION_AUDIT.md` (todo `throw new Error` do workspace segue convenção real e consistente em português). Padrões reconhecidos: "não encontrado" → 404; "já existe/possui/está/foi" → 409; "precisa/deve ser/não pode/obrigatório/inválido/nenhum(a)...existente/só pode/ainda não" → 422; qualquer mensagem não reconhecida → 500 (nunca um código mais específico por suposição). Toda resposta de erro segue o mesmo corpo padronizado, incluindo o `correlationId` da requisição.

---

## 7. Observabilidade

- **Request logging** — Pino (logger nativo do Fastify), habilitado por padrão; cada requisição gera uma linha "incoming request" e "request completed" com tempo de resposta.
- **Correlation ID** — reutiliza o tipo `CorrelationId` de `@abp/infrastructure` (Seção 1), nunca um conceito paralelo. Aceita `x-correlation-id` já enviado pelo cliente; gera um novo via `crypto.randomUUID()` quando ausente; sempre ecoado no header de resposta e incluído em todo log daquela requisição — permite cruzar um erro relatado por um cliente com a linha de log exata.
- **`GET /health`** (liveness) — nunca toca o banco; sempre 200 enquanto o processo estiver de pé.
- **`GET /ready`** (readiness) — executa `SELECT 1` contra a conexão SQLite já aberta; 200 se acessível, 503 caso contrário — a mesma distinção liveness/readiness já padrão em orquestração de produção, nunca um conceito inventado por esta Sprint.

---

## 8. Segurança

Nenhuma autenticação, autorização, JWT, OAuth ou sessão foi implementada — exatamente como instruído. Nenhum placeholder funcional foi criado; a única preparação para uma futura integração com o IAM é estrutural: `managersPlugin` já é registrado antes de qualquer rota, e um futuro plugin de autenticação seguiria exatamente o mesmo padrão (`fastify.addHook('onRequest', ...)`, como `correlationIdPlugin` já demonstra), registrado entre `correlationIdPlugin` e as rotas — nenhuma rota precisaria mudar de forma, apenas a composição em `server.ts` ganharia mais uma linha de `fastify.register(...)` quando essa Sprint futura existir.

---

## 9. Documentação OpenAPI

`@fastify/swagger` monta o documento a partir do `schema` já declarado em cada rota — nenhuma documentação foi escrita manualmente em paralelo. `@fastify/swagger-ui` o serve navegável em `/documentation`; o JSON bruto em `/documentation/json`. Confirmado gerado corretamente em validação manual (Seção 11) — título, descrição, versão e as quatro tags (`health`, `business-profile`, `branding`, `crm`) presentes.

---

## 10. Cobertura de Testes

40 testes novos, organizados exatamente segundo os itens exigidos por esta Sprint:

- **Composition Root** (`server.test.ts`) — os três Managers são expostos corretamente; as 14 tabelas já existem antes de qualquer requisição (migrations aplicadas no boot); `fastify.close()` fecha a conexão de banco de forma ordenada.
- **Mapeamentos DTO** (`mappers/*.mapper.test.ts`, 3 arquivos) — serialização de `Date` para ISO 8601, preservação correta de campo opcional ausente como `undefined` (nunca vazando como `null` ou string vazia).
- **Validação** — coberta dentro de cada arquivo de rota (`businessProfile.test.ts`, `branding.test.ts`, `crm.test.ts`): corpo com campo obrigatório ausente, `primaryColorHex` fora do padrão `#RRGGBB` → sempre 400, nunca chega ao Manager.
- **Tratamento de erro** (`errors/mapDomainError.test.ts`, `plugins/errorHandler.test.ts`) — cada um dos quatro padrões de heurística testado isoladamente; JSON malformado no corpo respondido com o `statusCode` que o próprio Fastify atribui (a correção da Seção 11); rota inexistente → 404 padronizado.
- **Integração de endpoints** (`routes/{businessProfile,branding,crm,health}.test.ts`) — fluxo completo via `fastify.inject()` (HTTP real, em processo, sem abrir porta de rede): criação → transição de estágio → consulta, para os três domínios; casos de 404/409/422 alcançáveis por HTTP real, nunca simulados.

```
pnpm typecheck   → 20/20 pacotes + 2 apps, sucesso (novo app @abp/api registrado em platform/tsconfig.json)
pnpm build       → sucesso; apps/web permanece byte a byte idêntico à FUN-003 (462 módulos, mesmos hashes) — zero impacto no bundle de navegador
pnpm lint        → sucesso, zero warning
pnpm test        → 396/396 testes, 117/117 arquivos de teste (356 já existentes + 40 desta Sprint)
```

---

## 11. Validação Manual — Servidor Real, Chamadas HTTP Reais

`pnpm --filter @abp/api start` (via `tsx`) subiu o servidor real em `127.0.0.1`, contra um arquivo SQLite real (não `:memory:`). Chamadas HTTP reais executadas via `curl`/`Invoke-RestMethod`:

- `GET /health` → `{"status":"ok"}`; `GET /ready` → `{"status":"ready"}`.
- `POST /business-profiles`, `POST /branding/identity`, `POST /crm/leads` → 200/201 com dado real, persistido em SQLite real.
- `GET /documentation/json` → documento OpenAPI válido, título/descrição/tags corretos.
- Header `x-correlation-id` enviado pelo cliente → ecoado de volta identicamente.
- Casos de erro reais: 400 (campo obrigatório ausente / `primaryColorHex` inválido / JSON malformado), 404 (Tenant sem Business Profile), 409 (segundo Business Profile para o mesmo Tenant, ADR-001).
- **Prova de persistência através de reinício de processo, via HTTP real** (mesmo padrão de prova já usado por `@abp/persistence` na FUN-003, agora repetido através da própria API): processo 1 cria um Business Profile via `POST /business-profiles`; processo 1 é encerrado (`Stop-Process`); processo 2, um PID de sistema operacional genuinamente novo, é iniciado apontando para o mesmo arquivo `.sqlite3`; `GET /business-profiles/by-tenant/...` no processo 2 devolve exatamente o mesmo `profileId` criado pelo processo 1.

**Bug real encontrado e corrigido durante esta validação manual, não durante o desenvolvimento inicial:** um `Content-Length` inconsistente (artefato de transporte, não um erro de domínio) estava sendo classificado como 500 pelo `errorHandler`, porque `mapDomainError` só reconhece mensagens de Manager — nunca havia sido concebido para receber um erro nativo do próprio Fastify. Corrigido (Seção 6, item 2) verificando `error.code`/`error.statusCode` já atribuídos pelo Fastify antes de cair em `mapDomainError`; coberto por teste de regressão (`errorHandler.test.ts`).

---

## 12. Limitações

- **Frontend não migrado** — instrução explícita desta Sprint; `apps/web` continua consumindo exclusivamente os Managers em processo (Fake), como desde a FUN-002. Nenhum cliente HTTP de produção foi escrito no Frontend; `fastify.inject()` (testes) e `curl`/`Invoke-RestMethod` (validação manual, Seção 11) cumpriram o papel de "pequeno cliente de teste" opcional já sugerido pela própria Sprint.
- **Apenas três domínios expostos** — Business Profile, Branding, CRM — os mesmos já priorizados pela FUN-003; os dez domínios restantes não têm nenhuma rota HTTP ainda.
- **Sem autenticação** — deliberado (Seção 8); todo endpoint está, hoje, aberto.
- **Um único arquivo SQLite, um único processo de escrita** — mesma limitação já registrada pela FUN-003, herdada sem alteração; múltiplos processos de API concorrentes contra o mesmo arquivo não foram testados nesta Sprint.
- **`mapDomainError` é uma heurística de texto, não uma hierarquia de exceção tipada** — funciona hoje porque a convenção de mensagem em português já é real e consistente (Seção 6), mas está sujeita a quebrar silenciosamente se uma futura Sprint de domínio (fora do escopo desta) introduzir uma mensagem de erro em um padrão não reconhecido — nesse caso, o resultado é sempre 500 (nunca um código incorreto mais específico), o comportamento mais seguro possível diante da incerteza, mas ainda assim uma limitação a resolver com uma hierarquia de exceção tipada em uma Sprint arquitetural futura.

## 13. Próximos Passos

- Expor os quatro domínios já conectados ao Frontend porém ainda Fake (Communication, Analytics, Automation, Knowledge) através da mesma API, assim que também ganharem persistência real (o próximo passo natural indicado pela FUN-003, Seção 12).
- Migrar `apps/web` para consumir esta API via HTTP real (`fetch`/`@tanstack/react-query`), substituindo o Composition Root em processo (Fake) — a integração completa que esta própria Sprint deliberadamente deixou para uma Sprint futura.
- Autenticação/autorização real via IAM, quando uma Sprint dedicada existir — o ponto de extensão já está preparado (Seção 8).
- Uma hierarquia de exceção tipada no domínio, substituindo a heurística de `mapDomainError` por um mapeamento exato — exige uma Sprint arquitetural (fora do escopo de qualquer Sprint FUN, per as regras desta série).
