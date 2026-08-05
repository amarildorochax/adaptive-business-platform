# Finance Core Migration Report

**Adaptive Business Platform · Documento de Implementação**

Status: Approved · Sprint: IMP-007 — Finance Hub Migration (Fase 1 — Finance Core)

---

## Nota de Posicionamento Documental

Como em toda Sprint desta série, o contexto e o texto da própria Sprint divergem do estado real do repositório em pontos que precisam ser registrados antes de qualquer decisão técnica. Esta Sprint também foi interrompida uma vez por um erro 500/529 da API da Anthropic durante a etapa final de testes — a auditoria de retomada confirmou que nenhum arquivo já escrito estava parcial ou corrompido; a execução simplesmente continuou de onde parou, sem reescrever nenhum componente já correto.

**`FINANCE_HUB_ARCHITECTURE.md` não existe** — o documento real é `FINANCE_HUB.md`, par técnico de `FINANCE_DOMAIN_BLUEPRINT.md` (o proprietário do domínio: Entidades, dezenove Eventos, doze Regras de negócio), mesmo padrão de nomenclatura já usado por `CRM_DOMAIN_BLUEPRINT.md`/`CRM_HUB.md` e `COMMUNICATION_DOMAIN_BLUEPRINT.md`/`COMMUNICATION_HUB.md`. Mesma divergência de nome de arquivo já registrada para `COMMERCE_HUB_ARCHITECTURE.md` na Sprint anterior (que, ao contrário deste caso, era o nome real).

**`platform/packages/finance-hub/` já existia, com 25 Entidades/Value Objects e os catálogos completos de Commands (dezesseis) e Events (dezenove) já declarados** — diferente de Content Hub (IMP-004) e Commerce Hub (IMP-006), que nasceram do zero nesta série. Esta Sprint é, portanto, mais parecida com CRM/Communication/Growth Hub (IMP-002/003/005): um pacote de contratos já rico, esperando sua primeira implementação de execução real.

**`src/core/billing/`, `src/core/payment/` e `src/core/invoice/` não existem** — nenhum dos três diretórios sugeridos pela leitura obrigatória está presente em `src/core/`. `src/core/finance/` existe e é real e funcional, mas modela um domínio de granularidade e propósito diferentes do já aprovado pelo Blueprint: `RevenueRecord`/`ExpenseRecord` (registro simples de receita/despesa por categoria, com `CashFlowRecord`/`FinancialSnapshot` sempre calculados sob demanda, nunca armazenados) — um painel de fluxo de caixa agregado, não o modelo de Invoice/Payment/Ledger de partida dobrada já contratado em `platform/packages/finance-hub`. Os dois únicos contratos daquele módulo com nome sugestivo — `InvoiceProvider`/`PaymentProvider` — são, pelo próprio doc-comment, "contrato futuro... nunca implementado nesta Sprint", reservados para nota fiscal e gateway de pagamento, ambos explicitamente fora do escopo desta Sprint. `src/app/features/finance/` é stub puro (README + index.ts), mesma situação já encontrada para `src/app/features/marketing/` na IMP-005.

**A lista de Entidades da própria Sprint (Etapa 2) diverge do vocabulário já aprovado.** "BillingAccount" não existe no catálogo — a Entidade real é `FinancialAccount` (`FINANCE_DOMAIN_BLUEPRINT.md`, Capítulo 4). "FinancialRecord" também não corresponde a nenhuma Entidade específica do catálogo de 25 já declaradas — o conceito mais próximo é coberto coletivamente por `LedgerEntry`/`Transaction`/`Balance`, não por uma única Entidade com esse nome. Ambos tratados como ilustrativos, não normativos, mesmo padrão já aplicado em toda Sprint anterior desta série.

**Dois componentes além dos nove citados na Etapa 2 foram adicionados por necessidade estrutural do próprio Blueprint** — mesmo critério já usado em IMP-006 para justificar `Category`/`CartItem` além da lista original daquela Sprint: `InvoiceItem` (Invoice nunca existe sem ao menos a possibilidade de suas linhas — Blueprint, Capítulo 11: "Invoice View recupera... incluindo seus Invoice Item") e `Balance` (Balance Is Derived é um dos princípios mais repetidos de todo `FINANCE_HUB.md`, Capítulos 4, 5 e 9 — implementar `LedgerEntry` sem nenhuma forma de Balance derivado deixaria o princípio central do documento sem nenhuma materialização). `PaymentAttempt` também foi incluído, não pela lista da Etapa 2, mas porque o Blueprint (Capítulo 8) atribui "Payment Management" conjuntamente a `Payment Manager` **e** `Payment Attempt Manager`, e o próprio fluxo operacional do Capítulo 9 os cita sempre juntos.

