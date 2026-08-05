import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import type { DatabaseHandle } from "./client.js";

const migrationsFolder = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "migrations");

/**
 * Aplica toda migration `.sql` de `src/db/migrations/` ainda não registrada em `_migrations`, em
 * ordem alfabética de nome de arquivo (por isso o prefixo numérico `0000_`, `0001_`, ...) —
 * idempotente, seguro para rodar a cada bootstrap. Cada migration roda dentro de uma transação
 * única; uma migration que falhar nunca deixa `_migrations` registrando uma aplicação parcial.
 */
export function runMigrations(handle: DatabaseHandle): void {
  handle.db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name TEXT PRIMARY KEY,
      applied_at INTEGER NOT NULL
    )
  `);

  const applied = new Set(handle.db.prepare("SELECT name FROM _migrations").all().map((row) => (row as { name: string }).name));

  const files = readdirSync(migrationsFolder)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (applied.has(file)) {
      continue;
    }

    const sql = readFileSync(path.join(migrationsFolder, file), "utf-8");

    handle.db.exec("BEGIN");
    try {
      handle.db.exec(sql);
      handle.db.prepare("INSERT INTO _migrations (name, applied_at) VALUES (?, ?)").run(file, Date.now());
      handle.db.exec("COMMIT");
    } catch (error) {
      handle.db.exec("ROLLBACK");
      throw new Error(`Migration "${file}" falhou e foi revertida: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
