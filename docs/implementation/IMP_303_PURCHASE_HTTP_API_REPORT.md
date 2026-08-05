# IMP-303 — Purchase HTTP API — Relatório de Implementação

**Adaptive Business Platform · Relatório de Sprint**

---

## Nota de Posicionamento Documental

Este relatório fecha a Sprint **IMP-303 — Purchase HTTP API**, a terceira etapa do Purchase Hub (Arquitetura ✅ ERP-001, Core ✅ IMP-301, Persistência ✅ IMP-302). Ela adiciona, exclusivamente ao pacote já existente `apps/api`, a camada de transporte HTTP sobre `PurchaseManager` já aprovado — nenhuma alteração a `PurchaseManager`, Services, Entities, Commands, Events, Policies, Validators, Factories, Repository Interfaces ou à Persistência (IMP-302). Nenhum Frontend, nenhum Workspace, nenhum DTO compartilhado com `apps/web`, nenhuma autenticação nova foi criada. O blueprint técnico utilizado integralmente foi `IMP_203_SUPPLIER_HTTP_API_REPORT.md`.

Esta Sprint encontrou, através do próprio teste de integração HTTP completo (não por leitura de código), um bug real e reproduzível na Persistência (IMP-302) — detalhado no Capítulo 8. Como Persistência está congelada neste Sprint, o bug foi documentado e isolado, nunca corrigido silenciosamente.

---

## 1. Auditoria Realizada (Passo 1, obrigatória antes de qualquer implementação)

Comparação completa entre `routes/supplier.ts`/`dtos/supplier.dto.ts`/`mappers/supplier.mapper.ts`/`errors/mapSupplierError.ts` (IMP-203) e o que o Purchase Hub exige, à luz de `PurchaseManager` (IMP-301) e `PurchaseDomainError` (14 subclasses).

**Existe algum endpoint reutilizável?** Não, literalmente — cada domínio tem suas próprias rotas, mesma disciplina de toda a API (`crm.ts`, `businessProfile.ts`, `branding.ts`, `supplier.ts`, nenhum compartilha um handler). O *padrão* é 100% reutilizável — confirmado agora pela segunda vez consecutiva.

**Existe algum padrão novo?** Três:
1. `evaluateReorderRule` é o primeiro método público de um Manager que não corresponde a nenhum dos Commands aprovados pelo catálogo (`PurchaseEvaluationResult<T>`, sem campo `command`) — ainda assim exposto como endpoint, per instrução explícita ("criar somente endpoints correspondentes aos métodos públicos do PurchaseManager").
2. `RegisterReceivingResponseDto`/`ConvertRequisitionToPurchaseOrderResponseDto` são os primeiros DTOs de resposta compostos desta API — `PurchaseManager.registerReceiving`/`convertRequisitionToPurchaseOrder` retornam mais de uma Entidade no mesmo resultado (`{ receiving, purchaseOrder, fullyReceived }`/`{ requisition, purchaseOrder }`), diferente de todo Manager anterior, cujo `result` é sempre uma única Entidade ou um array dela.
3. `ApprovalThreshold` (`{ limit: Money }`) exigiu uma variante do achatamento de Value Object já usado por `TaxId`/`PaymentTerms` (IMP-203) — ver Capítulo 4.

**Existe alguma oportunidade de abstração?** Sim, três, nenhuma executada (ver Capítulo 9).

**Existe algum bug anteriormente corrigido que possa reaparecer?** O bug de IMP-203 (`PATCH` reconstruindo o corpo com chave `undefined` explícita, sobrescrevendo dado já existente) **não tem superfície de ataque no Purchase Hub** — auditoria confirmou que nenhum dos doze Commands de `PurchaseManager` corresponde a uma atualização parcial por merge (`{ ...existing, ...input }`); cada Command é uma criação completa ou uma transição de propósito específico. Por isso, **esta Sprint não implementa nenhum endpoint `PATCH`** — decisão documentada, não uma omissão. Ver Capítulo 5.

---

## 2. Endpoints Implementados

