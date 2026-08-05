# IMP-204 — Supplier Frontend — Relatório de Implementação

**Adaptive Business Platform · Relatório de Sprint**

---

## Nota de Posicionamento Documental

Este relatório fecha a Sprint **IMP-204 — Supplier Frontend**, a quarta etapa do Supplier Hub (Arquitetura ✅ ERP-001, Core ✅ IMP-201, Persistência ✅ IMP-202, HTTP API ✅ IMP-203). Ela cria exclusivamente a infraestrutura Web de consumo do Supplier Hub — nenhuma Tela, Página, Workspace, UX, Layout, Card ou elemento de Design. Nenhuma alteração a `SupplierManager`, Services, Entities, Commands, Events, Policies, Validators, Factories, Repository Interfaces, Persistência ou aos endpoints já aprovados de `apps/api`.

---

## 1. Arquitetura Utilizada

Toda a infraestrutura vive em um único diretório novo, `apps/web/src/core/supplier/`, per instrução explícita e repetida de IMP-204 ("Criar a camada: core/supplier/"). Isso diverge da organização já usada por Business Profile/Branding/CRM (FUN-004/FUN-100), que espalham o equivalente em três locais — `core/http/dtos/{domain}.dto.ts`, `core/http/clients/{domain}Client.ts`, `core/query/use*.ts` — cada um acrescentado incrementalmente ao longo de Sprints distintas. Decisão documentada: a instrução de IMP-204 é explícita, repetida três vezes, e a própria Sprint declara este layout como o padrão "obrigatório para todos os futuros domínios do ERP" — uma decisão deliberada de introduzir, a partir do Supplier Hub, um layout mais coeso para a série ERP, não um desvio silencioso do padrão anterior. Internamente, a separação de responsabilidade é preservada integralmente (DTO / Client / Query Keys / Cache / Hooks, cada um seu próprio arquivo) — apenas o diretório-contêiner muda.

| Arquivo | Papel |
|---|---|
| `supplier.dto.ts` | DTOs — cópia deliberada de `apps/api/src/dtos/supplier.dto.ts`, nunca compartilhados |
| `supplierClient.ts` | Cliente HTTP — espelha `apps/api/src/routes/supplier.ts` (IMP-203), rota a rota, via `apiClient` (`core/http/client.ts`) |
| `supplierQueryKeys.ts` | Query Keys centralizadas |
| `supplierCache.ts` | Helper de sincronização de cache pós-Mutation |
| `useSuppliers.ts` / `useSupplier.ts` | Hooks de Query |
| `useCreateSupplier.ts` / `useUpdateSupplier.ts` / `useDisableSupplier.ts` / `useReactivateSupplier.ts` / `useAddSupplierContact.ts` / `useRegisterSupplierCatalogItem.ts` / `useUpdateSupplierCatalogItem.ts` / `useCreateSupplierContract.ts` / `useRecordSupplierPerformance.ts` | Hooks de Mutation, um por Command |
| `testing/realApiServer.ts` | Helper exclusivo de teste — nunca exportado pelo barrel |

Nenhum arquivo de produção acessa `fetch` diretamente nem `SupplierManager` — toda comunicação passa por `apiClient` (`core/http/client.ts`), a mesma instância única já usada por toda a aplicação e já conectada ao interceptor de autenticação (`AuthProvider`). Nenhum código de autenticação novo foi escrito.

---

## 2. Integração HTTP

`supplierClient.ts` tem onze métodos, um por endpoint já aprovado em IMP-203 (`register`, `findById`, `listByTenant`, `update`, `disable`, `reactivate`, `addContact`, `registerCatalogItem`, `updateCatalogItem`, `createContract`, `recordPerformance`) — nenhum endpoint novo é assumido, nenhum é omitido. `findById` usa `undefinedOn404` (já existente, `core/http/undefinedOn404.ts`), mesma disciplina de `businessProfileClient.findByTenant`.

---

## 3. Hooks Criados

Onze Hooks, um por método de `supplierClient` — cobertura completa dos onze endpoints, nenhum inventado além disso.

