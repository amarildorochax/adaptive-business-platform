# IMP-401 — Inventory Movement Hub Core

**Adaptive Business Platform · Relatório de Implementação**

Status: Concluído · 2026-08-01

---

## Nota de Posicionamento

Este é o primeiro domínio ERP da plataforma implementado integralmente sob `STD-001` —
`docs/standards/ADAPTIVE_DEVELOPMENT_STANDARD.md` e `ADAPTIVE_ENGINEERING_CHECKLIST.md` — usando
Supplier Hub (IMP-201–205) e Purchase Hub (IMP-301–305) como blueprints oficiais. Esta Sprint
implementa exclusivamente o **Core** do Inventory Movement Hub (`packages/inventory-movement-hub`) —
nenhum SQLite, nenhum HTTP, nenhum Frontend, nenhum Workspace. Terceiro domínio da série ERP-001
(Supplier ✅ → Purchase ✅ → Inventory Movement Core ✅), o eixo central do desenho, per
`ERP_ARCHITECTURE.md`, ADR-ERP-002: "é o único novo Hub consumido tanto pelo lado de suprimento
quanto pelo lado de demanda."

---

## Sumário

1. Auditoria Realizada (Passo 1)
2. Aggregate Root
3. Entidades
4. Value Objects
5. Commands
6. Events
7. Repository Interfaces
8. Services
9. Policy, Validator, Factory
10. Testes e Cobertura
11. Divergências Encontradas
12. Decisões Tomadas
13. Qualidade
14. Validação
15. Preparação para IMP-402

---

## 1. Auditoria Realizada (Passo 1)

Leitura integral, não resumida, de todas as fontes obrigatórias: `ERP_ARCHITECTURE.md`,
`INVENTORY_MOVEMENT_HUB.md`, `ERP_CONTEXT_MAP.md`, `DOMAIN_EVENT_CATALOG.md`,
`DOMAIN_OWNERSHIP_MATRIX.md`, `ERP_FOUNDATION_REPORT.md`, `ADAPTIVE_DEVELOPMENT_STANDARD.md`,
`ADAPTIVE_ENGINEERING_CHECKLIST.md`, e os dez relatórios de blueprint (IMP-201–205, IMP-301–305).
Código existente auditado via leitura direta e `grep` completo do monorepo.

**Existe código legado relacionado a Inventory? Sim — achado mais relevante desta auditoria.**
`packages/commerce-hub/src/{Inventory.ts, InventoryRepository.ts, InventoryService.ts}` já implementa
uma Entidade `Inventory` real (identificador, `productId`/`variantId`, `quantity`, `updatedAt`), com
`CommerceManager.adjustInventory` publicando o Evento `StockUpdated`. Este código **não é um
divergência nova** — é exatamente o achado que `INVENTORY_MOVEMENT_HUB.md` já nomeia em sua própria
Nota de Posicionamento Documental como "o documento de reconciliação mais delicado de toda a série" e
resolve via **ADR-IM-001** (Change Request formal contra `COMMERCE_HUB_ARCHITECTURE.md`, Capítulo 25,
nunca executada unilateralmente): o ledger append-only (`StockMovement`) passa a ser propriedade do
Inventory Movement Hub; a leitura simplificada do Commerce Hub (`Inventory`/`StockUpdated`) permanece
como está, tornando-se candidata a projeção derivada apenas quando uma Sprint de integração futura
formalizar esse consumo. **Esta Sprint não tocou nenhuma linha de `packages/commerce-hub`** — Core
isolado, sem nenhuma dependência de código sobre o pacote existente, consistente com a própria
Change Request (proposta, nunca executada) já registrada na arquitetura.

**Existe movimentação parcialmente implementada?** Não — nenhum `StockMovement`/Aggregate de ledger
físico existe em qualquer pacote do monorepo antes desta Sprint (confirmado por `grep` completo);
apenas a leitura simplificada do Commerce Hub, já tratada acima.

**Existe conceito morto?** Nenhum, específico a este Hub.

**Existe duplicação?** Nenhuma — `@abp/inventory-movement-hub` é um pacote novo, sem sobreposição de
Entidade com nenhum Hub já registrado em `DOMAIN_OWNERSHIP_MATRIX.md`.

