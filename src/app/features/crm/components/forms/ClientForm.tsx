// ClientForm.tsx
//
// Responsabilidade:
// Formulário de cadastro/edição de Cliente/Contato — validação
// obrigatória de Nome, Email e Status antes de permitir salvar.
// "Observações" não é um campo do tipo `Client` (protegido) — ao
// salvar, o texto digitado vira uma nova `Note` (entidade separada,
// ver `types/Note.ts`), repassada via `onCreateNote`.

import { useState } from 'react';
import { Stack, Flex, Grid } from '@/app/primitives';
import { Input, Button } from '@/design-system/components';
import { FormField, SelectField, TextareaField } from './FormField';
import type { Client, ClientStatus } from '../../types/Client';
import type { Company } from '../../types/Company';
import type { Tag as TagEntity } from '../../types/Tag';
import { TagsFilter } from '../filters';

const STATUS_OPTIONS: { value: ClientStatus; label: string }[] = [
  { value: 'lead', label: 'Lead' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'customer', label: 'Cliente' },
  { value: 'inactive', label: 'Inativo' },
];

export interface ClientFormValues {
  name: string;
  companyId: string | null;
  role: string;
  phone: string;
  whatsapp: string;
  email: string;
  source: string;
  salesOwnerName: string;
  status: ClientStatus;
  tagIds: string[];
  notes: string;
}

const EMPTY_VALUES: ClientFormValues = {
  name: '',
  companyId: null,
  role: '',
  phone: '',
  whatsapp: '',
  email: '',
  source: '',
  salesOwnerName: '',
  status: 'lead',
  tagIds: [],
  notes: '',
};

export interface ClientFormProps {
  initialClient?: Client;
  companies: Company[];
  tags: TagEntity[];
  onSubmit: (values: ClientFormValues) => void;
  onCancel: () => void;
}

export function ClientForm(props: ClientFormProps) {
  const { initialClient, companies, tags, onSubmit, onCancel } = props;

  const [values, setValues] = useState<ClientFormValues>(
    initialClient
      ? {
          name: initialClient.name,
          companyId: initialClient.companyId,
          role: initialClient.role,
          phone: initialClient.phone,
          whatsapp: initialClient.whatsapp,
          email: initialClient.email,
          source: initialClient.source,
          salesOwnerName: initialClient.salesOwnerName,
          status: initialClient.status,
          tagIds: initialClient.tagIds,
          notes: '',
        }
      : EMPTY_VALUES,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof ClientFormValues>(key: K, value: ClientFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    const nextErrors: Record<string, string> = {};
    if (!values.name.trim()) nextErrors.name = 'Informe o nome.';
    if (!values.email.trim()) nextErrors.email = 'Informe o e-mail.';
    if (!values.status) nextErrors.status = 'Selecione um status.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit(values);
  }

  return (
    <Stack gap={16}>
      <Grid columns={2} gap={16} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <FormField label="Nome" required error={errors.name}>
          <Input value={values.name} onChange={(value) => set('name', value)} error={Boolean(errors.name)} />
        </FormField>

        <FormField label="Empresa">
          <SelectField
            value={values.companyId ?? ''}
            onChange={(value) => set('companyId', value || null)}
            options={companies.map((company) => ({ value: company.id, label: company.name }))}
            placeholder="Nenhuma"
          />
        </FormField>

        <FormField label="Cargo">
          <Input value={values.role} onChange={(value) => set('role', value)} />
        </FormField>

        <FormField label="Responsável">
          <Input value={values.salesOwnerName} onChange={(value) => set('salesOwnerName', value)} />
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

        <FormField label="Origem">
          <Input value={values.source} onChange={(value) => set('source', value)} />
        </FormField>

        <FormField label="Status" required error={errors.status}>
          <SelectField value={values.status} onChange={(value) => set('status', value as ClientStatus)} options={STATUS_OPTIONS} error={Boolean(errors.status)} />
        </FormField>
      </Grid>

      <FormField label="Etiquetas">
        <TagsFilter selectedTagIds={values.tagIds} onChange={(tagIds) => set('tagIds', tagIds)} tags={tags} />
      </FormField>

      <FormField label="Observações">
        <TextareaField value={values.notes} onChange={(value) => set('notes', value)} placeholder="Alguma observação sobre este cliente…" />
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
