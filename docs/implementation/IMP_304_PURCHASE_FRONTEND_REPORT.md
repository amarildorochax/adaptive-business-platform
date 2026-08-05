# IMP-304 — Purchase Frontend — Relatório de Implementação

**Adaptive Business Platform · Relatório de Sprint**

---

## Nota de Posicionamento Documental

Este relatório fecha a Sprint **IMP-304 — Purchase Frontend**, a quarta etapa do Purchase Hub (Arquitetura ✅ ERP-001, Core ✅ IMP-301, Persistência ✅ IMP-302, HTTP API ✅ IMP-303). Ela cria exclusivamente a infraestrutura Web de consumo do Purchase Hub — nenhuma Tela, Página, Workspace, UX, Layout, Card ou elemento de Design. Nenhuma alteração a `PurchaseManager`, Services, Repository Interfaces, Persistência ou aos dezenove endpoints já aprovados de `apps/api` (IMP-303). O blueprint técnico utilizado integralmente foi `IMP_204_SUPPLIER_FRONTEND_REPORT.md`.

---

## 1. Auditoria Realizada (Passo 1, obrigatória antes de qualquer implementação)

Comparação completa entre `apps/web/src/core/supplier/` (dezoito arquivos, IMP-204) e o que o Purchase Hub exige, à luz dos dezenove endpoints já aprovados em `apps/api/src/routes/purchase.ts` (IMP-303).

**Existe alguma abstração reutilizável?** Sim, integralmente: `core/http/client.ts` (`apiClient` singleton), `core/http/ApiError.ts` (`ApiError`/`ApiNetworkError`), `core/http/undefinedOn404.ts`, e o próprio layout de arquivo (DTO / Client / Query Keys / Cache / Hooks) — nenhum deles precisou de nenhuma alteração para servir o Purchase Hub. `testing/realApiServer.ts` (IMP-204) é inteiramente genérico (sobe todo `apps/api`, não referencia `Supplier` em lugar nenhum) — reutilizável por cópia direta, sem nenhuma adaptação de conteúdo.

**Existe alguma melhoria aplicável?** Uma, real e nova: nenhuma Mutation do Supplier Hub jamais precisou sincronizar mais de uma Entidade por resultado — `registerReceiving`/`convertRequisitionToPurchaseOrder` (IMP-303) devolvem resultados compostos, exigindo que a Mutation correspondente chame mais de um helper de sincronização (ver Capítulo 7).

**Existe algum bug anteriormente corrigido que possa reaparecer?** O bug de `useSupplier`/`useBusinessProfile` (React Query v5 rejeitando `undefined` como dado resolvido, IMP-204) **reaparece estruturalmente** em `usePurchaseOrder`/`usePurchaseRequisition` — mesma forma (`T | undefined`, via `findById`/`undefinedOn404`). Corrigido preventivamente com a mesma técnica já validada (`null` interno, `select: (data) => data ?? undefined`) — nunca reproduzido nesta Sprint porque a correção já foi aplicada desde a primeira versão de cada Hook, não descoberta por teste como em IMP-204.

**Existe alguma oportunidade de padronização?** Sim, três, nenhuma executada (ver Capítulo 10).

---

## 2. Infraestrutura Criada

Toda a infraestrutura vive em `apps/web/src/core/purchase/`, mesmo layout obrigatório já fixado por IMP-204:

| Arquivo | Papel |
|---|---|
| `purchase.dto.ts` | DTOs — cópia deliberada de `apps/api/src/dtos/purchase.dto.ts`, nunca compartilhados |
| `purchaseClient.ts` | Cliente HTTP — espelha `apps/api/src/routes/purchase.ts` (IMP-303), rota a rota |
| `purchaseQueryKeys.ts` | Query Keys centralizadas — seis chaves |
| `purchaseCache.ts` | Helpers de sincronização de cache pós-Mutation |
| `usePurchaseOrder.ts` / `usePurchaseOrders.ts` / `usePurchaseOrdersBySupplier.ts` / `useReceivings.ts` / `usePurchaseRequisition.ts` / `usePurchaseRequisitions.ts` | Hooks de Query — seis, um por endpoint `GET` |
| `useCreatePurchaseOrder.ts` / `useAddPurchaseOrderItem.ts` / `useApprovePurchaseOrder.ts` / `useSendPurchaseOrderToSupplier.ts` / `useCancelPurchaseOrder.ts` / `useRegisterReceiving.ts` / `useCreatePurchaseRequisition.ts` / `useApprovePurchaseRequisition.ts` / `useRejectPurchaseRequisition.ts` / `useConvertRequisitionToPurchaseOrder.ts` / `useCreateReorderRule.ts` / `useDeactivateReorderRule.ts` / `useEvaluateReorderRule.ts` | Hooks de Mutation — treze, um por Command/método público restante |
| `testing/realApiServer.ts` | Helper exclusivo de teste — cópia de `core/supplier/testing/realApiServer.ts`, nunca exportado pelo barrel |