---

## Resumo Executivo

Esta Sprint implementou a primeira execução real sobre o pacote `platform/packages/finance-hub` — até então, como `crm-hub`/`communication-hub`/`growth-hub` antes de suas respectivas Sprints, inteiramente composto de contratos de tipo. Onze Entidades entraram em escopo: `FinancialAccount`, `Invoice`, `InvoiceItem`, `Payment`, `PaymentAttempt`, `Refund`, `Subscription`, `Transaction`, `LedgerEntry`, `Balance` e `TaxRecord`. O `FinanceManager` implementa o Ledger Flow completo já descrito no Blueprint (Capítulo 6): toda operação com efeito financeiro real cria um Ledger Entry apenas-anexar, agrupa-o em uma Transaction imutável já inteiramente formada, e recalcula o Balance do zero a partir de todo o Ledger da Financial Account — nunca por incremento. `pnpm typecheck`, `pnpm build`, `pnpm lint` e `pnpm test` completam sem erro em todo o workspace (18 projetos), com 18 testes novos (100 no total).

---

## Inventário e Classificação

| Conceito | Origem | Classificação | Evidência |
|---|---|---|---|
| `platform/packages/finance-hub/` (25 Entidades, 16 Commands, 19 Events, 12 Business Rules) | — | Já existente, Frozen em espírito | Confirmado por leitura integral de `FinCommand.ts`, `FinEvent.ts`, `FinBusinessRule.ts` e das 25 Entidades já declaradas desde a IMP-001 |
| `src/core/billing/`, `src/core/payment/`, `src/core/invoice/` | — | **Inexistente** | Nenhum dos três diretórios existe em `src/core/` |
| `RevenueRecord`/`ExpenseRecord`/`CashFlowRecord`/`FinancialSnapshot` | `src/core/finance/` | Real e funcional, mas de domínio distinto — não portado | Modelo de fluxo de caixa agregado por categoria, não Invoice/Payment/Ledger de partida dobrada; mais próximo de Financial Dashboard/Reporting (Blueprint, Capítulo 11), explicitamente fora do escopo desta Sprint ("Relatórios financeiros; Dashboards; Analytics") |
| `InvoiceProvider`/`PaymentProvider` | `src/core/finance/` | Nunca implementado, mesmo no legado | Doc-comment do próprio arquivo: "contrato futuro... nunca implementado nesta Sprint"; reservados para nota fiscal e gateway, ambos fora de escopo |
| Feature de Finance na UI | `src/app/features/finance/` | **Stub puro** | Apenas `README.md` + `index.ts`, mesma situação de `src/app/features/marketing/` (IMP-005) |
| Commands do Finance Hub (16) | `FinCommand.ts` | Já aprovado, reutilizado parcialmente | Dez de dezesseis exercidos nesta Sprint: `CreateInvoice`, `UpdateInvoice`, `CancelInvoice`, `AuthorizePayment`, `CapturePayment`, `FailPayment`, `IssueRefund`, `CreateSubscription`, `RenewSubscription`, `GenerateRecurringInvoice` |
| Events do Finance Hub (19) | `FinEvent.ts` | Já aprovado, reutilizado parcialmente | Treze de dezenove exercidos: `InvoiceCreated`, `InvoiceUpdated`, `InvoicePaid`, `InvoiceCancelled`, `PaymentAuthorized`, `PaymentCaptured`, `PaymentFailed`, `RefundIssued`, `SubscriptionCreated`, `SubscriptionRenewed`, `RecurringBillingExecuted`, `LedgerEntryCreated`, `BalanceUpdated` |
| `Settlement`, `Reconciliation` | `platform/packages/finance-hub/{Settlement.ts, Reconciliation.ts}` | Fora de escopo, não tocado | "Conciliação bancária" explicitamente excluída desta Sprint |
| `PaymentMethod`, `Charge` | `platform/packages/finance-hub/{PaymentMethod.ts, Charge.ts}` | Fora de escopo, não tocado | Mediados exclusivamente pelo Integration Hub (gateway); "PIX/Cartão/Boleto/Stripe/Mercado Pago/Asaas/gateways" explicitamente excluídos |
| `FinancialDocument` | `platform/packages/finance-hub/FinancialDocument.ts` | Fora de escopo, não tocado | Emissão de Invoice/Recibo/Comprovante para consumo humano — "emissão fiscal" explicitamente excluída |
| `Receivable`, `Payable`, `Wallet`, `Discount` (Finance), `Fee`, `FinancialAdjustment`, `Currency`/`ExchangeRate`/`Tax` (jurisdição) | `platform/packages/finance-hub/*` | Adiado, não requisitado pela Etapa 2 | Nenhum mencionado na lista de Entidades desta Sprint; cada um tem Command/Event próprio já aprovado, prontos para uma Sprint futura — nenhum invented, nenhum descartado |
| Customer/Lead/Opportunity (CRM Hub), Order/Campaign (Commerce/Growth Hub) | `@abp/crm-hub`, `@abp/commerce-hub`, `@abp/growth-hub` | Referenciado por identificador opaco, nunca importado | `FinancialAccount.relationshipId` — mesmo padrão ADR-002 já usado em toda Sprint anterior; nenhuma sobreposição de responsabilidade com Commerce Hub (`Order`/`Cart` nunca são lidos ou referenciados por este pacote) |

