import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@core/query/queryClient";
import { ManagerProvider } from "@core/managers/ManagerContext";
import { AuthProvider } from "@core/auth/AuthProvider";
import { ThemeProvider } from "@core/theme/ThemeProvider";
import { ToastProvider } from "@shared/components/ui/toast/ToastProvider";

/** Composição única de todo Provider de nível de aplicação — nenhum componente de página monta seu próprio Provider. `ThemeProvider` mais externo de todos (aplica o tema mesmo em `/login`, antes de qualquer sessão); `AuthProvider` em seguida — resolve a sessão independentemente de qualquer Query/Manager. */
export function AppProviders({ children }: { readonly children: ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <ManagerProvider>{children}</ManagerProvider>
          </QueryClientProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
