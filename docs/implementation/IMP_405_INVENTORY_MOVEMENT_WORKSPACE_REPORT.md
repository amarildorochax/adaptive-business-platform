# IMP-405 — Inventory Movement Workspace — Relatório de Implementação

**Adaptive Business Platform · Relatório de Sprint**

---

## Nota de Posicionamento Documental

Este relatório fecha a Sprint **IMP-405 — Inventory Movement Workspace**, a sexta e última etapa do
Inventory Movement Hub (Arquitetura ✅ ERP-001, Core ✅ IMP-401, Persistência ✅ IMP-402, HTTP API ✅
IMP-403, Frontend Infrastructure ✅ IMP-404). Ela constrói exclusivamente o Workspace — nenhuma
alteração a Arquitetura, Core, Persistência, HTTP API ou `core/inventory-movement/` (Frontend
Infrastructure, IMP-404). Ao final desta Sprint, o Inventory Movement Hub está completo de ponta a
ponta — o **terceiro domínio ERP integral** desta plataforma, ao lado do Supplier Hub e do Purchase
Hub, e o primeiro a representar explicitamente um **ledger de fatos operacionais imutáveis** em vez de
um Aggregate mutável com máquina de estados própria.

Esta Sprint foi retomada após uma interrupção: o código do Workspace já existia integralmente no disco
(escrito por uma sessão anterior), mas sem o Passo 1 (auditoria documentada), sem validação executada e
sem este relatório. O trabalho aqui descrito consistiu em auditar rigorosamente esse código já
existente contra os quatro blueprints obrigatórios, corrigir as divergências reais encontradas (todas
documentadas abaixo, nunca silenciosamente) e só então validar e reportar.

---

## 1. Auditoria Realizada (Passo 1, obrigatória antes de qualquer correção)

Comparação completa, na ordem exigida pelo prompt desta Sprint: Supplier Workspace (IMP-205) → Purchase
Workspace (IMP-305) → Inventory Movement Frontend Infrastructure (IMP-404) → UX-001 → UX-002 → STD-001,
contra o que já estava escrito em `apps/web/src/pages/inventory-movement/` e nos novos componentes de
`shared/components/ui/`.

**Existe componente reutilizável?** Sim, amplamente — `PageContainer`, `PageHeader`, `AsyncState`,
`SectionSubNav`, `Table`, `Drawer`, `Field`, `Select`, `Button`, `Badge`, `Alert`, `KPIGrid`,
`MetricCard`, `EmptyState`, `NotConnectedNotice`, `ProcessFlow`, `LiveIndicator`, `Timeline`,
`ActivityBadge`, `WidgetCard`, `useRecentlyChanged`, `useToast`, `useTheme` — todos reutilizados sem
nenhuma alteração, mesmo esqueleto de arquivo do Supplier/Purchase Workspace
(`{Domain}Page.tsx` + `{domain}Sections.ts` + `sections/*.tsx` + `Create{Entity}Drawer.tsx` +
`{domain}HistoryLog.ts`).

**Existe duplicação? (pergunta central desta auditoria, ver achado explícito do prompt sobre
`MovementCard`/`StockMovementCard` e `ReservationBadge`/`StockReservationStatusBadge`)** **Não** — são
dois pares de componentes genuinamente distintos, não uma duplicação por descuido, e ambos os lados já
se documentam cruzadamente:

- `MovementCard`/`ReservationBadge` (`shared/components/ui/`) são componentes **legados do Inventory
  Workspace (FUN-105)**, construídos sobre `Inventory.adjustInventory`/o conceito simplificado de
  Reserva **nunca implementado** do Commerce Hub (`ReservationBadge` já documentava, desde a FUN-105,
  que não existe nenhum dado real por trás — "pronto para o dia em que essa modelagem existir").
- `StockMovementCard`/`StockReservationStatusBadge` (`shared/components/ui/`) são componentes **novos
  desta Sprint**, sobre o Stock Movement/Stock Reservation reais (`core/inventory-movement/`, IMP-404) —
  campos e formas de dado inteiramente diferentes (`StockMovementResponseDto` vs. a forma simplificada de
  `MovementCardProps`; `StockReservationStatus` real, `Active`/`Released`/`ConvertedToMovement`, vs. os
  três valores fictícios `reserved`/`available`/`released` de `ReservationBadge`, que nunca
  correspondem a nenhum enum real).

Cada arquivo já contém, desde que foi escrito, um comentário explícito de não-confusão apontando para o
outro par (`MovementBadge.tsx`: "nunca confundir com `MovementCard`/`ReservationBadge`… componentes
legados do Inventory Workspace (FUN-105)… forma e domínio distintos"; `StockReservationStatusBadge.tsx`:
o mesmo, na direção oposta). Nenhum dos dois pares importa o outro. Nenhum é usado pelo Workspace
errado (confirmado por busca de uso: `MovementCard`/`ReservationBadge` só aparecem em
`pages/inventory/` (FUN-105); `StockMovementCard`/`StockReservationStatusBadge`/`ReservationCard` só
aparecem em `pages/inventory-movement/` (IMP-405), IMP-405 Workspace Components e sua raiz de definição).
**Conclusão da auditoria: nenhuma correção necessária aqui** — a separação é a decisão correta, já
documentada nos dois lados, e reflete honestamente o mesmo limite arquitetural que
`InventoryMovementPage.tsx` já registra sobre a rota (`/inventory-movement` nova, nunca substituindo
`/inventory`, Capítulo 2).

