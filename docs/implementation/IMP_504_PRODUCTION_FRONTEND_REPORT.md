# IMP-504 — Production Frontend Infrastructure

**Adaptive Business Platform · Relatório de Implementação**

Status: Completo
Data: 2026-08-04
Escopo: exclusivamente Frontend Infrastructure (`apps/web/src/core/production/`) — Arquitetura, Core,
Persistence, HTTP e Workspace permanecem fora de escopo, per instrução explícita desta Sprint. Nenhuma
tela, nenhum componente visual, nenhum Workspace.

---

## Nota de Posicionamento

Este relatório documenta a infraestrutura de acesso ao Production Hub em `apps/web`, seguindo
rigorosamente os três blueprints já consolidados: Supplier Frontend (IMP-204), Purchase Frontend
(IMP-304) e Inventory Movement Frontend (IMP-404, o mais recente). Nenhum padrão novo foi criado.

---

## 1. Auditoria Realizada (Passo 1)

Executada antes de qualquer código, comparando Production HTTP (IMP-503) → Supplier Frontend →
Purchase Frontend → Inventory Movement Frontend.

**Existe infraestrutura parcial?** Não. Nenhuma pasta `core/production/` existia antes desta Sprint —
confirmado por leitura completa de `apps/web/src/core/` (13 domínios já presentes, nenhum
`production`).

**Existe duplicação?** A duplicação estrutural esperada existe e é aceita como padrão sancionado:
`production.dto.ts` duplica deliberadamente `apps/api/src/dtos/production.dto.ts` (nunca um import
cross-app — "Nunca compartilhar código entre apps/api e apps/web"); `testing/realApiServer.ts` é a
quarta cópia byte-a-byte do mesmo helper (Supplier/Purchase/Inventory Movement já o replicaram três
vezes) — candidato a `core/http/testing/realApiServer.ts` compartilhado, identificado desde
`IMP_304_PURCHASE_FRONTEND_REPORT.md` e reafirmado por cada Sprint subsequente, **não extraído
novamente aqui** per instrução explícita ("Não refatorar neste Sprint").

**Existe abstração válida?** Nenhuma nova extraída — mesma resposta conservadora dos três Frontends
anteriores.

**Existe melhoria para STD-001?** Uma observação nova, não uma melhoria de convenção: esta Sprint
descobriu uma variante inédita da classe de limitação "cache mutável sem estratégia consolidada" (ver
Seção 8, item b) — dados **derivados/computados no servidor** (`totalConsumedCost`/
`totalGeneratedQuantity`) que ficam desatualizados após uma Mutation relacionada, sem que recalculá-los
no cliente seja uma opção legítima (reproduziria regra de negócio do Core no Frontend). Documentado
como um novo caso da mesma classe já nomeada por IMP-304, não uma classe nova — nenhuma mudança ao
Standard proposta.

**Existe oportunidade de reutilização?** Sim, no nível de padrão estrutural (nunca de código
importado): `productionCache.ts` reutiliza as cinco estratégias já catalogadas por
`inventoryMovementCache.ts`/`purchaseCache.ts`/`supplierCache.ts` (Seção 5).

---

## 2. DTOs

`production.dto.ts` — cópia deliberada e completa de `apps/api/src/dtos/production.dto.ts` (IMP-503),
mesmos 20 tipos, nenhum tipo de `@abp/production-hub` importado.

## 3. Client

`productionClient.ts` — 17 métodos, um por endpoint de `apps/api/src/routes/production.ts` (IMP-503),
todos via `apiClient` (`core/http/client.ts`), nunca `fetch` diretamente. `findBillOfMaterialsById`/
`findActiveBillOfMaterialsForProduct`/`findProductionOrderById` usam `undefinedOn404`;
`getTotalConsumedCost`/`getTotalGeneratedQuantity` deliberadamente não usam (ver Seção 9, decisão
tomada).

## 4. Query Keys

`productionQueryKeys.ts` — oito chaves, uma por Query real (nenhuma para `ProductionConsumption`/
`ProductionOutput`, sem Query dedicada própria desde o Core).

