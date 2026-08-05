import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { PersistenceConfig } from "./config.js";

export interface DatabaseHandle {
  readonly db: DatabaseSync;
  close(): void;
}

/**
 * Único ponto de construção de conexão real desta Sprint — `node:sqlite` (módulo nativo do Node,
 * estável desde a série 22, disponível no runtime desta plataforma), nunca um pacote npm de driver
 * SQLite. Decisão registrada em `FUN_003_REAL_PERSISTENCE_LAYER_REPORT.md`, Seção "Tecnologia": o
 * candidato originalmente escolhido (`better-sqlite3`, um addon nativo que exige compilação C++ via
 * node-gyp) não compila neste ambiente (Python/toolchain de build ausentes) — `node:sqlite` elimina
 * esse requisito por inteiro, por já vir embutido no próprio runtime.
 *
 * `journal_mode = WAL` e `foreign_keys = ON` são os dois únicos PRAGMA aplicados — sem eles,
 * escrita concorrente (WAL) e integridade referencial (foreign_keys) dependeriam do padrão do
 * SQLite, permissivo demais para uma base real.
 */
export function createDatabase(config: PersistenceConfig): DatabaseHandle {
  if (config.databasePath !== ":memory:") {
    mkdirSync(path.dirname(config.databasePath), { recursive: true });
  }

  const db = new DatabaseSync(config.databasePath);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA foreign_keys = ON");

  return { db, close: () => db.close() };
}