**`InventoryCard`/`AlertCard`, sugeridos literalmente pelo prompt para a Visão Geral — avaliados e
deliberadamente não instanciados aqui, divergência real documentada.** O prompt lista
`KPIGrid, MetricCard, InventoryCard, ProcessFlow, LiveIndicator, AlertCard` para a Visão Geral.
`InventoryCard` (FUN-105) representa um item de estoque do Commerce Hub — `productName`, `categoryName`,
`quantity`, foco em catálogo/produto — um conceito genuinamente diferente de um `StockMovement` (um fato
de ledger, não um "item"); reaproveitá-lo aqui misturaria a projeção simplificada do Commerce Hub com o
ledger real deste Hub, exatamente a reconciliação que `InventoryMovementPage.tsx` já documenta como
"nunca executada silenciosamente" (Capítulo 2, achado sobre a rota). `StockMovementCard` — novo, real,
alinhado a `StockMovementResponseDto` — ocupa esse lugar corretamente. `AlertCard` (FUN-105) exige
`count`/`items` de uma condição de alerta observada — este Hub não tem nenhuma Query de listagem para
`StockAlertRule` nem qualquer sinal de `StockAlertTriggered` sobre HTTP (Capítulo 7), então não existe
nenhum dado real para alimentá-lo na Visão Geral sem fabricar uma contagem; instanciá-lo aqui violaria
"Nunca criar métricas fictícias" (regra explícita desta Sprint). Ambas as omissões são, portanto,
decisões corretas e agora documentadas — não um esquecimento.

**Existe oportunidade de abstração?** As mesmas três já registradas por IMP-305 (`EntitySummaryCard`
genérico, `createStatusBadge(toneMap, labelMap)`, `demoApiFetchMock.ts` modularizado por domínio) seguem
válidas e, com este Hub, agora têm uma **quarta/quinta instância comprovada** —
`StockMovementCard`/`ReservationCard`/`LocationCard`/`AlertRuleCard` reaproveitam a mesma classe CSS
`.purchase-card` de `PurchaseOrderCard`/`ReceivingCard`/`SupplierCard`/`ContractCard` (cinco domínios
sob o mesmo shape visual, nunca extraído); `MovementBadge`/`StockReservationStatusBadge` seguem o mesmo
padrão `Badge` + mapa de tom de `SupplierStatusBadge`/`PurchaseStatusBadge`/`RequisitionStatusBadge`
(agora cinco instâncias). **Não executadas nesta Sprint**, per a mesma instrução explícita de "não
refatorar" já seguida por IMP-305 — permanecem candidatas de alta prioridade para uma Sprint de
consolidação transversal, ver Capítulo 15.

**Existe limitação herdada do domínio?** Quatro, todas já antecipadas pelo Capítulo 14 de
`IMP_404_INVENTORY_MOVEMENT_FRONTEND_REPORT.md` e resolvidas explicitamente nesta Sprint — ver Capítulos
5–9. Mais uma nova, encontrada apenas agora: **nenhuma Query tenant-wide existe para Stock Movement ou
Stock Reservation neste Hub** (só `listActiveStockLocations` é tenant-wide) — diferente de Supplier
(`useSuppliers`) e Purchase (`usePurchaseOrders`), a Visão Geral e o Analytics deste Workspace não têm
nenhuma fonte real alternativa ao que a própria sessão do navegador observou. Documentada em
`InventoryMovementPage.tsx`/`inventoryMovementSections.ts`, tratada com a mesma disciplina honesta já
usada por `receivedThisSession` (Purchase Workspace).

**Existe oportunidade de fortalecer o Design System?** Sim — ver Capítulo 15 (abstrações candidatas) e
Capítulo 12 (novos componentes, todos genéricos, prontos para reuso por Production/Fiscal/Financial
Hub).

---

## 2. Bugs Reais Encontrados e Corrigidos Nesta Sprint (nunca silenciosamente)

O código já existente em disco (de uma sessão anterior não finalizada) estava, em sua lógica de domínio,
correto e honesto — a auditoria não encontrou nenhuma violação das regras de negócio, nenhum dado
fictício, nenhuma ação de edição/exclusão sobre Movement. Todos os problemas reais encontrados eram de
**acessibilidade/ambiguidade de nomes** (afetando também os testes automatizados que dependem de nomes
acessíveis únicos) e um **defeito real de isolamento entre testes**. Cada um foi corrigido apenas na
camada do Workspace (ou em seu próprio arquivo de teste), nunca em Core/Persistência/HTTP
API/`core/inventory-movement/`.

### 2.1 — Botões "Nova Movimentação" duplicados (`OverviewSection.tsx`, `MovementsSection.tsx`)

**Achado.** `Drawer.tsx` nunca desmonta o conteúdo por trás de si (é um overlay, não uma troca de
árvore) — então o botão `PageHeader.actions` ("Nova Movimentação", disponível em qualquer aba) convivia,
ao mesmo tempo no DOM, com um segundo botão de mesmo nome acessível: um em `OverviewSection.tsx`
(ação do `EmptyState` quando nenhuma movimentação existe ainda nesta sessão) e outro em
`MovementsSection.tsx` (botão secundário ao lado de "Consultar Movimentações"). Isso quebrava
`getByRole("button", { name: "Nova Movimentação" })` em qualquer teste que dependesse dele — e é a
mesma classe de ambiguidade real de acessibilidade já documentada e corrigida em
`IMP_305_PURCHASE_WORKSPACE_REPORT.md`.

