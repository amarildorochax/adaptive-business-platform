# IMP-501 — Production Hub Core

**Adaptive Business Platform · Relatório de Implementação**

Status: Completo
Data: 2026-08-04
Escopo: exclusivamente Core (`packages/production-hub`) — Arquitetura, Persistência, HTTP, Frontend e
Workspace permanecem fora de escopo, per instrução explícita desta Sprint.

---

## Nota de Posicionamento

Este relatório documenta a implementação do **Production Hub Core** — o quarto domínio ERP da
plataforma, seguindo Supplier Hub (IMP-201), Purchase Hub (IMP-301) e Inventory Movement Hub
(IMP-401), todos já completos. Segue rigorosamente `STD-001`
(`docs/standards/ADAPTIVE_DEVELOPMENT_STANDARD.md`, `ADAPTIVE_ENGINEERING_CHECKLIST.md`) e o
blueprint arquitetural `PRODUCTION_HUB.md` (Draft, Sprint ERP-001).

Nenhuma camada além do Core foi tocada. Nenhuma convenção já consolidada pelos três Cores anteriores
foi redefinida.

---

## Sumário

1. Auditoria Realizada (Passo 1)
2. Aggregates
3. Entidades e Value Objects
4. Commands
5. Events
6. Repository Interfaces
7. Services e Manager
8. Policy, Validator, Factory
9. Testes e Cobertura
10. Divergências Encontradas
11. Decisões Tomadas
12. Qualidade (10 Perguntas Oficiais)
13. Validação
14. Preparação para IMP-502

---

## 1. Auditoria Realizada (Passo 1)

Executada antes de qualquer código, comparando Arquitetura → Código existente → Supplier Hub →
Purchase Hub → Inventory Movement Hub, per `STD-001`, Capítulo 3.

**Existe código relacionado à Produção?** Não. Uma busca case-insensitive por
`production|productionorder|workorder|billofmaterials|BOM|manufactur|productionstep` em toda a árvore
`platform/` (excluindo `dist/`) retornou apenas falsos positivos: (a) a palavra "production" como nome
de ambiente (`NODE_ENV`-style) em `apps/api/src/security/authConfig.ts` e
`packages/persistence/src/db/config.ts`; e (b) referências deliberadamente antecipadas dentro do
**Inventory Movement Hub**, que já modela `MovementOrigin` incluindo os valores `'ProductionConsumption'`
e `'ProductionOutput'` (`packages/inventory-movement-hub/src/MovementOrigin.ts`), a regra
`MovementOriginReferenceRequiredError` que exige `originReferenceId` para essas origens
(`InventoryDomainError.ts`), e o mapeamento `resolveMovementOriginEvent` (`InventoryPolicy.ts`) — um
contrato de string opaca desenhado para receber os Eventos futuros do Production Hub sem que este
precisasse existir ainda. Nenhum tipo, classe ou stub de `ProductionOrder`/`BillOfMaterials`/
`WorkCenter`/`Batch`/`Lot` existia em lugar algum.

**Existe conceito parcialmente implementado?** Sim — o gap que motivou a criação de
`PRODUCTION_HUB.md` foi originalmente identificado pela auditoria de FUN-104
(`docs/implementation/FUN_104_PRODUCT_HUB_WORKSPACE_REPORT.md`): zero modelagem de
Composição/BOM em `packages/commerce-hub`, apesar de um componente `CompositionCard` já ter sido
construído genérico e pronto para reuso, nunca conectado a dado real
(`NotConnectedNotice`/`EmptyState`). `FUN_105_INVENTORY_WORKSPACE_REPORT.md`, linha 144, registra a
mesma lacuna do ponto de vista do Workspace de Inventário. Este Core não conecta `CompositionCard` —
isso é explicitamente trabalho de uma Sprint futura de Frontend (IMP-504), fora de escopo aqui — mas
`BillOfMaterials`/`BOMLine` são exatamente o modelo de dados que o desbloqueará.