Nenhum arquivo de produção acessa `fetch` diretamente nem `PurchaseManager` — toda comunicação passa por `apiClient`, a mesma instância única já usada por toda a aplicação. Dezenove Hooks no total, um por endpoint já aprovado em IMP-303 — cobertura completa, nenhum inventado, nenhum omitido.

---

## 3. `PurchaseApiClient`

`purchaseClient.ts` tem dezenove métodos, um por endpoint (`createPurchaseOrder`, `findPurchaseOrderById`, `listOpenPurchaseOrdersByTenant`, `listPurchaseOrdersBySupplier`, `addPurchaseOrderItem`, `approvePurchaseOrder`, `sendPurchaseOrderToSupplier`, `cancelPurchaseOrder`, `listReceivingsByPurchaseOrder`, `registerReceiving`, `createPurchaseRequisition`, `findPurchaseRequisitionById`, `listPurchaseRequisitionsByStatus`, `approvePurchaseRequisition`, `rejectPurchaseRequisition`, `convertRequisitionToPurchaseOrder`, `createReorderRule`, `deactivateReorderRule`, `evaluateReorderRule`). `findPurchaseOrderById`/`findPurchaseRequisitionById` usam `undefinedOn404` (já existente, `core/http/undefinedOn404.ts`), mesma disciplina de `supplierClient.findById`.

---

## 4. DTOs

`purchase.dto.ts` duplica, campo a campo, `apps/api/src/dtos/purchase.dto.ts` (IMP-303) — nenhum import cruzado entre `apps/web` e `apps/api`, mesma disciplina de `supplier.dto.ts` (IMP-204). Vinte e cinco interfaces, nenhuma reexportação de tipo de `@abp/purchase-hub`, incluindo os dois DTOs de resultado composto (`RegisterReceivingResponseDto`, `ConvertRequisitionToPurchaseOrderResponseDto`) e a decisão de achatamento de `ApprovalThreshold` já documentada em IMP-303 (preservada aqui sem reinterpretação).

---

## 5. Hooks

Dezenove Hooks, um por método de `purchaseClient` — cobertura completa dos dezenove endpoints.

`useApprovePurchaseOrder`, não `useApprovePurchase`. IMP-304 cita "useApprovePurchase()" sob o rótulo "Exemplos:" — o vocabulário já consolidado do Purchase Hub, do Core (`approvePurchaseOrder`) ao HTTP (`POST /purchase-orders/:purchaseOrderId/approve`), usa exclusivamente "ApprovePurchaseOrder"; "ApprovePurchase" (sem "Order") não aparece em nenhum documento ou código já aprovado. Mesma disciplina de `useDisableSupplier` (IMP-204) diante do mesmo tipo de exemplo aproximado.

`useReceivings`, não `useReceiving`. IMP-304 cita "useReceiving()" — mas o endpoint devolve uma lista (`readonly ReceivingResponseDto[]`), nunca um único Receiving; nomeado no plural para refletir fielmente a forma real do dado, mesma disciplina de preservar a Linguagem Ubíqua sobre um nome de exemplo aproximado.

Os demais Hooks seguem literalmente o Command/método correspondente: `useCreatePurchaseOrder`, `useAddPurchaseOrderItem`, `useSendPurchaseOrderToSupplier`, `useCancelPurchaseOrder`, `useRegisterReceiving`, `useCreatePurchaseRequisition`, `useApprovePurchaseRequisition`, `useRejectPurchaseRequisition`, `useConvertRequisitionToPurchaseOrder`, `useCreateReorderRule`, `useDeactivateReorderRule`, `useEvaluateReorderRule` (este último exposto apesar de não ser um dos doze Commands aprovados, mesma disciplina já aplicada pela camada HTTP em IMP-303 — "criar Hooks apenas para endpoints realmente existentes", e este endpoint existe).

---

## 6. Queries

`usePurchaseOrder(purchaseOrderId)` — `GET /purchase-orders/:purchaseOrderId`, chave `["purchase","order",id]`, `undefined` quando ausente.