---

## Componentes Criados

**Repositórios** (contratos apenas, per Etapa 7): um por Entidade em escopo (11 no total) — `LedgerEntryRepository` nunca declara `update`/`remove` (Ledger Is Immutable, enforçado estruturalmente); `TransactionRepository` nunca declara `update` (Immutable Transactions); `InvoiceRepository`/`RefundRepository`/`PaymentAttemptRepository` seguem a mesma disciplina de imutabilidade onde o Blueprint já a exige.

**Serviços**: um por Entidade (11 no total). `LedgerEntryService` é o único ponto de gravação de Ledger Entry em todo o pacote — nenhum outro Service cria esse registro diretamente, mesma disciplina do "Ledger Manager, guardião da imutabilidade" já descrita em `FINANCE_HUB.md`, Capítulo 7. `BalanceService.recalculate` sempre soma, do zero, todo Ledger Entry já registrado (nunca incrementa um valor armazenado), aplicação literal de Balance Is Derived.

**Orquestrador**: `FinanceManager.ts` — expõe `createFinancialAccount`, `createInvoice`/`updateInvoice`/`cancelInvoice`, `authorizePayment`/`capturePayment`/`failPayment`, `issueRefund`, `createSubscription`/`renewSubscription`/`generateRecurringInvoice`, `registerTaxRecord`, além de `getBalance`/`listLedgerEntries` como leituras de apoio. `capturePayment` e `issueRefund` derivam `financialAccountId` sempre a partir da Invoice associada — nunca exigido do chamador, reduzindo a superfície de erro de uso indevido.

## Componentes Reutilizados

O catálogo completo de 25 Entidades, 16 Commands e 19 Events, já declarado desde a IMP-001, foi reutilizado integralmente como contrato — nenhum tipo foi alterado. O padrão `{result, command?, events}` de retorno de operação, já em uso por `CRMManager`/`CommunicationManager`/`GrowthManager`, foi reutilizado sem alteração — Finance Hub, como Growth Hub, já chega com catálogo de Commands completo, diferente de Content/Commerce Hub. A disciplina de coleta de Domain Events (nenhum publicado em Event Bus real) também se repete sem alteração.

## Componentes Ausentes

Settlement (liquidação com o Provider), Reconciliation (conciliação com extrato externo), Receivable/Payable (acompanhamento operacional de valor a receber/pagar), Wallet (saldo utilizável), Discount/Fee (redução/taxa sobre Invoice), Financial Adjustment (correção manual), Financial Document (emissão de Invoice/Recibo/Comprovante), Payment Method/Charge (mediados pelo Integration Hub) — todos já contratados em `finance-hub` desde a IMP-001, nenhum implementado nesta Sprint. Todos correspondem a capacidades explicitamente fora do escopo desta Sprint (Conciliação bancária, gateways, emissão fiscal, Relatórios financeiros) ou simplesmente não requisitados pela Etapa 2 — cada um mantém seu próprio Command/Event já aprovado, intocado, pronto para uma Sprint futura.

---

## Lacunas Arquiteturais

**`ApplyDiscount`, `ApplyFinancialAdjustment`, `RegisterSettlement`, `StartReconciliation`, `CreateReceivable` e `CreatePayable` — seis dos dezesseis Commands aprovados — não têm produtor nesta Sprint.** Nenhuma lacuna real do Blueprint: cada um corresponde a uma Entidade explicitamente adiada (Discount, Financial Adjustment, Settlement, Reconciliation, Receivable, Payable), nunca implementada porque não fazia parte do escopo desta Sprint, não porque o Command estivesse ausente do catálogo.

**`DiscountApplied`, `FinancialAdjustmentApplied`, `SettlementCompleted`, `ReconciliationCompleted`, `WalletUpdated` e `CurrencyUpdated` — seis dos dezenove Events aprovados — também não têm produtor.** Mesma causa exata dos Commands correspondentes.