**Existe duplicação?** Não. Nenhum outro Hub possui um Aggregate `BillOfMaterials`, `ProductionOrder`
ou `WorkCenter`. `DOMAIN_OWNERSHIP_MATRIX.md` (pré-ERP, Official) não lista Production Hub — omissão já
rastreada como Change Request pendente em `ERP_ARCHITECTURE.md`, §9, item 2 ("adicionar Purchase Hub,
Supplier Hub, Inventory Movement Hub, Production Hub e Fiscal Hub como 15º a 19º proprietários, quando
os cinco documentos desta Sprint avançarem de Draft para Official") — não uma omissão desta Sprint,
nada corrigido aqui.

**Existe oportunidade de reutilização?** O padrão estrutural flat `src/`, um arquivo por conceito, é
integralmente reutilizado dos três Cores anteriores (ver Seção 11). Nenhuma abstração cross-hub nova
foi extraída — `IMP_301_PURCHASE_HUB_CORE_REPORT.md`, linha 137, já havia sinalizado
`createStateMachine<TStatus>(edges)` como candidata para "Inventory Movement Hub ou Production Hub, os
próximos domínios"; esta Sprint **não** extrai essa abstração (apenas dois usos reais de máquina de
estados existiriam simultaneamente até este ponto contando só Production — a Regra de Três Ocorrências
de `STD-001`, Capítulo 14, ainda não foi atingida somando os quatro Hubs; ver Seção 11).

**Existe oportunidade de abstração?** Nenhuma nova extraída por esta Sprint — mesma resposta acima,
documentada, não silenciosamente ignorada.

**Existe melhoria para o Development Standard?** Uma observação: `IMP_405_INVENTORY_MOVEMENT_WORKSPACE_REPORT.md`,
§19, já antecipava corretamente que `ProductionOrder` teria "mais provavelmente... o padrão de máquina
de estados (como Supplier/Purchase)" — confirmado por esta Sprint (`ProductionStatus`: `Planned` →
`InProgress` → `Completed`/`Cancelled`) — e não o padrão de ledger append-only do próprio Inventory
Movement Hub. Nenhuma mudança ao Standard document proposta; a previsão já registrada se confirmou.

**Existe conflito de ownership?** Não. `Product`/`Variant` permanecem exclusivamente do Commerce Hub
(nunca criados por este Core — toda `BOMLine`/`ProductionOutput` referencia por identificador opaco);
`Stock Movement` permanece exclusivamente do Inventory Movement Hub (este Core nunca grava
movimentação de estoque diretamente). Ambos os limites, já declarados por `PRODUCTION_HUB.md`, Capítulo
3, são respeitados integralmente pela implementação (ver Seção 11 para a análise completa de acoplamento).

---

## 2. Aggregates

Três Aggregates, exatamente como especificado por `PRODUCTION_HUB.md`, Capítulo 4:

- **`BillOfMaterials`** (`BillOfMaterials.ts`) — Aggregate independente, associado a exatamente um
  `outputProductId`; versionada, nunca editada in-place (ADR-PD-002). Contém `BOMLine[]` como parte
  interna.
- **`ProductionOrder`** (`ProductionOrder.ts`) — Aggregate Root do ciclo de execução; referencia
  exatamente uma `BillOfMaterials`; agrupa `ProductionConsumption[]`/`ProductionOutput[]` como parte
  interna; única Entidade deste domínio referenciada por identificador por Inventory Movement Hub e
  Financial Hub.
- **`WorkCenter`** (`WorkCenter.ts`) — Aggregate independente e opcional, mesma Capability opcional já
  aplicada por `StockLocation` (Inventory Movement Hub).

## 3. Entidades e Value Objects

- **`BOMLine`** (`BOMLine.ts`) — Value Object imutável, parte interna de `BillOfMaterials.lines`, nunca
  referenciado por identificador próprio, mesma disciplina de `ReceivingLine`.
- **`ProductionConsumption`** (`ProductionConsumption.ts`) — registro imutável, parte interna de
  `ProductionOrder.consumptions`, sem Repository próprio (ver Seção 11, divergência do campo
  `acquisitionCost`).
- **`ProductionOutput`** (`ProductionOutput.ts`) — registro imutável, parte interna de
  `ProductionOrder.outputs`, sem Repository próprio.
- **`UnitOfMeasure`** (`UnitOfMeasure.ts`) — Value Object, enum fechado `'Unit' | 'Kilogram' | 'Liter' |
  'Meter'`, os quatro exemplos citados literalmente por `PRODUCTION_HUB.md`, Capítulo 6.
