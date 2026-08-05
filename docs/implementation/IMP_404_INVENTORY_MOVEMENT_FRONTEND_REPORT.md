# IMP-404 — Inventory Movement Frontend Infrastructure

**Adaptive Business Platform · Relatório de Implementação**

Status: Concluído · 2026-08-01

---

## Nota de Posicionamento

Quarta etapa do Inventory Movement Hub, sob STD-001, seguindo integralmente os blueprints de IMP-204
(Supplier Frontend) e IMP-304 (Purchase Frontend). Esta Sprint implementa exclusivamente a
infraestrutura Frontend — `apps/web/src/core/inventory-movement/` — nenhuma tela, nenhum componente
visual, nenhuma alteração em Arquitetura, Core, Persistência, HTTP API, Repository Interfaces,
Managers, Services, Policies, Validators ou Factories. O Workspace (IMP-405) é a próxima Sprint.

---

## Sumário

1. Auditoria Realizada (Passo 1)
2. `inventoryMovementClient`
3. DTOs
4. Query Keys
5. Cache
6. Hooks
7. Tratamento de Erros
8. Testes
9. Garantia de Ledger nos Hooks
10. Divergências Encontradas
11. Limitações
12. Qualidade
13. Validação
14. Preparação para IMP-405

---

## 1. Auditoria Realizada (Passo 1)

Leitura integral de `ERP_ARCHITECTURE.md`, `INVENTORY_MOVEMENT_HUB.md`, `ERP_CONTEXT_MAP.md`,
`DOMAIN_EVENT_CATALOG.md`, `IMP_401`/`IMP_402`/`IMP_403_INVENTORY_MOVEMENT_*_REPORT.md`, e leitura
direta (não por memória) de `apps/web/src/core/purchase/*` e `apps/web/src/core/supplier/*` completos —
`*.dto.ts`, `*Client.ts`, `*QueryKeys.ts`, `*Cache.ts`, `testing/realApiServer.ts`, cada Hook de Query
e de Mutation citado neste relatório, `core/http/{client,ApiClient,ApiError,undefinedOn404}.ts`, e os
arquivos de teste `*Client.test.ts`/`use*Queries.test.tsx`/`use*Mutations.test.tsx`.

**Existe oportunidade de reutilização?** Sim, integralmente — `apiClient` singleton, `ApiError`/
`ApiNetworkError`/`undefinedOn404`, o padrão `null`-sentinela + `select` para Query de detalhe (bug
React Query v5 já documentado por `useSupplier.ts`/`usePurchaseOrder.ts`), `testing/realApiServer.ts`
(cópia deliberada pela terceira vez consecutiva), a estrutura de teste em duas camadas (`*Client.test.ts`
real-HTTP em Node, `use*Queries.test.tsx`/`use*Mutations.test.tsx` jsdom-mocked).

**Existe oportunidade de abstração?** Duas, ambas já identificadas por Sprints anteriores e
reafirmadas, nenhuma extraída:
- `testing/realApiServer.ts` — inteiramente genérico, candidato a `core/http/testing/realApiServer.ts`
  compartilhado, identificado desde IMP-304, agora com três cópias idênticas (Supplier, Purchase,
  Inventory Movement).
- Nova nesta Sprint: o par `movement`/`position` de `useRegisterStockMovement` e
  `useConvertReservationToMovement` (ambos sincronizam um Movement aditivo + uma Position substituída
  no mesmo `onSuccess`) é um padrão exato repetido duas vezes dentro do próprio Hub — candidato a um
  único helper `syncMovementAndPosition(queryClient, movement, position)` dentro de
  `inventoryMovementCache.ts`; **não extraído nesta Sprint** (duas ocorrências, abaixo do critério de
  "3+ instâncias reais" já estabelecido em `ADAPTIVE_DEVELOPMENT_STANDARD.md`, Capítulo 14).

**Existe alguma convenção divergente?** Uma, nova e necessária — `?locationId=` como querystring
opcional (`useStockMovementsByProduct`/`useStockPosition`), refletindo o mesmo parâmetro já introduzido
pela camada HTTP (IMP-403). Nenhum Hook anterior (Supplier, Purchase) precisou de um segundo parâmetro
opcional na assinatura de um Hook de Query — implementado como parâmetro posicional simples
(`useStockPosition(productId, locationId?)`), nunca um objeto de opções, mantendo a assinatura o mais
próxima possível do padrão de um único parâmetro já estabelecido.

**Existe algum bug histórico que possa reaparecer?** O bug de `undefined` em `queryFn` do React Query
v5 (IMP-204) foi auditado e replicado corretamente em `useStockPosition`/`useStockReservation` (mesmo
padrão `null`-sentinela + `select`) — `usePurchaseOrder`/`useSupplier` como referência direta. Nenhuma
outra classe de bug histórica (jsdom×`@abp/persistence`, PATCH-clobbering) tem superfície nova nesta
Sprint além da já conhecida e já contornada pelo padrão existente.

