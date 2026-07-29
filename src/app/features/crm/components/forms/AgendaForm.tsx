// AgendaForm.tsx
//
// Responsabilidade:
// Formulário de cadastro de evento de Agenda.

import { useState } from 'react';
import { Stack, Flex, Grid } from '@/app/primitives';
import { Input, Button } from '@/design-system/components';
import { FormField, SelectField, TextareaField } from './FormField';
import type { AgendaEvent, AgendaEventType } from '../../types/AgendaEvent';
import type { Client } from '../../types/Client';

const TYPE_OPTIONS: { value: AgendaEventType; label: string }[] = [
  { value: 'appointment', label: 'Compromisso' },
  { value: 'callback', label: 'Retorno' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'meeting', label: 'Reunião' },
  { value: 'reminder', label: 'Lembrete' },
];

export interface AgendaFormValues {
  type: AgendaEventType;
  title: string;
  date: string;
  time: string;
  clientId: string | null;
  notes: string;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const EMPTY_VALUES: AgendaFormValues = {
  type: 'appointment',
  title: '',
  date: today(),
  time: '09:00',
  clientId: null,
  notes: '',
};

export interface AgendaFormProps {
  initialEvent?: AgendaEvent;
  clients: Client[];
  onSubmit: (values: AgendaFormValues) => void;
  onCancel: () => void;
}

export function AgendaForm(props: AgendaFormProps) {
  const { initialEvent, clients, onSubmit, onCancel } = props;

  const [values, setValues] = useState<AgendaFormValues>(
    initialEvent
      ? {
          type: initialEvent.type,
          title: initialEvent.title,
          date: initialEvent.date,
          time: initialEvent.time,
          clientId: initialEvent.clientId,
          notes: initialEvent.notes,
        }
      : EMPTY_VALUES,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof AgendaFormValues>(key: K, value: AgendaFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    const nextErrors: Record<string, string> = {};
    if (!values.title.trim()) nextErrors.title = 'Informe o título.';
    if (!values.date) nextErrors.date = 'Informe a data.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit(values);
  }

  return (
    <Stack gap={16}>
      <Grid columns={2} gap={16} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <FormField label="Título" required error={errors.title}>
          <Input value={values.title} onChange={(value) => set('title', value)} error={Boolean(errors.title)} />
        </FormField>

        <FormField label="Tipo">
          <SelectField value={values.type} onChange={(value) => set('type', value as AgendaEventType)} options={TYPE_OPTIONS} />
        </FormField>

        <FormField label="Data" required error={errors.date}>
          <Input type="text" placeholder="AAAA-MM-DD" value={values.date} onChange={(value) => set('date', value)} error={Boolean(errors.date)} />
        </FormField>

        <FormField label="Hora">
          <Input type="text" placeholder="HH:MM" value={values.time} onChange={(value) => set('time', value)} />
        </FormField>

        <FormField label="Cliente">
          <SelectField
            value={values.clientId ?? ''}
            onChange={(value) => set('clientId', value || null)}
            options={clients.map((client) => ({ value: client.id, label: client.name }))}
            placeholder="Nenhum"
          />
        </FormField>
      </Grid>

      <FormField label="Observações">
        <TextareaField value={values.notes} onChange={(value) => set('notes', value)} />
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