- **`ProductionStatus`** (dentro de `ProductionOrder.ts`) — enum fechado `'Planned' | 'InProgress' |
  'Completed' | 'Cancelled'`.
- **`BillOfMaterialsStatus`** (dentro de `BillOfMaterials.ts`) — enum fechado `'Active' | 'Superseded'`.

## 4. Commands

Os nove Commands exatos de `PRODUCTION_HUB.md`, Capítulo 7 (`ProductionCommand.ts`):
`CreateBillOfMaterials`, `SupersedeBillOfMaterials`, `CreateProductionOrder`, `StartProduction`,
`RegisterProductionConsumption`, `RegisterProductionOutput`, `CompleteProduction`, `CancelProduction`,
`CreateWorkCenter`. Todos processados exclusivamente por `ProductionManager`.

## 5. Events

Os sete Eventos exatos de `DOMAIN_EVENT_CATALOG.md`/`PRODUCTION_HUB.md`, Capítulo 8
(`ProductionEvent.ts`): `BillOfMaterialsCreated`, `BillOfMaterialsSuperseded`, `ProductionStarted`,
`ProductionConsumption`, `ProductionOutput`, `ProductionCompleted`, `ProductionCancelled`. Nenhum
Evento adicional foi criado.

## 6. Repository Interfaces

As três interfaces exatas de `PRODUCTION_HUB.md`, Capítulo 9 (`BillOfMaterialsRepository.ts`,
`ProductionOrderRepository.ts`, `WorkCenterRepository.ts`) — apenas interface, nenhuma implementação
de persistência (escopo de IMP-502). Assinaturas seguem literalmente o pseudocódigo do Capítulo 9 (sem
parâmetro `tenantId` adicional — ver Seção 11).

## 7. Services e Manager

- **`BillOfMaterialsService`** — encapsula versionamento, nomeado explicitamente pelo Capítulo 10.
- **`ProductionExecutionService`** — orquestra todo o ciclo de vida de `ProductionOrder` (criação,
  início, consumo, geração, conclusão, cancelamento) e as duas consultas de custo/quantidade
  consolidada; nomeado explicitamente pelo Capítulo 10.
- **`WorkCenterService`** — complementação natural para o Aggregate `WorkCenter`, sem Service nomeado
  pela arquitetura, mesma disciplina de `StockLocationService` (Inventory Movement Hub).
- **`ProductionManager`** — única fachada pública; todo Command passa exclusivamente por ele; nenhum
  Event Bus real é publicado (retornado ao chamador, mesmo padrão de `InventoryMovementManager`).

## 8. Policy, Validator, Factory

- **`ProductionPolicy`** — decisões puras: `canTransitionProductionOrderStatus`,
  `canRegisterProductionConsumption`/`canRegisterProductionOutput`, `hasSufficientInput`,
  `computeTotalConsumedCost`, `computeTotalGeneratedQuantity`. Nenhuma lança exceção.
- **`ProductionValidator`** — validação real, lança `ProductionDomainError` tipado, consultando a
  Policy antes de decidir.
- **`ProductionFactory`** — construção de toda Entidade (`createBillOfMaterials`,
  `createProductionOrder`, `createProductionConsumption`, `createProductionOutput`,
  `createWorkCenter`), zero regra de negócio.
- **`ProductionDomainError`** — hierarquia tipada de 12 subclasses, cada `code` prefixado
  `PRODUCTION_`, nunca reutilizando erro de outro Hub.

---

## 9. Testes e Cobertura

Seis arquivos de teste, mesmo número do blueprint mais próximo (Inventory Movement Hub, que também
concentra cobertura em Policy/Validator/Factory/DomainError/Manager, sem arquivo de teste por Service
— ver Seção 11):

