// AppRouter.tsx
//
// Responsabilidade:
// Componente de topo do roteamento — cria o Data Router
// (`createBrowserRouter`) a partir de `appRouteObjects` e o expõe via
// `RouterProvider`. Montado em `main.tsx` (Auditoria pós-Sprint 31),
// envolvido por `AppProviders` — a rota raiz agora abre no Dashboard
// Premium (`app/pages/DashboardPage`).

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { appRouteObjects } from './routes';

const router = createBrowserRouter(appRouteObjects);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
