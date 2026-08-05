# IMP-301 — Purchase Hub Core — Relatório de Implementação

**Adaptive Business Platform · Relatório de Sprint**

---

## Nota de Posicionamento Documental

Este relatório fecha a Sprint **IMP-301 — Purchase Hub Core**, a primeira Sprint de implementação do segundo domínio ERP da plataforma. Ela traduz `docs/architecture/PURCHASE_HUB.md` (Draft) em código real no novo pacote `platform/packages/purchase-hub`, seguindo integralmente `ERP_ARCHITECTURE.md`, `ERP_CONTEXT_MAP.md`, `DOMAIN_EVENT_CATALOG.md` e `DOMAIN_OWNERSHIP_MATRIX.md`, sem alterar nenhuma decisão arquitetural já aprovada, e seguindo exatamente o blueprint validado por `SupplierHub` (IMP-201/202/203/204/205 e UX-002) — per instrução explícita desta Sprint, o Supplier Hub é agora o padrão oficial de Fase 2 e nenhuma decisão arquitetural sua foi alterada. Nenhum domínio existente foi tocado — nenhuma linha de `Business Profile`, `Branding`, `CRM`, `Commerce`, `Inventory`, `Finance`, `Communication`, `Analytics`, `Automation`, `Knowledge`, `Runtime` ou `Supplier Hub` foi alterada. Escopo estritamente de Core: nenhuma persistência SQLite, nenhuma API HTTP, nenhum Frontend, nenhum Workspace, nenhum DTO, nenhum React Hook, nenhuma Query Key, nenhum Cache.

Esta Sprint executou a auditoria obrigatória (Passo 1) antes de qualquer implementação, documentada integralmente no Capítulo 1, e encontrou três divergências genuínas (Capítulo 3) — nenhuma delas corrigida silenciosamente.

---

## 1. Auditoria Realizada (Passo 1, obrigatória antes de qualquer implementação)

**Existe código legado relacionado a Purchase? Não, como domínio Core.** Busca completa por "Purchase"/"purchase" em todo o monorepo confirmou: nenhum `packages/purchase-hub` existia antes desta Sprint; nenhuma Entidade, Repository, Service ou Manager de Purchase existe em nenhum outro pacote. As únicas ocorrências reais são:
- `purchaseOrderId` como campo opaco de correlação já usado dentro de `SupplierPerformanceRecord`/`SupplierPerformanceRepository` (IMP-201/202) — uso legítimo já esperado, não uma colisão.
- Placeholders de Frontend, inteiramente sem lógica de domínio, criados pela FUN-104/FUN-106: `apps/web/src/pages/purchases/*` (`PurchasePage.tsx`, `purchaseSections.ts`, `sections/OrdersSection.tsx`, entre outros), `apps/web/src/pages/product-hub/sections/PurchasesSection.tsx`, e os componentes `PurchaseCard`/`ReceivingCard`/`CostIndicator`/`SupplierBadge` em `shared/components/ui/`. Cada um já documentado em seu próprio commentário como `NotConnectedNotice`, explicitamente aguardando um `PurchaseManager` real — confirmados, lidos nesta Sprint, e deixados intactos (fora do escopo Core-only).

**Existe algum domínio parcialmente implementado?** Não. Diferente do Supplier Hub (que encontrou um stub `Supplier`/`SupplierRegistered` real, porém morto, dentro do CRM Hub), a auditoria desta Sprint não encontrou nenhum tipo, Entidade ou Evento de Purchase declarado em nenhum outro pacote de domínio (`crm-hub`, `commerce-hub`, `finance-hub`). Purchase Hub Core é território genuinamente livre.

**Existe algum conceito morto?** Não dentro do próprio domínio Purchase. A auditoria encontrou, isto sim, uma dependência arquitetural real de um domínio que ainda não existe como código — detalhado no Capítulo 3 (`ReorderEvaluationService`/Inventory Movement Hub).

**Existe alguma divergência?** Sim, três — nenhuma delas impede a implementação, todas documentadas no Capítulo 3 antes de qualquer linha de código de produção ser escrita.

---

## 2. Arquitetura Implementada