| Arquivo | Foco |
|---|---|
| `ProductionDomainError.test.ts` | hierarquia, `code` único, `name`, mensagens |
| `ProductionPolicy.test.ts` | máquina de estados, `hasSufficientInput`, somas consolidadas |
| `ProductionValidator.test.ts` | toda regra de negócio lançando o Domain Error específico |
| `ProductionFactory.test.ts` | defaults, geração de identificador, preservação de campos opcionais |
| `ValueObjects.test.ts` | `isValidBOMLine`/`isValidProductionConsumption`/`isValidProductionOutput` |
| `ProductionManager.test.ts` | orquestração de ponta a ponta via `InMemoryFakes` — BOM create/supersede, ciclo completo de ProductionOrder (create → start com insumo insuficiente e suficiente → consumo → geração → completar/cancelar), queries |

**Resultado:** 77 testes, 100% aprovados, executado três vezes consecutivas sem nenhuma flake (Seção
13). `pnpm test` (workspace completo): 197 arquivos de teste, 1124 testes aprovados + 1 falha esperada
(`it.fails`, bug de IMP-302/303 já documentado, não relacionado a esta Sprint) — mesmo total nas três
execuções.

**Comparação com Inventory Movement Hub** (referência de cobertura per instrução desta Sprint): IMH
teve 5 arquivos de teste de unidade (`InventoryDomainError`/`InventoryFactory`/`InventoryPolicy`/
`InventoryValidator`/`ValueObjects`) + 1 de orquestração (`InventoryMovementManager`) = 6 arquivos.
Production Hub Core replica exatamente essa distribuição (6 arquivos), cobrindo adicionalmente cenários
que IMH não precisou exercitar por não ter máquina de estados própria: toda transição rejeitada de
`ProductionStatus`, o caminho de insumo insuficiente (`started: false`, sem Evento), e as duas regras
de guarda com checagem específica-antes-de-genérica (`ensureCanCompleteProduction`/
`ensureCanCancelProduction`).

---

## 10. Divergências Encontradas

Per `STD-001`: Arquitetura → Auditoria → Amendment → Implementação. Nenhuma corrigida silenciosamente.

**1. `ProductionConsumption` não lista `acquisitionCost` como campo (Capítulo 5), mas
`DOMAIN_EVENT_CATALOG.md` exige "acquisitionCost de origem" no payload conceitual do Evento
`ProductionConsumption`, e `ProductionCompleted` exige "custo total consumido" — uma soma só computável
se cada registro carregar seu próprio custo.** Resolução: `acquisitionCost: number` adicionado como
campo próprio de `ProductionConsumption`, recebido como parâmetro explícito de
`RegisterProductionConsumption` (nunca calculado internamente, nunca consultado a outro Hub — ver
Divergência 2). Documentado em `ProductionConsumption.ts`.