Dezenove endpoints — doze Commands, seis Query, mais `evaluateReorderRule` (não é um Command aprovado, mas é público no Core):

| Método | Rota | `PurchaseManager` | Status de sucesso |
|---|---|---|---|
| POST | `/purchase-orders` | `createPurchaseOrder` | 201 |
| GET | `/purchase-orders/:purchaseOrderId` | `getPurchaseOrder` | 200 (404 se ausente) |
| GET | `/purchase-orders/by-tenant/:tenantId/open` | `listOpenPurchaseOrders` | 200 |
| GET | `/purchase-orders/by-supplier/:supplierId` | `listPurchaseOrdersBySupplier` | 200 |
| POST | `/purchase-orders/:purchaseOrderId/items` | `addPurchaseOrderItem` | 201 |
| POST | `/purchase-orders/:purchaseOrderId/approve` | `approvePurchaseOrder` | 200 |
| POST | `/purchase-orders/:purchaseOrderId/send` | `sendPurchaseOrderToSupplier` | 200 |
| POST | `/purchase-orders/:purchaseOrderId/cancel` | `cancelPurchaseOrder` | 200 |
| GET | `/purchase-orders/:purchaseOrderId/receivings` | `listReceivingsByPurchaseOrder` | 200 |
| POST | `/receivings` | `registerReceiving` | 201 |
| POST | `/purchase-requisitions` | `createPurchaseRequisition` | 201 |
| GET | `/purchase-requisitions/:requisitionId` | `getPurchaseRequisition` | 200 (404 se ausente) |
| GET | `/purchase-requisitions/by-tenant/:tenantId/status/:status` | `listPurchaseRequisitionsByStatus` | 200 |
| POST | `/purchase-requisitions/:requisitionId/approve` | `approvePurchaseRequisition` | 200 |
| POST | `/purchase-requisitions/:requisitionId/reject` | `rejectPurchaseRequisition` | 200 |
| POST | `/purchase-requisitions/:requisitionId/convert` | `convertRequisitionToPurchaseOrder` | 201 |
| POST | `/reorder-rules` | `createReorderRule` | 201 |
| POST | `/reorder-rules/:ruleId/deactivate` | `deactivateReorderRule` | 200 |
| POST | `/reorder-rules/:ruleId/evaluate` | `evaluateReorderRule` | 200 |

Os dezenove métodos públicos de `PurchaseManager` mapeiam 1:1 para os dezenove endpoints acima — nenhum inventado, nenhum omitido, nenhum atalho. `evaluateReorderRule` é `POST` (não `GET`), apesar de não ser um Command — tem efeito colateral real (pode criar uma `PurchaseRequisition`), então semanticamente não é uma consulta idempotente.

`GET /purchase-orders/by-tenant/:tenantId/open`, `GET /purchase-orders/by-supplier/:supplierId` e `GET /purchase-requisitions/by-tenant/:tenantId/status/:status` seguem o estilo `by-{campo}/:valor` já estabelecido (`businessProfile.ts`, `supplier.ts`) — a última introduz um **segundo segmento de path** (`/status/:status`) em vez de Querystring, preservando a mesma disciplina de IMP-203 ("decisão deliberada de não introduzir Querystring") mesmo com duas dimensões de filtro.

---

## 3. Schemas OpenAPI

Cada rota declara `schema.tags`/`schema.summary`/`schema.body` (ou `schema.params`, ver abaixo) diretamente no registro Fastify — gerado automaticamente por `@fastify/swagger`, nenhum passo manual. Validação restrita a **formato, tipo, campo obrigatório e enum**, nunca regra de negócio: `additionalProperties: false` em todo `body`, `minLength: 1` para string obrigatória, `type: "integer", minimum: 0|1` para quantidade, `enum` para `origin` (`PurchaseRequisition`) e para `status` (path da listagem por status), `format: "date-time"` para `receivedAt`. Nenhuma verificação de threshold, de transição de status, de quantidade pendente ou de qualquer outra regra de domínio vive em nenhum schema — todas permanecem exclusivamente em `PurchaseValidator`/`PurchasePolicy` (Core, intocados).