**Correção.** Ambos os botões locais foram removidos. Precedente direto: `OverviewSection.tsx` do
Purchase Workspace nunca teve um botão de ação no seu `EmptyState` equivalente — apenas texto apontando
para outra aba/Ação Rápida. Este Workspace agora segue exatamente o mesmo padrão: a descrição do
`EmptyState` aponta para a Ação Rápida do `PageHeader` ("disponível em qualquer aba deste Workspace"),
sem duplicar o botão. `onCreateRequested`, agora sem nenhum consumidor, foi removido das duas
assinaturas de props e de `InventoryMovementPage.tsx`.

### 2.2 — Dois campos "Identificador do Order" na mesma seção (`ReservationsSection.tsx`)

**Achado.** O card "Criar Reserva" e o card "Consultar Reservas por Order" (ambos sempre montados juntos
nesta seção) tinham, cada um, seu próprio campo com o rótulo idêntico "Identificador do Order" —
`getByLabelText("Identificador do Order")` deixava de identificar um único campo.

**Correção.** O campo do card de consulta foi renomeado para "Order a consultar" — o campo de criação
mantém "Identificador do Order" (o rótulo original, mais genérico, correto para o fluxo primário de
criação). Nenhum teste precisou mudar (os três testes que digitam nesse campo o fazem sempre no fluxo de
criação).

### 2.3 — Defeitos de teste reais, corrigidos apenas no arquivo de teste (nunca no componente)

Mesma disciplina "nunca corrigir o componente para acomodar um teste impreciso" já registrada em
`IMP_305_PURCHASE_WORKSPACE_REPORT.md`:

- **`/movement-demo-/` nunca poderia casar com nada renderizado.** `StockMovementCard`/
  `MovementsSection` truncam todo identificador em 8 caracteres (`slice(0, 8)`), convenção real e
  consistente desta UI — `"movement-demo-1".slice(0, 8)` é exatamente `"movement"`, sem o hífen. Três
  ocorrências corrigidas para `/movement/`.
- **`getByText("10")`/`getByText("9")` ambíguos em `PositionsSection`.** Sem nenhuma Reserva ainda
  refletida na posição, "Em mãos" e "Disponível" são genuinamente o mesmo valor real (quantidade
  reservada = 0) — dois `MetricCard` distintos mostrando o mesmo texto. Corrigido para
  `getAllByText(...).length` maior que zero, nas duas ocorrências (consulta pós-Movement, consulta
  pós-conversão de Reserva).
- **`getByRole("button", { name: "Analytics" })` exato falhava.** `SectionSubNav` acrescenta o selo
  "Prévia" ao nome acessível de toda seção com `hasRealData: false` (`inventoryMovementSections.ts` —
  Analytics é "Prévia" aqui, ver Capítulo 4) — mesma classe de defeito já documentada e corrigida por
  `IMP_205_SUPPLIER_WORKSPACE_REPORT.md` para Histórico/Configurações. Corrigido para `/Analytics/`.

### 2.4 — `document.body` acumulando raízes de render entre testes sequenciais (defeito real de
    infraestrutura de teste, isolado ao arquivo desta Sprint)

**Achado, via instrumentação direta do DOM.** A partir do terceiro teste em diante,
`InventoryMovementPage.test.tsx` começava a falhar com "Found multiple elements" para elementos que
deveriam ser únicos (`"Nova Movimentação"`, depois `"Visão Geral"` em cascata). Reproduzido de forma
determinística escrevendo um teste de diagnóstico temporário que gravava `document.body.children.length`
a cada `afterEach`: o valor crescia 1 → 2 → 3 ao longo dos três primeiros testes quando o arquivo
dependia exclusivamente do `cleanup()` global já registrado em `vitest.setup.ts`
(`setupFiles`) — ou seja, a raiz de render do teste anterior permanecia anexada ao `document.body`.
Adicionar um `cleanup()` explícito (`@testing-library/react`) ao `afterEach` **local** deste arquivo, executado
antes do hook global (ordem de hooks de dentro para fora), eliminou o problema por completo — confirmado
pela mesma instrumentação, `bodyChildren` sempre 0 após cada teste.

**Por que a correção fica só no arquivo de teste.** `vitest.setup.ts` é Frontend Infrastructure
compartilhada por toda a suíte (191 arquivos, 1048 testes) — fora do escopo desta Sprint, e uma correção
ali arriscaria uma mudança de comportamento cega em todo o resto da plataforma. `SupplierPage.test.tsx`/
`PurchasePage.test.tsx` têm exatamente o mesmo `afterEach` (sem `cleanup()` explícito) e não apresentam
este sintoma sob a suíte completa — a causa raiz exata (por que este arquivo específico dispara o
sintoma e os outros dois não) não foi isolada com certeza absoluta, e não foi necessário isolá-la para
resolver o problema real: a correção local é suficiente, comprovadamente eficaz, e não introduz nenhuma
mudança de comportamento fora deste arquivo. Registrado aqui com total transparência — um achado real,
não mascarado.

### 2.5 — Dois defeitos reais fora de `pages/inventory-movement/`, expostos por esta Sprint

