# IMP-505 — Production Workspace

**Adaptive Business Platform · Relatório de Implementação**

Status: Completo
Data: 2026-08-04
Escopo: exclusivamente Workspace (`apps/web/src/pages/production/`) — Arquitetura, Core, Persistence,
HTTP e Frontend Infrastructure permanecem fora de escopo, per instrução explícita desta Sprint.

---

## Nota de Posicionamento

Este relatório documenta o Workspace do Production Hub — a quinta e última etapa do domínio
(Arquitetura → Core → Persistência → HTTP API → Frontend Infrastructure → **Workspace**), seguindo
rigorosamente os três blueprints já consolidados: Supplier Workspace (IMP-205), Purchase Workspace
(IMP-305), Inventory Movement Workspace (IMP-405, o mais recente), e a UX-002 (ProcessFlow,
LiveIndicator, agrupamento de Sidebar, Breadcrumb, `PageHeader.actions`). Nenhum padrão novo foi
criado. Ao final desta Sprint, o **Production Hub torna-se o quarto domínio ERP completo** desta
plataforma.

---

## 1. Auditoria Realizada (Passo 1)

Executada antes de qualquer código, comparando Production HTTP (IMP-503) → Supplier Workspace →
Purchase Workspace → Inventory Movement Workspace → UX-002.

**Existe Workspace parcial?** Não. Nenhuma pasta `pages/production/` existia antes desta Sprint —
confirmado por leitura completa de `apps/web/src/pages/` (13 domínios já presentes, nenhum
`production`).

**Existe rota existente?** Não — `/production` nunca apareceu em `routes.tsx`/`navEntries.ts`/
`PLANNED_DOMAINS`, rota inteiramente nova, sem placeholder anterior a substituir (diferente de
`/purchases`, IMP-305, que substituiu um placeholder FUN-106 sobre `CommerceManager`).

**Existe duplicação?** A duplicação estrutural esperada existe e é aceita como padrão sancionado, não
como pendência: `testing/realApiServer.ts`-equivalente não foi necessário aqui (os testes de Workspace
usam `demoApiFetchMock.ts`, nunca um servidor real); o padrão `dashboard-section`/`form-grid`/
`dashboard-grid`, os componentes `WidgetCard`/`Field`/`Button`/`EmptyState`/`Alert`/`NotConnectedNotice`
e a classe CSS `.purchase-card` — todos reutilizados sem nenhuma modificação, mesma disciplina de
`LocationCard`/`ReservationCard`/`PurchaseOrderCard`.

**Existe componente reutilizável?** Sim, integralmente: `PageHeader`, `PageContainer`, `AsyncState`,
`SectionSubNav`, `WidgetCard`, `KPIGrid`, `MetricCard`, `ProcessFlow`, `LiveIndicator`,
`NotConnectedNotice`, `Timeline`, `ActivityBadge`, `EmptyState`, `Alert`, `Field`, `Select`, `Button`,
`Drawer`, `Badge`, `Table` — nenhum precisou de alteração. Apenas cinco componentes novos foram
necessários (Seção 3), todos para Entidades genuinamente novas deste domínio, nenhum reimplementando
um já existente.

**Existe abstração válida?** Nenhuma nova extraída — mesma resposta conservadora dos três Workspaces
anteriores, per "Não refatorar neste Sprint".

**Existe melhoria para STD-001?** Nenhuma identificada.

**Existe melhoria para UX-002?** Uma observação, não uma melhoria de convenção: esta é a primeira
Sprint em que `ProcessFlow` precisa representar o funil de progresso de um Aggregate com uma máquina de
estados real E múltiplos fatos internos adicionais (`consumptions`/`outputs` embutidos) — o padrão
"múltiplos sinais reais combinados" (`buildLedgerFlow`, IMP-405) provou-se diretamente aplicável, sem
exigir nenhuma extensão da API de `ProcessFlow`. Nenhuma mudança proposta.

---

## 2. Workspace

`pages/production/ProductionPage.tsx` — composição idêntica a `InventoryMovementPage.tsx`: `PageHeader`
com Ação Rápida única ("Nova Ordem de Produção"), `?section=` como estado de navegação (nunca sub-rotas
de roteador), `SectionSubNav` com as oito seções, `AsyncState` sobre a única Query de topo.