**`InvoiceItemRepository`/`PaymentAttemptRepository` não têm nenhum Evento de domínio próprio** no catálogo de 19 já aprovado — apenas `Invoice` (via `InvoiceCreated`/`Updated`/`Paid`/`Cancelled`) e `Payment` (via `PaymentAuthorized`/`Captured`/`Failed`) têm cobertura direta. `FinanceManager` reflete isso com precisão: `addInvoiceItem`/`recordPaymentAttempt` nunca produzem um Evento próprio — são sempre parte do resultado de uma operação de Invoice ou Payment.

**Nenhum Command/Event aprovado cobre Financial Account ou Tax Record** — mesmo tratamento já dado a `Organization`/`Contact` em `CRMOperationResult` (IMP-002): `createFinancialAccount`/`registerTaxRecord` retornam `command: undefined`, `events: []`.

---

## Riscos

Mesmo risco estrutural já registrado pelos cinco relatórios anteriores: nenhum Event Bus real existe, então todo `FinEvent` retornado é coletado, nunca publicado.

Risco específico desta Sprint, o mais alto de toda a série até agora, já antecipado pela própria Nota de Posicionamento do Blueprint de Commerce Hub (IMP-006): a fronteira Finance↔Commerce é o ponto de maior sensibilidade de todo o domínio de negócio da plataforma — um erro aqui fragmenta exatamente o dado mais crítico (o dinheiro). Esta implementação nunca importa nenhum tipo de `@abp/commerce-hub`/`@abp/crm-hub`/`@abp/growth-hub`; toda referência cross-Hub permanece opaca (`FinancialAccount.relationshipId`); e nenhuma responsabilidade de `Order`/`Cart` foi replicada dentro deste pacote — `Order`/`OrderPaid` (Commerce Hub) permanecem, por design, o produtor do lado de fora que uma Sprint de Infrastructure futura precisará conectar a `authorizePayment`/`capturePayment`, exatamente como o próprio `COMMERCE_CORE_MIGRATION_REPORT.md` já recomendava.

Risco secundário, já esperado pela natureza desta Entidade: `authorizePayment`/`capturePayment`/`failPayment` são operações de domínio livremente chamáveis, sem qualquer garantia estrutural de causalidade externa (nenhum Provider real, nenhum Integration Hub) — em produção, expor esses métodos sem uma camada de Infrastructure que garanta que a autorização/captura reflete um evento real do Provider permitiria confirmar um pagamento que nunca ocorreu. Aceitável nesta Sprint (nenhuma API, nenhuma infraestrutura, per as próprias regras), mesma classe de risco já registrada para `CommerceManager.markOrderPaid()` na Sprint anterior.

---

## Recomendações

Ao planejar a Sprint que conectar Commerce Hub e Finance Hub, tratar `authorizePayment`/`capturePayment` como candidatos à substituição por handlers reais reagindo a `OrderCreated` (Commerce Hub) e a uma notificação real de Provider (Integration Hub) — nunca operações livremente invocáveis por um chamador arbitrário.

Priorizar Discount/Fee e Financial Adjustment como próximas extensões de Finance Core, já que ambos têm Command/Event completos já aprovados e dependência mínima de infraestrutura externa — mesmo critério já usado para priorizar Journey/Experiment em Growth Hub (IMP-005).

Registrar, como item de governança já sinalizado pela Nota de Posicionamento desta Sprint, a correção do nome de arquivo referenciado na leitura obrigatória de Sprints futuras: o documento correto é `FINANCE_HUB.md`, não `FINANCE_HUB_ARCHITECTURE.md`.

---

## Conclusão

Esta foi a Sprint mais rica em contrato já pré-existente de toda a série — 25 Entidades, 16 Commands, 19 Events, todos já Frozen em espírito desde a IMP-001, esperando sua primeira execução real. E foi também a primeira a modelar, com todo o rigor que o próprio `FINANCE_HUB.md` exige, um Ledger verdadeiramente imutável e um Balance verdadeiramente derivado — não como frase de princípio, mas como um Repository que estruturalmente nunca expõe `update`, e um Service que estruturalmente nunca lê um valor armazenado, apenas recalcula. O legado real (`src/core/finance/`) existia, era funcional, e ainda assim não serviu de origem a nenhuma Entidade desta Sprint — porque modelava um problema diferente, um lembrete de que Extrair→Adaptar→Portar exige primeiro confirmar que há algo do mesmo domínio para extrair, nunca assumir que "existe algo parecido" equivale a "existe o legado certo".
