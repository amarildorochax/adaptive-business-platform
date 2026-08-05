import { afterEach } from "vitest";

/**
 * Limpeza automática do DOM entre testes de componente (React Testing Library) — sem isso, dois
 * testes que renderizam o mesmo Widget (ex.: Dashboard e uma página de domínio, ambos usando
 * `CRMWidget`) deixam árvores sobrepostas no `document.body`, produzindo falso "elemento duplicado"
 * em `getByText`/`getByRole`. Guardado por `typeof document` porque este mesmo arquivo é carregado
 * por todo teste do workspace (`vitest.config.ts`, `setupFiles`) — inclusive os 313 testes de
 * `packages/*`, que rodam em ambiente `node` e nunca tocam o DOM.
 */
afterEach(async () => {
  if (typeof document !== "undefined") {
    const { cleanup } = await import("@testing-library/react");
    cleanup();
  }
});
