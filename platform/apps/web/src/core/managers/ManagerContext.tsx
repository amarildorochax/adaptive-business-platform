import { useMemo, type ReactNode } from "react";
import { buildManagers } from "./buildManagers";
import { ManagerContext } from "./managerContextInstance";

/**
 * Único ponto de construção do `ManagerRegistry` para toda a árvore de componentes — garante que
 * cada Manager (e, por trás dele, cada Fake Repository) seja instanciado exatamente uma vez por
 * sessão de navegador, nunca recriado a cada render. Nenhum componente descendente constrói um
 * Manager por conta própria.
 */
export function ManagerProvider({ children }: { readonly children: ReactNode }) {
  const managers = useMemo(() => buildManagers(), []);

  return <ManagerContext.Provider value={managers}>{children}</ManagerContext.Provider>;
}
