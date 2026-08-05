import cors from "@fastify/cors";
import fp from "fastify-plugin";
import { resolveApiConfig } from "../config.js";

/**
 * CORS — necessário desde esta Sprint (FUN-100): `apps/web` (Vite, porta 5173 por padrão) e
 * `apps/api` (porta 3001) são origens diferentes em desenvolvimento, e o Frontend agora envia um
 * cabeçalho customizado (`Authorization`) em toda requisição autenticada — sem CORS explícito, o
 * navegador bloqueia a leitura da resposta mesmo que a requisição HTTP em si tenha sido concluída.
 * Origem única e exata (`ABP_WEB_ORIGIN`, `config.ts`), nunca `*` — Bearer token em `Authorization`
 * não usa cookies, então `credentials: true` não é necessário aqui.
 */
export const corsPlugin = fp(async (fastify) => {
  const { webOrigin } = resolveApiConfig();

  await fastify.register(cors, {
    origin: webOrigin,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });
});