**Existe algum comportamento específico de Ledger que precise ser refletido?** Sim — é o eixo central
desta Sprint. `appendStockMovementInCache` é **sempre aditivo, nunca substitui** uma entrada já
cacheada, porque um `StockMovement` nunca é alterado após criado em nenhuma camada já construída
(Core/Persistência/HTTP). Nenhum Hook `useUpdateStockMovement`/`useDeleteStockMovement`/
`useReplaceStockMovement` foi criado — não por omissão deliberada de algo que poderia existir, mas
porque nenhum método correspondente existe em `inventoryMovementClient`/`apps/api`/
`InventoryMovementManager`. Ver Seção 9 para a verificação formal.

---

## 2. `inventoryMovementClient`

`inventoryMovementClient.ts` — treze métodos, um por endpoint de `apps/api/src/routes/inventoryMovement.ts`
(IMP-403), mesma disciplina de `purchaseClient`/`supplierClient`. `withLocationQuery` é um helper
privado novo (não existe equivalente em Purchase/Supplier) que anexa `?locationId=` apenas quando
informado — `ApiClient.get<T>(path)` não aceita um objeto de query params separado, então a
serialização acontece no cliente do domínio, nunca em `core/http/ApiClient.ts` (fora de escopo, camada
intocada).

---

## 3. DTOs

`inventoryMovement.dto.ts` — cópia campo-a-campo de `apps/api/src/dtos/inventoryMovement.dto.ts`
(IMP-403), nunca um import cruzado. `StockLocationAddressDto` permanece aninhado, mesma decisão já
tomada na camada HTTP.

---

## 4. Query Keys

`inventoryMovementQueryKeys.ts` — seis chaves, uma por Query real exposta pela API (`movementsByProduct`,
`movementsByOriginReference`, `position`, `reservation`, `reservationsByOrder`,
`activeLocationsByTenant`). Nenhuma chave para `StockAlertRule` — mesma ausência, pela mesma razão,
já documentada para `ReorderRule` em `purchaseQueryKeys.ts` (nenhuma Query de detalhe/listagem existe
em `InventoryMovementManager` para este Aggregate). `locationId` sempre entra na chave como
`locationId ?? null`, nunca omitido, para que a ausência e a presença de filtro de localização nunca
colidam no mesmo slot de cache.

---

## 5. Cache

`inventoryMovementCache.ts` — três helpers, cada um espelhando exatamente um padrão já consolidado,
nenhuma estratégia nova inventada:

- `appendStockMovementInCache` — sempre aditivo (nunca `replaceOrAppend`), mesmo formato de
  `appendReceivingInCache` (Purchase Hub) — mas aqui a disciplina reflete a própria natureza
  append-only do domínio, não apenas uma convenção emprestada.
- `syncStockPositionInCache` — substituição direta via `setQueryData`, nunca uma lista — a Position é
  sempre a projeção mais recente.
- `syncStockReservationInCaches` — `replaceOrAppend` sobre a lista por Order, mesmo padrão de
  `syncPurchaseOrderInCaches`/`syncSupplierInCaches` (Reservation é mutável, `Active → Released |
  ConvertedToMovement`).
- `appendStockLocationInCache` — sempre aditivo, mesmo formato de `appendReceivingInCache` (toda nova
  Location nasce `active: true`, per `InventoryFactory`).

Nenhum cenário do Ledger revelou uma limitação nova de cache além das já conhecidas (Seção 11).

---

## 6. Hooks

Treze Hooks, um por método de `inventoryMovementClient` — seis Query, sete Mutation:

| Hook | Tipo | Endpoint |
|---|---|---|
| `useStockMovementsByProduct` | Query | `GET /stock-movements/by-product/:productId` |
| `useStockMovementsByOriginReference` | Query | `GET /stock-movements/by-origin-reference/:originReferenceId` |
| `useStockPosition` | Query | `GET /stock-positions/:productId` |
| `useStockReservation` | Query | `GET /stock-reservations/:reservationId` |
| `useStockReservationsByOrder` | Query | `GET /stock-reservations/by-order/:orderId` |
| `useActiveStockLocations` | Query | `GET /stock-locations/by-tenant/:tenantId/active` |
| `useRegisterStockMovement` | Mutation | `POST /stock-movements` |
| `useCreateStockReservation` | Mutation | `POST /stock-reservations` |
| `useReleaseStockReservation` | Mutation | `POST /stock-reservations/:reservationId/release` |
| `useConvertReservationToMovement` | Mutation | `POST /stock-reservations/:reservationId/convert` |
| `useCreateStockLocation` | Mutation | `POST /stock-locations` |
| `useCreateStockAlertRule` | Mutation | `POST /stock-alert-rules` |
| `useDeactivateStockAlertRule` | Mutation | `POST /stock-alert-rules/:ruleId/deactivate` |