`useActiveWorkCenters()` é a única Query de topo — **achado central desta Sprint, mesma classe já
documentada por `IMP_405_INVENTORY_MOVEMENT_WORKSPACE_REPORT.md`**: `ProductionManager` não expõe
nenhuma Query tenant-wide para `ProductionOrder`/`BillOfMaterials`; a única Query próxima de
tenant-wide é `listActiveWorkCenters()` — e mesmo essa não recebe `tenantId` no próprio endpoint
(limitação herdada do Core/Persistência/HTTP, IMP-501/502/503, nunca resolvida silenciosamente aqui).

`productionHistoryLog.ts` — mesmo formato de `inventoryMovementHistoryLog.ts`: `entries` (log de
atividade textual) + `productionOrders` (upsert por identificador, a única fonte real para o
`ProcessFlow`/KPIs da Visão Geral, já que nenhuma Query "listar todas as Ordens" existe).

## 3. Componentes

Cinco componentes novos em `shared/components/ui/` — cada um reutiliza exclusivamente as CSS classes já
existentes (`.purchase-card`, `.badge--*`), nunca uma folha de estilo nova:

| Componente | Mesmo padrão de |
|---|---|
| `ProductionStatusBadge` | `PurchaseStatusBadge` |
| `BillOfMaterialsStatusBadge` | `PurchaseStatusBadge` |
| `ProductionOrderCard` | `LocationCard`/`PurchaseOrderCard` |
| `BillOfMaterialsCard` | `LocationCard` |
| `WorkCenterCard` | `LocationCard` (mesma Capability opcional) |

Nenhum recusou reutilização de um componente já existente — todos os cinco representam Entidades
genuinamente novas (`ProductionOrder`/`BillOfMaterials`/`WorkCenter`) sem nenhum equivalente prévio.

## 4. Seções (oito, per instrução explícita)

| Seção | `hasRealData` | Conteúdo real |
|---|---|---|
| Visão Geral | true | `ProcessFlow` + KPIs (sessão) + `useActiveWorkCenters` (tenant-wide-próximo) |
| Ordens de Produção | true | `useProductionOrder`(id)/`useProductionOrdersByOrigin` + "Session Preview" |
| Ordens em Execução | true | `useProductionOrdersByStatus("InProgress")` + `useStartProduction`/`useRegisterProductionConsumption`/`useRegisterProductionOutput`/`useCompleteProduction`/`useCancelProduction` |
| Centros de Trabalho | true | `useActiveWorkCenters`/`useCreateWorkCenter` — totalmente real |
| Estruturas (BOM) | true | `useBillOfMaterials`/`useActiveBillOfMaterialsForProduct`/`useCreateBillOfMaterials`/`useSupersedeBillOfMaterials` + "Session Preview" para listagem |
| Histórico | false | `productionHistoryLog.ts` + `NotConnectedNotice` |
| Analytics | false | KPIs de sessão + `NotConnectedNotice` |
| Configurações | false | tema + `NotConnectedNotice` |

Criação de `ProductionOrder` ocorre exclusivamente pela Ação Rápida do `PageHeader`
(`CreateProductionOrderDrawer.tsx`) — nenhuma seção duplica esse formulário, mesma disciplina de
prevenção de botão duplicado (Seção 9).

---

## 5. UX (UX-002)

