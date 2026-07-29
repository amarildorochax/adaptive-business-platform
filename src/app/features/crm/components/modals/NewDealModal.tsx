// NewDealModal.tsx
//
// Responsabilidade:
// Modal de cadastro/edição de Negócio.

import { Modal } from '@/design-system/components';
import { DealForm, type DealFormValues } from '../forms';
import type { Deal } from '../../types/Deal';
import type { Client } from '../../types/Client';
import type { CrmPipelineStage } from '../../types/CrmPipelineStage';

export interface NewDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: DealFormValues) => void;
  clients: Client[];
  stages: CrmPipelineStage[];
  deal?: Deal;
}

export function NewDealModal(props: NewDealModalProps) {
  const { isOpen, onClose, onSubmit, clients, stages, deal } = props;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={deal ? 'Editar Negócio' : 'Novo Negócio'}>
      <div style={{ width: 'min(640px, 90vw)', maxHeight: '80vh', overflowY: 'auto', marginTop: 16 }}>
        <DealForm
          initialDeal={deal}
          clients={clients}
          stages={stages}
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
