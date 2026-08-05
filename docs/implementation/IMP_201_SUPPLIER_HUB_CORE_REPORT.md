# IMP-201 — Supplier Hub Core — Relatório de Implementação

**Adaptive Business Platform · Relatório de Sprint**

---

## Nota de Posicionamento Documental

Este relatório fecha a Sprint **IMP-201 — Supplier Hub Core**, a primeira Sprint de implementação da Fase 2 (ERP Foundation). Ela traduz `docs/architecture/SUPPLIER_HUB.md` (Draft) em código real no novo pacote `platform/packages/supplier-hub`, seguindo integralmente `ERP_ARCHITECTURE.md`, `ERP_CONTEXT_MAP.md`, `DOMAIN_EVENT_CATALOG.md` e `DOMAIN_OWNERSHIP_MATRIX.md`, sem alterar nenhuma decisão arquitetural já aprovada. Nenhum domínio existente foi tocado — nenhuma linha de `Business Profile`, `Branding`, `CRM`, `Commerce`, `Inventory`, `Finance`, `Communication`, `Analytics`, `Automation`, `Knowledge` ou `Runtime` foi alterada. Escopo estritamente de Core: nenhuma persistência SQLite, nenhuma API HTTP, nenhum Frontend, nenhum Workspace, nenhum DTO, nenhum Read Model.

Esta Sprint encontrou uma divergência arquitetural genuína e pré-existente, detalhada no Capítulo 2, e a documentou integralmente antes de qualquer implementação — nunca corrigida silenciosamente, per instrução explícita do Sprint.

---

## 1. Arquitetura Implementada

Novo pacote `@abp/supplier-hub` (`platform/packages/supplier-hub`), 24 arquivos de produção + 9 arquivos de teste, seguindo exatamente a estrutura de `SUPPLIER_HUB.md`:

| Categoria | Arquivos |
|---|---|
| Value Objects | `TaxId.ts`, `Money.ts`, `PaymentTerms.ts` |
| Entidades | `Supplier.ts` (Aggregate Root), `SupplierContact.ts`, `SupplierCatalogItem.ts`, `SupplierContract.ts`, `SupplierPerformanceRecord.ts` |
| Commands | `SupplierCommand.ts` (9 tipos, exatamente os de `SUPPLIER_HUB.md`, Capítulo 7) |
| Events | `SupplierEvent.ts` (7 tipos, exatamente os de `DOMAIN_EVENT_CATALOG.md`) |
| Repository Interfaces | `SupplierRepository.ts`, `SupplierCatalogItemRepository.ts`, `SupplierContractRepository.ts`, `SupplierPerformanceRepository.ts` — apenas interface, zero implementação |
| Domain Errors | `SupplierDomainError.ts` (6 classes) |
| Policy | `SupplierPolicy.ts` (decisões puras, nunca lança exceção) |
| Validator | `SupplierValidator.ts` (validação real, lança `SupplierDomainError`) |
| Factory | `SupplierFactory.ts` (construção de toda Entidade) |
| Services | `SupplierService.ts`, `SupplierCatalogService.ts`, `SupplierContractService.ts`, `SupplierPerformanceService.ts` |
| Manager | `SupplierManager.ts` — única fachada pública |
| Testing | `testing/InMemoryFakes.ts` — fakes em memória, nunca exportados pelo barrel de produção |

`index.ts` reexporta todo contrato de produção; `package.json` expõe `.` e `./testing` como dois entry points distintos, mesmo padrão de `@abp/crm-hub`/`@abp/commerce-hub`. `tsconfig.json` do pacote foi adicionado às `references` de `platform/tsconfig.json`.

---

## 2. Divergência Encontrada (documentada antes da implementação, per instrução explícita do Sprint)

**`packages/crm-hub/src/Supplier.ts` já declarava um tipo `Supplier`.** Antes de escrever qualquer código, a exploração de convenções encontrou que o CRM Hub (`CRM_DOMAIN_BLUEPRINT.md`, Frozen) já modela `Supplier` como um dos quatro `RelationshipPartyType` (`Customer | Organization | Supplier | Partner`) — um stub de quatro campos (`supplierId`, `tenantId`, `relationshipId`, `createdAt`), e `CRMEvent.ts` já declara `"SupplierRegistered"` como um dos dezoito `CRMEventType` Frozen. Verificação por grep completo confirmou que nenhum dos dois é instanciado por nenhum método real de `CRMManager` — são declarações de tipo nunca wired a nenhuma lógica.