**Existe oportunidade de reutilização?** O padrão estrutural completo de `PurchaseManager`/
`PurchaseOrderService`/`PurchaseFactory`/`PurchaseValidator`/`PurchasePolicy` (`packages/purchase-hub`)
foi replicado integralmente como blueprint estrutural. `packages/purchase-hub/src/ReorderRule.ts` e
`ReorderEvaluationService.ts` já documentavam, desde IMP-301, a ausência deste Hub como uma limitação
explícita — a existência real de `packages/inventory-movement-hub` a partir de agora não altera
nenhuma linha do Purchase Hub (Frozen para esta Sprint), mas fecha a lacuna que aquele pacote já
esperava (ver Seção 15).

---

## 2. Aggregate Root

**StockMovement** — fato físico único e imutável (`movementId`, `tenantId`, `productId`, `variantId?`,
`locationId?`, `quantityDelta`, `origin`, `originReferenceId?`, `occurredAt`). Nunca editado ou
removido — apenas compensado por um novo `StockMovement` de sinal oposto. `StockMovementRepository`
expõe `append`, deliberadamente nunca `update`.

---

## 3. Entidades

`StockPosition` (Aggregate derivado, nunca escrito diretamente — sempre projeção recalculada de
`StockMovement`/`StockReservation`), `StockReservation` (Aggregate independente, máquina de estados
`Active → Released | ConvertedToMovement`), `StockLocation` (Aggregate independente, Capability
opcional), `StockAlertRule` (Aggregate independente, limiar de alerta).

---

## 4. Value Objects

`MovementOrigin` — enum fechado (`Purchase`, `ProductionConsumption`, `ProductionOutput`,
`SaleFulfillment`, `SaleReturn`, `ManualAdjustment`), com `requiresOriginReference` marcando as duas
origens que exigem correlação rastreável. `QuantityDelta` — inteiro assinado, nunca zero.

---

## 5. Commands

Sete Commands, exatamente `INVENTORY_MOVEMENT_HUB.md`, Capítulo 7: `RegisterStockMovement`,
`CreateStockReservation`, `ReleaseStockReservation`, `ConvertReservationToMovement`,
`CreateStockLocation`, `CreateStockAlertRule`, `DeactivateStockAlertRule`. Nenhum Command adicional
foi criado.

---

## 6. Events

Sete Events, exatamente `DOMAIN_EVENT_CATALOG.md`, seção "Inventory Movement Hub": `InventoryReceived`,
`InventoryReserved`, `InventoryReleased`, `InventoryAdjusted`, `InventoryConsumed`, `InventoryProduced`,
`StockAlertTriggered`. Nenhum Event adicional foi criado.

---

## 7. Repository Interfaces

Cinco interfaces: `StockMovementRepository` (append-only), `StockPositionRepository` (`findByProduct`/
`recalculate`, especificado literalmente pela arquitetura — a aritmética real é responsabilidade da
Persistência), `StockReservationRepository`, `StockLocationRepository` (extensão de implementação —
ver Seção 11), `StockAlertRuleRepository`. Todas apenas contrato — nenhuma implementação SQLite/real
nesta Sprint.

---

## 8. Services

Quatro Services nomeados por `INVENTORY_MOVEMENT_HUB.md`, Capítulo 10: `StockMovementRecordingService`,
`StockPositionProjectionService`, `StockReservationService`, `StockAlertEvaluationService`. Um Service
adicional, `StockLocationService`, foi criado como complementação natural de implementação para o
Aggregate `StockLocation` — mesma disciplina já usada por `SupplierService`/`PurchaseRequisitionService`
em Sprints anteriores (documentado em cada arquivo correspondente).

---

## 9. Policy, Validator, Factory

`InventoryPolicy` — `resolveMovementOriginEvent`, `canTransitionReservationStatus`,
`computeQuantityAvailable`, `shouldTriggerStockAlert`, todas puras. `InventoryValidator` — sete
validações reais, lançando `InventoryDomainError` tipado. `InventoryFactory` — construção de cada
Entidade, isolando geração de identificador e defaults (`status: 'Active'` para nova Reservation,
`active: true` para Location/Alert Rule).

`InventoryDomainError` — sete classes de erro específicas do Hub, nunca reaproveitando
`PurchaseDomainError`/`SupplierDomainError`.

---

## 10. Testes e Cobertura

58 testes, 6 arquivos: `ValueObjects.test.ts` (5), `InventoryDomainError.test.ts` (2),
`InventoryPolicy.test.ts` (10), `InventoryFactory.test.ts` (5), `InventoryValidator.test.ts` (11),
`InventoryMovementManager.test.ts` (25, incluindo o fluxo completo Purchase→Position→Alert,
Reservation→Release/Convert, isolamento por `locationId`, e todo caminho de erro).