Nenhum dos dois exigiu tocar em Arquitetura/Core/Persistência/HTTP API — ambos são consequência direta e
honesta de `navEntries.ts` já ter sido corretamente atualizado (rota `/inventory-movement`, ativa, rótulo
"Movimentação de Estoque") em uma sessão anterior, sem que os testes que dependem de `NAV_ENTRIES` já
tivessem sido atualizados junto:

- **`Sidebar.test.tsx`** construía `new RegExp(entry.label)` sem âncora para verificar o link de cada
  entrada — "Movimentação de Estoque" contém "Estoque" como substring, então o regex sem âncora da
  entrada "Estoque" (`/inventory`) também casava com o link "Movimentação de Estoque". Corrigido para
  `new RegExp(`^${entry.label}`)`, preservando a tolerância original ao selo "Em breve" (sufixo do nome
  acessível dos itens `planned`).
- **`navEntries.test.ts`** ainda esperava "doze módulos ativos" — desatualizado desde que
  `/inventory-movement` entrou como o décimo terceiro. Corrigido para treze, com a descrição do teste
  atualizada para citar a IMP-405.

---

## 3. Arquitetura Utilizada

Toda comunicação do Workspace acontece exclusivamente através de `apps/web/src/core/inventory-movement/`
(IMP-404) — confirmado por busca: zero import de `fetch(`, `ApiClient`, `core/http/client` ou
`InventoryMovementManager` em `pages/inventory-movement/` (as únicas ocorrências textuais desses termos
são comentários de documentação, nunca código executável). `useAuth().tenantId`, nunca
`useDashboardBootstrap()` — mesma decisão consciente já tomada por Supplier/Purchase Workspace (este Hub
não tem nenhuma relação com o Business Profile Engine).

**`useActiveStockLocations(tenantId)` é a única Query de topo** — achado estrutural central desta Sprint
(Capítulo 1): diferente de `useSuppliers`/`usePurchaseOrders`, nenhuma Query tenant-wide existe para
Stock Movement/Stock Reservation. Cada seção que precisa de dado real chama sua própria Query
co-localizada (`useStockMovementsByProduct`, `useStockPosition`, `useStockReservationsByOrder`), sempre
a partir de um `productId`/`orderId` informado pelo usuário — nunca uma listagem pré-carregada.

---

## 4. Estrutura — as Nove Seções

| Seção | Conteúdo real | Rota interna |
|---|---|---|
| Visão Geral | KPIs reais de sessão + Localizações ativas (real), `ProcessFlow` do funil do Ledger, `LiveIndicator` | `?section=` ausente (padrão) |
| Movimentações | Ledger real por Produto (busca obrigatória), registrar movimentação, zero ação de edição/exclusão | `?section=movements` |
| Posições | `StockPosition` real por Produto/Localização, nunca recalculada na UI | `?section=positions` |
| Reservas | Criar/Consultar por Order/Liberar/Converter — todas operações reais | `?section=reservations` |
| Localizações | `StockLocation` real (única Query tenant-wide do Hub) + criação real | `?section=locations` |
| Alertas | Criação/desativação reais de `StockAlertRule`; `NotConnectedNotice` para listagem e para `StockAlertTriggered` | `?section=alerts` |
| Histórico | Log de sessão honesto | `?section=history` |
| Analytics | Indicadores reais derivados da sessão; `NotConnectedNotice` para o escopo tenant-wide | `?section=analytics` |
| Configurações | Tema (única preferência real); `NotConnectedNotice` para o resto | `?section=settings` |

`hasRealData: false` em Histórico, Analytics e Configurações — mesma convenção de Supplier/Purchase.
**Analytics diverge deliberadamente do precedente do Purchase Workspace** (lá, `hasRealData: true`,
porque `usePurchaseOrders` é uma Query tenant-wide real) — aqui não existe Query tenant-wide equivalente
para Movement/Reservation, então Analytics é honestamente "Prévia", documentado em
`inventoryMovementSections.ts`.

---

## 5. Visão Geral

`KPIGrid`/`MetricCard` (três KPIs: Localizações ativas — real, tenant-wide; Movimentações nesta sessão;
Reservas ativas nesta sessão) + `ProcessFlow` (Capítulo 8) + `LiveIndicator` (Capítulo 9) +
`StockMovementCard` para até três movimentações recentes da sessão, `EmptyState` honesto quando vazio.
`InventoryCard`/`AlertCard` (sugeridos pelo prompt) deliberadamente não usados — ver Capítulo 1.

---

## 6. Movimentações

`Table` real (`useStockMovementsByProduct`, ordem cronológica real vinda de
`SqliteStockMovementRepository.findByProduct`, `ORDER BY occurred_at ASC`, IMP-402) — busca por Produto
obrigatória (o domínio não expõe "listar tudo"), coluna "Origem" via `MovementBadge`, soma exibida
(`totalDelta`) é uma conferência visual sobre o dado já recebido, nunca uma fonte de verdade paralela à
Stock Position. **A tabela nunca recebe `rowActions`** — nenhuma coluna de ações, porque nenhum Command
de edição/exclusão/substituição existe em nenhuma camada já construída; a ausência é a própria estrutura
do domínio tornada visível, confirmada pelo teste "LEDGER: nenhuma ação de editar/excluir aparece em
nenhum lugar da seção Movimentações" (Capítulo 13).

---

## 7. Posições

