// NewActivityModal.tsx
//
// Responsabilidade:
// Modal de cadastro/edição de Atividade.

import { Modal } from '@/design-system/components';
import { ActivityForm, type ActivityFormValues } from '../forms';
import type { Activity } from '../../types/Activity';
import type { Client } from '../../types/Client';

export interface NewActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ActivityFormValues) => void;
  clients: Client[];
  activity?: Activity;
}

export function NewActivityModal(props: NewActivityModalProps) {
  const { isOpen, onClose, onSubmit, clients, activity } = props;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={activity ? 'Editar Atividade' : 'Nova Atividade'}>
      <div style={{ width: 'min(560px, 90vw)', maxHeight: '80vh', overflowY: 'auto', marginTop: 16 }}>
        <ActivityForm
          initialActivity={activity}
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