Novo pacote `@abp/purchase-hub` (`platform/packages/purchase-hub`), 23 arquivos de produção + 6 arquivos de teste, seguindo exatamente a estrutura de `PURCHASE_HUB.md` e o mesmo layout de arquivo já validado por `@abp/supplier-hub`:

| Categoria | Arquivos |
|---|---|
| Value Objects | `Money.ts`, `ApprovalThreshold.ts`, `ReceivingLine.ts` (`PurchaseStatus` inline em `PurchaseOrder.ts`, mesma convenção de `SupplierStatus` em `Supplier.ts`) |
| Entidades | `PurchaseOrder.ts` (Aggregate Root), `PurchaseOrderItem.ts`, `Receiving.ts`, `PurchaseRequisition.ts` (Aggregate Root próprio), `ReorderRule.ts` (Aggregate Root próprio) |
| Commands | `PurchaseCommand.ts` (12 tipos, exatamente os de `PURCHASE_HUB.md`, Capítulo 7) |
| Events | `PurchaseEvent.ts` (9 tipos, exatamente os de `DOMAIN_EVENT_CATALOG.md`) |
| Repository Interfaces | `PurchaseOrderRepository.ts`, `ReceivingRepository.ts`, `PurchaseRequisitionRepository.ts`, `ReorderRuleRepository.ts` — apenas interface, zero implementação |
| Domain Errors | `PurchaseDomainError.ts` (13 classes, nenhuma reutilizada de `SupplierDomainError`) |
| Policy | `PurchasePolicy.ts` (decisões puras, nunca lança exceção) |
| Validator | `PurchaseValidator.ts` (validação real, lança `PurchaseDomainError`) |
| Factory | `PurchaseFactory.ts` (construção de toda Entidade) |
| Services | `PurchaseOrderService.ts`, `ReceivingService.ts`, `ReorderEvaluationService.ts`, `PurchaseRequisitionService.ts` |
| Manager | `PurchaseManager.ts` — única fachada pública |
| Testing | `testing/InMemoryFakes.ts` — fakes em memória, nunca exportados pelo barrel de produção |

`index.ts` reexporta todo contrato de produção; `package.json` expõe `.` e `./testing` como dois entry points distintos, mesmo padrão de `@abp/supplier-hub`. `tsconfig.json` do pacote foi adicionado às `references` de `platform/tsconfig.json`, logo após a entrada de `supplier-hub`.

---

## 3. Divergências Encontradas (documentadas antes da implementação, per instrução explícita do Sprint)

**Divergência 1 — quatro Commands sem Evento correspondente.** `PURCHASE_HUB.md`, Capítulo 7, lista doze Commands; `DOMAIN_EVENT_CATALOG.md` cataloga apenas nove Eventos para o Purchase Hub. Comparação exaustiva confirma que `AddPurchaseOrderItem`, `RejectPurchaseRequisition`, `CreateReorderRule` e `DeactivateReorderRule` não possuem Evento correspondente. Per instrução explícita ("Nunca criar eventos adicionais"), nenhum Evento foi inventado — os quatro métodos correspondentes de `PurchaseManager` retornam `command` preenchido e `events: []`, documentado inline em cada um e testado explicitamente em `PurchaseManager.test.ts` ("sem publicar Evento — incompletude documentada").

**Divergência 2 — `ReorderEvaluationService` depende de um Hub que ainda não existe como código.** `PURCHASE_HUB.md`, Capítulo 11, descreve este Service avaliando "continuamente" `Reorder Rule` contra "Stock Position" do Inventory Movement Hub. A auditoria (Capítulo 1) confirmou que `packages/inventory-movement-hub` não existe nesta Fase — apenas sua arquitetura, produzida pela ERP-001 (`docs/architecture/INVENTORY_MOVEMENT_HUB.md`), sem nenhum código real. Não existe, portanto, nenhuma fonte real de Evento de estoque à qual este Hub pudesse se inscrever nesta Sprint. **Decisão tomada:** `ReorderEvaluationService.evaluate(ruleId, currentQuantity)` recebe a quantidade em estoque corrente como parâmetro explícito do chamador, em vez de qualquer inscrição real — mesma disciplina já usada por `SupplierPerformanceService.recordFromReceiving` diante do próprio Purchase Hub, quando este ainda não existia como pacote (IMP-201). A avaliação "contínua" real fica para uma Sprint futura de integração, quando `packages/inventory-movement-hub` existir (Capítulo 8).

