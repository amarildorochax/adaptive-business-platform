# IMP-601 — Fiscal Hub Core

**Adaptive Business Platform · Relatório de Implementação**

Status: Completo
Data: 2026-08-05
Escopo: exclusivamente Core (`packages/fiscal-hub`) — Arquitetura, Persistência, HTTP, Frontend e
Workspace permanecem fora de escopo, per instrução explícita desta Sprint.

---

## Nota de Posicionamento

Este relatório documenta a implementação do **Fiscal Hub Core** — o quinto domínio ERP da plataforma,
seguindo Supplier Hub (IMP-201), Purchase Hub (IMP-301), Inventory Movement Hub (IMP-401) e Production
Hub (IMP-501), todos já completos. Segue rigorosamente `STD-001`
(`docs/standards/ADAPTIVE_DEVELOPMENT_STANDARD.md`, `ADAPTIVE_ENGINEERING_CHECKLIST.md`) e o blueprint
arquitetural `FISCAL_HUB.md` (Draft, Sprint ERP-001).

Nenhuma camada além do Core foi tocada. Nenhuma convenção já consolidada pelos quatro Cores anteriores
foi redefinida.

**Mudança de escopo em relação ao briefing original desta Sprint, decidida explicitamente pelo
usuário antes de qualquer código:** o briefing original nomeava a Sprint "Financial Hub Core", como o
quinto domínio ERP. A leitura obrigatória (`ERP_ARCHITECTURE.md`, `FINANCIAL_HUB.md`) mostrou que essa
premissa contradiz a própria arquitetura já registrada da plataforma — ver Seção 1 para o achado
completo e a pergunta formal que resultou na escolha de construir o **Fiscal Hub** em seu lugar, o
propósito genuíno do quinto domínio ERP per `ADAPTIVE_DEVELOPMENT_STANDARD.md`, Capítulo 17
("Fiscal Hub — depende de Finance/Commerce Hub, já existentes... Financial Hub — reconciliação,
extensão de Finance Hub, nunca um novo Owner").

---

## Sumário

1. Auditoria Realizada (Passo 1) — incluindo o achado que redirecionou o escopo da Sprint
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
14. Preparação para IMP-602

---

## 1. Auditoria Realizada (Passo 1)

Executada antes de qualquer código, comparando Arquitetura → Código existente → Supplier Hub → Purchase
Hub → Inventory Movement Hub → Production Hub, per `STD-001`, Capítulo 3.

### 1.1 O achado que redirecionou o escopo — "Financial Hub" não é um novo domínio

O briefing desta Sprint pedia "Financial Hub Core" como o quinto domínio ERP, espelhando exatamente o
padrão de pacote novo (Aggregates/Entities/Commands/Events/Repository Interfaces próprios) já usado
pelos quatro Hubs anteriores. A leitura obrigatória revelou uma contradição direta com a arquitetura já
registrada:

- `ERP_ARCHITECTURE.md` declara explicitamente: dos dez domínios originalmente pedidos pela Sprint
  ERP-001, **apenas cinco tornam-se novos proprietários de conceito — Purchase, Supplier, Inventory
  Movement, Production e **Fiscal** Hub**. "Financial Hub" é um dos nomes pedidos, mas
  `FINANCIAL_HUB.md` existe como **documento de reconciliação**, não blueprint de domínio — conclui que
  todo o vocabulário financeiro (`Invoice`, `Payment`, `LedgerEntry`, `AccountPayable`,
  `AccountReceivable`, `TaxRecord`) já pertence, Official, ao **Finance Hub**, já implementado em
  `platform/packages/finance-hub` (57 arquivos: `Payable.ts`, `Receivable.ts`, `LedgerEntry.ts`,
  `Invoice.ts`, `Payment.ts`, `TaxRecord.ts`, com Services/Repositories/testes).
- `ADR-FN-001` (`FINANCIAL_HUB.md`): "Nenhum novo Owner financeiro é criado por esta Sprint."
- `ADAPTIVE_DEVELOPMENT_STANDARD.md`, Capítulo 17 (Roadmap da Fase 2, já registrado antes desta
  Sprint), lista explicitamente a ordem correta: "Fiscal Hub — depende de Finance/Commerce Hub, já
  existentes; independente dos três anteriores... Financial Hub — reconciliação, extensão de Finance
  Hub (nunca um novo Owner, per ADR-ERP-001)."

Construir um "Financial Hub Core" como pacote novo, com Aggregates próprios para `Payable`/
`Receivable`/`LedgerEntry`, duplicaria exatamente o que já existe, Official, no Finance Hub — violação
direta do princípio Single Owner / No Duplicate Models (`DOMAIN_OWNERSHIP_MATRIX.md`) que todas as
quatro Sprints anteriores desta série respeitaram sem exceção.

**Per instrução explícita desta própria Sprint** ("Caso exista qualquer ambiguidade. Parar. Perguntar.
Não decidir sozinho.") e per `STD-001`, Capítulo 3 ("Nunca corrigir silenciosamente"), esta contradição
foi reportada ao usuário antes de qualquer código, com quatro opções formais: (1) construir o Fiscal
Hub — o quinto domínio genuíno da arquitetura; (2) implementar apenas a extensão de integração descrita
por `FINANCIAL_HUB.md` dentro do Finance Hub já existente; (3) prosseguir com "Financial Hub Core"
mesmo assim, como divergência arquitetural deliberada; (4) pausar para revisão de arquitetura. **O
usuário escolheu a Opção 1.** Esta Sprint é, portanto, o Fiscal Hub Core — arquiteturalmente o mesmo
"quinto domínio ERP" prometido pelo briefing original, apenas sob seu nome correto.

### 1.2 Auditoria de código — Existe código fiscal já existente?

Não. Busca case-insensitive por `fiscal|taxrule|taxregime|fiscaldocument|taxcalculation|
fiscalobligation|taxclassification` em toda a árvore `platform/` retornou apenas falsos positivos — a
palavra "fiscal" usada descritivamente como sinônimo de "tributário" (`Organization.identificador
fiscal` = CNPJ, `Supplier.TaxId` = identificador fiscal externo do Fornecedor, `InventoryPage.tsx`
mencionando "Fiscal" em uma frase de roadmap textual). Nenhum tipo, classe, enum ou stub de
`FiscalDocument`/`TaxRule`/`TaxRegime`/`TaxCalculation`/`FiscalObligation` existia em lugar algum.

**Existe tentativa anterior?** Não — nenhum histórico de commit, nenhum diretório, nenhum arquivo com
padrão `*.bak`/`*_old`/similar relacionado a este domínio.

**Existe código legado?** Não.

**Existe enum compartilhado?** Não — nenhum `@abp/shared` define `Money`/`TaxClassification`/`TaxRate`
(reconfirmado, mesma verificação já feita por IMP-201/301/401/501).

**Existe interface parcialmente implementada?** Não.

**Existe documentação específica?** Sim — exclusivamente `FISCAL_HUB.md` (Draft, Sprint ERP-001), a
leitura obrigatória desta Sprint. `TaxRecord` (Finance Hub) é um stub deliberadamente raso (3 campos:
`taxRecordId`, `transactionId`, `amount`) que `FISCAL_HUB.md` explicitamente preserva sem alteração —
"Fiscal Hub nunca substitui Tax Record (Finance Hub) — ambos coexistem" (Capítulo 3). Nenhuma colisão.

**Existe placeholder?** Não.

**Existe TODO?** Não — busca por `TODO|FIXME|not implemented|NotImplemented` em `finance-hub`,
`production-hub`, `purchase-hub` (candidatos mais prováveis) não retornou nenhuma ocorrência.

**Existe conflito de ownership?** Não. `TaxClassification` (Fiscal Hub) nunca é confundido com `TaxId`
(Supplier Hub, identificador externo do Fornecedor — CNPJ/CPF, um conceito totalmente distinto).
`Product`/`Order`/`Invoice` permanecem exclusivamente de Commerce Hub/Finance Hub, referenciados por
identificador opaco (`productId`/`orderId`/`invoiceId`), nunca por tipo importado.

**Existe oportunidade de reutilização?** O padrão estrutural flat `src/`, um arquivo por conceito, é
integralmente reutilizado dos quatro Cores anteriores. `Money.ts` é a terceira definição local
independente do mesmo conceito (primeira: Supplier Hub; segunda: Purchase Hub) — mesma oportunidade de
abstração compartilhada já documentada por IMP-301/501, deliberadamente não executada aqui (fora de
escopo: "somente Core"). `InvalidMoneyError`/`ensureValidMoney` seguem literalmente o precedente de
`packages/purchase-hub/src/PurchaseDomainError.ts`.

---

## 2. Aggregates

Três Aggregates explícitos de `FISCAL_HUB.md`, Capítulo 4, mais um quarto tratado como Aggregate
independente na prática (ver Seção 11):

- **`FiscalDocument`** (`FiscalDocument.ts`) — Aggregate Root; representa o documento fiscal formal de
  uma operação; agrupa `FiscalDocumentLine[]` como parte interna; imutável quanto ao conteúdo após
  emissão, exceto pelo próprio ciclo de cancelamento.
- **`TaxRule`** (`TaxRule.ts`) — Aggregate independente; regra de cálculo tributário vigente para uma
  combinação de `TaxRegime`/classificação/período.
- **`FiscalObligation`** (`FiscalObligation.ts`) — Aggregate independente; obrigação acessória
  periódica, com data de vencimento e status.
- **`TaxRegime`** (`TaxRegime.ts`) — não listado nominalmente entre os três Aggregates do Capítulo 4,
  mas com Repository Interface própria e ciclo de vida próprio (Capítulo 9) — tratado como Aggregate
  independente, mesma leitura já aplicada por `WorkCenter` (Production Hub, IMP-501, "Aggregate
  independente e opcional... a arquitetura não o lista explicitamente entre os Aggregates do Capítulo
  4, mas seu ciclo de vida e consulta próprios o tornam um Aggregate independente na prática").

## 3. Entidades e Value Objects

- **`FiscalDocumentLine`** (`FiscalDocumentLine.ts`) — parte interna de `FiscalDocument.lines`, sem
  Repository próprio, mesma disciplina de `BOMLine`/`PurchaseOrderItem`.
- **`TaxCalculation`** (`TaxCalculation.ts`) — resultado determinístico de aplicar uma `TaxRule`
  vigente a uma `FiscalDocumentLine`; sem Repository próprio (Capítulo 9 não a lista); vive como campo
  `FiscalDocumentLine.taxCalculation` — ver Seção 10, Divergência 1, para a decisão de correlação por
  identificador entre `CalculateTax` e `IssueFiscalDocument`.
- **`Money`** (`Money.ts`) — Value Object, terceira definição local independente (ver Seção 1.2).
- **`TaxClassification`** (`TaxClassification.ts`) — Value Object, código de classificação fiscal
  (equivalente conceitual a NCM).
- **`TaxRate`** (`TaxRate.ts`) — Value Object, alíquota percentual ou fixa (`'Percentage' | 'Fixed'`).
- **`FiscalDocumentType`** (dentro de `FiscalDocument.ts`) — enum fechado `'Sale' | 'Return' |
  'Transfer'`.
- **`FiscalDocumentStatus`** (dentro de `FiscalDocument.ts`) — enum fechado `'Issued' | 'Cancelled'`.
- **`FiscalObligationStatus`** (dentro de `FiscalObligation.ts`) — enum fechado `'Pending' |
  'Fulfilled' | 'Overdue'`.

## 4. Commands

Os oito Commands exatos de `FISCAL_HUB.md`, Capítulo 7 (`FiscalCommand.ts`): `RegisterTaxRegime`,
`CreateTaxRule`, `DeactivateTaxRule`, `CalculateTax`, `IssueFiscalDocument`, `CancelFiscalDocument`,
`RegisterFiscalObligation`, `MarkFiscalObligationFulfilled`. Todos processados exclusivamente por
`FiscalManager`.

## 5. Events

Os seis Eventos exatos de `DOMAIN_EVENT_CATALOG.md`/`FISCAL_HUB.md`, Capítulo 8 (`FiscalEvent.ts`):
`TaxRuleCreated`, `TaxCalculated`, `FiscalDocumentIssued`, `FiscalDocumentCancelled`,
`FiscalObligationRegistered`, `FiscalObligationOverdue`. Nenhum Evento adicional foi criado.

## 6. Repository Interfaces

As quatro interfaces exatas de `FISCAL_HUB.md`, Capítulo 9 (`TaxRegimeRepository.ts`,
`TaxRuleRepository.ts`, `FiscalDocumentRepository.ts`, `FiscalObligationRepository.ts`) — apenas
interface, nenhuma implementação de persistência (escopo de IMP-602). Duas extensões de implementação
foram adicionadas além do pseudocódigo literal — ver Seção 10, Divergências 2 e 3.

## 7. Services e Manager

- **`TaxCalculationService`** — "o único ponto que produz Tax Calculation, aplicando a Tax Rule vigente
  de forma determinística" (Capítulo 10); nomeado explicitamente pela arquitetura.
- **`FiscalDocumentIssuanceService`** — "o único ponto que publica FiscalDocumentIssued... nunca emite
  um Documento Fiscal sem Tax Calculation completo associado a cada linha" (Capítulo 10); nomeado
  explicitamente.
- **`FiscalObligationTrackingService`** — "avalia periodicamente Fiscal Obligation pendente e publica
  FiscalObligationOverdue" (Capítulo 10); nomeado explicitamente; também concentra
  `RegisterFiscalObligation`/`MarkFiscalObligationFulfilled` (ver Seção 11).
- **`TaxRegimeService`**/**`TaxRuleService`** — complementação natural para os Aggregates `TaxRegime`/
  `TaxRule`, sem Service nomeado pela arquitetura, mesma disciplina de `WorkCenterService` (Production
  Hub)/`SupplierService` (Supplier Hub).
- **`FiscalManager`** — única fachada pública; todo Command passa exclusivamente por ele; nenhum Event
  Bus real é publicado (retornado ao chamador, mesmo padrão de `ProductionManager`).

## 8. Policy, Validator, Factory

- **`FiscalPolicy`** — decisões puras: `canTransitionFiscalDocumentStatus`,
  `canTransitionFiscalObligationStatus`, `isTaxRuleApplicable`, `computeTaxAmount`,
  `isFiscalObligationOverdue`. Nenhuma lança exceção.
- **`FiscalValidator`** — validação real, lança `FiscalDomainError` tipado, consultando a Policy antes
  de decidir.
- **`FiscalFactory`** — construção de toda Entidade (`createTaxRegime`, `createTaxRule`,
  `createTaxCalculation`, `createFiscalDocument`, `createFiscalObligation`), zero regra de negócio —
  `createTaxCalculation` recebe o `amount` já computado pela Policy, nunca calcula internamente.
- **`FiscalDomainError`** — hierarquia tipada de 15 subclasses, cada `code` prefixado `FISCAL_`, nunca
  reutilizando erro de outro Hub.

---

## 9. Testes e Cobertura

Seis arquivos de teste, mesma distribuição de Production Hub (IMP-501):

| Arquivo | Foco |
|---|---|
| `FiscalDomainError.test.ts` | hierarquia, `code` único, `name`, mensagens |
| `FiscalPolicy.test.ts` | máquinas de estado (Document/Obligation), `isTaxRuleApplicable`, `computeTaxAmount` (determinismo, percentual vs. fixo), `isFiscalObligationOverdue` |
| `FiscalValidator.test.ts` | toda regra de negócio lançando o Domain Error específico |
| `FiscalFactory.test.ts` | defaults, geração de identificador, preservação de campos opcionais, documento sem linhas |
| `ValueObjects.test.ts` | `isValidMoney`/`isValidTaxClassification`/`isValidTaxRate`/`isValidFiscalDocumentLine`/`isValidFiscalObligation` |
| `FiscalManager.test.ts` | orquestração ponta a ponta via `InMemoryFakes` — ciclo completo de Tax Regime/Tax Rule/cálculo/emissão/cancelamento/obrigação fiscal, incluindo a avaliação periódica de vencimento |

**Resultado:** 91 testes no pacote `fiscal-hub`, 100% aprovados, executado três vezes consecutivas em
isolamento (`npx vitest run packages/fiscal-hub`) sem nenhuma flake. `pnpm test` (workspace completo):
209 arquivos de teste, 1318 testes (1317 aprovados + 1 falha esperada, `it.fails` de IMP-302/303, já
documentada, não relacionada a esta Sprint) — ver Seção 13 para o flake pré-existente e não
relacionado encontrado durante a validação do workspace completo.

**Comparação com Production Hub** (referência de cobertura mais recente): Production Hub Core teve 77
testes em 6 arquivos, cobrindo 3 Aggregates e 9 Commands. Fiscal Hub Core cobre 4 Aggregates e 8
Commands com 91 testes — crescimento proporcional, concentrado principalmente em `FiscalManager.test.ts`
(19 casos, contra 13 de `ProductionManager.test.ts`), refletindo o número maior de fluxos de erro
distintos (duas máquinas de estado independentes — `FiscalDocumentStatus`/`FiscalObligationStatus` —
contra uma única em Production Hub).

---

## 10. Divergências Encontradas

Per `STD-001`: Arquitetura → Auditoria → Amendment → Implementação. Nenhuma corrigida silenciosamente.

**1. `CalculateTax` e `IssueFiscalDocument` são dois Commands catalogados separadamente
(`FISCAL_HUB.md`, Capítulo 7), mas o Fluxo Completo (Capítulo 12) não especifica como uma
`FiscalDocumentLine` — que só passa a existir formalmente dentro de um `FiscalDocument` já emitido —
pode ser referenciada pelo payload de `TaxCalculated` (`fiscalDocumentLineId`,
`DOMAIN_EVENT_CATALOG.md`) antes de o documento existir.** Resolução: `fiscalDocumentLineId` é gerado
pelo **chamador** (não por `FiscalFactory`), permanecendo estável entre a chamada a `CalculateTax` —
que o referencia no Evento `TaxCalculated` — e a chamada subsequente a `IssueFiscalDocument`, cujo
input de linha (`IssueFiscalDocumentLineInput`) exige o mesmo identificador e o `TaxCalculation` já
produzido. `TaxCalculationService.calculateTax` permanece publicamente invocável de forma
independente — não apenas um passo interno oculto de emissão — porque `FISCAL_HUB.md`, Capítulo 8,
descreve um "Agente de Conformidade Fiscal" que "sinaliza risco de não conformidade antes da emissão de
um Fiscal Document", implicando um uso de preview desacoplado da emissão real. Documentado em
`FiscalDocumentLine.ts` e `TaxCalculationService.ts`.

**2. `TaxRuleRepository` (Capítulo 9) especifica apenas `findApplicable`/`save`, sem `findById`.**
`DeactivateTaxRule` (Capítulo 7) exige carregar uma `TaxRule` existente por identificador antes de
desativá-la — sem essa consulta, não há como implementar o Command. Resolução: `findById` adicionado
como extensão de implementação necessária, mesma disciplina de `StockLocationRepository` (Inventory
Movement Hub, IMP-401, Divergência 4 — "extensão de implementação necessária para o Command
CreateStockLocation ter onde persistir"). Documentado em `TaxRuleRepository.ts`.

**3. `FiscalObligationRepository` (Capítulo 9) especifica apenas `findPending`/`findOverdue`/`save`,
sem `findById`.** Mesmo problema da Divergência 2 — `MarkFiscalObligationFulfilled` exige carregar a
obrigação existente. Resolução idêntica: `findById` adicionado. Documentado em
`FiscalObligationRepository.ts`.

**4. Três Commands sem Evento catalogado.** `RegisterTaxRegime`, `DeactivateTaxRule` e
`MarkFiscalObligationFulfilled` não têm Evento correspondente em `DOMAIN_EVENT_CATALOG.md` (que
cataloga apenas seis Eventos, nenhum "TaxRegimeRegistered"/"TaxRuleDeactivated"/
"FiscalObligationFulfilled"). Tratados retornando `events: []`, nunca um Evento inventado — mesma
disciplina de `CreateProductionOrder`/`CreateWorkCenter` (Production Hub). Documentado em
`FiscalCommand.ts`.

**5. `FiscalObligationOverdue` nunca é publicado por um Command direto.** É produzido por
`FiscalObligationTrackingService.evaluateOverdue`, mecanismo de avaliação periódica "acionado pelo
Automation Engine, nunca por agendador interno" (Capítulo 10) — mesmo padrão de
`ReorderRuleTriggered`/`evaluateReorderRule` (Purchase Hub). `FiscalManager.evaluateFiscalObligations`
retorna `FiscalEvaluationResult<T>` (sem campo `command`), nunca um `FiscalCommand` fabricado para uma
chamada que não é um dos oito Commands aprovados. Documentado em `FiscalManager.ts`.

**6. `TaxRate` (Capítulo 6: "alíquota percentual ou fixa, com vigência temporal explícita") e `TaxRule`
(Capítulo 5: "vigência (data início/fim)") descrevem vigência em dois lugares.** Resolução: vigência
modelada como campo próprio de `TaxRule` (`validFrom`/`validUntil`) apenas — `TaxRate` carrega somente
`type`/`value`, evitando um campo de vigência redundante duplicado em dois VOs para o mesmo conceito.
Documentado em `TaxRate.ts`.

**7. `FiscalDocument.lines` não exige tamanho mínimo (Aggregate pode, tecnicamente, ser emitido sem
nenhuma linha).** Nenhuma regra explícita da arquitetura exige um mínimo (Capítulo 11 não menciona) —
mesma disciplina conservadora já aplicada a `BillOfMaterials.lines` (Production Hub, IMP-501): cada
linha individual é validada, mas a coleção em si não tem tamanho mínimo imposto, evitando inventar uma
restrição estrutural não escrita. Testado explicitamente em `FiscalFactory.test.ts`.

**8. `FiscalDocument.orderId`/`invoiceId` — "referencia exatamente uma origem" (Capítulo 11) foi lido
como "ao menos uma", não "exatamente uma, mutuamente exclusiva".** A arquitetura não proíbe
explicitamente um documento com ambos os campos preenchidos (ex.: uma venda cujo Order e Invoice já
estão ambos disponíveis no momento da emissão) — `ensureFiscalDocumentHasOrigin` rejeita apenas a
ausência total de origem, nunca a presença simultânea de ambas. Documentado em `FiscalValidator.ts`.

---

## 11. Decisões Tomadas

**`FiscalObligationTrackingService` concentra `RegisterFiscalObligation`/
`MarkFiscalObligationFulfilled`/`evaluateOverdue`.** `FISCAL_HUB.md`, Capítulo 10, nomeia apenas este
Service para o Aggregate `FiscalObligation` — mesma disciplina de `ReorderEvaluationService` (Purchase
Hub) concentrando todo o ciclo de vida de um único Aggregate em um único Service nomeado.

**`TaxRuleService` é distinto de `TaxCalculationService`.** O primeiro gerencia o ciclo de vida da
`TaxRule` (criar/desativar); o segundo aplica uma `TaxRule` já existente para produzir um cálculo,
nunca gerencia seu ciclo de vida — separação de responsabilidade única, mesmo padrão de
`BillOfMaterialsService` (versionamento) vs. `ProductionExecutionService` (execução) em Production Hub.

**`TaxCalculation.amount` é sempre computado pela Policy (`computeTaxAmount`), nunca pela Factory.**
"Factory nunca contém regra de negócio" (`ADAPTIVE_DEVELOPMENT_STANDARD.md`, Capítulo 5) —
`TaxCalculationService` chama `FiscalPolicy.computeTaxAmount` e passa o resultado já pronto para
`FiscalFactory.createTaxCalculation`, que apenas monta o registro.

**`FiscalDocumentIssuanceService`/`TaxCalculationService` nunca consultam `@abp/commerce-hub`/
`@abp/finance-hub`.** Mesmo Limite de Domínio já aplicado por `ProductionExecutionService.start`
recebendo `availableQuantities` como parâmetro — os dados de origem já confirmados (linhas da venda,
valor base) chegam como parâmetro explícito do chamador, nunca por consulta real a outro Hub. Nenhuma
implementação de Event Bus existe ainda nesta plataforma para consumir `InvoiceCreated`/`OrderPaid`
diretamente.

**`TaxRegime.name` e `FiscalObligation.type`/`periodicity` permanecem `string` livre, sem enum
fechado.** A arquitetura (Capítulo 5) não especifica um conjunto fechado de valores para nenhum dos
três campos — mesma disciplina conservadora de nunca inventar uma restrição estrutural não escrita.

**`InvalidMoneyError` e `ensureValidMoney` seguem literalmente o precedente de
`packages/purchase-hub/src/PurchaseDomainError.ts`/`PurchaseValidator.ts`**, em vez de reutilizar
`InvalidTaxRateError` para uma falha de validação de tipo diferente — cada Domain Error corresponde a
exatamente uma regra de negócio, nunca uma reaproveitada para uma condição distinta.

---

## 12. Qualidade (10 Perguntas Oficiais)

Per `ADAPTIVE_ENGINEERING_CHECKLIST.md`:

1. **Arquitetura respeitada?** Sim — todo Aggregate, Entidade, Value Object, Command, Event e
   Repository Interface corresponde exatamente a `FISCAL_HUB.md`. Oito divergências reais documentadas
   na Seção 10, nenhuma resolvida silenciosamente. A mudança de escopo (Financial → Fiscal Hub, Seção
   1.1) foi decidida pelo usuário antes de qualquer código, não uma reinterpretação unilateral.
2. **Auditoria realizada?** Sim — Seção 1, executada antes de qualquer código, incluindo o achado
   crítico que redirecionou o escopo.
3. **Blueprint seguido?** Sim — estrutura flat `src/`, `Manager` como única fachada, `{result, command,
   events}`, `Policy`/`Validator`/`Factory` separados, `testing/InMemoryFakes.ts` fora do barrel —
   idêntico a Supplier/Purchase/Inventory Movement/Production Hub.
4. **Código duplicado?** Não, no sentido de código importado de outro Hub. `Money.ts` é a terceira
   definição local independente do mesmo conceito (Supplier/Purchase/Fiscal) — oportunidade de
   abstração já documentada, deliberadamente não executada (fora de escopo desta Sprint).
5. **Componentes reutilizados?** Sim, no nível de padrão estrutural — mesmo formato de
   `{Domain}Manager`/`{Domain}Policy`/`{Domain}Validator`/`{Domain}Factory`/`{Domain}DomainError` dos
   quatro Cores anteriores.
6. **Limitações documentadas?** Sim — Seção 10, oito divergências, cada uma com resolução justificada
   e precedente citado.
7. **Testes completos?** Sim — 91 testes cobrindo toda Entidade, Value Object, Command, Event (via
   Manager), Factory, Policy, Validator, Service (via Manager) e a hierarquia de Domain Error.
8. **OpenAPI validada?** Não aplicável — este Core não expõe HTTP (fora de escopo desta Sprint).
9. **Workspace sem acesso direto ao HTTP?** Não aplicável — este Core não possui Frontend/Workspace
   (fora de escopo desta Sprint).
10. **Documentação atualizada?** Sim — este relatório; nenhum documento de arquitetura foi alterado
    (nenhuma correção silenciosa; toda divergência documentada aqui).

**Existe melhoria para Supplier/Purchase/Inventory Movement/Production?** Nenhuma identificada — nenhum
dos quatro Hubs concluídos foi tocado por esta Sprint.

Per instrução desta Sprint: nenhuma refatoração foi realizada além da implementação do próprio domínio.

---

## 13. Validação

`pnpm typecheck`, `pnpm build` e `pnpm lint` executados três vezes consecutivas sobre o workspace
completo (27 pacotes + 2 apps), sem nenhum erro em nenhuma das três execuções.

`pnpm test` (workspace completo, `vitest run`) executado três vezes consecutivas:

| Execução | typecheck | build | lint | test (workspace completo) |
|---|---|---|---|---|
| 1 | ✅ 0 erros | ✅ 0 erros | ✅ 0 erros | ⚠️ 1318 testes, 1316 aprovados + 1 falha esperada + **1 falha inesperada** |
| 2 | ✅ 0 erros | ✅ 0 erros | ✅ 0 erros | ✅ 1318 testes, 1317 aprovados + 1 falha esperada |
| 3 | ✅ 0 erros | ✅ 0 erros | ✅ 0 erros | ⚠️ 1318 testes, 1316 aprovados + 1 falha esperada + **1 falha inesperada** |

**Flake pré-existente e não relacionado, encontrado durante a validação do workspace completo.**
`apps/web/src/pages/production/ProductionPage.test.tsx` ("Visão Geral mostra KPIs reais...") falhou nas
execuções 1 e 3 por timeout de `waitFor` aguardando um botão renderizar, e passou normalmente na
execução 2 — comportamento intermitente típico de um teste sensível a timing sob jsdom, não um erro
determinístico. Este arquivo pertence ao Production Workspace (IMP-505, Frontend) — **nenhuma linha
dele, nem de qualquer arquivo em `apps/web/`, foi tocada por esta Sprint**, que se limitou a
`platform/packages/fiscal-hub/` e a uma única linha em `platform/tsconfig.json` (registro da nova
referência de projeto). Per `STD-001`, Capítulo 13 ("qualquer flake encontrado é documentado, nunca
ignorado, nunca corrigido fora do escopo autorizado da Sprint quando o flake é pré-existente e não
relacionado") e Capítulo 12 ("nunca esconder limitações"), este achado é documentado aqui e não
corrigido — está fora do escopo autorizado desta Sprint ("somente Core").

**O pacote `fiscal-hub` em si, isolado (`npx vitest run packages/fiscal-hub`), foi executado três vezes
adicionais e obteve 91/91 testes aprovados nas três execuções, sem nenhuma flake:**

| Execução (isolada) | Testes |
|---|---|
| 1 | ✅ 6 arquivos, 91 aprovados |
| 2 | ✅ 6 arquivos, 91 aprovados |
| 3 | ✅ 6 arquivos, 91 aprovados |

`pnpm lint` só executa sobre `apps/api`/`apps/web` (nenhum pacote de domínio, incluindo os quatro Cores
anteriores, define script `lint` — `packages/fiscal-hub` segue a mesma ausência, consistente com o
precedente, não uma omissão desta Sprint).

---

## 14. Preparação para IMP-602

`packages/fiscal-hub` está pronto para receber persistência real (SQLite, `node:sqlite`), mesmo molde
de IMP-202/302/402/502:

- `FiscalDocument` e `TaxRule`/`FiscalObligation` são máquinas de estado (não ledgers append-only) — a
  tabela de persistência seguirá o molde de `purchase_orders`/`production_orders`, não o de
  `stock_movements`.
- `FiscalDocumentLine`, sem Repository próprio, será persistida como tabela filha de
  `fiscal_documents` via FK simples (`fiscal_document_id`), mesmo molde de `purchase_order_items`.
  Como `taxCalculation` é embutido em cada linha (não uma tabela própria — Divergência 1, Seção 10), a
  decisão de achatar seus campos (`tax_calculation_id`, `tax_rule_id`, `amount`, `calculated_at`)
  diretamente na tabela `fiscal_document_lines`, ou criar uma tabela filha `tax_calculations` própria,
  fica para IMP-602 — nenhuma das duas abordagens contraria o Core aqui implementado.
- `TaxRegime.findByTenant`/`TaxRule.findApplicable`/`WorkCenter`-equivalentes não recebem `tenantId`
  explícito em todos os pontos (Divergência 4, Capítulo 9 da arquitetura original) — mesma decisão em
  aberto já sinalizada por Production Hub (IMP-501, "isolamento de Tenant... precisará de decisão
  explícita em IMP-502") permanece válida aqui: avaliar antes de escrever a migration se o isolamento
  de Tenant é garantido pela query ou por uma conexão já escopada.
- `TaxRuleRepository.findApplicable(taxRegimeId, classification, date)` exigirá, na persistência real,
  uma consulta por intervalo de data (`validFrom <= date AND (validUntil IS NULL OR validUntil >=
  date)`) combinada com `active = 1` — primeira consulta desta natureza na plataforma (os quatro Hubs
  anteriores não têm um padrão de "vigência temporal" comparável); avaliar se um índice composto
  (`taxRegimeId`, classificação) é suficiente ou se a filtragem por data deve ocorrer inteiramente em
  SQL.
- As Divergências 2 e 3 (Seção 10 — `findById` adicionado a `TaxRuleRepository`/
  `FiscalObligationRepository`, além do pseudocódigo original) já estão refletidas no contrato do Core;
  a persistência real de IMP-602 simplesmente as implementa, nenhuma decisão adicional necessária ali.

Ao final desta Sprint: Supplier Hub ✅, Purchase Hub ✅, Inventory Movement Hub ✅, Production Hub ✅,
**Fiscal Hub Core ✅** — preparando a plataforma para IMP-602 (Fiscal Persistence), IMP-603 (Fiscal
HTTP API), IMP-604 (Fiscal Frontend), IMP-605 (Fiscal Workspace). Financial Hub permanece,
corretamente, uma extensão de integração sobre o Finance Hub já existente — nunca um sexto pacote de
domínio novo, per ADR-FN-001/ADR-ERP-001.
