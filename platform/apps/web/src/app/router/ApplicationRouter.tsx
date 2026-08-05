import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { createAppRoutes } from "./routes";

/**
 * Rota raiz (FUN-002 — Multi-Route Application). O Dashboard único da FUN-001 dá lugar a uma
 * aplicação multi-rotas — sete páginas de domínio ativas mais dez rotas "Em breve" para os
 * Managers já mapeados e ainda não conectados. Ver `routes.tsx` para a árvore completa.
 */
const router = createBrowserRouter(createAppRoutes());

export default function ApplicationRouter() {
  return <RouterProvider router={router} />;
}