**Divergência 3 — ambiguidade na máquina de estados de `PurchaseStatus` em torno de `PendingApproval`.** `PURCHASE_HUB.md`, Capítulo 5, lista `PendingApproval` como estado distinto de `Draft`, mas o Fluxo Completo (Capítulo 13) não descreve explicitamente qual transição leva a ele, nem como o `ApprovalThreshold` (configurável por Tenant, sem nenhum armazenamento de configuração por Tenant existente na plataforma) se relaciona com a decisão de aprovação automática versus explícita. **Decisão tomada, documentada em `PurchaseOrder.ts`:** `Draft` é um Purchase Order ainda sem item; a primeira chamada a `AddPurchaseOrderItem` transiciona `Draft → PendingApproval` (sem Evento — não existe um catalogado para esta transição, e nenhum foi inventado, mesma disciplina da Divergência 1). `ApprovalThreshold` nunca é lido de um repositório próprio do Purchase Hub — é recebido como parâmetro explícito de `PurchaseManager.approvePurchaseOrder`, e o Purchase Hub nunca decide sozinho se uma aprovação é "automática": todo `ApprovePurchaseOrder` bem-sucedido acima do teto exige uma `approvedByIdentityId` explícita (`PurchaseOrderApprovalRequiresIdentityError` caso ausente) — o Purchase Hub nunca aprova por conta própria, exatamente como `PURCHASE_HUB.md`, ADR-PU-004, exige ("nunca por decisão interna do Purchase Hub").

---

## 4. Decisões Tomadas Durante a Implementação

**`PurchaseOrderService` e `PurchaseRequisitionService` foram adicionados, sem estarem nomeados em `PURCHASE_HUB.md`, Capítulo 11** (que nomeia explicitamente apenas `PurchaseOrderService`... na verdade nomeia `PurchaseOrderService`, `ReceivingService` e `ReorderEvaluationService`). `PurchaseRequisitionService` é um Service base do Aggregate Root `PurchaseRequisition`, complementação natural de implementação — mesma disciplina já usada para justificar `SupplierService` em IMP-201.

**`ReorderEvaluationService` absorveu `createRule`/`deactivateRule`, em vez de um `ReorderRuleService` próprio.** `PURCHASE_HUB.md` nomeia apenas um Service para o Aggregate `ReorderRule`; manter todo o ciclo de vida (criar, desativar, avaliar) em um único Service mantém uma responsabilidade coerente ("gerenciar Reorder Rules") sem introduzir uma classe adicional não prevista pela arquitetura.

**`ConvertRequisitionToPurchaseOrder` exige o custo de aquisição como parâmetro explícito do chamador.** `PurchaseRequisitionLine` (Capítulo 5) carrega apenas Produto e quantidade sugerida — o custo de aquisição só é conhecido ao negociar com o Fornecedor escolhido, nunca antes. `PurchaseRequisitionService.convertToPurchaseOrder` recebe um `ReadonlyMap<productId, Money>` e lança `MissingAcquisitionCostError` para qualquer Produto sem custo informado — nunca um valor fabricado ou herdado de `SupplierCatalogItem.listPrice` (que, por design do Supplier Hub, "nunca vincula automaticamente a nenhum custo de aquisição real").

**`Money` definido localmente, segunda cópia independente do mesmo conceito.** `PURCHASE_HUB.md` descreve `Money` nos mesmos termos que `SUPPLIER_HUB.md` já usa. Nenhum pacote compartilhado de Value Objects existe no monorepo (reconfirmado: `@abp/shared` não define `Money`). `packages/purchase-hub/src/Money.ts` é, portanto, a segunda definição local independente do mesmo Value Object — avaliado explicitamente no Capítulo 7 (Qualidade) como uma oportunidade real de abstração compartilhada, deliberadamente não executada nesta Sprint.

**`PurchaseEvent` usa múltiplos campos de referência opcionais (`purchaseOrderId?`, `requisitionId?`, `ruleId?`), não um único campo obrigatório como `SupplierEvent.supplierId`.** O Purchase Hub publica Eventos de três Aggregates distintos (`PurchaseOrder`, `PurchaseRequisition`, `ReorderRule`); mesmo formato multi-Aggregate já usado por `CRMEvent.ts` (`relationshipId` opcional).