**Comparação honesta com o Purchase Hub Core (78 testes):** a diferença não é lacuna de cobertura —
é a proporção real de superfície testável. O Purchase Hub tem três Aggregate Roots com máquinas de
estado de sete e quatro estados, treze Domain Errors e treze métodos de Validator. O Inventory
Movement Hub tem um Aggregate Root append-only (sem máquina de estados própria), um Aggregate derivado
sem Command de escrita, e dois Aggregates independentes com máquinas de estado de três estados cada —
a mesma disciplina de "um teste por transição, um teste por erro, um teste por decisão pura" produz
naturalmente uma contagem menor sobre uma superfície menor. Todo comportamento de negócio documentado
em `INVENTORY_MOVEMENT_HUB.md`, Capítulo 11 ("Regras de Negócio"), tem cobertura direta: imutabilidade
do ledger, `quantityAvailable` nunca negativo, correlação obrigatória de Produção, isolamento por
`locationId`.

---

## 11. Divergências Encontradas

**1. Três Commands sem Evento catalogado.** `CreateStockLocation`, `CreateStockAlertRule`,
`DeactivateStockAlertRule` não têm Evento correspondente em `DOMAIN_EVENT_CATALOG.md` (que cataloga
apenas sete Eventos, nenhum referente a `StockLocation` ou à criação/desativação de `StockAlertRule`).
Tratados retornando `events: []`, nunca um Evento inventado — mesma disciplina de
`AddPurchaseOrderItem`/`CreateReorderRule` no Purchase Hub. Documentado em `InventoryCommand.ts`.

**2. `StockPositionRepository`/`StockReservationRepository` não incluem `variantId` como parâmetro de
consulta.** `INVENTORY_MOVEMENT_HUB.md`, Capítulo 9, especifica `findByProduct(productId, locationId?)`
literalmente — mesmo `StockMovement`/`StockPosition`/`StockReservation` carregando `variantId` como
campo próprio (Capítulo 5). Esta Sprint implementou o contrato exatamente como especificado, sem
adicionar um parâmetro não previsto pela arquitetura — uma consulta por `variantId` específico não é
possível nesta Fase. Documentado em `testing/InMemoryFakes.ts` e recomendado como item de Amendment
contra `INVENTORY_MOVEMENT_HUB.md` antes de IMP-402, nunca corrigido silenciosamente aqui.

**3. `StockAlertRuleRepository.findActiveByProduct` usa `undefined`, não `null`.** A arquitetura
descreve o retorno como `StockAlertRule | null` (pseudocódigo); todo Repository Interface já existente
no monorepo (Purchase Hub, Supplier Hub) usa `| undefined` para "ausência", nunca `| null` — esta
Sprint seguiu a convenção já estabelecida no código real, não a notação literal do documento de
arquitetura, decisão de alinhamento interno documentada aqui.

**4. `StockLocationRepository` não é especificado por `INVENTORY_MOVEMENT_HUB.md`, Capítulo 9** (que
nomeia apenas quatro dos cinco Repositories necessários) — extensão de implementação necessária para o
Command `CreateStockLocation` ter onde persistir, documentada em `StockLocationRepository.ts`.

Nenhuma divergência exigiu Amendment formal contra documento Official/Frozen — todas são
complementações de implementação sobre um documento ainda Draft (`INVENTORY_MOVEMENT_HUB.md`), o
próprio processo que aquele documento antecipa.

---

## 12. Decisões Tomadas

**Orquestração em três Services no Manager** (`registerStockMovement`/`convertReservationToMovement`
chamam `movements` → `positions` → `alerts` em sequência) — diferente do Purchase Hub, onde cada
Command mapeava a um único Service. Decisão registrada em `InventoryMovementManager.ts`: o próprio
Capítulo 12 de `INVENTORY_MOVEMENT_HUB.md` já descreve esta cadeia como três responsabilidades
sequenciais e independentes, cada uma já nomeada como Service próprio no Capítulo 10 — mantê-las
distintas e compor apenas no Manager preserva Alta Coesão, consistente com `ADAPTIVE_DEVELOPMENT_STANDARD.md`,
Capítulo 5.