**Nomes divergem dos exemplos ilustrativos do prompt** (`useStockMovements()`, `useStockReservations()`,
`useStockLocations()`, `useStockAlertRules()`) exatamente pela mesma razão já registrada por
`useReceivings.ts` (Purchase Hub) frente ao "useReceiving()" citado por IMP-304: os nomes reais
refletem o endpoint/parâmetro real (`useStockMovementsByProduct`, não um genérico "useStockMovements"
sem escopo — não existe um `GET /stock-movements` sem filtro), nunca uma aproximação do exemplo
ilustrativo do prompt. `useStockAlertRules()` (plural, listagem) não foi criado porque não existe
Query correspondente — mesma disciplina "criar somente Hooks correspondentes a métodos públicos da
API", aplicada rigorosamente mesmo quando diverge do texto de exemplo.

---

## 7. Tratamento de Erros

Nenhuma estratégia paralela — `ApiError`/`ApiNetworkError` (`core/http/ApiError.ts`), intocados;
`undefinedOn404` para toda Query de detalhe (`findStockPosition`, `findStockReservationById`); o
mapeamento 401/404/409/422/500 já acontece inteiramente no servidor (`mapInventoryMovementError.ts`,
IMP-403) — o Frontend nunca reimplementa essa lógica, apenas recebe `ApiError.statusCode` já correto e
usa `toUserMessage()` já existente, sem nenhuma extensão específica de domínio.

---

## 8. Testes

67 novos testes: `inventoryMovementClient.test.ts` (10, HTTP real via `startRealApiServer`, SQLite
`:memory:` real, zero mock), `useInventoryMovementQueries.test.tsx` (11, jsdom + `fetch` mockado),
`useInventoryMovementMutations.test.tsx` (13, jsdom + `fetch` mockado). "Nunca mockar integração HTTP
quando ela puder ser testada de verdade" — a integração HTTP real está inteiramente coberta pelo
arquivo Node; os arquivos jsdom cobrem exclusivamente a integração com React Query (queryKey,
`enabled`, sincronização de cache), nunca o roundtrip HTTP em si.

**Os três cenários obrigatórios do Ledger, verbatim do prompt**, todos em
`useInventoryMovementMutations.test.tsx`:

1. *Registrar movimento → Atualização automática da lista.* Testado com uma lista pré-cacheada de um
   Movement, disparando `useRegisterStockMovement`, e verificando que a lista cresce para dois
   elementos, o novo sempre ao final.
2. *Consultar posição → Cache consistente.* Testado verificando que `syncStockPositionInCache`
   substitui (nunca soma) o valor já cacheado pelo valor exato devolvido pela Mutation.
3. *Consultar histórico → Ordem preservada.* Testado em `inventoryMovementClient.test.ts` (HTTP real):
   três movimentos registrados em sequência, `listStockMovementsByProduct` devolve exatamente na mesma
   ordem de registro.

Mais um cenário adicional, também explicitamente exigido: *"Garantir que nenhum Hook exponha operações
inexistentes"* — dois testes dedicados (Seção 9).

---

## 9. Garantia de Ledger nos Hooks

Dois testes formais, além da ausência estrutural em si:

1. `inventoryMovementClient.test.ts` — inspeciona `Object.keys(inventoryMovementClient)` e confirma
   que nenhum nome de método relacionado a "movement" combina com `/update|delete|replace|edit|remove/i`.
2. `useInventoryMovementMutations.test.tsx` — importa dinamicamente `useRegisterStockMovement.ts` e
   confirma que o módulo exporta exatamente um símbolo (`useRegisterStockMovement`), nenhum outro.

Estes testes não "provam" a ausência de forma absoluta (um novo arquivo `useUpdateStockMovement.ts`
poderia ser criado amanhã sem que este teste specific o pegue) — mas funcionam como um guard de
regressão: se algum dia um método/Hook desse tipo for adicionado ao arquivo já testado, o teste
falha imediatamente. Combinado com a garantia estrutural de três camadas já existente (Core não tem o
método → HTTP não tem a rota → Frontend não tem o Hook), a garantia real é a ausência do próprio método
a ser chamado, não apenas um teste negativo.

---

## 10. Divergências Encontradas

Nenhuma divergência exigiu Amendment. A única decisão sem precedente direto foi a assinatura de dois
parâmetros posicionais opcionais em Hooks de Query (`productId, locationId?`), documentada na Seção 1.

