-- FUN-100 — Authentication & Authorization Foundation.
-- Seis tabelas que sustentam os seis Repository Interfaces do IAM Core (IMP-011, `@abp/platform-services`)
-- — Credential, Profile, RolePermission, Session, AccessToken, AccessAuditRecord — nenhuma reinterpretação
-- de campo, cada uma espelhando exatamente a Entity já aprovada.
--
-- `role_permissions` e `access_audit_records` recebem uma coluna "id" autoincrementável, nunca exposta
-- por nenhum Repository Interface — mesma disciplina já aplicada em `0000_init.sql` às tabelas sem chave
-- natural própria (RolePermission/AccessAuditRecord não têm identificador próprio na Entity aprovada).

CREATE TABLE IF NOT EXISTS credentials (
  credential_id TEXT PRIMARY KEY,
  identity TEXT NOT NULL,
  kind TEXT NOT NULL,
  secret_reference TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_credentials_identity ON credentials (identity);

CREATE TABLE IF NOT EXISTS profiles (
  profile_id TEXT PRIMARY KEY,
  identity TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE (identity, tenant_id)
);
CREATE INDEX IF NOT EXISTS idx_profiles_identity ON profiles (identity);

CREATE TABLE IF NOT EXISTS role_permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role TEXT NOT NULL,
  permission TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions (role);

CREATE TABLE IF NOT EXISTS sessions (
  session_id TEXT PRIMARY KEY,
  identity TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  revoked_at INTEGER
);

CREATE TABLE IF NOT EXISTS access_tokens (
  value TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_access_tokens_session_id ON access_tokens (session_id);

CREATE TABLE IF NOT EXISTS access_audit_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  identity TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  action TEXT NOT NULL,
  granted INTEGER NOT NULL,
  recorded_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_access_audit_records_identity ON access_audit_records (identity);