`useDisableSupplier`, não `useDeactivateSupplier`. IMP-204 cita "useDeactivateSupplier()" sob o rótulo "Exemplos:" — todo o vocabulário já consolidado do Supplier Hub, do Core (`disableSupplier`, `SupplierStatus: "Active" | "Disabled"`) à Persistência ao HTTP (`POST /suppliers/:supplierId/disable`, Evento `SupplierDisabled`), usa exclusivamente "Disable"/"Disabled"; "Deactivate" não aparece em nenhum documento ou código já aprovado. Nomeado `useDisableSupplier` para preservar a Linguagem Ubíqua já fixada em três Sprints anteriores, evitando um segundo sinônimo não documentado.

---

## 4. Queries

`useSuppliers(tenantId)` — `GET /suppliers/by-tenant/:tenantId`, chave `["supplier","list",tenantId]`, `enabled` apenas com `tenantId` definido.

`useSupplier(supplierId)` — `GET /suppliers/:supplierId`, chave `["supplier","detail",supplierId]`, `undefined` quando ausente, nunca um erro.

---

## 5. Mutations

Nove Hooks — um por Command já aprovado. Cinco (`useCreateSupplier`, `useUpdateSupplier`, `useDisableSupplier`, `useReactivateSupplier`, `useAddSupplierContact`) devolvem um `SupplierResponseDto` completo e sincronizam cache via `syncSupplierInCaches` (Capítulo 6). Quatro (`useRegisterSupplierCatalogItem`, `useUpdateSupplierCatalogItem`, `useCreateSupplierContract`, `useRecordSupplierPerformance`) não sincronizam nenhum cache — nenhuma Query de listagem existe ainda para Catalog Item/Contract/Performance Record (nem em `SupplierManager`, nem em `apps/api`), então não há nada a atualizar; o dado da Mutation é devolvido diretamente ao chamador.

---

## 6. Query Keys

`supplierQueryKeys.ts` centraliza as duas chaves (`list(tenantId)`, `detail(supplierId)`) — nenhum domínio já existente (`crm`/`branding`/`business-profile`) centraliza desta forma (cada hook já existente inlina o array literal). Introduzido porque IMP-204 pede Query Keys "consistentes" e "nunca duplicadas" como item próprio, e onze operações nascem no mesmo Sprint (ao contrário dos domínios anteriores, que cresceram um Hook por vez ao longo de múltiplas Sprints) — decisão local ao Supplier Hub, não uma mudança retroativa a nenhum domínio existente.

---

## 7. Estratégia de Cache

`syncSupplierInCaches(queryClient, supplier)` (`supplierCache.ts`) — reutilizado pelas cinco Mutations que devolvem um Supplier completo: substitui o cache de detalhe diretamente (`setQueryData`) e, quando a lista do mesmo Tenant já está em cache, substitui a entrada correspondente ou a acrescenta. Mesmo padrão de `useRegenerateTheme`/`useSubmitLogo` (Branding) — nunca um `invalidateQueries`, porque o dado já devolvido pela própria Mutation já é a fotografia completa e correta.

Nenhum optimistic update (atualização de cache *antes* da confirmação do servidor) foi implementado — per instrução explícita ("Optimistic updates somente quando já existir padrão equivalente. Caso não exista padrão. Não inventar"): nenhum Hook já existente nesta plataforma faz update otimista (todos atualizam o cache em `onSuccess`, depois da confirmação real) — não havia padrão equivalente a seguir, então nenhum foi inventado.

---

## 8. Tratamento de Erros

Nenhum tratamento paralelo — `ApiError`/`ApiNetworkError` (`core/http/ApiError.ts`, já existentes) propagam normalmente através de toda Mutation/Query; nenhum Hook do Supplier Hub intercepta ou reclassifica erro. `useSupplier`/`useSuppliers` usam `undefinedOn404` no `supplierClient`, não no Hook — mesma camada de todo domínio já existente.

---

## 9. DTOs