**Primeira vez nesta API que um `schema.params` é declarado** (`GET /purchase-requisitions/by-tenant/:tenantId/status/:status`) — `status` é um `enum` de quatro valores; um valor fora do enum é rejeitado com 400 pela própria validação de schema do Fastify, antes de qualquer chamada ao `PurchaseManager`. Testado explicitamente (`purchase.test.ts`, "400 — status inexistente no path").

Testado explicitamente (`purchase.test.ts`, describe "Documentação OpenAPI") que `/documentation/json` expõe a tag `purchase` e os dezenove caminhos (`paths`) esperados.

---

## 4. DTOs Utilizados

Ver `dtos/purchase.dto.ts` — vinte e cinco interfaces. Decisões de forma:

- **Achatamento de Value Object de campo único, mesmo padrão de IMP-203**: nenhuma novidade aqui — `ReceivingLine`/`PurchaseRequisitionLine` (Value Objects de dois campos primitivos, sem identificador) viajam como objeto simples `{ campo1, campo2 }`, idêntico na Request e na Response.
- **`Money` aninhado, mesma exceção deliberada de IMP-203.**
- **`ApprovalThreshold` — achatamento do *wrapper*, não do `Money` interno (decisão nova).** `ApprovalThreshold` é `{ limit: Money }` — um único campo cujo valor é ele mesmo um objeto de dois campos. Diferente de `TaxId`/`PaymentTerms` (cujo único campo é um primitivo, achatado diretamente a `taxId: string`/`paymentTermsDueInDays: number`), aqui o *wrapper* (`limit`) é que desaparece: `ApprovePurchaseOrderRequestDto.threshold` é diretamente um `MoneyDto`, nunca `{ limit: MoneyDto }`. O `Money` interno permanece aninhado, pela mesma razão de sempre (dois campos que sempre viajam juntos). O handler reconstrói `{ limit: threshold }` antes de chamar `PurchaseManager.approvePurchaseOrder`.
- **`acquisitionCosts` como array de `{ productId, cost }`, nunca um objeto-mapa.** `PurchaseManager.convertRequisitionToPurchaseOrder` espera um `ReadonlyMap<string, Money>` — JSON não tem tipo `Map`; o handler converte o array recebido em `Map` antes de chamar o Manager (`new Map(acquisitionCosts.map(...))`), a única transformação de forma desta Sprint que não é um achatamento/desachatamento de Value Object.
- **DTOs de resposta compostos, sem precedente em IMP-203** (`RegisterReceivingResponseDto`, `ConvertRequisitionToPurchaseOrderResponseDto`) — refletem fielmente `RegisterReceivingResult`/`{ requisition, purchaseOrder }` do Core, nunca acrescentando nem removendo um campo.

---

## 5. Mapeamento HTTP e Decisão sobre `PATCH`

Todo handler segue `HTTP → DTO → PurchaseManager → DTO → HTTP` sem exceção — nenhum `if`/regra de negócio além de tradução de forma (destructuring, `new Date(...)`, `.toISOString()`, `new Map(...)`, envolver/desenvolver `ApprovalThreshold`).

**Nenhum endpoint `PATCH` nesta Sprint — decisão documentada, per Capítulo 1.** O bug de IMP-203 (`PATCH /suppliers/:supplierId`) ocorreu porque `SupplierManager.updateSupplier` aceita `Partial<Pick<Supplier, ...>>` e o Core faz `{ ...existing, ...input }` — uma chave presente com valor `undefined` sobrescrevia um campo já existente. `PurchaseManager` não possui **nenhum** método desse formato: `addPurchaseOrderItem` recebe um objeto totalmente tipado (não `Partial`); `approve`/`send`/`cancel`/`reject`/`deactivate` não recebem corpo de atualização de campo algum; `convertRequisitionToPurchaseOrder` recebe `supplierId`/`acquisitionCosts`, nunca um merge parcial sobre a Requisition. Confirmado por leitura completa de `PurchaseManager.ts`/`PurchaseOrderService.ts`/`PurchaseRequisitionService.ts`/`ReorderEvaluationService.ts` (Core, IMP-301) antes de qualquer rota ser escrita — a classe de bug não tem onde reaparecer.

