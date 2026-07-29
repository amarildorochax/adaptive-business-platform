// NewAgendaModal.tsx
//
// Responsabilidade:
// Modal de cadastro de evento de Agenda.

import { Modal } from '@/design-system/components';
import { AgendaForm, type AgendaFormValues } from '../forms';
import type { AgendaEvent } from '../../types/AgendaEvent';
import type { Client } from '../../types/Client';

export interface NewAgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: AgendaFormValues) => void;
  clients: Client[];
  event?: AgendaEvent;
}

export function NewAgendaModal(props: NewAgendaModalProps) {
  const { isOpen, onClose, onSubmit, clients, event } = props;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={event ? 'Editar Evento' : 'Novo Evento na Agenda'}>
      <div style={{ width: 'min(560px, 90vw)', maxHeight: '80vh', overflowY: 'auto', marginTop: 16 }}>
        <AgendaForm
          initialEvent={event}
          clients={clients}
          onSubmit={(values) => {
            onSubmit(values);
            onClose();
          }}
          onCancel={onClose}
        />
      </div>
    </Modal>
  );
}
