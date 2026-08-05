import { resolveApiConfig } from "./config.js";
import { buildServer } from "./server.js";

async function main(): Promise<void> {
  const fastify = await buildServer();
  const config = resolveApiConfig();

  await fastify.listen({ port: config.port, host: config.host });

  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.once(signal, () => {
      fastify.close().finally(() => process.exit(0));
    });
  }
}

main().catch((error: unknown) => {
  console.error("Falha ao iniciar o servidor:", error);
  process.exitCode = 1;
});