---

## 6. Domain Errors

`errors/mapPurchaseError.ts` — mesmo mecanismo de `mapSupplierError.ts` (IMP-203): mapeia por `instanceof PurchaseDomainError`/`error.code` (nunca por heurística de texto), delega a `mapDomainError.ts` (intocado) como fallback. As catorze subclasses de `PurchaseDomainError` (`PurchaseOrderNotFoundError`, `PurchaseOrderItemNotFoundError`, `PurchaseOrderItemAdditionNotAllowedError`, `PurchaseOrderInvalidStatusTransitionError`, `PurchaseOrderApprovalRequiresIdentityError`, `PurchaseOrderHasReceivingCannotCancelError`, `ReceivingQuantityExceedsPendingError`, `InvalidMoneyError`, `InvalidReceivingLineError`, `PurchaseRequisitionNotFoundError`, `PurchaseRequisitionInvalidStatusTransitionError`, `PurchaseRequisitionNotApprovedError`, `MissingAcquisitionCostError`, `ReorderRuleNotFoundError`) mapeadas explicitamente:

| Código | Status |
|---|---|
| `*_NOT_FOUND` (4 classes) | 404 |
| `PURCHASE_ORDER_ITEM_ADDITION_NOT_ALLOWED`, `PURCHASE_ORDER_INVALID_STATUS_TRANSITION`, `PURCHASE_ORDER_HAS_RECEIVING_CANNOT_CANCEL`, `PURCHASE_REQUISITION_INVALID_STATUS_TRANSITION`, `PURCHASE_REQUISITION_NOT_APPROVED` (5 classes) | 409 |
| `PURCHASE_ORDER_APPROVAL_REQUIRES_IDENTITY`, `RECEIVING_QUANTITY_EXCEEDS_PENDING`, `PURCHASE_INVALID_MONEY`, `PURCHASE_INVALID_RECEIVING_LINE`, `PURCHASE_MISSING_ACQUISITION_COST` (5 classes) | 422 |

Diferente de IMP-203 (que encontrou duas mensagens de `SupplierDomainError` fora do alcance da heurística de `mapDomainError`), a auditoria desta Sprint **não encontrou nenhuma divergência equivalente** — porque `mapPurchaseError` mapeia por `code` para todas as catorze classes, nunca delegando a heurística de texto de `mapDomainError` para nenhuma delas; `mapDomainError` só é alcançado para um erro genuinamente fora de `PurchaseDomainError`.

---

## 7. Integração com `PurchaseManager` e Manager Registry

Nenhuma instanciação direta — toda rota acessa exclusivamente `fastify.managers.purchase`, decorado uma única vez por `managersPlugin` (`plugins/managers.ts`, intocado), que já constrói `PurchaseManager` via `createManagerRegistry("real", handle)` desde IMP-302. Nenhuma dependência nova foi adicionada a `managers.ts`.

---

## 8. Divergência Encontrada — Bug Real na Persistência (IMP-302), Não Corrigido Nesta Sprint

**Encontrado pelo teste de integração HTTP completo desta Sprint, não por leitura de código.** O primeiro rascunho do teste de fluxo completo de Purchase Order incluía dois `registerReceiving` sequenciais contra o mesmo Purchase Order (um recebimento parcial, seguido de um segundo que completa a quantidade) — um cenário real e comum (entregas parciais em múltiplos embarques). O segundo `POST /receivings` retornava **500**, nunca documentado nem esperado.

