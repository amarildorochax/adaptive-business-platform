import { useContext } from "react";
import { ToastContext } from "./toastContextInstance";

/** Único ponto de disparo de notificações Toast a partir de um componente — nunca importar `ToastContext` diretamente fora deste arquivo e de `ToastProvider`. */
export function useToast() {
  const toast = useContext(ToastContext);

  if (toast === undefined) {
    throw new Error("useToast() foi chamado fora de um ToastProvider.");
  }

  return toast;
}