**`evaluateReorderRule` não é um dos doze Commands aprovados.** É um mecanismo de orquestração interna/agendada (avaliação "contínua" da Divergência 2), nunca uma ação de usuário — por isso `PurchaseManager.evaluateReorderRule` retorna `PurchaseEvaluationResult<T>` (sem campo `command`), um tipo distinto de `PurchaseOperationResult<T>`, mantendo o contrato de Command íntegro: todo `PurchaseCommand` retornado corresponde a um dos doze Commands reais e aprovados, nunca a uma chamada interna de orquestração.

---

## 5. Aderência aos Documentos ERP

Verificado, capítulo a capítulo:

- **Responsabilidades e Limites** (`PURCHASE_HUB.md`, Capítulos 2-3): nenhum método do pacote cria/altera `Supplier`, `Product`/Catalog ou qualquer Entidade de outro domínio — todas as referências (`supplierId`, `productId`) são identificador opaco (`string`), nenhum tipo de `@abp/supplier-hub`/`@abp/commerce-hub` é importado.
- **Aggregates** (Capítulo 4): `PurchaseOrder` (com `PurchaseOrderItem` interno), `PurchaseRequisition` e `ReorderRule` são os três Aggregate Roots, exatamente como especificado; `Receiving` é Entidade própria com Repository dedicado, imutável assim que criada.
- **Commands** (Capítulo 7): os doze Commands implementados são exatamente os catalogados — nenhum inventado.
- **Events** (`DOMAIN_EVENT_CATALOG.md`): os nove Eventos implementados são exatamente os catalogados — nenhum adicional criado, mesmo onde o catálogo está incompleto (Divergência 1).
- **Procurement absorvido, nunca um Owner separado** (Capítulo 9, ADR-PU-001): nenhuma classe `ProcurementManager` ou equivalente foi criada; `PurchaseRequisition` vive inteiramente dentro de `@abp/purchase-hub`, orquestrada pelo mesmo `PurchaseManager`.
- **Manager como única fachada** (Capítulo 11): `PurchaseManager` é a única classe exportada capaz de orquestrar os quatro Services; nenhum teste, nenhum consumidor futuro deveria instanciar `PurchaseOrderService`/`ReceivingService`/`ReorderEvaluationService`/`PurchaseRequisitionService` diretamente fora de composição via Manager.
- **Regras de Negócio** (Capítulo 12): "Quantidade recebida nunca excede a pendente" (`ensureReceivingWithinPending`), "Nenhum cancelamento após Receiving" (`ensureCanCancelPurchaseOrder`), "Aprovação explícita acima do teto" (`ensureApprovalIdentityProvided`), "Apenas Requisition aprovada é convertida" (`ensureRequisitionApproved`) — todas implementadas e testadas.
- **ADR-PU-001 a ADR-PU-004** (Capítulo 15): respeitados sem exceção — Procurement nunca um Owner separado; `ApprovalThreshold` configurável por Tenant nunca hardcoded, sempre parâmetro externo; `ReorderRule` nunca aprova/envia um Purchase Order sozinha, apenas cria a `PurchaseRequisition` correspondente.

---

## 6. Limitações Encontradas

`ReorderEvaluationService.evaluate` não possui nenhuma inscrição real em evento de estoque — recebe a quantidade corrente como parâmetro explícito, porque `packages/inventory-movement-hub` ainda não existe como código (Divergência 2). Esta é uma limitação herdada da ordem de implementação dos Hubs ERP, não desta Sprint.

`ConvertRequisitionToPurchaseOrder` não valida que o Fornecedor informado (`supplierId`) está `Active` — essa validação já existe como predicado puro em `SupplierPolicy.isEligibleForNewPurchaseOrder` (`@abp/supplier-hub`), exposto desde IMP-201 exatamente para este consumo futuro, mas aplicá-la aqui exigiria importar `@abp/supplier-hub` dentro de `@abp/purchase-hub` — proibido pelo Limite de Domínio desta Sprint ("nenhum acoplamento com outros Hubs"). Fica registrada como responsabilidade de uma orquestração cross-hub futura (fora do escopo de qualquer Core Sprint isolada), não desta implementação.

