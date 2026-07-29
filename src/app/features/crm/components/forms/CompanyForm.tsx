// CompanyForm.tsx
//
// Responsabilidade:
// Formulário de cadastro/edição de Empresa — mesmo padrão do
// `ClientForm` (validação obrigatória, "Observações" vira uma `Note`
// separada em vez de um campo de `Company`).

import { useState } from 'react';
import { Stack, Flex, Grid } from '@/app/primitives';
import { Input, Button } from '@/design-system/components';
import { FormField, SelectField, TextareaField } from './FormField';
import type { Company, CompanySize } from '../../types/Company';
import type { CrmRecordStatus } from '../../types/common';

const SIZE_OPTIONS: { value: CompanySize; label: string }[] = [
  { value: 'micro', label: 'Microempresa' },
  { value: 'pequena', label: 'Pequena empresa' },
  { value: 'media', label: 'Média empresa' },
  { value: 'grande', label: 'Grande empresa' },
];

const STATUS_OPTIONS: { value: CrmRecordStatus; label: string }[] = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'archived', label: 'Arquivado' },
];

export interface CompanyFormValues {
  name: string;
  tradeName: string;
  cnpj: string;
  segment: string;
  size: CompanySize;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  ownerName: string;
  status: CrmRecordStatus;
  notes: string;
}

const EMPTY_VALUES: CompanyFormValues = {
  name: '',
  tradeName: '',
  cnpj: '',
  segment: '',
  size: 'pequena',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  phone: '',
  whatsapp: '',
  email: '',
  website: '',
  ownerName: '',
  status: 'active',
  notes: '',
};

export interface CompanyFormProps {
  initialCompany?: Company;
  onSubmit: (values: CompanyFormValues) => void;
  onCancel: () => void;
}

export function CompanyForm(props: CompanyFormProps) {
  const { initialCompany, onSubmit, onCancel } = props;

  const [values, setValues] = useState<CompanyFormValues>(
    initialCompany
      ? {
          name: initialCompany.name,
          tradeName: initialCompany.tradeName,
          cnpj: initialCompany.cnpj,
          segment: initialCompany.segment,
          size: initialCompany.size,
          address: initialCompany.address,
          city: initialCompany.city,
          state: initialCompany.state,
          zipCode: initialCompany.zipCode,
          phone: initialCompany.phone,
          whatsapp: initialCompany.whatsapp,
          email: initialCompany.email,
          website: initialCompany.website,
          ownerName: initialCompany.ownerName,
          status: initialCompany.status,
          notes: '',
        }
      : EMPTY_VALUES,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof CompanyFormValues>(key: K, value: CompanyFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    const nextErrors: Record<string, string> = {};
    if (!values.name.trim()) nextErrors.name = 'Informe a razão social.';
    if (!values.email.trim()) nextErrors.email = 'Informe o e-mail.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit(values);
  }

  return (
    <Stack gap={16}>
      <Grid columns={2} gap={16} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <FormField label="Razão Social" required error={errors.name}>
          <Input value={values.name} onChange={(value) => set('name', value)} error={Boolean(errors.name)} />
        </FormField>

        <FormField label="Nome Fantasia">
          <Input value={values.tradeName} onChange={(value) => set('tradeName', value)} />
        </FormField>

        <FormField label="CNPJ">
          <Input value={values.cnpj} onChange={(value) => set('cnpj', value)} />
        </FormField>

        <FormField label="Segmento">
          <Input value={values.segment} onChange={(value) => set('segment', value)} />
        </FormField>

        <FormField label="Porte">
          <SelectField value={values.size} onChange={(value) => set('size', value as CompanySize)} options={SIZE_OPTIONS} />
        </FormField>

        <FormField label="Responsável">
          <Input value={values.ownerName} onChange={(value) => set('ownerName', value)} />
        </FormField>

        <FormField label="Cidade">
          <Input value={values.city} onChange={(value) => set('city', value)} />
        </FormField>

        <FormField label="Estado">
          <Input value={values.state} onChange={(value) => set('state', value)} />
        </FormField>

        <FormField label="Telefone">
          <Input value={values.phone} onChange={(value) => set('phone', value)} />
        </FormField>

        <FormField label="WhatsApp">
          <Input value={values.whatsapp} onChange={(value) => set('whatsapp', value)} />
        </FormField>

        <FormField label="E-mail" required error={errors.email}>
          <Input type="email" value={values.email} onChange={(value) => set('email', value)} error={Boolean(errors.email)} />
        </FormField>

        <FormField label="Website">
          <Input value={values.website} onChange={(value) => set('website', value)} />
        </FormField>

        <FormField label="Status">
          <SelectField value={values.status} onChange={(value) => set('status', value as CrmRecordStatus)} options={STATUS_OPTIONS} />
        </FormField>
      </Grid>

      <FormField label="Observações">
        <TextareaField value={values.notes} onChange={(value) => set('notes', value)} placeholder="Alguma observação sobre esta empresa…" />
      </FormField>

      <Flex justify="flex-end" gap={8}>
        <Button variant="neutral" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Salvar
        </Button>
      </Flex>
    </Stack>
  );
}
