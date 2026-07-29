// NewCompanyModal.tsx
//
// Responsabilidade:
// Modal de cadastro/edição de Empresa.

import { Modal } from '@/design-system/components';
import { CompanyForm, type CompanyFormValues } from '../forms';
import type { Company } from '../../types/Company';

export interface NewCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: CompanyFormValues) => void;
  company?: Company;
}

export function NewCompanyModal(props: NewCompanyModalProps) {
  const { isOpen, onClose, onSubmit, company } = props;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={company ? 'Editar Empresa' : 'Nova Empresa'}>
      <div style={{ width: 'min(640px, 90vw)', maxHeight: '80vh', overflowY: 'auto', marginTop: 16 }}>
        <CompanyForm
          initialCompany={company}
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