`ProcessFlow`: aplicado na Visão Geral. `LiveIndicator`: `useRecentlyChanged(activeWorkCenters.dataUpdatedAt)`,
mesma disciplina de `useActiveStockLocations`/`useSuppliers`. `PageHeader.actions`: "Nova Ordem de
Produção". Breadcrumb: automático via `navEntries.ts` (nenhuma configuração própria necessária).
Sidebar: `/production` adicionado à categoria `"Operação"` já existente (mesma categoria de
Estoque/Movimentação de Estoque/Compras/Fornecedores) — nunca uma categoria nova, per instrução
explícita ("`category` nunca lido por `ApplicationRouter`/`findNavEntry`... reforça visualmente a
fronteira de responsabilidade").

## 6. ProcessFlow

Funil "Planejada → Iniciada → Consumo Registrado → Produção Registrada → Concluída"
(`buildProductionFlow`, `OverviewSection.tsx`), computado exclusivamente sobre
`productionHistoryLog.productionOrders` (sessão do navegador — nenhuma Query tenant-wide existe).

**Divergência deliberada e documentada do exemplo literal desta Sprint** ("Planejada → Preparada → Em
Produção → Concluída → Finalizada"): "Preparada"/"Finalizada" não correspondem a nenhum valor real de
`ProductionStatus` (`Planned | InProgress | Completed | Cancelled`) nem a nenhum outro fato observável
do domínio. Per a própria instrução desta Sprint ("Os estados deverão refletir exclusivamente o
domínio. Nunca inventar estados"), os cinco passos usam exclusivamente fatos reais e distintos já
expostos por `ProductionOrderResponseDto`: criação, transição real a `InProgress`,
`consumptions.length > 0`, `outputs.length > 0`, `status === "Completed"`. Mesma disciplina de
divergência documentada já registrada por `buildLedgerFlow` (IMP-405) diante da sugestão de IMP-404.

`Cancelled` nunca é uma etapa do funil — representado exclusivamente, por Ordem, via
`ProductionStatusBadge`, mesma disciplina de `Cancelled`/`Rejected` em `PurchaseStatusBadge` diante do
`buildProcurementFlow` do Purchase Workspace.

## 7. LiveIndicator

Único uso: Visão Geral, `useRecentlyChanged(activeWorkCenters.dataUpdatedAt)` — mesmo padrão de
`useActiveStockLocations`/`useSuppliers`. Nenhuma limitação encontrada, mesma conclusão de IMP-405.

---

## 8. Testes e Cobertura

`ProductionPage.test.tsx` — 14 testes cobrindo: carregamento, Visão Geral (KPIs zero + estado vazio),
criação de Composição/Ordem/Centro de Trabalho, fluxo completo real (iniciar → consumir → gerar →
concluir), insumo insuficiente (`started: false`), cancelamento antes de consumo, erro real 409 (concluir
sem geração) via toast, consulta honesta sem resultado, Histórico, Analytics, Configurações, e
unicidade do botão "Nova Ordem de Produção" (prevenção de duplicidade).

`demoApiFetchMock.ts` estendido com os 17 endpoints do Production Hub (`billsOfMaterials`/
`productionOrders`/`workCenters`, replicando `ProductionPolicy.hasSufficientInput` apenas na medida do
necessário para os cenários exercitados, nunca uma reimplementação completa do domínio — mesma
disciplina já registrada para `PurchasePolicy`/`InventoryPolicy`).

**Comparação com Inventory Movement Workspace (IMP-405, referência de cobertura explícita desta
Sprint)**: IMP-405 cobriu nove seções com 16 testes de página + 11 testes de componentes
compartilhados (nenhum componente novo nesta Sprint precisou de teste próprio — todos são composições
diretas de `Badge`/primitivos já testados transitivamente pelos testes de página, mesmo critério de
`PurchaseStatusBadge`/`LocationCard`, que também nunca tiveram arquivo de teste próprio). Esta Sprint
cobre oito seções com 14 testes de página — proporção de cobertura por seção comparável (~1.75
testes/seção aqui vs. ~1.8 em IMP-405), mesma disciplina de não duplicar entre a integração real
(`productionClient.test.ts`, já validada em IMP-504) e o teste de Workspace (que cobre exclusivamente
navegação, sincronização de cache visível na UI, e os fluxos operacionais completos).

---

## 9. Auditoria — Cinco Itens Já Conhecidos

Per instrução explícita desta Sprint ("Verificar explicitamente... mesmo quando inexistente").

**(a) Session Timeline limitation (IMP-205).** Existe equivalente exato: nenhum endpoint HTTP do
Production Hub (IMP-503) devolve `ProductionEvent` — `productionHistoryLog.ts` é a mesma solução
híbrida já validada (`NotConnectedNotice` nomeando a lacuna real + log honesto de sessão via
`Timeline`), byte-a-byte estruturalmente idêntico a `inventoryMovementHistoryLog.ts`.

**(b) Duplicate button issue.** Prevenido desde o primeiro rascunho, nunca descoberto por teste
posterior: `CreateProductionOrderDrawer.tsx` é o único lugar com um botão/campo "Nova Ordem de
Produção"/"Composição (BillOfMaterials) já ativa"; toda seção usa rótulos distintos para seus próprios
formulários ("Criar Composição", "Criar Centro de Trabalho", "Ordem a consultar" vs. "Ordem a iniciar").
Teste explícito confirma a unicidade (`getByRole` bem-sucedido é a própria asserção).

**(c) SectionSubNav accessibility.** Mesma disciplina — testes que visam uma seção com
`hasRealData: false` (Histórico/Analytics/Configurações) usam `name: /Histórico/`/`/Analytics/`/
`/Configurações/` (regex), nunca uma string exata, por causa do selo "Prévia" já acrescentado ao nome
acessível pelo próprio `SectionSubNav.tsx` (componente intocado, comportamento herdado).

**(d) Sidebar grouping (UX-002).** `/production` unido à categoria `"Operação"` já existente — nenhuma
categoria nova (Seção 5).

**(e) ProcessFlow e LiveIndicator.** Ambos reutilizados sem nenhuma alteração de código — única
observação real é de "quais sinais alimentar", documentada nas Seções 6-7, mesma conclusão de IMP-405
("nenhuma limitação do componente em si, apenas do que o domínio expõe").

---

## 10. Divergências Encontradas

Per `STD-001`: Arquitetura → Auditoria → Amendment → Implementação. Nenhuma corrigida silenciosamente.

**Nenhuma divergência estrutural real** entre HTTP/Frontend Infrastructure (IMP-503/504) e este
Workspace — todos os 17 Hooks já aprovados foram consumidos exatamente como expostos, nenhum
recomposto ou contornado.

**Um ajuste a um teste pré-existente, não relacionado ao domínio Production**:
`navEntries.test.ts` afirmava um número fixo de módulos ativos ("treze") — desatualizado pela adição de
`/production` (décimo quarto). Corrigido para "quatorze", mesma manutenção mecânica já exigida de cada
Sprint anterior que adicionou uma rota (`IMP_405...`/`IMP_305...` presumivelmente fizeram o mesmo ajuste
ao acrescentar suas próprias rotas). Não constitui uma divergência de arquitetura — apenas uma
contagem que precisa ser mantida em sincronia manualmente, sem nenhum teste dedicado a isso.

---

## 11. Decisões Tomadas

**`availableQuantities` de `StartProduction` informado manualmente pelo operador** (`InProgressSection.tsx`,
formato `produto:quantidade` separados por vírgula) — `IMP_504_PRODUCTION_FRONTEND_REPORT.md`, §13, já
previa que o Workspace precisaria compor essa informação a partir de uma fonte real de Stock Position
(Inventory Movement Hub). Esta Sprint, com escopo estritamente limitado ao Workspace do Production Hub
(proibida de alterar Frontend Infrastructure ou compor um Hook novo cross-Hub), não integra
`core/inventory-movement/useStockPosition` — o operador informa manualmente a disponibilidade
conhecida. Documentado como decisão explícita, nunca uma simulação de integração real; uma Sprint
futura de composição cross-Hub (fora desta série) poderia substituir esse formulário manual por uma
consulta real.

**Separação "Ordens de Produção" (criação/consulta) vs. "Ordens em Execução" (cockpit operacional).**
A criação acontece exclusivamente via Ação Rápida do `PageHeader`; "Ordens de Produção" torna-se
puramente consulta (por identificador/por Order de origem) + "Session Preview"; "Ordens em Execução"
concentra toda a máquina de estados (`start`/`registerConsumption`/`registerOutput`/`complete`/
`cancel`), selecionando uma Ordem da lista real `InProgress` antes de agir sobre ela — nenhuma ação
duplicada entre as duas seções.

**Botão "Atualizar" explícito em "Ordens em Execução".** `useProductionOrdersByStatus("InProgress")` é
uma Query real, mas nenhuma sincronização automática existe após `start`/`registerConsumption`/
`registerOutput`/`complete`/`cancel` (`productionCache.ts`, IMP-504, limitação já documentada, mesma
classe de `requisitionsByStatus`) — um botão "Atualizar" explícito refaz a consulta manualmente, nunca
uma tentativa de recálculo local do que já deveria ter mudado no servidor.

**`totalConsumedCost`/`totalGeneratedQuantity` nunca exibidos de forma agregada no Analytics** — apenas
por Ordem individual (onde já existiam Hooks dedicados, não utilizados nesta Sprint para não introduzir
complexidade adicional além do estritamente necessário aos oito requisitos da Sprint); o Analytics
deriva exclusivamente de contagens sobre `productionOrdersThisSession`, nunca somando
`acquisitionCost`/`quantityGenerated` localmente — essa soma já é a única consolidação de custo
permitida ao domínio (`PRODUCTION_HUB.md`, Capítulo 3) e pertence exclusivamente ao servidor.

**`BOMSection`/`InProgressSection` usam um parser simples (`produto:quantidade`) em vez de um
componente de lista dinâmica dedicado.** Nenhum componente "editor de linhas repetíveis" já existe no
Design System (`shared/components/ui/`) — construir um novo estaria fora do escopo desta Sprint
("Somente criar novos componentes caso realmente não exista equivalente" já respeitado ao reutilizar
`Field`/`Button` em um padrão local repetido, `LinesEditor`, interno a `BOMSection.tsx`, nunca
promovido a `shared/`).

---

## 12. Qualidade (10 Perguntas Oficiais)

Per `ADAPTIVE_ENGINEERING_CHECKLIST.md`:

1. **Arquitetura respeitada?** Sim — toda seção consome exclusivamente `core/production/` (IMP-504);
   nenhuma regra de negócio, nenhum cálculo do Core reimplementado na interface.
2. **Auditoria realizada?** Sim — Seções 1 e 9.
3. **Blueprint seguido?** Sim — Página/Seções/Drawer/HistoryLog idênticos em forma a IMP-205/305/405.
4. **Componente reutilizado?** Sim — Seção 3; apenas cinco novos, todos para Entidades sem equivalente.
5. **Abstração aplicada?** Nenhuma nova — mesma resposta conservadora de toda Sprint desta série.
6. **Limitações documentadas?** Sim — Seções 9 e 11.
7. **Melhoria para UX-002?** Uma observação registrada, nenhuma mudança de convenção (Seção 1).
8. **Testes completos?** Sim — 14 testes cobrindo as oito seções, o fluxo operacional completo e a
   auditoria de duplicidade. Ver Seção 8 para comparação com IMP-405.
9. **Cobertura equivalente a IMP-405?** Sim — Seção 8.
10. **Documentação atualizada?** Sim — este relatório; nenhum documento de arquitetura alterado.

Nenhuma refatoração além do estritamente necessário para esta Sprint foi realizada.

---

## 13. Validação

`pnpm typecheck`, `pnpm build`, `pnpm lint` e `pnpm test` executados três vezes consecutivas sobre o
workspace completo:

| Execução | typecheck | build | lint | test |
|---|---|---|---|---|
| 1 | ✅ 0 erros | ✅ 0 erros | ✅ 0 erros | ✅ 203 arquivos, 1226 aprovados + 1 falha esperada |
| 2 | ✅ 0 erros | ✅ 0 erros | ✅ 0 erros | ⚠️ 1ª tentativa: 2 arquivos falharam sob carga plena; repetição imediata: 203 arquivos, 1226 aprovados + 1 falha esperada |
| 3 | ✅ 0 erros | ✅ 0 erros | ✅ 0 erros | ✅ 203 arquivos, 1226 aprovados + 1 falha esperada |

**Flake documentado, não corrigido silenciosamente**: na primeira tentativa da segunda execução de
`pnpm test`, `ProductionPage.test.tsx` (teste "cancela uma Ordem antes de qualquer consumo") e um
segundo arquivo (não identificado no log daquela execução) falharam sob a suíte completa em paralelo;
`ProductionPage.test.tsx` isoladamente (`vitest run apps/web/src/pages/production`) passou 14/14 de
forma consistente em três execuções separadas, e a repetição imediata da suíte completa também passou
sem nenhuma falha. Mesma classe de flake já registrada como pré-existente e não relacionada à
correção de código (`packages/persistence`, pesquisa de IMP-502: "`apps/web` tests occasionally flake
under full-suite load... documented as pre-existing, timing-sensitive") — nenhum workaround foi
introduzido no código de produção ou de teste para mascarar essa instabilidade; a suíte completa
recomeçada confirmou a saúde real do código.

A única falha esperada (`it.fails`) continua sendo o bug de duplo `registerReceiving` de Purchase Hub,
pré-existente, não relacionado a esta Sprint.

---

## 14. Encerramento do Production Hub

**O Production Hub está oficialmente completo — o quarto domínio ERP integral desta plataforma:**

| Sprint | Camada | Status |
|---|---|---|
| IMP-501 | Core (`@abp/production-hub`) | ✅ |
| IMP-502 | Persistence (SQLite real) | ✅ |
| IMP-503 | HTTP API (17 endpoints) | ✅ |
| IMP-504 | Frontend Infrastructure (`core/production/`, 17 Hooks) | ✅ |
| IMP-505 | Workspace (`/production`, oito seções) | ✅ |

**Melhorias arquiteturais identificadas ao longo da série IMP-501 → IMP-505, registradas para servir de
referência aos próximos domínios (Financial Hub, Fiscal Hub), sem alterar retroativamente nenhum Hub já
concluído:**

1. **Padrão "Aggregate com dois arrays internos"** (`ProductionOrder.consumptions`/`.outputs`,
   IMP-502) generaliza com sucesso o template de um-array-interno de Purchase Hub
   (`PurchaseOrder.items`). Um futuro domínio com três ou mais coleções internas (nenhum caso
   conhecido ainda) provavelmente reutilizaria o mesmo padrão sem alteração.
2. **Tensão real entre texto de arquitetura e instrução de Sprint** (IMP-501, Divergência 2:
   `PRODUCTION_HUB.md` descreve `StartProduction` "consultando Stock Position via Query", mas a
   instrução da própria Sprint proibiu consultar Inventory Movement diretamente) — resolvida como
   parâmetro explícito do chamador em todas as quatro camadas subsequentes (Core → Persistência → HTTP
   → Frontend → Workspace), nunca uma composição cross-Hub disfarçada. Um Hub futuro com uma
   dependência real de dado de outro domínio (ex.: Fiscal Hub precisando de valores de Financial Hub)
   deveria seguir a mesma disciplina: parâmetro explícito no Core, nunca um import direto de outro
   pacote de domínio.
3. **Nova instância da classe "cache mutável sem estratégia consolidada"** (IMP-504) — não apenas
   listas chaveadas por status mutável (`productionOrdersByStatus`, já conhecido desde IMP-304), mas
   também **valores escalares derivados no servidor** (`totalConsumedCost`/`totalGeneratedQuantity`)
   que ficam desatualizados após uma Mutation relacionada, sem alternativa de recomputação legítima no
   cliente. Um futuro Hub com uma consulta de agregação/soma real (provável em Financial Hub) herdará
   a mesma limitação — a disciplina correta, já validada aqui, é nunca recalcular a regra de negócio no
   Frontend, apenas invalidar/refazer manualmente a Query quando exibida ao lado de uma ação que a
   altera.
4. **Quatro candidatos a abstração cross-Hub seguem crescendo em evidência, ainda nunca extraídos**
   (`EntitySummaryCard` genérico, `createStatusBadge(toneMap, labelMap)` genérico, template "consulta
   por identificador obrigatório", modularização de `demoApiFetchMock.ts` por domínio) — Production Hub
   contribuiu mais uma instância de cada (`ProductionOrderCard`/`BillOfMaterialsCard`/`WorkCenterCard`,
   `ProductionStatusBadge`/`BillOfMaterialsStatusBadge`, `OrdersSection`/`BOMSection`, mais ~250 linhas
   em `demoApiFetchMock.ts`). Nenhum extraído nesta série, per disciplina consistente de "não refatorar
   durante um Sprint de implementação" — uma Sprint de consolidação transversal dedicada (já
   recomendada por `IMP_405_INVENTORY_MOVEMENT_WORKSPACE_REPORT.md`, nunca executada) continua sendo o
   caminho correto antes ou durante o próximo domínio (Financial Hub, IMP-601), quando o número de
   instâncias reais tornar a abstração inquestionavelmente justificada.

**Ao final desta Sprint**: Supplier Hub ✅, Purchase Hub ✅, Inventory Movement Hub ✅, **Production Hub
✅ COMPLETO** — preparando IMP-601 (Financial Hub Core).