**Por que isto não foi encontrado durante ERP-001.** A Sprint de arquitetura verificou `DOMAIN_OWNERSHIP_MATRIX.md` (nenhuma linha "Supplier") e `COMMERCE_HUB_ARCHITECTURE.md` (grep, zero ocorrência) — mas nunca grepou o código real de `packages/crm-hub/src/`, porque ERP-001 era uma Sprint de documentação pura, sem escopo de auditoria de código. Esta é a primeira Sprint com acesso ao código real do CRM Hub desde então.

**Decisão tomada — nenhuma alteração em `packages/crm-hub`.** O escopo desta Sprint proíbe explicitamente alterar CRM Hub. O `Supplier` implementado em `@abp/supplier-hub/src/Supplier.ts` é uma Entidade inteiramente distinta, em um pacote distinto, sem nenhuma relação de herança ou substituição com o stub do CRM Hub. Não existe, nesta plataforma, nenhum tipo unificado de Evento entre pacotes — `CRMEventType` e `SupplierEventType` são uniões TypeScript completamente independentes, então não há colisão de compilação possível; a divergência é de nome de domínio e de governança, não de tipo.

**Amendment proposta (nunca executada por esta Sprint).** Contra `CRM_DOMAIN_BLUEPRINT.md` (Frozen — exige processo de Amendment per `DOCUMENTATION_CONSTITUTION.md`, §10): deprecar formalmente o `RelationshipPartyType` `"Supplier"` do CRM Hub em favor de uma referência por identificador opaco ao `Supplier` real do Supplier Hub, já que o stub do CRM Hub nunca foi implementado e o Supplier Hub agora é a fonte de verdade real e funcional para este conceito. Esta Amendment não foi executada — fica registrada aqui como recomendação formal para decisão humana futura, exatamente como o processo de Amendment exige.

**Segunda divergência — dois Commands sem Evento correspondente.** `SUPPLIER_HUB.md`, Capítulo 7, lista nove Commands (`AddSupplierContact`, `UpdateSupplierCatalogItem` entre eles); `DOMAIN_EVENT_CATALOG.md` cataloga apenas sete Eventos para o Supplier Hub — nenhum Evento existe para `AddSupplierContact` nem para `UpdateSupplierCatalogItem`. Per instrução explícita ("Não criar eventos adicionais"), nenhum Evento foi inventado — `SupplierManager.addSupplierContact` e `SupplierManager.updateSupplierCatalogItem` retornam `command` preenchido e `events: []`, documentado inline em ambos os métodos e testado explicitamente (`SupplierManager.test.ts`, "sem publicar nenhum Evento — incompletude documentada do catálogo").

---

## 3. Decisões Tomadas Durante a Implementação

**`SupplierService` foi adicionado, sem estar nomeado em `SUPPLIER_HUB.md`, Capítulo 10.** O documento nomeia explicitamente apenas `SupplierCatalogService` e `SupplierPerformanceService`; um Service base do Aggregate Root (registro/atualização/desabilitação/reativação/contato) é uma complementação natural de implementação, análoga a `CustomerService`/`ProductService` em cada Hub já implementado — nunca uma decisão de arquitetura nova.

**`SupplierContractService` foi adicionado pela mesma razão** — `SupplierContract` possui Repository Interface própria (Capítulo 9), Command e Evento próprios, exigindo um Service dedicado pela mesma disciplina de responsabilidade única.

**Validação real, não apenas catálogo declarativo.** `CRMBusinessRule.ts`/`CRMValidationResult.ts` (precedente do CRM Hub) documentam regras de forma puramente declarativa, adiando a verificação para um "Validation Engine" nunca implementado. IMP-201 pede explicitamente validação real ("Fornecedor ativo. Documento válido. Duplicidade. Status."), então `SupplierValidator` lança `SupplierDomainError` de fato — decisão deliberada de não replicar o adiamento do CRM Hub, porque o próprio Sprint exige o oposto.