`usePurchaseOrders(tenantId)` — `GET /purchase-orders/by-tenant/:tenantId/open`, chave `["purchase","orders","open",tenantId]` — a única listagem de Purchase Order que recebe apenas `tenantId`.

`usePurchaseOrdersBySupplier(supplierId)` — `GET /purchase-orders/by-supplier/:supplierId`, chave `["purchase","orders","by-supplier",supplierId]`.

`useReceivings(purchaseOrderId)` — `GET /purchase-orders/:purchaseOrderId/receivings`, chave `["purchase","receivings",purchaseOrderId]`.

`usePurchaseRequisition(requisitionId)` — `GET /purchase-requisitions/:requisitionId`, chave `["purchase","requisition",id]`, `undefined` quando ausente.

`usePurchaseRequisitions(tenantId, status)` — `GET /purchase-requisitions/by-tenant/:tenantId/status/:status`, chave `["purchase","requisitions",tenantId,status]` — `status` obrigatório, refletindo fielmente o contrato do endpoint (`PurchaseManager` não expõe "listar todos os status").

---

## 7. Mutations e Estratégia de Cache

`purchaseCache.ts` — dois helpers principais, `syncPurchaseOrderInCaches`/`syncPurchaseRequisitionInCaches`, mais `appendReceivingInCache`, mesmo padrão de `syncSupplierInCaches` (IMP-204): grava o cache de detalhe diretamente, substitui-ou-acrescenta em toda lista de chave única já cacheada. Nenhum `invalidateQueries`, nenhum optimistic update — nenhum padrão novo inventado, per instrução explícita.

**Onze Mutations sincronizam cache**: `useCreatePurchaseOrder`/`useAddPurchaseOrderItem`/`useApprovePurchaseOrder`/`useSendPurchaseOrderToSupplier`/`useCancelPurchaseOrder` chamam `syncPurchaseOrderInCaches` (detalhe + `openOrdersByTenant` + `ordersBySupplier`); `useCreatePurchaseRequisition`/`useApprovePurchaseRequisition`/`useRejectPurchaseRequisition` chamam `syncPurchaseRequisitionInCaches` (apenas detalhe, ver limitação abaixo); `useRegisterReceiving` chama ambos `syncPurchaseOrderInCaches` (sobre o Purchase Order embutido no resultado composto) e `appendReceivingInCache`; `useConvertRequisitionToPurchaseOrder` chama ambos `syncPurchaseRequisitionInCaches`/`syncPurchaseOrderInCaches` sobre as duas Entidades do resultado composto; `useEvaluateReorderRule` chama `syncPurchaseRequisitionInCaches` condicionalmente (apenas quando `triggered: true`).

**Duas Mutations sem nenhum cache** (`useCreateReorderRule`, `useDeactivateReorderRule`) — nenhuma Query de detalhe/listagem existe para `ReorderRule` em `PurchaseManager`/`apps/api`, mesma razão de `useRegisterSupplierCatalogItem` (IMP-204).

**Limitação documentada, não corrigida — `requisitionsByStatus` nunca sincronizada automaticamente.** Diferente de `openOrdersByTenant`/`ordersBySupplier` (uma única chave por Tenant/Fornecedor, formato já resolvido por `syncSupplierInCaches`), `requisitionsByStatus` é chaveada também pelo `status` da própria Requisition — uma transição real (`Open` → `Approved`) deveria mover a entrada de uma chave de cache para outra, cenário que nenhum Hook do Supplier Hub jamais precisou resolver (nenhuma lista daquele domínio é chaveada por um campo mutável da própria Entidade). Como não existe padrão equivalente já consolidado, per instrução explícita ("Somente utilizar padrões já consolidados. Não inventar"), nenhuma estratégia foi inventada: `syncPurchaseRequisitionInCaches` atualiza somente o cache de detalhe. Testado explicitamente (`usePurchaseMutations.test.tsx`, "sincroniza o cache de detalhe, nunca a lista por status") que a lista da chave antiga permanece desatualizada em cache até uma nova consulta real. Documentado como responsabilidade do futuro Workspace (IMP-305): invalidar/refazer manualmente, ou aceitar a lista desatualizada até a próxima consulta.

---

## 8. Tratamento de Erros