**`StockAlertEvaluationService.evaluate` recebe `quantityOnHand` como parâmetro explícito**, mesmo já
existindo `StockPositionRepository` no mesmo Hub — porque `InventoryMovementManager` já tem o
`StockPosition` recém-recalculado em mãos no momento da chamada, tornando uma segunda consulta
redundante. Diferente da razão pela qual `ReorderEvaluationService.evaluate` (Purchase Hub) recebe
`currentQuantity` — lá, nenhuma fonte real existia.

**`StockReservationService.convertToMovement` constrói o `StockMovement` diretamente via
`InventoryFactory`**, sem invocar `StockMovementRecordingService` — evita reentrância de Service para
Service, mesmo padrão de `PurchaseRequisitionService.convertToPurchaseOrder`.

---

## 13. Qualidade

**STD-001 foi seguido integralmente?** Sim — ciclo de fases respeitado (apenas Core), Passo 1
executado e documentado, `core/{domain}` não aplicável nesta fase (Frontend fora de escopo).

**Checklist aprovado?** Sim — as dez perguntas de `ADAPTIVE_ENGINEERING_CHECKLIST.md` respondidas
implicitamente ao longo deste relatório (arquitetura respeitada, auditoria realizada, blueprint
seguido, sem duplicação, sem abstração especulativa, limitações documentadas, testes completos,
Workspace/HTTP não aplicáveis, documentação atualizada).

**Existe duplicação?** Não.

**Existe abstração reutilizável?** O padrão `{Domain}OperationResult<T> = {result, command, events}` e
a divisão Policy/Validator/Factory/Service/Manager já são, a partir de STD-001, o próprio Standard —
nada novo a generalizar aqui além do que já está codificado.

**Existe melhoria para Supplier/Purchase?** Não executada (fora de escopo — "Não refatorar"). Uma
observação registrada para uma Sprint futura de integração: `packages/purchase-hub/src/ReorderRule.ts`
documenta explicitamente, desde IMP-301, que aguarda a existência real deste Hub para consumir
`StockPosition` de verdade em vez de receber `currentQuantity` como parâmetro do chamador — essa
integração passa a ser possível a partir de agora, mas não foi executada nesta Sprint (Purchase Hub
permanece Frozen).

---

## 14. Validação

`pnpm typecheck`, `pnpm build`, `pnpm lint`, `pnpm test` executados três vezes na suíte completa do
monorepo (24 pacotes/apps). Runs 1 e 2: totalmente limpos, 926 testes passando + 1 `it.fails` esperado
(IMP-303) = 927. Run 3: um flake isolado e confirmado —
`apps/web/src/app/router/routes.test.tsx > renderiza o Dashboard na rota raiz`, falha de timing sob
carga plena da suíte (não reproduz quando o arquivo roda isolado, confirmado por reexecução direta).
Pré-existente, em `apps/web`, sem nenhuma relação com `packages/inventory-movement-hub` — nenhum
arquivo tocado por esta Sprint tem qualquer relação com roteamento ou com o Dashboard. Documentado,
não corrigido (fora do escopo desta Sprint de Core isolado).

---

## 15. Preparação para IMP-402

O pacote `@abp/inventory-movement-hub` está pronto para receber persistência real
(`StockMovementRepository`/`StockPositionRepository`/`StockReservationRepository`/
`StockLocationRepository`/`StockAlertRuleRepository` → `Sqlite*Repository`), seguindo exatamente o
blueprint de IMP-302 (`packages/persistence`, migração idempotente numerada, FK dentro do mesmo Hub,
transação por escrita multi-tabela). Dois pontos de atenção já identificados para aquela Sprint:

1. `StockPositionRepository.recalculate` é, por desenho desta Sprint, delegado inteiramente à
   Persistência — a Sprint de Persistência deve implementar a soma real via `SUM(quantity_delta)` em
   SQL sobre `stock_movements`, nunca recarregar todas as linhas para somar em memória no Core.
2. A limitação de `variantId` documentada na Seção 11.2 deve ser resolvida ali, ou formalmente adiada
   via Amendment, antes de IMP-402 assumir silenciosamente uma granularidade que a interface atual não
   suporta.

Após a Persistência, a Sprint seguinte natural é a integração real entre Hubs (Purchase Hub consumindo
`StockPosition` de verdade para `ReorderRule`, Commerce Hub consumindo `InventoryAdjusted` para sua
própria projeção de `Inventory`) — ainda não uma Sprint deste ciclo, mas agora tecnicamente possível
pela primeira vez na história da plataforma.