---

## 11. Limitações

**Herdada da Persistência/HTTP (terceira vez documentada)**: `variantId` continua ausente de todo
parâmetro de consulta (`useStockPosition`/`useStockMovementsByProduct` não filtram por variant) — a
mesma limitação de IMP-401/402/403, propagada integralmente ao Frontend, nunca mascarada.

**`requisitionsByStatus`-like risk avaliado e descartado**: IMP-304 documentou que
`requisitionsByStatus` (Purchase Hub) fica desatualizada em cache após uma transição de status, porque
é chaveada pelo próprio `status` mutável. Auditoria desta Sprint confirma que o Inventory Movement Hub
**não tem** esse risco: nenhuma Query Key deste Hub é parametrizada por um campo mutável da própria
Entidade (`reservationsByOrder` é chaveada por `orderId`, imutável; `movementsByProduct` por
`productId`/`locationId`, também imutáveis) — `syncStockReservationInCaches` já resolve corretamente a
transição de status de uma Reservation porque a lista é indexada por Order, não por status.

---

## 12. Qualidade

**STD-001 seguido?** Sim.

**Supplier Blueprint seguido?** Sim — `undefinedOn404`, `ApiError`, estrutura de arquivo idêntica.

**Purchase Blueprint seguido?** Sim — `null`-sentinela + `select`, `replaceOrAppend` inline,
`testing/realApiServer.ts` copiado, dois níveis de teste (Node real + jsdom mocked).

**Existe duplicação?** Não além da já aceita (DTOs, `realApiServer.ts` — nunca compartilhados, per
instrução explícita de cada Sprint desta série).

**Existe abstração reutilizável?** Sim — duas candidatas, Seção 1 (`realApiServer.ts` compartilhado,
agora com 3 cópias; `syncMovementAndPosition` dentro do próprio Hub, 2 ocorrências).

**Existe oportunidade de fortalecer `core/{domain}`?** Sim — o padrão `withLocationQuery`/parâmetro
posicional opcional em Query, comprovado nesta Sprint, é um candidato direto de convenção para
Production Hub/Fiscal Hub caso surjam filtros opcionais semelhantes (ex.: um futuro `workCenterId?`
em Production). Documentado, não imposto como regra até que uma segunda ocorrência real apareça.

---

## 13. Validação

`pnpm typecheck`, `pnpm build`, `pnpm lint`, `pnpm test` executados três vezes na suíte completa do
monorepo (24 pacotes/apps), a partir de `platform/` (caminho absoluto confirmado, per
[[feedback_bash_cwd_persistence]]). Run 1 teve um flake isolado e já conhecido —
`apps/web/src/app/router/routes.test.tsx > renderiza o Dashboard na rota raiz` — confirmado, mais uma
vez, como falha de timing sob carga plena da suíte (passa de forma confiável isolado), pré-existente,
sem nenhuma relação com qualquer arquivo tocado por esta Sprint (mesmo flake já documentado em
`IMP_402_INVENTORY_MOVEMENT_PERSISTENCE_REPORT.md`, Seção 12). Runs 2 e 3: totalmente limpos e
idênticos — 1020 testes passando + 1 `it.fails` esperado (IMP-303) = 1021.

---

## 14. Preparação para IMP-405

`core/inventory-movement/` está pronto para ser consumido exclusivamente por Hooks no Workspace,
seguindo o blueprint de IMP-305 (Purchase Workspace). Quatro pontos já identificados para aquela
Sprint:

1. O componente `ProcessFlow` (Design System, UX-002) precisará de um mapeamento de estado próprio
   para o Ledger — diferente de `PurchaseOrder`/`PurchaseRequisition` (máquina de estados linear), um
   `StockMovement` não tem "estado" (é um fato único, não uma Entidade com transição) — o Workspace
   precisará decidir o que `ProcessFlow` representa aqui (provavelmente a jornada de uma
   `StockReservation`: `Active → Released | ConvertedToMovement`, a única máquina de estados real deste
   Hub).
2. `RegisterStockMovement` continua exposto sem restrição de uso (limitação já documentada em
   IMP-403) — o Workspace deve decidir explicitamente se oferece um formulário de "registrar
   movimento manual" na UI, documentando essa decisão, nunca a omitindo silenciosamente.
3. A limitação de `variantId` (Seção 11) deve ser documentada uma quarta vez.
4. Nenhuma tela deste Hub pode assumir que `useStockPosition` sempre tem dado — `undefined` é um
   estado real e esperado (Produto nunca movimentado), o Workspace deve tratá-lo com `EmptyState`/
   `NotConnectedNotice` conforme já convencionado, nunca como um erro de carregamento.