## 5. Cache

`productionCache.ts` reutiliza exatamente as cinco estratégias já catalogadas nesta plataforma, nenhuma
nova:

| Estratégia | Aplicada a |
|---|---|
| Substituição direta de detalhe (`setQueryData`) | `syncBillOfMaterialsInCache` (detalhe), `activeBillOfMaterialsByProduct` quando `status === "Active"` |
| Replace-or-append em lista de chave imutável | `syncProductionOrderInCaches` → `productionOrdersByOrigin` (chaveada por `orderId`, imutável) |
| Aditiva (append-only) | `appendWorkCenterInCache` → `activeWorkCenters()` |
| Sem sincronização de lista (chave mutável, sem estratégia consolidada) | `productionOrdersByStatus` — nunca tocada, mesma limitação de `requisitionsByStatus` |
| Sem sincronização alguma (Mutation sem Query correspondente) | Não aplicável neste Hub — todo Command tem ao menos uma Query relacionada |

`ProductionConsumption`/`ProductionOutput` não recebem nenhum helper `appendXInCache` — diferente de
`StockMovement`/`Receiving`, nenhuma Query independente existe para eles na API; ambos chegam já
corretos como campos de `order.consumptions`/`order.outputs` dentro do próprio
`syncProductionOrderInCaches`.

## 6. Hooks

Dezessete Hooks, um por método público de `productionClient` — oito Query, nove Mutation:

| Hook | Tipo | Endpoint |
|---|---|---|
| `useBillOfMaterials` | Query | `GET /bills-of-materials/:id` |
| `useActiveBillOfMaterialsForProduct` | Query | `GET /bills-of-materials/by-product/:id/active` |
| `useProductionOrder` | Query | `GET /production-orders/:id` |
| `useProductionOrdersByStatus` | Query | `GET /production-orders/by-status/:status` |
| `useProductionOrdersByOrigin` | Query | `GET /production-orders/by-origin/:orderId` |
| `useTotalConsumedCost` | Query | `GET /production-orders/:id/total-consumed-cost` |
| `useTotalGeneratedQuantity` | Query | `GET /production-orders/:id/total-generated-quantity` |
| `useActiveWorkCenters` | Query | `GET /work-centers/active` |
| `useCreateBillOfMaterials` | Mutation | `POST /bills-of-materials` |
| `useSupersedeBillOfMaterials` | Mutation | `POST /bills-of-materials/:id/supersede` |
| `useCreateProductionOrder` | Mutation | `POST /production-orders` |
| `useStartProduction` | Mutation | `POST /production-orders/:id/start` |
| `useRegisterProductionConsumption` | Mutation | `POST /production-orders/:id/consumptions` |
| `useRegisterProductionOutput` | Mutation | `POST /production-orders/:id/outputs` |
| `useCompleteProduction` | Mutation | `POST /production-orders/:id/complete` |
| `useCancelProduction` | Mutation | `POST /production-orders/:id/cancel` |
| `useCreateWorkCenter` | Mutation | `POST /work-centers` |

Nenhuma tela acessa `fetch`/`ApiClient`/HTTP diretamente — toda comunicação passa exclusivamente por
este módulo, mesma disciplina "DDD" exigida.

---

## 7. Testes e Cobertura

Três arquivos, mesmo formato de IMP-404:

| Arquivo | Ambiente | Cobertura |
|---|---|---|
| `productionClient.test.ts` | Node, servidor real (`startRealApiServer`) | 10 testes — todo endpoint, fim a fim, sem mock de `fetch`; auditoria de bug (FK second-write, PATCH-clobber) |
| `useProductionQueries.test.tsx` | jsdom, `fetch` mockado | 11 testes — as 8 Query, `queryKey`/`enabled`/forma do dado |
| `useProductionMutations.test.tsx` | jsdom, `fetch` mockado | 10 testes — as 9 Mutation, sincronização de cache exata de cada helper |

