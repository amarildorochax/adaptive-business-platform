-- FUN-003 — Real Persistence Layer Foundation.
-- Exclusivamente as 14 tabelas que sustentam os três domínios priorizados (Business Profile,
-- Branding, CRM) — nenhuma tabela dos demais onze domínios é antecipada aqui, per instrução
-- explícita desta Sprint. Cada tabela espelha, campo a campo, a Entity já aprovada do pacote de
-- domínio correspondente — nunca uma reinterpretação.
--
-- As seis tabelas de fato imutável/versionado (business_classification_records, maturity_records,
-- business_profile_lifecycle_states, logos, design_tokens, brand_themes) recebem uma coluna "id"
-- autoincrementável, nunca exposta por nenhum Repository Interface — usada exclusivamente para
-- preservar a ordem de inserção nas consultas "list*", porque cada Service correspondente já
-- depende de "o mais recente é sempre o último em ordem de inserção".

CREATE TABLE IF NOT EXISTS business_profiles (
  profile_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS business_classification_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id TEXT NOT NULL,
  segment TEXT NOT NULL,
  subsegment TEXT,
  version INTEGER NOT NULL,
  recorded_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_business_classification_records_profile_id ON business_classification_records (profile_id);

CREATE TABLE IF NOT EXISTS maturity_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id TEXT NOT NULL,
  maturity TEXT NOT NULL,
  version INTEGER NOT NULL,
  recorded_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_maturity_records_profile_id ON maturity_records (profile_id);

CREATE TABLE IF NOT EXISTS business_profile_lifecycle_states (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id TEXT NOT NULL,
  stage TEXT NOT NULL,
  entered_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_business_profile_lifecycle_states_profile_id ON business_profile_lifecycle_states (profile_id);

CREATE TABLE IF NOT EXISTS logos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  logo_id TEXT NOT NULL UNIQUE,
  tenant_id TEXT NOT NULL,
  asset_reference TEXT NOT NULL,
  uploaded_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_logos_tenant_id ON logos (tenant_id);

CREATE TABLE IF NOT EXISTS design_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token_id TEXT NOT NULL UNIQUE,
  tenant_id TEXT NOT NULL,
  theme_id TEXT NOT NULL,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  value TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_design_tokens_theme_id ON design_tokens (theme_id);

CREATE TABLE IF NOT EXISTS brand_themes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  theme_id TEXT NOT NULL UNIQUE,
  tenant_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  generated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_brand_themes_tenant_id ON brand_themes (tenant_id);

CREATE TABLE IF NOT EXISTS leads (
  lead_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  source TEXT NOT NULL,
  qualified_at INTEGER,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_leads_tenant_id ON leads (tenant_id);

CREATE TABLE IF NOT EXISTS customers (
  customer_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  relationship_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_customers_tenant_id ON customers (tenant_id);

CREATE TABLE IF NOT EXISTS organizations (
  organization_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  relationship_id TEXT NOT NULL,
  name TEXT NOT NULL,
  trade_name TEXT,
  tax_id TEXT,
  segment TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_organizations_tenant_id ON organizations (tenant_id);

CREATE TABLE IF NOT EXISTS contacts (
  contact_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  phone TEXT,
  association_type TEXT NOT NULL,
  association_id TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_contacts_tenant_id ON contacts (tenant_id);

CREATE TABLE IF NOT EXISTS relationships (
  relationship_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  party_type TEXT NOT NULL,
  party_id TEXT NOT NULL,
  status TEXT NOT NULL,
  lifecycle_stage TEXT NOT NULL,
  account_manager_id TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS opportunities (
  opportunity_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  title TEXT NOT NULL,
  value REAL NOT NULL,
  relationship_id TEXT NOT NULL,
  pipeline_id TEXT NOT NULL,
  stage_id TEXT NOT NULL,
  partner_id TEXT,
  outcome TEXT NOT NULL,
  lost_reason TEXT,
  created_at INTEGER NOT NULL,
  closed_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_opportunities_tenant_id ON opportunities (tenant_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_relationship_id ON opportunities (relationship_id);

CREATE TABLE IF NOT EXISTS timeline_events (
  timeline_event_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  relationship_id TEXT NOT NULL,
  description TEXT NOT NULL,
  occurred_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_timeline_events_relationship_id ON timeline_events (relationship_id);
