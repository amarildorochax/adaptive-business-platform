// DialogProvider.tsx
//
// Responsabilidade:
// Provider global de diálogos de confirmação/alerta (padrão
// "tem certeza?"), com API imperativa baseada em Promise. Distinto do
// `ModalProvider` (conteúdo arbitrário): aqui o conteúdo é sempre
// título + mensagem + par de botões confirmar/cancelar.

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Modal } from '@/design-system/components';
import type { ComponentVariant } from '@/design-system/types';

export interface DialogOptions {
  title: string;
  message?: string;
  variant?: ComponentVariant;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface PendingDialog extends DialogOptions {
  resolve: (confirmed: boolean) => void;
}

export interface DialogContextValue {
  confirm: (options: DialogOptions) => Promise<boolean>;
}

const DialogContext = createContext<DialogContextValue | undefined>(undefined);

export interface DialogProviderProps {
  children?: ReactNode;
}

export function DialogProvider(props: DialogProviderProps) {
  const { children } = props;
  const [pending, setPending] = useState<PendingDialog | null>(null);

  const confirm = useCallback((options: DialogOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve });
    });
  }, []);

  const respond = useCallback(
    (confirmed: boolean) => {
      pending?.resolve(confirmed);
      setPending(null);
    },
    [pending],
  );

  const value = useMemo<DialogContextValue>(() => ({ confirm }), [confirm]);

  return (
    <DialogContext.Provider value={value}>
      {children}
      <Modal isOpen={pending !== null} onClose={() => respond(false)} title={pending?.title}>
        {pending?.message}
        <button onClick={() => respond(true)}>{pending?.confirmLabel ?? 'Confirmar'}</button>
        <button onClick={() => respond(false)}>{pending?.cancelLabel ?? 'Cancelar'}</button>
      </Modal>
    </DialogContext.Provider>
  );
}

export function useDialog(): DialogContextValue {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog deve ser usado dentro de um <DialogProvider>.');
  }
  return context;
}
