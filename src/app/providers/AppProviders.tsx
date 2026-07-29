// AppProviders.tsx
//
// Responsabilidade:
// Composição de todos os Providers globais do Frontend Foundation em um
// único componente de montagem — evita que consumidores precisem
// aninhar manualmente 6 Providers na raiz da aplicação.
//
// Nota: `ThemeProvider` é reexportado de `@/design-system/foundations`
// (Sprint 26) — não há uma segunda implementação de tema aqui.

import type { ReactNode } from 'react';
import { ThemeProvider, type ThemeProviderProps } from '@/design-system/foundations';
import { NotificationProvider } from './NotificationProvider';
import { ToastProvider } from './ToastProvider';
import { DialogProvider } from './DialogProvider';
import { ModalProvider } from './ModalProvider';
import { ShortcutProvider } from './ShortcutProvider';

export interface AppProvidersProps {
  children?: ReactNode;
  themeProps?: Omit<ThemeProviderProps, 'children'>;
}

export function AppProviders(props: AppProvidersProps) {
  const { children, themeProps } = props;

  return (
    <ThemeProvider {...themeProps}>
      <ShortcutProvider>
        <NotificationProvider>
          <ToastProvider>
            <DialogProvider>
              <ModalProvider>{children}</ModalProvider>
            </DialogProvider>
          </ToastProvider>
        </NotificationProvider>
      </ShortcutProvider>
    </ThemeProvider>
  );
}
