-- IMP-602 — Fiscal Persistence.
-- As cinco tabelas que sustentam as quatro Repository Interfaces do Fiscal Hub Core (IMP-601,
-- `@abp/fiscal-hub`) — TaxRegime, TaxRule, FiscalDocument, FiscalObligation — per `FISCAL_HUB.md`,
-- Capítulo 4/5/9. Cada tabela espelha, campo a campo, a Entity já aprovada — nenhuma reinterpretação.
--
-- FOREIGN KEY: usada sempre que a tabela referenciada existe dentro deste mesmo Hub, nunca através da
-- fronteira de um Hub — mesma disciplina já aplicada por Supplier/Purchase/Inventory Movement/
-- Production Persistence. `tax_rules.tax_regime_id` referencia `tax_regimes` (mesmo Hub, Capítulo 5:
-- "taxRegimeId") e `fiscal_document_lines.fiscal_document_id`/`tax_rule_id` referenciam
-- `fiscal_documents`/`tax_rules` (mesmo Hub, parte-interna-do-Aggregate e referência de cálculo já
-- aplicado, respectivamente). Por outro lado, `fiscal_documents.order_id`/`invoice_id`,
-- `fiscal_document_lines.product_id` e `tax_rules.classification_code` são identificadores/valores
-- opacos de outros Hubs (Commerce Hub/Finance Hub) ou Value Objects sem Entidade própria — nenhuma
-- FOREIGN KEY declarada para eles, mesma disciplina de `production_orders.order_id` (IMP-502) e
-- `reorder_rules.product_id` (IMP-302).
--
-- SEM TRIGGER: nenhuma das quatro Entidades é um ledger append-only como `stock_movements` —
-- `FiscalDocumentRepository`/`TaxRuleRepository`/`FiscalObligationRepository`/`TaxRegimeRepository`
-- (Core, congelado nesta Sprint) expõem `save`, nunca `append`. Nenhum trigger de imutabilidade é
-- necessário aqui — a imutabilidade de `FiscalDocument` após emissão (Capítulo 11: "sua única
-- transição posterior permitida é Cancelled") já é garantida inteiramente por `FiscalValidator`/
-- `FiscalPolicy` (Core), nunca reforçada a nível de banco, mesma disciplina de
-- `ProductionOrder`/`PurchaseOrder`.
--
-- SEM CHECK: toda validação de negócio (quantidade positiva, alíquota não negativa, nome não vazio,
-- transição de status permitida, etc.) já vive em `FiscalValidator`/`isValidMoney`/
-- `isValidTaxClassification`/`isValidTaxRate`/`isValidFiscalDocumentLine`/`isValidFiscalObligation`
-- (Core, congelado) — Persistence nunca reimplementa regra de negócio, apenas restrição estrutural
-- (NOT NULL, FOREIGN KEY, PRIMARY KEY, UNIQUE).
--
-- COM UNIQUE em `tax_regimes.tenant_id`: diferente da ausência de UNIQUE em `bills_of_materials`
-- (IMP-502 — nenhuma regra nomeada equivalente existia), `FISCAL_HUB.md`, Capítulo 5, nomeia
-- textualmente a regra "associado a exatamente uma Empresa por Tenant" para `TaxRegime` — mesmo
-- critério já usado para traduzir `SUPPLIER_HUB.md`, Capítulo 11 ("TaxId único por Tenant") em
-- `suppliers.UNIQUE (tenant_id, tax_id_value)` (IMP-202). `FiscalValidator.ensureNoDuplicateTaxRegime`
-- (Core) já impõe esta regra em memória; a UNIQUE aqui é a mesma garantia, reforçada a nível de banco,
-- nunca uma regra nova inventada por esta Sprint.
--
-- TaxCalculation ACHATADO EM fiscal_document_lines, SEM TABELA PRÓPRIA: `TaxCalculation` não tem
-- Repository Interface própria (`FISCAL_HUB.md`, Capítulo 9, especifica exatamente quatro Repository
-- Interfaces, nenhuma para este conceito) e tem cardinalidade 1:1 obrigatória com a
-- `FiscalDocumentLine` que a contém, sem ciclo de vida ou Command próprio após criada
-- (`IMP_601_FISCAL_HUB_CORE_REPORT.md`, Seção 14, deixou esta decisão em aberto para esta Sprint).
-- Resolução: seus quatro campos (`taxCalculationId`, `taxRuleId`, `amount` [Money, dois campos],
-- `calculatedAt`) são achatados diretamente como colunas de `fiscal_document_lines`
-- (`tax_calculation_id`, `tax_rule_id`, `tax_amount_amount`, `tax_amount_currency_code`,
-- `tax_calculated_at`) — mesma disciplina de achatamento de Value Object sem ciclo de vida próprio já
-- usada para `Money` em `purchase_order_items.acquisition_cost_amount`/`_currency_code` (IMP-302),
-- nunca uma tabela filha adicional não prevista pelo Core.
--
-- Money (dois campos) ACHATADO em `unit_value_amount`/`unit_value_currency_code`
-- (`fiscal_document_lines`) e `tax_amount_amount`/`tax_amount_currency_code` (mesma tabela, dentro do
-- TaxCalculation achatado) — mesmo padrão de `acquisition_cost_amount`/`_currency_code` (IMP-302).
--
-- TaxClassification (VO de campo único) ACHATADO em `classification_code` — mesmo critério de campo
-- único primitivo achatado direto já formalizado em `ADAPTIVE_DEVELOPMENT_STANDARD.md`, Capítulo 7,
-- para DTOs HTTP, aplicado aqui à camada de Persistence pela mesma razão (nenhum campo adicional a
-- preservar).
--
-- TaxRate (dois campos, `type`/`value`) ACHATADO em `rate_type`/`rate_value` — mesmo critério.

CREATE TABLE IF NOT EXISTS tax_regimes (
  tax_regime_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE (tenant_id)
);

CREATE TABLE IF NOT EXISTS tax_rules (
  tax_rule_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  tax_regime_id TEXT NOT NULL REFERENCES tax_regimes (tax_regime_id),
  classification_code TEXT NOT NULL,
  rate_type TEXT NOT NULL,
  rate_value REAL NOT NULL,
  exemption_condition TEXT,
  valid_from INTEGER NOT NULL,
  valid_until INTEGER,
  active INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tax_rules_tenant_id ON tax_rules (tenant_id);
CREATE INDEX IF NOT EXISTS idx_tax_rules_regime_classification ON tax_rules (tax_regime_id, classification_code);
CREATE INDEX IF NOT EXISTS idx_tax_rules_active ON tax_rules (active);

CREATE TABLE IF NOT EXISTS fiscal_documents (
  fiscal_document_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  type TEXT NOT NULL,
  order_id TEXT,
  invoice_id TEXT,
  status TEXT NOT NULL,
  number TEXT,
  series TEXT,
  cancel_reason TEXT,
  issued_at INTEGER NOT NULL,
  cancelled_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_fiscal_documents_tenant_id ON fiscal_documents (tenant_id);
CREATE INDEX IF NOT EXISTS idx_fiscal_documents_order_id ON fiscal_documents (order_id);
CREATE INDEX IF NOT EXISTS idx_fiscal_documents_status ON fiscal_documents (status);

CREATE TABLE IF NOT EXISTS fiscal_document_lines (
  fiscal_document_line_id TEXT PRIMARY KEY,
  fiscal_document_id TEXT NOT NULL REFERENCES fiscal_documents (fiscal_document_id),
  product_id TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit_value_amount REAL NOT NULL,
  unit_value_currency_code TEXT NOT NULL,
  classification_code TEXT NOT NULL,
  tax_calculation_id TEXT NOT NULL,
  tax_rule_id TEXT NOT NULL REFERENCES tax_rules (tax_rule_id),
  tax_amount_amount REAL NOT NULL,
  tax_amount_currency_code TEXT NOT NULL,
  tax_calculated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_fiscal_document_lines_fiscal_document_id ON fiscal_document_lines (fiscal_document_id);
CREATE INDEX IF NOT EXISTS idx_fiscal_document_lines_tax_rule_id ON fiscal_document_lines (tax_rule_id);

CREATE TABLE IF NOT EXISTS fiscal_obligations (
  fiscal_obligation_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  type TEXT NOT NULL,
  periodicity TEXT NOT NULL,
  due_date INTEGER NOT NULL,
  status TEXT NOT NULL,
  fulfilled_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_fiscal_obligations_tenant_id ON fiscal_obligations (tenant_id);
CREATE INDEX IF NOT EXISTS idx_fiscal_obligations_status ON fiscal_obligations (status);