`supplier.dto.ts` duplica, campo a campo, `apps/api/src/dtos/supplier.dto.ts` (IMP-203) — nenhum import cruzado entre `apps/web` e `apps/api`, mesma disciplina já documentada em `businessProfile.dto.ts`/`crm.dto.ts` ("Cópia deliberada, não um import cruzado entre apps"). Dezesseis interfaces, nenhuma reexportação de tipo de `@abp/supplier-hub`.

---

## 10. Divergências Encontradas (documentadas, não corrigidas silenciosamente)

**Conflito genuíno entre ambiente jsdom e `@abp/persistence`.** `renderHook` (`@testing-library/react`) exige `document`, disponível apenas sob `@vitest-environment jsdom`. Sob jsdom, `@abp/persistence` (`db/migrate.ts`) falha ao resolver sua pasta de migrations — `fileURLToPath(new URL(".", import.meta.url))` lança "The URL must be of scheme file". Diagnosticado como um conflito de transformação de módulo específico do ambiente de teste (o `import.meta.url` resolvido sob jsdom não é aceito por `fileURLToPath`, mesmo depois de `globalThis.URL` ser explicitamente restaurado à classe nativa do Node dentro de um import dinâmico — tentativa registrada em `testing/realApiServer.ts`, preservada como documentação da tentativa). `packages/persistence` é uma dependência congelada nesta Sprint ("Não alterar: ... Persistência") — nenhuma correção ali é permitida.

**Resolução, sem violar "sem mock" onde é possível cumprir.** `supplierClient.test.ts` (ambiente Node, sem esse conflito) cobre com HTTP real e zero mock: os onze endpoints fim a fim, mapeamento de erro real (404/409/422 produzidos pelo `apps/api` real), e o interceptor de autenticação (`Authorization: Bearer <token>` capturado de um hook de diagnóstico anexado à própria instância real do servidor, nunca modificando `apps/api`). Os dois arquivos de teste de Hook (`useSupplierQueries.test.tsx`, `useSupplierMutations.test.tsx`), que exigem jsdom, usam `fetch` mockado — mesmo padrão de **todo** teste de Hook já existente nesta plataforma (`useBrandIdentity.test.tsx`, `useBusinessProfileSummary.test.tsx`) — cobrindo exclusivamente a integração com React Query (chave de cache, `enabled`, sincronização pós-Mutation) sobre uma implementação de `supplierClient` já validada, sem mock, no arquivo anterior.

**Extensão mínima e aditiva de `ApiClient`** (`core/http/ApiClient.ts`) — `setBaseUrl(url)`, mesmo padrão de `setAccessToken`, adicionada exclusivamente para permitir apontar o `apiClient` singleton para o servidor real de teste em porta efêmera (decidida apenas em tempo de execução). Nenhum caminho de produção chama `setBaseUrl` — `main.tsx`/`AuthProvider` continuam usando exclusivamente o `baseUrl` resolvido de `import.meta.env`. Testado em `ApiClient.test.ts`.

**Import relativo de `apps/api/src/server.ts`** (nunca do pacote `@abp/api` por nome) em `testing/realApiServer.ts` — `@abp/api/package.json` não declara `exports` (`main.ts` é um bootstrapper de processo com efeito colateral, nunca pensado como biblioteca); adicionar um `exports` ali seria uma alteração a `apps/api`, proibida nesta Sprint. O import relativo ao código-fonte não passa pela resolução de `package.json` (`main`/`exports`), então nenhuma alteração a `apps/api` foi necessária — apenas uma nova referência de projeto em `apps/web/tsconfig.json` (`../api`) para que `tsc -b` resolva os tipos.

**Bug real encontrado por teste — `useQuery` não aceita `undefined` como valor resolvido (React Query v5).** `useSupplier`, cujo `queryFn` originalmente devolvia `supplierClient.findById(supplierId)` diretamente (`SupplierResponseDto | undefined`), disparava "Query data cannot be undefined" e nunca alcançava `isSuccess: true` para um Supplier ausente — descoberto pelo próprio teste de Hook desta Sprint (`useSupplierQueries.test.tsx`), nunca reproduzido antes porque nenhum Hook já existente com a mesma forma (`useBusinessProfile`, também `T | undefined`) tem teste de Hook próprio cobrindo esse caminho. Corrigido em `useSupplier.ts` (Frontend, dentro do escopo desta Sprint): `queryFn` devolve `null` internamente, `select: (data) => data ?? undefined` converte de volta, preservando o contrato `T | undefined` já usado em toda a aplicação. `useBusinessProfile.ts` (fora do escopo do Supplier Hub) provavelmente compartilha a mesma vulnerabilidade — não alterado por esta Sprint, apenas registrado aqui como achado relevante para consideração futura.