**2. `PRODUCTION_HUB.md`, Capítulo 10/11, descreve `ProductionExecutionService` "consultando Stock
Position, Inventory Movement Hub, por Query já exposta" antes de `StartProduction`; a instrução desta
Sprint determina explicitamente "Caso algum Command dependa do estoque, receber os dados como
parâmetro. Nunca consultar Inventory Movement."** Resolução: `start(productionOrderId,
availableQuantities: ReadonlyMap<string, number>)` recebe a disponibilidade como parâmetro explícito
do chamador, nunca importando `@abp/inventory-movement-hub`. Mesmo padrão já precedente em
`ReorderEvaluationService.evaluate(ruleId, currentQuantity)` (Purchase Hub) — a Query real ao
Inventory Movement Hub é responsabilidade de uma camada de composição futura (HTTP/integração), fora
do escopo de um pacote de domínio Core. Insumo insuficiente resulta em `{ started: false }`, nunca uma
exceção — leitura literal de "resulta em ProductionOrder permanecendo Planned, nunca iniciada
silenciosamente com déficit" como resultado de negócio válido, não erro. Documentado em
`ProductionPolicy.hasSufficientInput`.

**3. Origem de `ProductionOrder` (Capítulo 5: "orderId do Commerce Hub... ou Manual").** Resolução:
modelada como `orderId?: string` simples (presente = reativa a uma venda; ausente = reabastecimento
manual), não como união discriminada com payload — a própria assinatura de
`ProductionOrderRepository.findByOrigin(orderId)` (Capítulo 9) confirma essa leitura. Documentado em
`ProductionOrder.ts`.

**4. `BillOfMaterialsRepository.findActiveByProduct`/`findById` e `WorkCenterRepository.findActive`
(Capítulo 9) não recebem `tenantId`, apesar de todo Aggregate carregar `tenantId` como isolamento
absoluto entre Empresas.** Resolução: implementado literalmente como especificado, sem parâmetro
adicional — mesma disciplina já aplicada por `StockMovementRepository.findByProduct` (IMP-401, que
documenta a mesma limitação para `variantId`). Isolamento entre Tenants para estas consultas é
responsabilidade de uma Sprint futura de Persistência (IMP-502), nunca resolvido silenciosamente
adicionando um parâmetro aqui. Documentado em `BillOfMaterialsRepository.ts`/`WorkCenterRepository.ts`.

**5. `CreateProductionOrder` e `CreateWorkCenter` não possuem Evento correspondente em
`DOMAIN_EVENT_CATALOG.md`** (que cataloga apenas sete Eventos, nenhum para criação de `ProductionOrder`
ou `WorkCenter`). Resolução: `ProductionManager` retorna `events: []` para ambos, nunca um Evento
inventado — mesmo padrão de `CreateStockLocation`/`CreateStockAlertRule` (IMP-401) e
`AddPurchaseOrderItem`/`CreateReorderRule` (IMP-301). Documentado em `ProductionCommand.ts`.

**6. Payload de Evento minimalista vs. "Payload conceitual" do catálogo.** `DOMAIN_EVENT_CATALOG.md`
descreve payloads ricos para os sete Eventos (ex.: "quantidade consumida, acquisitionCost de origem"
para `ProductionConsumption`; "custo total consumido, quantidade gerada" para `ProductionCompleted`).
Resolução: `ProductionEvent` carrega apenas identificadores de correlação
(`billOfMaterialsId`/`productionOrderId`/`inputProductId`/`outputProductId`), nunca dado de negócio
duplicado — mesma disciplina de minimalismo referencial já aplicada por `InventoryEvent` (que também
omite campos como quantidade apesar de listados no "Payload conceitual" do próprio catálogo, ex.
`InventoryReceived`/`InventoryProduced`). Consumidor consulta o Aggregate completo via
`ProductionManager` (ex.: `getTotalConsumedCost`/`getTotalGeneratedQuantity`) quando precisar do dado
consolidado. Documentado em `ProductionEvent.ts`.

**7. Regra de Três Ocorrências (`STD-001`, Capítulo 14) para `createStateMachine<TStatus>(edges)`,
candidata já sinalizada por IMP-301.** Este Core introduz a segunda máquina de estados fechada real do
tipo `canTransitionXStatus(from, to): boolean` de formato idêntico (Supplier/Purchase já tinham a
primeira e a segunda contando `PurchaseOrder`+`PurchaseRequisition`; Inventory Movement Hub tem uma
terceira em `StockReservation`). Mesmo com múltiplas ocorrências já existentes, esta Sprint **não**
extrai a abstração — mudança estrutural cross-hub está fora do escopo de "somente Core" desta Sprint,
per instrução explícita ("é proibido alterar Arquitetura... nenhuma alteração poderá ser feita fora do
escopo do Core"). Sinalizado para uma Sprint de consolidação transversal futura, mesma recomendação já
registrada por `IMP_405_INVENTORY_MOVEMENT_WORKSPACE_REPORT.md`, §18.

---

## 11. Decisões Tomadas

**Nenhum Service próprio para `ProductionConsumption`/`ProductionOutput`.** Ambos são partes internas
de `ProductionOrder` (Capítulo 4: "agrupa... como parte interna"; Capítulo 9 não lista Repository
próprio para nenhum dos dois) — toda a lógica de registro vive em `ProductionExecutionService`, nunca
um Service por Entidade sem Aggregate próprio, mesma disciplina de `PurchaseOrderItem` nunca tendo
Service próprio dentro de `PurchaseOrderService`.

**`ProductionExecutionService` concentra todo o ciclo de vida de `ProductionOrder`.** Diferente de
Purchase Hub (que separa `PurchaseOrderService` de `ReceivingService` para dois Aggregates distintos),
`PRODUCTION_HUB.md` nomeia um único Service para todo o Aggregate `ProductionOrder` — create, start,
registerConsumption, registerOutput, complete, cancel, e as duas consultas de soma consolidada residem
juntos, uma única responsabilidade coerente ("orquestrar o ciclo de execução"), mesma leitura já
aplicada por `ReorderEvaluationService` concentrando criar/desativar/avaliar em um único Service
(Purchase Hub) quando a arquitetura nomeia apenas um Service para um Aggregate.

**`WorkCenterRepository.save` é usado tanto para criar quanto (potencialmente) atualizar; nenhum método
`deactivate` foi implementado.** `PRODUCTION_HUB.md` não lista nenhum Command de desativação de
`WorkCenter` (diferente de `DeactivateStockAlertRule`, que existe explicitamente para
`StockAlertRule`) — nenhum método além de `create`/`listActive` foi adicionado, evitando inventar um
Command não aprovado.

**Nenhuma validação de que `workCenterId` (opcional, em `CreateProductionOrder`) referencia um
`WorkCenter` ativo existente.** `PRODUCTION_HUB.md` não especifica essa regra explicitamente — mantida
ausente para não inventar uma regra de negócio não escrita, mesma disciplina conservadora aplicada em
todos os Cores anteriores.

**`acquisitionCost` tratado como valor total já observado para a quantidade consumida na linha (não um
custo unitário).** Leitura literal de "soma do acquisitionCost dos insumos consumidos" (Capítulo 3) —
soma direta dos valores, sem multiplicação por quantidade.

**`BillOfMaterials.lines` não exige tamanho mínimo (Aggregate pode, tecnicamente, ser criado sem
nenhuma linha).** Nenhuma regra explícita da arquitetura exige um mínimo — cada `BOMLine` individual é
validada (`quantityPerOutputUnit > 0`), mas a coleção em si não tem tamanho mínimo imposto, evitando
inventar uma restrição estrutural não escrita.

---

## 12. Qualidade (10 Perguntas Oficiais)

Per `ADAPTIVE_ENGINEERING_CHECKLIST.md`:

1. **Arquitetura respeitada?** Sim — todo Aggregate, Entidade, Value Object, Command, Event e
   Repository Interface corresponde exatamente a `PRODUCTION_HUB.md`. Sete divergências reais
   documentadas na Seção 11, nenhuma resolvida silenciosamente.
2. **Auditoria realizada?** Sim — Seção 1, executada antes de qualquer código.
3. **Blueprint seguido?** Sim — estrutura flat `src/`, `Manager` como única fachada, `{result, command,
   events}`, `Policy`/`Validator`/`Factory` separados, `testing/InMemoryFakes.ts` fora do barrel —
   idêntico a Supplier/Purchase/Inventory Movement Hub.
4. **Código duplicado?** Não. Nenhum tipo, Domain Error ou lógica reutilizada de outro Hub.
5. **Componentes reutilizados?** Sim, no nível de padrão estrutural (não de código importado) — mesmo
   formato de `{Domain}Manager`/`{Domain}Policy`/`{Domain}Validator`/`{Domain}Factory`/
   `{Domain}DomainError` dos três Cores anteriores.
6. **Limitações documentadas?** Sim — Seção 11, sete divergências, cada uma com resolução justificada
   e precedente citado.
7. **Testes completos?** Sim — 77 testes cobrindo toda Entidade, Value Object, Command, Event (via
   Manager), Factory, Policy, Validator, Service (via Manager) e a hierarquia de Domain Error. Ver
   Seção 10 para comparação com Inventory Movement Hub.
8. **OpenAPI validada?** Não aplicável — este Core não expõe HTTP (fora de escopo desta Sprint).
9. **Workspace sem acesso direto ao HTTP?** Não aplicável — este Core não possui Frontend/Workspace
   (fora de escopo desta Sprint).
10. **Documentação atualizada?** Sim — este relatório; nenhum documento de arquitetura foi alterado
    (nenhuma correção silenciosa; toda divergência documentada aqui, não no documento de origem).

**Existe melhoria para Supplier?** Nenhuma identificada.

**Existe melhoria para Purchase?** Nenhuma identificada.

**Existe melhoria para Inventory Movement?** Nenhuma identificada — o contrato `MovementOrigin`
already construído por IMP-401 para receber `ProductionConsumption`/`ProductionOutput` provou-se
suficiente sem nenhuma alteração.

Per instrução desta Sprint: nenhuma refatoração foi realizada — apenas documentação das observações
acima.

---

## 13. Validação

`pnpm typecheck`, `pnpm build`, `pnpm lint` e `pnpm test` executados três vezes consecutivas sobre o
workspace completo (25 pacotes + 2 apps):

| Execução | typecheck | build | lint | test |
|---|---|---|---|---|
| 1 | ✅ 0 erros | ✅ 0 erros | ✅ 0 erros | ✅ 197 arquivos, 1124 aprovados + 1 falha esperada |
| 2 | ✅ 0 erros | ✅ 0 erros | ✅ 0 erros | ✅ 197 arquivos, 1124 aprovados + 1 falha esperada |
| 3 | ✅ 0 erros | ✅ 0 erros | ✅ 0 erros | ✅ 197 arquivos, 1124 aprovados + 1 falha esperada |

**Nenhuma flake observada** — resultado idêntico nas três execuções. A única falha (`it.fails`) é o
bug de duplo `registerReceiving` sobre o mesmo Purchase Order já documentado por IMP-303
(`docs/implementation/IMP_303_PURCHASE_HTTP_API_REPORT.md`), pré-existente, não relacionado a esta
Sprint. `pnpm lint` só
executa sobre `apps/api`/`apps/web` (nenhum pacote de domínio, incluindo os três Cores anteriores,
define script `lint` — `packages/production-hub` segue a mesma ausência, consistente com o
precedente, não uma omissão desta Sprint).

---

## 14. Preparação para IMP-502

`packages/production-hub` está pronto para receber persistência real (SQLite, `node:sqlite`), mesmo
molde de IMP-202/IMP-302/IMP-402:

- `ProductionOrder` é uma máquina de estados (não um ledger append-only) — a tabela de persistência
  seguirá o molde de `purchase_orders` (IMP-302), não o de `stock_movements` (IMP-402).
- `ProductionConsumption`/`ProductionOutput`, sem Repository próprio, serão persistidos como tabelas
  filhas de `production_orders` via FK simples (`production_order_id`), mesmo molde de
  `purchase_order_items` — nunca uma tabela própria com Repository Interface adicional não prevista
  pela arquitetura.
- `BillOfMaterials`/`ProductionOrder` têm uma relação lógica (`ProductionOrder.billOfMaterialsId`) sem
  FK declarada explicitamente pela arquitetura (Capítulo 9 não menciona FK) — decisão de usar ou não
  uma FK real de banco fica para IMP-502, seguindo o precedente de IMP-302 (FK real entre
  `PurchaseOrder`↔`PurchaseRequisition`) vs. IMP-402 (zero FK entre os cinco Aggregates de Inventory
  Movement Hub, apenas correlação por valor) — ambos precedentes válidos, a decisão dependerá de como
  a persistência real de IMP-502 avaliar a necessidade de integridade referencial forçada.
  documentado aqui como pergunta em aberto, não resolvida silenciosamente por este Core.
- A Divergência 4 (Seção 10 — ausência de `tenantId` nas consultas de `BillOfMaterialsRepository`/
  `WorkCenterRepository`) precisará de uma decisão explícita em IMP-502: adicionar o parâmetro ausente
  da arquitetura (desviando do pseudocódigo literal, como uma Amendment formal) ou aceitar que o
  isolamento de Tenant seja garantido por outra camada (ex.: uma conexão de banco já escopada por
  Tenant). Recomendado avaliar antes de escrever a migration.
- A Divergência 2 (Query real a `Stock Position` do Inventory Movement Hub) permanece resolvida como
  parâmetro explícito neste Core — uma Sprint de integração futura (possivelmente IMP-503, HTTP API,
  compondo `ProductionManager` e `InventoryMovementManager` na mesma camada de aplicação) decidirá como
  essa Query real é conectada, nunca importando um pacote de domínio dentro de outro.

Ao final desta Sprint: Supplier Hub ✅, Purchase Hub ✅, Inventory Movement Hub ✅, **Production Hub
Core ✅** — preparando a plataforma para IMP-502 (Production Persistence), IMP-503 (Production HTTP
API), IMP-504 (Production Frontend), IMP-505 (Production Workspace).