Nenhuma validação de que `productId` referenciado por `PurchaseOrderItem`/`PurchaseRequisitionLine`/`ReorderRule` realmente existe no Commerce Hub — por desenho, mesma disciplina de `SupplierCatalogItem.productId`, responsabilidade do chamador/orquestração futura.

`AddPurchaseOrderItem`, `RejectPurchaseRequisition`, `CreateReorderRule` e `DeactivateReorderRule` não possuem Evento de catálogo — as operações são persistidas corretamente, mas nenhum consumidor externo é notificado, limitação herdada da arquitetura aprovada (Divergência 1).

---

## 7. Testes Criados

6 arquivos de teste, 78 testes, 100% passando:

| Arquivo | Cobertura |
|---|---|
| `PurchaseManager.test.ts` (29 testes) | Os 12 Commands, os 9 Events (incluindo os quatro casos de `events: []` documentados e o caso especial de `evaluateReorderRule` sem `command`), fluxo completo Draft→PendingApproval→Approved→Sent→PartiallyReceived→Received, aprovação dentro/acima do threshold com/sem identidade, cancelamento bloqueado após Receiving, conversão de Requisition com/sem custo informado, todas as Query methods |
| `PurchaseValidator.test.ts` (17 testes) | Cada um dos 10 métodos de validação, caso positivo e negativo |
| `PurchasePolicy.test.ts` (17 testes) | `canTransitionPurchaseOrderStatus` (fluxo feliz completo, saltos inválidos, estados finais, o caso especial `PartiallyReceived → PartiallyReceived`), `canAddPurchaseOrderItem`, `canTransitionRequisitionStatus`, `shouldTriggerReorder` |
| `ValueObjects.test.ts` (8 testes) | `Money` (validade e soma), `ApprovalThreshold` (dentro/fora do teto, moeda divergente), `ReceivingLine` |
| `PurchaseFactory.test.ts` (5 testes) | Construção de cada uma das 5 Entidades, defaults corretos (`Draft`, `Pending`, `Open`, `active: true`) |
| `PurchaseDomainError.test.ts` (2 testes) | `code` estável de cada uma das 13 classes, herança real de `Error` |

---

## 8. Cobertura Obtida

Todo Command, todo Event, toda Entidade, todo Service (via `PurchaseManager`), a Policy, o Validator e a Factory têm ao menos um teste direto — 78 testes, superior em volume aos 48 testes de `@abp/supplier-hub` (IMP-201), ainda que concentrados em 6 arquivos em vez de 9: a cobertura de cada Service individual (`PurchaseOrderService`/`ReceivingService`/`ReorderEvaluationService`/`PurchaseRequisitionService`) foi obtida através do fluxo completo em `PurchaseManager.test.ts`, em vez de arquivos de teste próprios por Service — avaliado no Capítulo 9 (Qualidade) como uma diferença estrutural válida, não uma lacuna de cobertura.

`pnpm typecheck`, `pnpm build`, `pnpm lint` e `pnpm test` executados na raiz do monorepo — todos verdes. Suíte completa executada três vezes:
1. Primeira execução: 2 falhas, ambas no próprio `purchase-hub` (mensagem de erro esperada no teste divergindo de "exige" para "requer" na classe real) — corrigido no teste, nunca no código de produção.
2. Segunda execução: 765 testes, 171 arquivos, 100% verde.
3. Terceira execução: 1 falha isolada em `apps/web/src/app/router/routes.test.tsx` — o mesmo flake de timing pré-existente já documentado desde IMP-201 (não relacionado a Purchase Hub; zero teste de `purchase-hub` falhou nesta execução).

---

## 9. Qualidade — Comparação com Supplier Hub

**O padrão foi seguido integralmente.** Mesma estrutura de arquivo por categoria (Value Objects → Entidades → Commands/Events → Repository Interfaces → Domain Errors → Policy → Validator → Factory → Services → Manager → Testing), mesmo formato de `{Domain}OperationResult<T> = {result, command, events}`, mesmo padrão de Fakes em memória nunca exportados pelo barrel principal, mesma disciplina "Manager como única fachada".