Consome exclusivamente `useStockPosition` — os três números exibidos (`quantityOnHand`,
`quantityReserved`, `quantityAvailable`) são lidos diretamente da resposta HTTP, nunca somados/derivados
nesta camada (confirmado por auditoria de código: nenhuma operação aritmética sobre esses campos existe
em `PositionsSection.tsx`). `position.data === undefined` (Produto nunca movimentado) é tratado com
`EmptyState` honesto, nunca como erro — exatamente o ponto (d) antecipado pelo Capítulo 14 de IMP-404.

**Limitação real do domínio, documentada em UI, nunca mascarada**: `createStockReservation`/
`releaseStockReservation` (Core) nunca chamam `StockPositionProjectionService.recalculate` — apenas
`registerStockMovement`/`convertReservationToMovement` o fazem. `quantityReserved`/`quantityAvailable`
só refletem uma Reserva criada/liberada depois que o próximo Movement/Conversion real recalcular a
posição. Um `Alert` explica exatamente essa defasagem.

---

## 8. Reservas

Wireup exclusivo aos cinco Hooks reais listados pelo prompt: `useStockReservationsByOrder`,
`useCreateStockReservation`, `useReleaseStockReservation`, `useConvertReservationToMovement` — todos
instanciados. `useStockReservation` (consulta por id único) **não é instanciado nesta seção** — mesma
disciplina de `RequisitionCard` no Purchase Workspace ("definido/exportado mas não instanciado, nenhuma
seção precisou"): o fluxo real oferecido é sempre por Order (criar → consultar por Order → agir), nunca
por id de Reserva isolado; o Hook segue pronto em `core/inventory-movement/` para o próximo caso de uso
real que o exigir, nunca removido, nunca simulado aqui. Ações "Liberar"/"Converter" aparecem apenas
quando `status === "Active"`, refletindo `InventoryPolicy.canTransitionReservationStatus` (Core) sem
reimplementar a regra no cliente — se o servidor rejeitar, o erro real aparece via toast (teste "422").

---

## 9. Localizações

`useActiveStockLocations` (única Query tenant-wide real do Hub) + `useCreateStockLocation`. Nenhuma ação
de edição/desativação — `StockLocationRepository`/`InventoryMovementManager` nunca expuseram Command
algum além de criação; a seção reflete essa ausência, nunca a inventa.

---

## 10. Alertas

`useCreateStockAlertRule`/`useDeactivateStockAlertRule` — as únicas duas Mutations reais para
`StockAlertRule`. Sem nenhuma Query de listagem/detalhe (mesma ausência, mesma razão, já documentada
para `ReorderRule` no Purchase Workspace) — Regras exibidas existem apenas nesta sessão do navegador,
`NotConnectedNotice` explícito. **Limitação adicional, distinta e real**: mesmo quando um
`StockAlertRule` genuinamente dispara no servidor (`StockAlertTriggered`, avaliado internamente por
`StockAlertEvaluationService`), esse Evento nunca atravessa HTTP — nenhuma notificação de "Alerta
disparado" é simulada em lugar nenhum.

---

## 11. Histórico, ProcessFlow, LiveIndicator, PageHeader.actions

**Histórico.** `inventoryMovementHistoryLog.ts` — mesma disciplina honesta de
`supplierHistoryLog.ts`/`purchaseHistoryLog.ts` (nenhum endpoint HTTP deste Hub devolve
`InventoryEvent`, confirmado por leitura direta de `apps/api/src/routes/inventoryMovement.ts` — os
mappers produzem apenas DTOs de resposta, nunca eventos). **Extensão real, além da forma exata do
Supplier/Purchase Hub**: `movements`/`reservations` (não apenas `entries` de texto) — exigida pela
ausência de qualquer Query tenant-wide (Capítulo 1), é a única fonte real que alimenta a Visão
Geral/Analytics/`ProcessFlow`. Resumo por categoria no próprio Histórico é uma contagem real sobre as
mesmas entradas já exibidas, nunca um dado adicional inventado.

**ProcessFlow (uso obrigatório).** `buildLedgerFlow()` interpreta explicitamente o funil citado
literalmente pelo prompt (Entrada → Reserva → Disponível → Consumo → Saída) — cada etapa mapeada a um
fato real e verificável do domínio, nunca uma simulação: Entrada = Movement com `quantityDelta` positivo
(real: `MovementOriginDto` inclui `Purchase`/`ProductionOutput`/`SaleReturn`/`ManualAdjustment`
positivos); Reserva = existência de uma `StockReservation` criada nesta sessão; Disponível = Reserva
`Released` (valor real de `StockReservationStatus`); Consumo = Movement de origem
`ProductionConsumption` (valor real do enum); Saída = Movement negativo cuja origem não é
`ProductionConsumption` (tipicamente `SaleFulfillment`, via `convertReservationToMovement`, confirmado
em `demoApiFetchMock.ts`). **Diverge da sugestão do Capítulo 14 de IMP-404** ("provavelmente a jornada
de uma `StockReservation`") — a Sprint optou pelo funil mais amplo citado literalmente pelo prompt, e a
auditoria confirma que essa escolha é honesta: nenhuma etapa depende de um estado inventado, todas
derivam de enums/status reais já existentes em Core desde IMP-401.

**LiveIndicator.** Acende em `OverviewSection.tsx` apenas quando `useActiveStockLocations(tenantId)
.dataUpdatedAt` muda de fato (`useRecentlyChanged`, componente reutilizado sem alteração) — nunca
decorativo/permanente.

**PageHeader.actions.** Uma única ação real, "Nova Movimentação", abrindo `CreateStockMovementDrawer` —
`RegisterStockMovement` (Core) nunca teve restrição de uso documentada (limitação já registrada em
IMP-403); esta Sprint decide explicitamente oferecer o formulário manual, per instrução direta do
prompt ("Nova Movimentação" é citado como exemplo). Decisão documentada, não uma omissão silenciosa da
pergunta aberta por IMP-404.

---

## 12. Novos Componentes Compartilhados

Seis componentes novos, todos em `shared/components/ui/`, todos genéricos (nenhum importa tipo de
`@abp/inventory-movement-hub`):

- **`StockMovementCard`** — resumo de um Stock Movement real; nunca instanciado com ação de
  edição/exclusão.
- **`ReservationCard`** — resumo de uma Stock Reservation real.
- **`LocationCard`** — resumo de uma Stock Location real.
- **`AlertRuleCard`** — resumo de uma Stock Alert Rule real.
- **`MovementBadge`** — origem + direção (Entrada/Saída) de um Movement, tom semântico automático pelo
  sinal real de `quantityDelta`.
- **`StockReservationStatusBadge`** — status real de uma Reservation, mesmo padrão de
  `PurchaseStatusBadge`/`RequisitionStatusBadge`.

**`ReservationBadge`, sugerido nominalmente pelo prompt entre os "candidatos" (junto de
`StockMovementCard`/`ReservationCard`/`LocationCard`/`AlertRuleCard`/`MovementBadge`) — já existe desde a
FUN-105, mas sobre dado fictício (Capítulo 1); em vez de reaproveitá-lo, `StockReservationStatusBadge`
foi criado como seu equivalente real** — decisão documentada, não uma duplicação por descuido.

**Reuso de CSS, não de componente** — `StockMovementCard`/`ReservationCard`/`LocationCard`/
`AlertRuleCard` reaproveitam a classe `.purchase-card` já usada por `PurchaseOrderCard`/`ReceivingCard`
(Purchase Hub)/`SupplierCard`/`ContractCard` (Supplier Hub) — quinta e sexta instância do mesmo padrão
visual, candidato cada vez mais forte a um `EntitySummaryCard` genérico (Capítulo 15), ainda não
extraído.

---

## 13. Testes

Vinte e sete testes novos, dois arquivos:

| Arquivo | Cobertura |
|---|---|
| `InventoryMovementWorkspaceComponents.test.tsx` (11 testes) | `MovementBadge` (tom/origem/fallback honesto), `StockMovementCard` (campos reais, omissão honesta de Localização ausente), `StockReservationStatusBadge` (rótulo real + fallback), `ReservationCard`, `LocationCard` (endereço ausente omitido), `AlertRuleCard` |
| `InventoryMovementPage.test.tsx` (16 testes) | Loading; Visão Geral vazia; registrar Movimentação via Ação Rápida (Visão Geral + Histórico refletem); Posições (com dado real, sem dado — honesto); Reservas (criar → consultar por Order → liberar; converter → Posição reflete decremento; 422 sem UI quebrada); Localizações; Alertas (criar/desativar + `NotConnectedNotice`); Histórico (resumo por categoria); Analytics; Configurações |

Toda integração usa os Hooks reais de `core/inventory-movement/` — nenhum mock da lógica do Workspace,
apenas da camada `fetch` (`demoApiFetchMock.ts`, estendido nesta Sprint com as rotas do Inventory
Movement Hub), mesma disciplina de todo Workspace HTTP-real já testado nesta plataforma.

### Testes específicos do Ledger (obrigatórios pelo prompt, verbatim)

Todos reais, verificados por leitura direta do arquivo de teste:

1. **Registrar movimentação → atualização automática.** `"LEDGER: registrar movimento -> atualização
   automática da lista já consultada em Movimentações"` — consulta vazia primeiro, registra, confirma
   que a mesma lista já consultada (mesma Query, mesmo `productId`) reflete o novo Movement sem
   recarregar a página.
2. **Consultar posições → sem recálculo na UI.** `"Posições: consulta a Stock Position real após um
   Stock Movement — nunca recalculada na UI"` — combinado com a auditoria de código do Capítulo 7 (zero
   operação aritmética sobre `quantityOnHand`/`quantityReserved`/`quantityAvailable` em
   `PositionsSection.tsx`), a garantia é estrutural, não apenas testada.
3. **Ordem cronológica.** `"LEDGER: consultar histórico -> ordem cronológica preservada para múltiplas
   movimentações do mesmo Produto"` — três movimentos (+10, -3, +5) registrados em sequência, o total
   exibido (+12) e a ordem retornada por `useStockMovementsByProduct` confirmam a garantia real de
   `ORDER BY occurred_at ASC` (IMP-402).
4. **Ausência de edição e ausência de exclusão.** `"LEDGER: nenhuma ação de editar/excluir aparece em
   nenhum lugar da seção Movimentações"` — um único teste cobre ambas as garantias explicitamente
   exigidas (nenhum botão "Editar"/"Excluir"/"Remover" em lugar nenhum da seção).

---

## 14. Estratégias de Cache

Nenhuma lógica de cache nova na UI — toda seção consome exclusivamente os Hooks de
`core/inventory-movement/` (IMP-404), que já encapsulam `queryKey`/`setQueryData` via
`inventoryMovementCache.ts` (`appendStockMovementInCache` sempre aditivo, `syncStockPositionInCache`
substitui, `syncStockReservationInCaches`/`appendStockLocationInCache`). Nenhuma Query Key foi alterada.
A limitação de defasagem entre Reserva e Posição (Capítulo 7) é herdada do Core, nunca mascarada por
nenhuma estratégia nova de cache nesta camada — per instrução explícita ("nenhum workaround").

---

## 15. Qualidade — Comparação com Supplier/Purchase Workspace

**Supplier/Purchase Workspace seguidos integralmente** — mesma estrutura de arquivo, mesma disciplina
"exclusivamente via Hooks", mesmo tratamento de erro sem paralelismo, mesma honestidade de
`NotConnectedNotice`/log de sessão, mesmo uso obrigatório de `ProcessFlow`/`LiveIndicator`.

**Existe duplicação?** Não (Capítulo 1) — a única duplicação real da plataforma (estrutura CSS de card,
padrão de Badge por tom) já estava documentada por IMP-305 e permanece intocada, agora com mais uma
instância comprovada.

**Existe oportunidade de fortalecer o padrão dos próximos Workspaces (Production Hub, IMP-501)?** Sim,
quatro:

1. **`EntitySummaryCard`/`createStatusBadge`** (Capítulo 12) — agora com seis/cinco instâncias
   comprovadas across Supplier/Purchase/Inventory Movement; cada domínio novo torna a extração mais
   urgente.
2. **Seção "consulta por identificador obrigatório, nunca listagem completa"** (`MovementsSection`,
   `PositionsSection`, `ReservationsSection` por Order) — template direto para qualquer futuro Aggregate
   cujo Core não exponha Query tenant-wide (bastante provável em Production Hub, cuja "Ordem de
   Produção" provavelmente será consultada por identificador, não listada).
3. **`ProcessFlow` sobre múltiplos sinais reais combinados** (Capítulo 11), não apenas a máquina de
   estados de um único Aggregate — precedente direto para qualquer domínio de ledger/evento futuro
   (Fiscal Hub, Financial Hub).
4. **Explicit local `cleanup()` como salvaguarda de teste** (Capítulo 2.4) — candidato a virar convenção
   documentada em `ADAPTIVE_ENGINEERING_CHECKLIST.md` para qualquer Workspace futuro com múltiplos
   testes sequenciais no mesmo arquivo, independentemente de a causa raiz exata do arquivo específico
   ter sido totalmente isolada.

---

## 16. Validação Executada

`pnpm typecheck`, `pnpm build`, `pnpm lint` e `pnpm test` executados três vezes cada, na íntegra, a
partir de `platform/` (caminho absoluto confirmado, per
[[feedback_bash_cwd_persistence]]) — todas as doze execuções (3 × 4 comandos) limpas, sem exceção:

| Execução | typecheck | build | lint | test |
|---|---|---|---|---|
| 1 | ✅ | ✅ | ✅ | ✅ 191 arquivos, 1047 passando + 1 `it.fails` esperado (IMP-303) = 1048 |
| 2 | ✅ | ✅ | ✅ | ✅ 191 arquivos, 1047 passando + 1 `it.fails` esperado = 1048 |
| 3 | ✅ | ✅ | ✅ | ✅ 191 arquivos, 1047 passando + 1 `it.fails` esperado = 1048 |

**Nenhum flake em nenhuma das três execuções** — inclusive o flake pré-existente e já conhecido
(`apps/web/src/app/router/routes.test.tsx > renderiza o Dashboard na rota raiz`, documentado em
`IMP_402_INVENTORY_MOVEMENT_PERSISTENCE_REPORT.md`/`IMP_404_INVENTORY_MOVEMENT_FRONTEND_REPORT.md`) não
recorreu em nenhuma das três rodadas. `vite build` confirma `InventoryMovementPage` em seu próprio chunk
lazy (`InventoryMovementPage-*.js`, 32,29 kB) — mesmo padrão de todo Workspace já existente
(`SupplierPage` ~24,45 kB, `PurchasePage` ~35,70 kB).

**Nota sobre a primeira execução (histórico, não repetido).** A primeira tentativa de rodar `pnpm test`
nesta Sprint (antes das correções do Capítulo 2) expôs de fato 12 testes falhando — todos rastreados até
os achados 2.1/2.4. Uma segunda tentativa, já após as correções de 2.1–2.4, expôs mais 2 falhas reais
(2.5, `Sidebar.test.tsx`/`navEntries.test.ts`) — corrigidas antes das três execuções limpas registradas
na tabela acima, que refletem o estado final do código. Nenhuma dessas descobertas foi descartada
silenciosamente — todas em Capítulo 2.

**Rota/Sidebar/Breadcrumb confirmados funcionais** — `routes.tsx` registra `{ path: "inventory-movement",
element: <InventoryMovementPage /> }` (lazy), `navEntries.ts` já tinha a entrada ativa correspondente
(rótulo "Movimentação de Estoque", categoria "Operação", ícone `ArrowRightLeft`) — ambos confirmados
pelos 191 arquivos de teste passando, incluindo `routes.test.tsx`/`Sidebar.test.tsx`/
`navEntries.test.ts` (este último e o primeiro, corrigidos nesta Sprint, Capítulo 2.5).

---

## 17. Limitações

Todas herdadas honestamente de camadas inferiores, nenhuma mascarada:

- **Nenhuma Query tenant-wide para Stock Movement/Stock Reservation** (Core, IMP-401) — Visão
  Geral/Analytics refletem apenas a sessão do navegador.
- **Defasagem entre Reserva e Posição** (Core, IMP-401) — `createStockReservation`/
  `releaseStockReservation` nunca recalculam `StockPosition`.
- **`variantId` ausente de todo parâmetro de consulta** (Core/Persistência/HTTP/Frontend, IMP-401 a
  IMP-404) — quinta vez documentada nesta série.
- **Nenhuma listagem de `StockAlertRule` já existentes, nenhum sinal de `StockAlertTriggered` sobre
  HTTP** (Core/HTTP, IMP-401/403).
- **Nenhum Evento de domínio real no Histórico** (HTTP, IMP-403) — mesma ausência já documentada para
  Supplier/Purchase Hub.
- **Segundo `registerReceiving` sobre o mesmo Purchase Order continua falhando** (Purchase Hub,
  IMP-302/303) — não relacionado a este Hub, citado apenas por completude do estado real da plataforma.

---

## 18. Melhorias Futuras

Quando uma Query tenant-wide para Stock Movement/Stock Reservation existir (ex.: um futuro
`listStockMovementsByTenant`), Visão Geral e Analytics devem trocar o log de sessão por dado real —
mesma reestruturação já aplicada a outros Workspaces quando uma limitação equivalente foi resolvida.

Quando `GET /stock-alert-rules` existir, `AlertsSection` deve trocar o estado local de sessão por uma
Query real (`useStockAlertRules`, a criar em `core/inventory-movement/`, fora do escopo desta Sprint).

As quatro abstrações candidatas do Capítulo 15 (`EntitySummaryCard`, `createStatusBadge`, template de
"seção por identificador obrigatório", convenção de `cleanup()` explícito) tornam-se cada vez mais
urgentes a cada novo domínio ERP — recomendada uma Sprint de consolidação transversal antes ou durante o
Production Hub.

---

## 19. Preparação para o Production Hub (IMP-501)

O Inventory Movement Hub está agora completo — Arquitetura → Core → Persistência → HTTP API → Frontend
Infrastructure → Workspace, todas as seis etapas validadas. Junto de Supplier Hub e Purchase Hub, os três
domínios formam o blueprint oficial da Fase 2 — o Inventory Movement Hub, especificamente, é agora o
blueprint de referência para **domínios orientados a ledger/evento** (distintos de Aggregates com
máquina de estados própria, o padrão de Supplier/Purchase).

Três pontos concretos para o Production Hub, decorrentes diretamente desta Sprint:

1. Se `ProductionOrder` (Production Hub) não expuser Query tenant-wide (padrão provável, dado que
   `ProductionConsumption`/`ProductionOutput` já são origens reais deste próprio Ledger), o padrão
   "seção por identificador obrigatório" (Capítulo 15, ponto 2) é o template direto.
2. Se `ProductionOrder` tiver uma máquina de estados real (mais provável que o padrão puro de ledger),
   `ProcessFlow` deve representar essa máquina de estados diretamente — o padrão "múltiplos sinais reais
   combinados" desta Sprint (Capítulo 11) é o precedente para quando NÃO houver uma única máquina de
   estados clara.
3. A convenção de `cleanup()` explícito por segurança (Capítulo 2.4) deve ser adotada preventivamente em
   qualquer novo arquivo de teste de Workspace com múltiplos `it()` sequenciais, independentemente de o
   sintoma já ter se manifestado.

---

## 20. Conclusão

O Inventory Movement Workspace está completo, testado e validado — a sexta e última camada do terceiro
domínio ERP integral da Adaptive Business Platform, e o primeiro a representar um ledger de fatos
imutáveis em vez de um Aggregate com máquina de estados própria. Toda comunicação passa exclusivamente
por `core/inventory-movement/`, nenhuma tela acessa HTTP diretamente, nenhum dado fictício foi exibido em
nenhuma seção, nenhuma movimentação pode ser editada, excluída, substituída ou duplicada em lugar nenhum
da interface, e nenhum saldo é recalculado no cliente. A pergunta central desta auditoria — se
`MovementCard`/`StockMovementCard` e `ReservationBadge`/`StockReservationStatusBadge` representam
duplicação — tem resposta definitiva: não, são pares deliberadamente distintos, um legado do Commerce
Hub (FUN-105) e um real deste Hub (IMP-405), ambos já se documentando cruzadamente desde que foram
escritos. Todos os bugs reais encontrados (ambiguidade de nomes acessíveis em dois componentes do
Workspace, um vazamento real de DOM entre testes sequenciais, e dois defeitos de teste fora deste
diretório expostos pela própria adição da rota) foram corrigidos e documentados, nunca silenciosamente.
O ciclo completo — Arquitetura (ERP-001) → Core (IMP-401) → Persistência (IMP-402) → HTTP API (IMP-403)
→ Frontend Infrastructure (IMP-404) → Workspace (IMP-405) — está validado de ponta a ponta (doze
execuções limpas de `typecheck`/`build`/`lint`/`test`, zero flakes) e pronto para servir, ao lado de
Supplier Hub e Purchase Hub, como blueprint oficial da Fase 2 para Production Hub, Fiscal Hub e
Financial Hub.
