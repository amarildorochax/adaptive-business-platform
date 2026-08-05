import { createDatabase } from "../db/client.js";
import { resolvePersistenceConfig } from "../db/config.js";
import { runMigrations } from "../db/migrate.js";

/** Script executável (`pnpm db:migrate`) — aplica toda migration pendente contra o banco resolvido por `ABP_ENV`/`ABP_DATABASE_PATH`. */
const config = resolvePersistenceConfig();
const handle = createDatabase(config);

try {
  runMigrations(handle);
  console.log(`Migrations aplicadas com sucesso — ambiente: ${config.environment}, banco: ${config.databasePath}`);
} finally {
  handle.close();
}
