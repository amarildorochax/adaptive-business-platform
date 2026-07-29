// ActivityForm.tsx
//
// Responsabilidade:
// Formulário de cadastro/edição de Atividade.

import { useState } from 'react';
import { Stack, Flex, Grid } from '@/app/primitives';
import { Input, Button } from '@/design-system/components';
import { FormField, SelectField, TextareaField } from './FormField';
import type { Activity, ActivityType, ActivityStatus } from '../../types/Activity';
import type { Client } from '../../types/Client';

const TYPE_OPTIONS: { value: ActivityType; label: string }[] = [
  { value: 'call', label: 'Ligação' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'E-mail' },
  { value: 'meeting', label: 'Reunião' },
  { value: 'task', label: 'Tarefa' },
  { value: 'visit', label: 'Visita' },
  { value: 'note', label: 'Observação' },
];

const STATUS_OPTIONS: { value: ActivityStatus; label: string }[] = [
  { value: 'pending', label: 'Pendente' },
  { value: 'completed', label: 'Concluído' },
  { value: 'canceled', label: 'Cancelado' },
];

export interface ActivityFormValues {
  type: ActivityType;
  clientId: string | null;
  date: string;
  time: string;
  ownerName: string;
  description: string;
  status: ActivityStatus;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const EMPTY_VALUES: ActivityFormValues = {
  type: 'call',
  clientId: null,
  date: today(),
  time: '09:00',
  ownerName: '',
  description: '',
  status: 'pending',
};

export interface ActivityFormProps {
  initialActivity?: Activity;
  clients: Client[];
  onSubmit: (values: ActivityFormValues) => void;
  onCancel: () => void;
}

export function ActivityForm(props: ActivityFormProps) {
  const { initialActivity, clients, onSubmit, onCancel } = props;

  const [values, setValues] = useState<ActivityFormValues>(
    initialActivity
      ? {
          type: initialActivity.type,
          clientId: initialActivity.clientId,
          date: initialActivity.date,
          time: initialActivity.time,
          ownerName: initialActivity.ownerName,
          description: initialActivity.description,
          status: initialActivity.status,
        }
      : EMPTY_VALUES,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof ActivityFormValues>(key: K, value: ActivityFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    const nextErrors: Record<string, string> = {};
    if (!values.description.trim()) nextErrors.description = 'Descreva a atividade.';
    if (!values.date) nextErrors.date = 'Informe a data.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit(values);
  }

  return (
    <Stack gap={16}>
      <Grid columns={2} gap={16} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <FormField label="Tipo">
          <SelectField value={values.type} onChange={(value) => set('type', value as ActivityType)} options={TYPE_OPTIONS} />
        </FormField>

        <FormField label="Cliente">
          <SelectField
            value={values.clientId ?? ''}
            onChange={(value) => set('clientId', value || null)}
            options={clients.map((client) => ({ value: client.id, label: client.name }))}
            placeholder="Nenhum"
          />
        </FormField>

        <FormField label="Data" required error={errors.date}>
          <Input type="text" placeholder="AAAA-MM-DD" value={values.date} onChange={(value) => set('date', value)} error={Boolean(errors.date)} />
        </FormField>

        <FormField label="Hora">
          <Input type="text" placeholder="HH:MM" value={values.time} onChange={(value) => set('time', value)} />
        </FormField>

        <FormField label="Responsável">
          <Input value={values.ownerName} onChange={(value) => set('ownerName', value)} />
        </FormField>

        <FormField label="Status">
          <SelectField value={values.status} onChange={(value) => set('status', value as ActivityStatus)} options={STATUS_OPTIONS} />
        </FormField>
      </Grid>

      <FormField label="Descrição" required error={errors.description}>
        <TextareaField value={values.description} onChange={(value) => set('description', value)} />
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