**Resultado**: 31 testes nos três arquivos, 100% aprovados, três execuções consecutivas sem flake.
`pnpm test` (workspace completo): 202 arquivos de teste (era 199 antes desta Sprint), 1212 testes
aprovados + 1 falha esperada (mesma de IMP-303/501/502/503, não relacionada), idêntico nas três
execuções.

**Comparação com Inventory Movement Frontend (IMP-404, referência de cobertura explícita desta
Sprint)**: IMP-404 cobriu 13 Hooks (7 Command + 6 Query) com 10 testes de client + 11 de query hook +
13 de mutation hook = 34 testes. Esta Sprint cobre 17 Hooks (9 Command + 8 Query) com 31 testes (10
client + 11 query hook + 10 mutation hook) — proporção comparável, mesma disciplina "integração real
cobre o roundtrip HTTP completo; testes de
Hook cobrem exclusivamente a integração com React Query por cima do client já validado", nunca
duplicando a mesma asserção nas duas camadas.

---

## 8. Auditoria — Três Classes de Bug/Limitação Já Conhecidas

Per instrução explícita desta Sprint ("Verificar explicitamente... mesmo quando inexistente").

**(a) Undefined `useQuery` bug (IMP-204).** O bug original: `useQuery` não aceita `undefined` como
valor resolvido (React Query v5 trata isso como erro "Query data cannot be undefined") — descoberto
quando um Hook `find*ById` devolvia `T | undefined` diretamente do `queryFn`. **Existe superfície
potencial aqui, prevenida desde o primeiro rascunho**: `useBillOfMaterials`, `useActiveBillOfMaterialsForProduct`
e `useProductionOrder` — os três Hooks cujo `productionClient` correspondente usa `undefinedOn404` —
usam o padrão `null`-sentinela + `select: (data) => data ?? undefined` desde a primeira versão, mesma
regra durável já aplicada por `useStockPosition`/`usePurchaseOrder`/`useSupplier`. Verificado por teste
explícito (`"devolve undefined (nunca lança) quando a API responde 404"` em ambos os arquivos de teste
de Query).

**(b) Mutable-key stale cache (IMP-304).** O bug original: `requisitionsByStatus` (Purchase Hub) nunca
é sincronizada automaticamente após uma transição de status, porque é chaveada pelo próprio `status`
mutável — nenhum padrão consolidado resolve mover uma entrada entre chaves de cache. **Existe
equivalente exato aqui**: `productionOrdersByStatus` está na mesma situação estrutural —
`ProductionOrder.status` é mutável (`Planned → InProgress → Completed | Cancelled`) e é o único
parâmetro da chave. `syncProductionOrderInCaches` nunca a sincroniza, documentado explicitamente no
próprio código (`productionCache.ts`) e verificado por teste
(`"useCreateProductionOrder nunca sincroniza productionOrdersByStatus — limitação documentada"`).

**Adicionalmente, uma segunda instância da mesma classe, não vista nos três Frontends anteriores**:
`totalConsumedCost`/`totalGeneratedQuantity` (Seção 9) são dados **derivados no servidor** que também
ficam desatualizados após uma Mutation relacionada (`registerProductionConsumption`/
`registerProductionOutput`/`completeProduction`), mas, diferente de `productionOrdersByStatus`
(recalculável recuperando a lista via nova consulta), recalculá-los no cliente exigiria reimplementar
"soma do `acquisitionCost`" (Core) no Frontend — proibido pela regra final desta Sprint. Documentado
como a mesma classe de limitação, nunca uma classe nova, nem um workaround.

**(c) Append-only cache (IMP-404).** O padrão original: `StockMovement`/`Receiving` são Entidades
imutáveis após criadas, com Query de listagem própria, sincronizadas por acréscimo puro
(`appendXInCache`), nunca substituição. **Não existe superfície equivalente para
`ProductionConsumption`/`ProductionOutput`** — apesar de também serem registros imutáveis no Core
(IMP-501), nenhuma Query de listagem própria existe para nenhum dos dois em
`apps/api/src/routes/production.ts` (IMP-503); ambos são apenas campos embutidos em `ProductionOrder`,
já corretos assim que `syncProductionOrderInCaches` grava o objeto completo. Nenhuma lista em cache
existe para uma estratégia append-only atuar sobre — a ausência é estrutural, não uma omissão desta
Sprint. **Existe, porém, um caso genuíno de padrão append-only neste Hub**: `appendWorkCenterInCache`
(`activeWorkCenters()`), estruturalmente idêntico a `appendStockLocationInCache` (mesma disciplina —
toda instância nasce `active: true`).

