import { createContext } from "react";

export type ToastTone = "success" | "danger" | "info";

export interface ToastContextValue {
  readonly showToast: (tone: ToastTone, message: string) => void;
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);
