// ModalProvider.tsx
//
// Responsabilidade:
// Provider global de modais com conteúdo arbitrário, organizados em
// pilha (o último aberto fica por cima). Distinto do `DialogProvider`
// (sempre título + mensagem + confirmar/cancelar): aqui o chamador
// fornece qualquer `ReactNode` como conteúdo.

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Modal } from '@/design-system/components';

interface ModalEntry {
  id: string;
  title?: string;
  content: ReactNode;
}

export interface ModalContextValue {
  openModal: (content: ReactNode, title?: string) => string;
  closeModal: (id: string) => void;
  closeAll: () => void;
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

export interface ModalProviderProps {
  children?: ReactNode;
}

export function ModalProvider(props: ModalProviderProps) {
  const { children } = props;
  const [stack, setStack] = useState<ModalEntry[]>([]);

  const closeModal = useCallback((id: string) => {
    setStack((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const openModal = useCallback((content: ReactNode, title?: string) => {
    const id = crypto.randomUUID();
    setStack((prev) => [...prev, { id, title, content }]);
    return id;
  }, []);

  const closeAll = useCallback(() => setStack([]), []);

  const value = useMemo<ModalContextValue>(() => ({ openModal, closeModal, closeAll }), [openModal, closeModal, closeAll]);

  return (
    <ModalContext.Provider value={value}>
      {children}
      {stack.map((entry) => (
        <Modal key={entry.id} isOpen onClose={() => closeModal(entry.id)} title={entry.title}>
          {entry.content}
        </Modal>
      ))}
    </ModalContext.Provider>
  );
}

export function useModal(): ModalContextValue {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal deve ser usado dentro de um <ModalProvider>.');
  }
  return context;
}