**Separação Policy/Validator.** `SupplierPolicy.canTransitionStatus` é uma função pura, sem exceção; `SupplierValidator.ensureStatusTransitionAllowed` consulta a Policy e lança `SupplierInvalidStatusTransitionError` quando ilegal. Esta separação torna `SupplierPolicy.isEligibleForNewPurchaseOrder` diretamente reutilizável pelo futuro `PurchaseManager` (Purchase Hub, Sprint futura) sem depender de nenhuma lógica de lançamento de exceção do Supplier Hub.

**`Money` definido localmente, não importado.** `SUPPLIER_HUB.md` descreve `Money` como "o mesmo já usado por Purchase Hub e Finance Hub" — mas nenhum pacote compartilhado de Value Objects existe no monorepo (`@abp/shared` não define `Money`; `@abp/finance-hub` define apenas `Currency`, sem `Money`). Definido localmente em `Money.ts`, com nota explícita de que será o primeiro candidato a substituição quando um pacote compartilhado existir.

**`SupplierPerformanceService.recordFromReceiving` aceita parâmetros primitivos, não um objeto de Evento `PurchaseReceived` literal.** `@abp/purchase-hub` não existe ainda (fora do escopo desta Sprint) — a consumação real de Evento entre pacotes fica para quando Purchase Hub Core for implementado.

---

## 4. Aderência aos Documentos ERP

Verificado, capítulo a capítulo:

- **Responsabilidades e Limites** (`SUPPLIER_HUB.md`, Capítulos 2-3): nenhum método do pacote cria/altera `Product`, `Purchase Order` ou qualquer Entidade de outro domínio — todas as referências são identificador opaco (`string`), nunca um tipo importado de `@abp/commerce-hub`.
- **Aggregates** (Capítulo 4): `Supplier` é o único Aggregate Root; `SupplierContact` é parte interna (array embutido, sem Repository próprio); `SupplierCatalogItem`/`SupplierContract`/`SupplierPerformanceRecord` têm Repository Interface própria, exatamente como especificado.
- **Commands** (Capítulo 7): os nove Commands implementados são exatamente os catalogados — nenhum inventado.
- **Events** (`DOMAIN_EVENT_CATALOG.md`): os sete Eventos implementados são exatamente os catalogados — nenhum adicional criado, mesmo onde o catálogo está incompleto (Capítulo 2 acima).
- **Manager como única fachada** (Capítulo 11): `SupplierManager` é a única classe exportada capaz de orquestrar os quatro Services; nenhum teste, nenhum consumidor futuro deveria instanciar `SupplierService`/`SupplierCatalogService` diretamente fora de composição via Manager (a única exceção é o próprio teste unitário de cada Service, deliberado).
- **Regras de Negócio** (Capítulo 11): "Duplicidade" (`ensureNoDuplicateTaxId`), "Documento válido" (`ensureValidTaxId`), "Status" (`ensureStatusTransitionAllowed`) implementadas e testadas; "Fornecedor ativo" implementado como `SupplierPolicy.isEligibleForNewPurchaseOrder`, exposto para o futuro Purchase Hub, nunca aplicado internamente pelo próprio Supplier Hub — exatamente como o documento especifica ("regra aplicada pelo Purchase Hub").
- **ADR-SU-001/002/003** (`SUPPLIER_HUB.md`, Capítulo 14): respeitados sem exceção — `Supplier` nunca compartilha identidade com `Customer`/`Organization`; `SupplierPerformanceRecord` só é criado via `recordFromReceiving` (fato observado); `SupplierCatalogItem.listPrice` nunca vincula automaticamente a nenhum custo de aquisição real.

---

## 5. Limitações Encontradas

Ausência de pacote compartilhado de Value Objects (`Money`) no monorepo — definido localmente, documentado no Capítulo 3.

`SupplierContact` não possui Evento de criação catalogado — a Entidade é criada e persistida corretamente, mas nenhum consumidor externo é notificado, uma limitação herdada da arquitetura aprovada, não desta implementação.