**Causa raiz, isolada por análise do código de Persistência (nenhuma linha alterada, per escopo desta Sprint).** `SqlitePurchaseOrderRepository.update` (IMP-302) regrava `purchase_order_items` por completo a cada chamada — `DELETE FROM purchase_order_items WHERE purchase_order_id = ?` seguido de reinserção de cada item, mesmo padrão de `SqliteSupplierRepository.replaceContacts` (IMP-202). Mas, diferente de `supplier_contacts` (nunca referenciada por FOREIGN KEY de nenhuma outra tabela), `purchase_order_items` **é** referenciada por FOREIGN KEY real a partir de `receiving_lines` (`receiving_lines.purchase_order_item_id REFERENCES purchase_order_items (purchase_order_item_id)`, IMP-302, Capítulo 4). `ReceivingService.register` (Core, IMP-301) sempre chama `purchaseOrderRepository.update(...)` (atualizando `quantityReceived`/`status` dos itens) **antes** de `receivingRepository.create(...)`. Na primeira chamada, nenhuma `receiving_lines` existe ainda — o `DELETE` é trivial. A partir da **segunda** chamada contra o mesmo Purchase Order, a `receiving_lines` já criada pela primeira Receiving referencia o `purchase_order_item_id` por FOREIGN KEY — e o `DELETE` de `replaceItems` viola essa FOREIGN KEY imediatamente (SQLite verifica por instrução, não de forma adiada), revertendo a transação e propagando um erro de constraint bruto, não um `PurchaseDomainError` — por isso `mapPurchaseError`/`mapDomainError` não o reconhecem e ele cai em 500.

**Por que isto não foi encontrado em IMP-302.** `SqliteRepositories.test.ts` (IMP-302) testa `SqlitePurchaseOrderRepository`/`SqliteReceivingRepository` isoladamente, nunca em sequência através do `ReceivingService` real com duas chamadas de `registerReceiving` consecutivas contra o mesmo item — o teste de fluxo completo via `PurchaseManager.test.ts` (IMP-301) também nunca expôs isto, porque roda sobre `InMemoryFakes`, que não têm FOREIGN KEY nenhuma. Esta é a primeira Sprint com um teste de integração real, ponta a ponta, via HTTP + SQLite real + múltiplas chamadas sequenciais ao mesmo Aggregate já com filhos persistidos — exatamente o tipo de defeito que só aparece na integração completa.

**Decisão tomada — não corrigido, isolado e documentado.** Persistência está congelada nesta Sprint ("Nenhuma alteração poderá ser feita em... Persistência"). O teste que expôs o bug foi mantido, mas reescrito com `it.fails(...)` (`routes/purchase.test.ts`, describe "Purchase Order") — a asserção descreve o comportamento **correto e esperado** (201, `fullyReceived: true`); a Vitest API `it.fails` marca o teste como passando *porque* essa asserção falha hoje, e fará o teste falhar automaticamente no dia em que o bug for corrigido, sinalizando a um mantenedor futuro para remover o `it.fails`. O teste de fluxo completo "feliz" (`"fluxo completo via HTTP real"`) foi reescrito para um único `registerReceiving` que já satisfaz a quantidade total — um caminho real e correto que não aciona o bug.

**Amendment proposta (nunca executada por esta Sprint) — contra `packages/persistence` (IMP-302).** `SqlitePurchaseOrderRepository.replaceItems` deveria parar de fazer `DELETE` completo seguido de reinserção; em vez disso, calcular a diferença entre os itens já persistidos e os itens recebidos (`UPDATE` para os que mudaram, `INSERT` apenas para os genuinamente novos, `DELETE` apenas para os genuinamente removidos) — nunca excluindo uma linha que ainda possui FOREIGN KEY dependente. Esta mudança pertenceria a uma Sprint de manutenção de Persistência (ou a uma futura revisão de IMP-302), nunca a esta Sprint de HTTP. Fica registrada aqui como recomendação formal.

---

## 9. Eventos

Nenhum arquivo desta Sprint importa, cria ou modifica `PurchaseEvent`/`PurchaseCommand`. `PurchaseManager` retorna `{ result, command, events }` (ou `{ result, events }` para `evaluateReorderRule`) — todo handler desestrutura apenas `result`, descarta `command`/`events` por completo antes de montar a resposta HTTP, mesma disciplina de `routes/supplier.ts` desde IMP-203. **`PurchaseEvent` nunca atravessa a camada HTTP nesta Sprint** — nenhum endpoint expõe, sintetiza ou reconstrói um Evento, nenhuma Timeline foi inventada. Documentado explicitamente per instrução do Sprint.

