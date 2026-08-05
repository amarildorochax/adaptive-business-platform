import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const dirname = fileURLToPath(new URL('.', import.meta.url));

/**
 * Configuração raiz de testes do workspace (IMP-001 — Fundação).
 * Um único runner cobre todos os pacotes e apps do monorepo pnpm,
 * evitando configuração duplicada por pacote enquanto nenhum deles
 * ainda possui volume de teste que justifique isolamento próprio.
 *
 * O bloco `resolve.alias` abaixo espelha exatamente `apps/web/vite.config.ts` (FUN-001) — os
 * apelidos `@`/`@app`/`@core`/`@shared`/`@modules` só existem naquele app; nenhum outro pacote do
 * workspace os usa, então esta adição nunca colide com nenhum import já existente em
 * `packages/*`.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(dirname, './apps/web/src'),
      '@app': path.resolve(dirname, './apps/web/src/app'),
      '@core': path.resolve(dirname, './apps/web/src/core'),
      '@shared': path.resolve(dirname, './apps/web/src/shared'),
      '@modules': path.resolve(dirname, './apps/web/src/modules'),
    },
  },
  test: {
    environment: 'node',
    include: ['packages/*/src/**/*.test.ts', 'apps/*/src/**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    setupFiles: ['./apps/web/vitest.setup.ts'],
  },
});
