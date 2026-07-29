// NewClientModal.tsx
//
// Responsabilidade:
// Modal de cadastro/edição de Cliente — combina `Modal` (Design System)
// com `ClientForm`. `client` opcional ativa o modo edição.

import { Modal } from '@/design-system/components';
import { ClientForm, type ClientFormValues } from '../forms';
import type { Client } from '../../types/Client';
import type { Company } from '../../types/Company';
import type { Tag as TagEntity } from '../../types/Tag';

export interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ClientFormValues) => void;
  companies: Company[];
  tags: TagEntity[];
  client?: Client;
}

export function NewClientModal(props: NewClientModalProps) {
  const { isOpen, onClose, onSubmit, companies, tags, client } = props;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={client ? 'Editar Cliente' : 'Novo Cliente'}>
      <div style={{ width: 'min(640px, 90vw)', maxHeight: '80vh', overflowY: 'auto', marginTop: 16 }}>
        <ClientForm
          initialClient={client}
          companies={companies}
          tags={tags}
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