Nenhum tratamento paralelo — `ApiError`/`ApiNetworkError` (`core/http/ApiError.ts`, já existentes, produzidos no servidor por `mapPurchaseError`/`mapDomainError`, IMP-303) propagam normalmente através de toda Mutation/Query; nenhum Hook do Purchase Hub intercepta ou reclassifica erro. `usePurchaseOrder`/`usePurchaseRequisition` usam `undefinedOn404` no `purchaseClient`, não no Hook — mesma camada de todo domínio já existente. 401/404/409/422/500 testados explicitamente contra o servidor real (`purchaseClient.test.ts`) e via mock (`usePurchaseMutations.test.tsx`).

---

## 9. Limitação Conhecida (Obrigatória) — Múltiplos Recebimentos

O IMP-303 documentou (Capítulo 8 daquele relatório) que um segundo `registerReceiving` contra o mesmo Purchase Order falha com um erro real de servidor (`ApiError`, statusCode 500 — bug de Persistência em `SqlitePurchaseOrderRepository.replaceItems`, IMP-302, ainda não corrigido). Esta Sprint **não** simula múltiplos recebimentos, **não** cria nenhum workaround (retry, fila local, merge otimista de recebimentos parciais) e **não** esconde o problema: `purchaseClient.registerReceiving`/`useRegisterReceiving` chamam o endpoint uma única vez e deixam o erro real propagar normalmente ao chamador, exatamente como qualquer outro erro HTTP desta camada — documentado inline em ambos os arquivos. Um teste explícito (`usePurchaseMutations.test.tsx`, "propaga um ApiError 500 real... nenhum workaround") confirma que o erro chega intacto, sem nenhuma tentativa de mascará-lo. A responsabilidade de comunicar essa limitação ao usuário final (ex.: desabilitar um segundo recebimento na UI, ou exibir uma mensagem clara) pertence ao futuro Workspace (IMP-305), nunca a esta camada de infraestrutura.

---

## 10. Qualidade — Comparação com Supplier Hub

**O padrão do Supplier foi seguido integralmente** — mesmo layout de diretório único, mesma separação DTO/Client/QueryKeys/Cache/Hooks, mesmo uso do `apiClient` singleton, mesma disciplina de nomeação (preferir o vocabulário já consolidado do Core/HTTP sobre um exemplo aproximado da própria Sprint), mesma abordagem de teste (integração HTTP real em ambiente Node + Hooks mockados em jsdom, mesma divergência jsdom×`@abp/persistence` já documentada e resolvida por IMP-204).

**Existe código duplicado?** Sim, um real e significativo: `core/purchase/testing/realApiServer.ts` é quase byte-idêntico a `core/supplier/testing/realApiServer.ts` — o arquivo já era inteiramente genérico em IMP-204 (nunca referenciou `Supplier` em nenhuma linha de lógica), então esta Sprint apenas o duplicou fielmente. Candidato real e imediato a `core/http/testing/realApiServer.ts` compartilhado.

**Existe oportunidade de abstração?** Três, nenhuma executada, per instrução explícita ("Não refatorar neste Sprint. Apenas documentar"):
1. `testing/realApiServer.ts` compartilhado entre todos os domínios (Capítulo anterior) — a mais óbvia e de menor risco.
2. `syncSupplierInCaches`/`syncPurchaseOrderInCaches` compartilham a mesma forma exata (`setQueryData` de detalhe + substituir-ou-acrescentar em N listas de chave única) — candidato a um `createEntitySync(detailKey, listKeys, matchBy)` genérico.
3. A limitação de `requisitionsByStatus` (Capítulo 7) não é exclusiva do Purchase Hub — qualquer futuro Hub com uma lista chaveada por um campo de status mutável (Inventory Movement, Production, Fiscal) enfrentará o mesmo problema. Vale uma decisão de padrão explícita numa Sprint futura de consolidação (ex.: um helper `moveEntryBetweenKeyedLists(queryClient, oldKey, newKey, entity, matchBy)`), não inventada agora por não existir ainda nenhum segundo caso real para generalizar a partir de apenas um.

**Existe melhoria reutilizável para todos os futuros Hubs?** Sim, quatro: (1) resultado composto (Capítulo 1) — quando um Manager devolve mais de uma Entidade, a Mutation correspondente deve chamar um helper de sincronização por Entidade embutida, nunca inventar um DTO de cache próprio; (2) correção preventiva do bug de `undefined` em `useQuery` (Capítulo 1) — todo futuro Hook `find*By Id` deve nascer já com `null`/`select`, nunca esperar um teste para descobrir o problema; (3) Hooks para métodos "não-Command" (`evaluateReorderRule`) devem existir sempre que o método for público no Manager, independentemente de corresponder a um dos Commands aprovados; (4) a limitação de lista chaveada por status (Capítulo 7) deve ser avaliada explicitamente na auditoria Passo 1 de todo Hub futuro com Aggregates de máquina de estados múltiplos.