---

## 10. Integração com SQLite

`managersPlugin` já aplica `runMigrations(handle)` no boot do servidor, incluindo `0003_purchase_hub.sql` (IMP-302) — nenhuma alteração necessária. `testing/buildTestServer.ts` (intocado) já injeta um banco `:memory:` migrado por teste; todo teste desta Sprint exercita `fastify.inject()` contra esse banco real, nunca um mock — confirmado no Capítulo 11, incluindo o teste que expôs o bug do Capítulo 8.

---

## 11. Testes Criados

Três novos arquivos, 39 testes (38 passam normalmente, 1 documenta o bug do Capítulo 8 via `it.fails`), 100% via `fastify.inject()` contra SQLite `:memory:` real:

| Arquivo | Cobertura |
|---|---|
| `routes/purchase.test.ts` | Fluxo completo de Purchase Order (criar → item → aprovar → enviar → receber por completo → listar Receivings); listagem por Tenant/Fornecedor; 400 (schema, duas rotas); 404 (Purchase Order, Requisition); 409 (item após montagem, cancelar após Receiving, converter Requisition não aprovada); 422 (aprovação acima do threshold sem identidade, quantidade acima da pendente, custo de aquisição ausente); aprovação acima do threshold **com** identidade; fluxo completo de Requisition (criar → aprovar → converter) e rejeição; listagem por status via path aninhado, incluindo 400 para status fora do enum; fluxo completo de Reorder Rule (criar → avaliar disparando/não disparando → desativar); 404 de Reorder Rule; persistência real entre chamadas; documentação OpenAPI (tag e dezenove `paths`); o teste `it.fails` do Capítulo 8 |
| `errors/mapPurchaseError.test.ts` | As catorze subclasses de `PurchaseDomainError` mapeadas para o código HTTP correto; `HttpError` já construído passa direto; erro não relacionado delega a `mapDomainError`; erro desconhecido cai em 500 |

Todo endpoint tem cobertura de sucesso e de ao menos um caso de erro mapeado, mesma amplitude exigida pelos relatórios anteriores desta série.

---

## 12. Cobertura Obtida

`pnpm typecheck`, `pnpm build` e `pnpm lint` verdes. `pnpm test` executado três vezes na raiz do monorepo — **as três execuções passaram integralmente, sem nenhum flake** (174 arquivos de teste, 822 testes em cada uma das três rodadas — 821 passando normalmente mais 1 `it.fails` documentando o bug do Capítulo 8, em todas as três execuções). Nenhum dos flakes intermitentes pré-existentes já documentados em Sprints anteriores (`routes.test.tsx`, `SupplierPage.test.tsx`) se manifestou nesta Sprint.

---

## 13. Qualidade — Comparação com Supplier Hub

**O padrão do Supplier foi seguido integralmente**, com as três extensões documentadas nos Capítulos 2 e 4 (endpoint sem Command correspondente, DTO de resposta composto, achatamento de VO-wrapper-de-Money) — nenhuma delas uma mudança de padrão, todas complementações naturais diante de formas que o Supplier Hub nunca precisou.

**Existe código duplicado?** Sim, o mesmo tipo de duplicação já aceita entre `supplier.ts`/`crm.ts`/`businessProfile.ts`: `nonEmptyString`/`moneySchema` são redeclarados, byte a byte idênticos, em `routes/purchase.ts` e `routes/supplier.ts`. Nenhuma duplicação nova além dessa já esperada.

**Existe oportunidade de abstração?** Três, nenhuma executada, per instrução explícita ("Não refatorar neste Sprint. Somente documentar"):
1. `nonEmptyString`/`moneySchema` (e agora também `receivingLineSchema`-like fragmentos) poderiam viver em um `schemas/common.ts` compartilhado entre todo `routes/*.ts` — evitaria a redeclaração byte-idêntica citada acima.
2. `mapSupplierError`/`mapPurchaseError` compartilham a mesma forma exata (`instanceof X` → `switch (error.code)` → `HttpError` por categoria → fallback a `mapDomainError`) — candidato a um `createDomainErrorMapper(ErrorClass, codeToHttpError)` genérico, reduziria cada arquivo a uma tabela de dados em vez de um `switch` escrito à mão.
3. O padrão de DTO de resposta composto (Capítulo 4) não tem abstração óbvia ainda (apenas dois exemplos) — mas documentado como um formato que Hubs futuros com resultado multi-Entidade (Inventory Movement, Production) provavelmente repetirão.