`SupplierCatalogItem` não possui Evento de atualização catalogado — mesma limitação.

Nenhuma validação de `TaxId` contra autoridade fiscal externa — por desenho, fora do escopo desta Sprint e da arquitetura aprovada (`SUPPLIER_HUB.md`, Capítulo 3: "nunca por autoridade externa nesta Sprint").

---

## 6. Testes Criados

9 arquivos de teste, 48 testes, 100% passando:

| Arquivo | Cobertura |
|---|---|
| `SupplierManager.test.ts` | Os 9 Commands, os 7 Events (incluindo os dois casos de `events: []` documentados), validação de duplicidade/formato/transição de status, isolamento entre Tenants, `SupplierNotFoundError` |
| `SupplierValidator.test.ts` | `ensureValidTaxId`, `ensureNoDuplicateTaxId` (incluindo exclusão do próprio id em update), `ensureStatusTransitionAllowed`, `ensureValidMoney` |
| `SupplierPolicy.test.ts` | `canTransitionStatus` (as 4 combinações), `isEligibleForNewPurchaseOrder` |
| `SupplierFactory.test.ts` | Construção de cada uma das 5 Entidades, unicidade de identificador |
| `SupplierDomainError.test.ts` | `code` estável de cada uma das 6 classes, herança real de `Error` |
| `ValueObjects.test.ts` | `TaxId`/`Money`/`PaymentTerms` — formato válido e inválido |
| `SupplierCatalogService.test.ts` | `listByProduct` cross-supplier, erro de item inexistente |
| `SupplierContractService.test.ts` | `listBySupplier` |
| `SupplierPerformanceService.test.ts` | `record` (imutável, via `append`), `recordFromReceiving` acumulando histórico |

---

## 7. Cobertura Obtida

Todo Command, todo Event, toda Entidade, todo Service, o Manager, a Policy, o Validator e a Factory têm ao menos um teste direto — equivalente, em amplitude de casos, ao padrão já estabelecido por `CRMManager.test.ts`/`FinanceManager.test.ts` (um teste por Command/Event relevante, mais casos de erro de regra de negócio). `pnpm typecheck`, `pnpm build`, `pnpm lint` e `pnpm test` executados na raiz do monorepo — todos verdes (154 arquivos de teste, 599 testes, incluindo os 48 novos).

---

## 8. Preparação para IMP-202 (Persistência)

Os quatro Repository Interfaces (`SupplierRepository`, `SupplierCatalogItemRepository`, `SupplierContractRepository`, `SupplierPerformanceRepository`) estão prontos para receber implementação SQLite real — nenhuma mudança de contrato deveria ser necessária, apenas uma nova classe por interface em `packages/persistence` ou equivalente, seguindo o padrão já estabelecido pelos Hubs anteriores. `SupplierFactory`/`SupplierValidator`/`SupplierPolicy`/`SupplierManager` não têm nenhuma dependência de infraestrutura — nenhum deles precisa mudar quando a persistência real for introduzida.

A ordem recomendada, per `ERP_FOUNDATION_REPORT.md`, Capítulo 6, seguiu-se corretamente: Supplier Hub foi a primeira Sprint por ter zero dependência de Evento de outro novo Hub — Purchase Hub Core é o próximo candidato natural de implementação (depende de Supplier Hub, que agora existe), não de sua persistência.

---

## 9. Conclusão

O Supplier Hub Core está implementado, testado e validado integralmente conforme `SUPPLIER_HUB.md`. Uma divergência de governança real e pré-existente (o stub `Supplier` do CRM Hub) foi encontrada, documentada e não corrigida silenciosamente — permanece como recomendação formal de Amendment para decisão humana futura. Duas incompletudes do catálogo de Eventos aprovado (`AddSupplierContact`, `UpdateSupplierCatalogItem` sem Evento) foram implementadas exatamente como estão, sem invenção. Nenhum domínio existente foi alterado. O pacote está pronto para receber, em Sprints futuras, Persistência (IMP-202), API HTTP, Frontend e Workspace, repetindo o ciclo de evolução já validado pelos módulos da Fase 1.
