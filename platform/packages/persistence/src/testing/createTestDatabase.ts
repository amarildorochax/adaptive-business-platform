import { createDatabase, type DatabaseHandle } from "../db/client.js";
import { runMigrations } from "../db/migrate.js";

/**
 * Helper exclusivo de teste — nunca referenciado por nenhum Repository real nem por
 * `createManagerRegistry`. Banco `:memory:` migrado, pronto para uso em cada `it()`. Nunca
 * exportado pelo barrel do pacote (`src/index.ts`), mesma disciplina já aplicada a
 * `src/testing/InMemoryFakes.ts` em todo pacote de domínio desde a IMP-002.
 */
export function createTestDatabase(): DatabaseHandle {
  const handle = createDatabase({ environment: "testing", databasePath: ":memory:" });
  runMigrations(handle);
  return handle;
}