Nenhuma das divergências acima exigiu Amendment contra nenhum documento Frozen/Official — todas foram resolvidas inteiramente dentro do escopo desta Sprint (Frontend), sem tocar Core, Persistência, HTTP API ou Arquitetura.

---

## 11. Testes Criados

Onze arquivos de teste, 68 novos testes (36 em `supplierClient.test.ts`/`ApiClient.test.ts`/`http`, mais os de Hook), 100% executados de fato — nenhum teste de domínio inteiramente ausente de execução:

| Arquivo | Ambiente | Cobertura |
|---|---|---|
| `supplierClient.test.ts` | Node, servidor real | Onze endpoints fim a fim; 404 tratado como ausência; 409/422 reais; interceptor de autenticação real (com e sem token) |
| `ApiClient.test.ts` (estendido) | Node | `setBaseUrl` (adição desta Sprint) |
| `useSupplierQueries.test.tsx` | jsdom, mock | `useSuppliers`/`useSupplier`, chave de cache, `enabled`, 404→undefined |
| `useSupplierMutations.test.tsx` | jsdom, mock | As nove Mutations — sincronização de cache das cinco que devolvem Supplier completo; ausência documentada de cache das quatro restantes; erro 409 real propagado como `ApiError` |

---

## 12. Cobertura Obtida

`pnpm typecheck`, `pnpm build` e `pnpm lint` verdes. `pnpm test` executado três vezes na raiz do monorepo, como exigido — **as três execuções passaram integralmente, sem nenhum flake** (160 arquivos de teste, 657 testes em cada uma das três rodadas). `vite build` confirmado sem incluir `@abp/persistence`/`node:sqlite`/`apps/api` no bundle de produção (tamanho do chunk principal praticamente inalterado, +0,06 kB, atribuível apenas a `ApiClient.setBaseUrl`) — nenhum arquivo de teste é alcançável a partir de `main.tsx`, mesma garantia estrutural já documentada para `core/http/testing/demoApiFetchMock.ts`.

---

## 13. Limitações

Nenhuma Query de listagem existe para Catalog Item/Contract/Performance Record — reflexo direto de `SupplierManager`/`apps/api` não exporem nenhum `GET` de listagem para esses três recursos ainda (Capítulo 5); quando (e se) uma Sprint futura de HTTP API adicionar esses endpoints, os Hooks de Mutation correspondentes devem ganhar sincronização de cache análoga a `syncSupplierInCaches`.

`useBusinessProfile.ts` provavelmente compartilha a vulnerabilidade de `queryFn` retornando `undefined` (Capítulo 10) — não corrigido, fora do escopo do Supplier Hub.

---

## 14. Possíveis Amendments

Nenhum — todas as divergências encontradas foram resolvidas inteiramente na camada Frontend, sem exigir mudança em nenhum documento Frozen/Official nem em Core/Persistência/HTTP API já aprovados.

---

## 15. Conclusão

O Supplier Hub agora possui infraestrutura Web completa e testada — cliente HTTP, Hooks de Query e Mutation para os onze endpoints já aprovados, Query Keys centralizadas, estratégia de cache documentada, tratamento de erro reaproveitado sem paralelismo, e DTOs deliberadamente duplicados. Nenhuma Tela foi construída. O ciclo **Arquitetura → Core → Persistência → HTTP → Frontend** está validado de ponta a ponta para o Supplier Hub — o IMP-205 (Workspace) deverá consumir exclusivamente `core/supplier/`, nunca `fetch`/HTTP diretamente, exatamente como esta Sprint exigia.