---

## 11. Testes Criados

Três arquivos novos, 38 testes:

| Arquivo | Ambiente | Cobertura |
|---|---|---|
| `purchaseClient.test.ts` | Node, servidor real | Dezenove endpoints exercitados via os quatro fluxos completos (Purchase Order até Received, listagem aberta, Requisition até convertida, rejeição de Requisition, Reorder Rule até desativada); 404 tratado como ausência (dois recursos); 409/422 reais produzidos por `mapPurchaseError`; interceptor de autenticação real (com e sem token) |
| `usePurchaseQueries.test.tsx` | jsdom, mock | Os seis Hooks de Query — chave de cache, `enabled`, 404→undefined |
| `usePurchaseMutations.test.tsx` | jsdom, mock | As treze Mutations — sincronização de cache das onze que possuem cache, ausência documentada de cache das duas restantes, a limitação de `requisitionsByStatus` (Capítulo 7) testada explicitamente, o erro 500 real do Capítulo 9 testado explicitamente sem nenhum workaround |

Nenhum mock usado para validar integração HTTP real — `purchaseClient.test.ts` executa contra uma instância real de `apps/api`, mesma disciplina de `supplierClient.test.ts` (IMP-204).

---

## 12. Cobertura Obtida

`pnpm typecheck`, `pnpm build` e `pnpm lint` verdes. `pnpm test` executado três vezes na raiz do monorepo — **as três execuções passaram integralmente, sem nenhum flake** (177 arquivos de teste, 860 testes em cada uma das três rodadas — 859 passando normalmente mais o `it.fails` de IMP-303, documentando o bug de Persistência já conhecido). `vite build` confirmado sem alteração relevante no tamanho do chunk principal (`index-*.js` inalterado) — nenhum arquivo de `core/purchase/` é alcançável a partir de `main.tsx` ainda (nenhuma Página/Workspace o importa nesta Sprint), mesma garantia estrutural já documentada por IMP-204.

---

## 13. Divergências Encontradas

Nenhuma divergência entre Arquitetura, Core, Persistência, HTTP ou o blueprint do Supplier Hub foi encontrada que exigisse Amendment. A única "correção antecipada" desta Sprint (Capítulo 1 — o bug de `undefined` em `useQuery`) não é uma divergência nova, é a aplicação preventiva de uma lição já registrada em `IMP_204_SUPPLIER_FRONTEND_REPORT.md`, Capítulo 10.

---

## 14. Possíveis Amendments

Nenhum — todas as observações desta Sprint (Capítulo 10) são oportunidades de abstração documentadas, nunca divergências que exigissem mudança em documento Frozen/Official ou em Core/Persistência/HTTP já aprovados.

---

## 15. Preparação para IMP-305 (Workspace)

`core/purchase/` está pronto para ser consumido exclusivamente pelo futuro Workspace — nenhuma Página deve chamar `fetch`/`purchaseClient`/`PurchaseManager` diretamente, apenas os dezenove Hooks aqui expostos, mesma disciplina já validada pelo Supplier Hub (IMP-205 consumiu exclusivamente `core/supplier/`). O Workspace deverá decidir, por conta própria, como comunicar ao usuário a limitação de múltiplos recebimentos (Capítulo 9) e como lidar com a ausência de sincronização automática de `requisitionsByStatus` (Capítulo 7) — nenhuma das duas decisões de UX pertence a esta Sprint de infraestrutura.

---

## 16. Conclusão

O Purchase Hub agora possui infraestrutura Web completa e testada — cliente HTTP para os dezenove endpoints já aprovados, Hooks de Query e Mutation cobrindo cada um deles, Query Keys centralizadas, estratégia de cache documentada (incluindo uma limitação real e honesta, nunca escondida), tratamento de erro reaproveitado sem paralelismo, DTOs deliberadamente duplicados, e a limitação de múltiplos recebimentos herdada de IMP-303 preservada com total transparência, sem workaround. Nenhuma Tela foi construída. O ciclo **Arquitetura → Core → Persistência → HTTP → Frontend** está validado de ponta a ponta para o segundo domínio ERP desta plataforma, confirmando o Objetivo Estratégico desta Sprint — a infraestrutura Frontend do Supplier Hub é genuinamente reutilizável. Pronto para a próxima etapa (IMP-305 — Workspace), repetindo o mesmo ciclo já comprovado pelo Supplier Hub.