---

## 9. Divergências Encontradas

Per `STD-001`: Arquitetura → Auditoria → Amendment → Implementação. Nenhuma corrigida silenciosamente.

**Nenhuma divergência real entre HTTP (IMP-503) e este Frontend** — os 17 endpoints mapeiam 1:1 aos 17
métodos de `productionClient`/17 Hooks, sem lacuna nem invenção.

---

## 10. Decisões Tomadas

**`getTotalConsumedCost`/`getTotalGeneratedQuantity` nunca usam `undefinedOn404`.** Diferente de
`findBillOfMaterialsById`/`findProductionOrderById` (onde "não encontrado" é um estado de negócio
legítimo — ex.: Produto ainda sem composição), estes dois métodos só fazem sentido chamados com um
`productionOrderId` já conhecido/válido (tipicamente já carregado por `useProductionOrder` em uma
mesma tela) — um 404 aqui sinaliza uma referência inválida real, não um estado esperado, e propaga como
erro (`isError: true`), nunca `data: undefined` silencioso.

**Nenhum helper `appendXInCache`/`syncXInCache` para `ProductionConsumption`/`ProductionOutput`.**
Nenhuma Query independente existe para nenhum dos dois — sincronizar algo que nenhuma Query jamais
consulta separadamente seria trabalho morto, nunca uma estratégia real (mesmo critério de "sem
sincronização alguma" já usado por `useCreateStockAlertRule` em Inventory Movement Hub, adaptado aqui a
"sem sincronização própria, apenas via o pai").

**`activeWorkCenters()` sem parâmetro de Tenant.** Diferente de `activeLocationsByTenant(tenantId)`
(Inventory Movement Hub), a Query Key e o Hook correspondentes não recebem `tenantId` — reflete
fielmente a ausência já herdada do Core/Persistência/HTTP (IMP-501/502/503, nenhum dos três adiciona
`tenantId` a `listActiveWorkCenters`/`findActive`/`GET /work-centers/active`); esta camada nunca
resolve silenciosamente uma limitação que três camadas anteriores já deixaram documentada.

**`SupersedeBillOfMaterialsResult`/`StartProductionResult`/`RegisterProductionConsumptionResult`/
`RegisterProductionOutputResult` sincronizados via desestruturação direta no `onSuccess`.** Mesmo
formato de `useConvertReservationToMovement`/`useRegisterReceiving` — cada composição sincroniza
exatamente os sub-resultados que carrega, nunca mais, nunca menos.

---

## 11. Qualidade (10 Perguntas Oficiais)

Per `ADAPTIVE_ENGINEERING_CHECKLIST.md`:

1. **Arquitetura respeitada?** Sim — todo Hook corresponde a um endpoint real de IMP-503; nenhuma
   lógica de negócio, nenhum componente visual.
2. **Auditoria realizada?** Sim — Seções 1 e 8.
3. **Blueprint seguido?** Sim — DTO/Client/QueryKeys/Cache/Hooks/Testes idênticos em forma a
   IMP-204/304/404.
4. **Código duplicado?** A duplicação estrutural esperada (DTOs, `testing/realApiServer.ts`) é
   idêntica à já aceita nos três Frontends anteriores.
5. **Componentes reutilizados?** `apiClient`/`undefinedOn404`/`ApiError` inteiros, sem modificação.
6. **Limitações documentadas?** Sim — Seção 8, incluindo uma variante nova da classe (b) nunca vista
   antes.
7. **Testes completos?** Sim — 36 testes cobrindo os 17 Hooks/17 métodos do client. Ver Seção 7 para
   comparação com IMP-404.