**Existe algum padrão reutilizável para futuros Hubs?** Sim, quatro, todos já demonstrados nesta Sprint e disponíveis para reuso literal: (1) mapear Domain Error por `code`, nunca por regex, sempre que o Core do Hub lançar uma hierarquia tipada; (2) expor todo método público do Manager, mesmo quando não corresponde a um Command aprovado, documentando a distinção; (3) preferir path aninhado a Querystring mesmo com múltiplas dimensões de filtro; (4) para Value Object cujo único campo é outro objeto (não um primitivo), achatar o *wrapper*, nunca o objeto interno.

---

## 14. Limitações Encontradas

O bug de Persistência do Capítulo 8 é a limitação mais significativa desta Sprint — um segundo `registerReceiving` contra o mesmo Purchase Order falha em produção até a Amendment proposta ser executada em uma Sprint futura de Persistência.

Nenhuma paginação em nenhuma rota de listagem — mesma limitação pré-existente em toda a API, não introduzida nem corrigida por esta Sprint.

`GET /purchase-requisitions/by-tenant/:tenantId/status/:status` exige que o chamador já saiba o status desejado — não existe um "listar todos, todos os status" nesta Sprint, porque `PurchaseManager`/`PurchaseRequisitionRepository` (Core/Persistência, intocados) não expõem esse método; reflete fielmente o contrato já aprovado.

---

## 15. Preparação para IMP-304 (Frontend)

`apps/api` agora expõe o Purchase Hub por completo — dezenove endpoints reais, documentados em `/documentation`, prontos para consumo por `apps/web`. Nenhuma mudança de contrato é esperada para IMP-304: cada DTO de resposta já é a forma final que um cliente HTTP deveria consumir (nenhum campo de domínio vazado, `Date` sempre ISO 8601, `Money` sempre `{ amount, currencyCode }`). O bug do Capítulo 8 deve ser considerado por IMP-304 ao desenhar qualquer fluxo de UI que registre múltiplos recebimentos parciais contra o mesmo Purchase Order — a Amendment proposta deveria idealmente ser resolvida antes ou durante aquela Sprint, não ignorada.

---

## 16. Possíveis Amendments

Uma: contra `packages/persistence` (`SqlitePurchaseOrderRepository.replaceItems`), detalhada no Capítulo 8 — trocar o padrão `DELETE`-completo-e-reinserção por um `diff` (update/insert/delete seletivos), nunca excluindo uma linha com FOREIGN KEY dependente ainda viva. Não executada nesta Sprint (Persistência congelada).

---

## 17. Conclusão

O Purchase Hub agora está exposto por completo via HTTP, com validação estritamente de schema, mapeamento de erro específico do domínio por `code`, zero regra de negócio na camada de transporte, zero alteração a Core ou Persistência, e zero endpoint `PATCH` (decisão informada, não uma omissão). O ciclo **Arquitetura → Core → Persistência → HTTP API** está validado de ponta a ponta para o segundo domínio ERP desta plataforma, confirmando o Objetivo Estratégico desta Sprint: a camada HTTP é genuinamente reutilizável entre domínios, sem adaptação arquitetural. Um bug real de Persistência foi encontrado pelo próprio rigor desta Sprint (teste de integração completo, nunca mockado) e tratado com total transparência — isolado, documentado, testado como conhecido (`it.fails`), com Amendment formal proposta, nunca corrigido silenciosamente e nunca escondido atrás de um teste mais fraco. Pronto para a próxima etapa (IMP-304 — Frontend), repetindo o mesmo ciclo já comprovado pelo Supplier Hub.
