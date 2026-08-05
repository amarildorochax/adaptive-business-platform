import { useContext } from "react";
import { ManagerContext } from "./managerContextInstance";

/** Único ponto de acesso aos Managers a partir de um componente — nunca importar `buildManagers` diretamente fora deste arquivo e de `ManagerProvider`. */
export function useManagers() {
  const managers = useContext(ManagerContext);

  if (managers === undefined) {
    throw new Error("useManagers() foi chamado fora de um ManagerProvider.");
  }

  return managers;
}