8. **OpenAPI validada?** Não aplicável a esta camada (já validada por IMP-503).
9. **Nenhuma tela acessa `fetch`/`ApiClient`/HTTP diretamente?** Sim — nenhuma tela existe nesta
   Sprint; a própria estrutura de `core/production/` torna esse acesso impossível por fora dela.
10. **Documentação atualizada?** Sim — este relatório; nenhum documento de arquitetura alterado.

**Existe melhoria para Supplier/Purchase/Inventory Movement?** Nenhuma identificada — a quarta cópia
de `testing/realApiServer.ts` reforça (não introduz) o candidato a extração já sinalizado por três
Sprints anteriores.

Nenhuma refatoração além do estritamente necessário para esta Sprint foi realizada.

---

## 12. Validação

`pnpm typecheck`, `pnpm build`, `pnpm lint` e `pnpm test` executados três vezes consecutivas sobre o
workspace completo:

| Execução | typecheck | build | lint | test |
|---|---|---|---|---|
| 1 | ✅ 0 erros | ✅ 0 erros | ✅ 0 erros | ✅ 202 arquivos, 1212 aprovados + 1 falha esperada |
| 2 | ✅ 0 erros | ✅ 0 erros | ✅ 0 erros | ✅ 202 arquivos, 1212 aprovados + 1 falha esperada |
| 3 | ✅ 0 erros | ✅ 0 erros | ✅ 0 erros | ✅ 202 arquivos, 1212 aprovados + 1 falha esperada |

**Nenhuma flake observada** — resultado idêntico nas três execuções. A única falha (`it.fails`)
continua sendo o bug de duplo `registerReceiving` de Purchase Hub, pré-existente, não relacionado a
esta Sprint.

Uma correção pontual ocorreu durante o desenvolvimento (não uma flake): o primeiro rascunho de
`useProductionMutations.test.tsx` deixou uma função `wrapper` local sem uso após todos os testes
migrarem para o wrapper inline com `queryClient` hoisted (necessário para pré-popular cache antes do
`render`) — erro de `tsc` (`TS6133`), corrigido removendo a função e o import não utilizado antes da
primeira execução de teste válida.

---

## 13. Preparação para IMP-505

`core/production/` está completo e pronto para consumo por um Workspace:

- Os 17 Hooks cobrem 100% da superfície pública de `productionClient`/`ProductionManager`.
- **Duas limitações herdadas, relevantes para IMP-505** (nunca escondidas, sempre documentadas de novo
  nesta camada): (1) `productionOrdersByStatus` nunca reflete uma transição de status recém-ocorrida
  sem um refetch explícito — o Workspace deve chamar `queryClient.invalidateQueries` ou
  `refetch()` manualmente após qualquer Mutation de transição, ou aceitar a lista desatualizada até a
  próxima navegação; (2) `totalConsumedCost`/`totalGeneratedQuantity` sofrem da mesma limitação, sem
  alternativa de recomputação client-side legítima — o Workspace deve invalidar/refazer essas duas
  Queries manualmente sempre que exibi-las na mesma tela onde `useRegisterProductionConsumption`/
  `useRegisterProductionOutput`/`useCompleteProduction` também são usadas.
- **`useStartProduction` exige `availableQuantities` já montado pelo chamador** (IMP-501/503) — o
  Workspace precisará compor essa informação a partir de uma fonte real de Stock Position (Inventory
  Movement Hub, `core/inventory-movement/useStockPosition`) antes de chamar
  `useStartProduction().mutate(...)`; `core/production/` nunca faz essa composição internamente.
- Nenhuma mudança de infraestrutura é antecipada — os 17 Hooks já cobrem toda operação pública do
  domínio.

Ao final desta Sprint: Supplier Hub ✅, Purchase Hub ✅, Inventory Movement Hub ✅, Production Hub
(Core ✅, Persistence ✅, HTTP API ✅, **Frontend Infrastructure ✅**) — preparando IMP-505
(Production Workspace), a Sprint final desta série.
