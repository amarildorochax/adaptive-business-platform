import { useContext } from "react";
import { AuthContext } from "./authContextInstance";

/** Único ponto de acesso ao estado de autenticação a partir de um componente — nunca importar `AuthContext` diretamente fora deste arquivo e de `AuthProvider`. */
export function useAuth() {
  const auth = useContext(AuthContext);

  if (auth === undefined) {
    throw new Error("useAuth() foi chamado fora de um AuthProvider.");
  }

  return auth;
}