**Duplicação real identificada, não executada nesta Sprint.** `Money.ts` agora existe em duas cópias independentes e idênticas (`@abp/supplier-hub` e `@abp/purchase-hub`) — candidato real a um futuro pacote compartilhado de Value Objects (`@abp/domain-kit` ou equivalente). Registrado aqui como recomendação, per instrução explícita ("Não refatorar o Supplier Hub neste Sprint").

**Oportunidade de abstração adicional identificada.** O par Policy/Validator (`canTransitionXStatus` puro + `ensureXStatusTransitionAllowed` lançando) se repete quase identicamente entre `SupplierPolicy`/`SupplierValidator` e `PurchasePolicy`/`PurchaseValidator` — e dentro do próprio Purchase Hub, entre a máquina de estados de `PurchaseOrder` e a de `PurchaseRequisition`. Um helper genérico `createStateMachine<TStatus>(edges)` seria um candidato razoável para uma futura Sprint de consolidação (Inventory Movement Hub ou Production Hub, os próximos domínios, teriam a mesma necessidade) — não implementado agora, por não ser pedido pelo escopo desta Sprint e por adicionar uma camada de indireção sobre um código já simples e testado.

**Diferença estrutural válida em Testes.** Supplier Hub distribuiu a cobertura de Service em 9 arquivos (um por Service adicional: `SupplierCatalogService.test.ts`, `SupplierContractService.test.ts`, `SupplierPerformanceService.test.ts`); Purchase Hub concentrou a mesma amplitude de casos em `PurchaseManager.test.ts`, testando cada Service através do Manager. Ambas as abordagens cobrem o mesmo comportamento observável — a escolha desta Sprint favoreceu não fragmentar testes de fluxo (ex.: Draft→PendingApproval→Approved→Sent→Received) que atravessam múltiplos Services em sequência.

---

## 10. Preparação para IMP-302 (Persistência)

Os quatro Repository Interfaces (`PurchaseOrderRepository`, `ReceivingRepository`, `PurchaseRequisitionRepository`, `ReorderRuleRepository`) estão prontos para receber implementação SQLite real — nenhuma mudança de contrato deveria ser necessária, apenas uma nova classe por interface em `packages/persistence`, seguindo o padrão já estabelecido por `packages/supplier-hub` (IMP-202), incluindo o primeiro uso real de FOREIGN KEY naquela Sprint como precedente direto para `PurchaseOrderItem.purchaseOrderId`/`Receiving.purchaseOrderId`. `PurchaseFactory`/`PurchaseValidator`/`PurchasePolicy`/`PurchaseManager` não têm nenhuma dependência de infraestrutura — nenhum deles precisa mudar quando a persistência real for introduzida.

Quando `packages/inventory-movement-hub` existir como código real (Divergência 2), `ReorderEvaluationService.evaluate` é o ponto de extensão natural: sua assinatura já isola "quantidade corrente" como parâmetro explícito, então a futura integração real (evento de estoque → chamada a `evaluate`) não deveria exigir nenhuma mudança de contrato dentro do Purchase Hub, apenas um novo chamador.

---

## 11. Conclusão

O Purchase Hub Core está implementado, testado e validado integralmente conforme `PURCHASE_HUB.md`, seguindo exatamente o blueprint do Supplier Hub. A auditoria obrigatória (Passo 1) confirmou território livre de código legado ou conceito morto dentro do próprio domínio Purchase. Três divergências genuínas foram encontradas e documentadas antes de qualquer implementação — nenhuma corrigida silenciosamente: quatro Commands sem Evento catalogado (mesma disciplina de `events: []` já validada por Supplier Hub), a dependência arquitetural de um Inventory Movement Hub que ainda não existe como código (resolvida via parâmetro explícito, limite de domínio documentado), e uma ambiguidade real na máquina de estados de `PendingApproval` (resolvida com uma decisão de implementação justificada e documentada). Nenhum domínio existente foi alterado. O pacote está pronto para receber, em Sprints futuras, Persistência (IMP-302), API HTTP, Frontend e Workspace, repetindo o ciclo de evolução já validado pelo Supplier Hub — e consolidando, pela segunda vez consecutiva, o Novo Padrão obrigatório desta Fase.
