// DealForm.tsx
//
// Responsabilidade:
// Formulário de cadastro/edição de Negócio.

import { useState } from 'react';
import { Stack, Flex, Grid } from '@/app/primitives';
import { Input, Button } from '@/design-system/components';
import { FormField, SelectField, TextareaField } from './FormField';
import type { Deal } from '../../types/Deal';
import type { Client } from '../../types/Client';
import type { CrmPipelineStage } from '../../types/CrmPipelineStage';

export interface DealFormValues {
  title: string;
  clientId: string;
  value: string;
  probability: string;
  stageId: string;
  ownerName: string;
  expectedCloseDate: string;
  source: string;
  notes: string;
}

const EMPTY_VALUES: DealFormValues = {
  title: '',
  clientId: '',
  value: '',
  probability: '50',
  stageId: '',
  ownerName: '',
  expectedCloseDate: '',
  source: '',
  notes: '',
};

export interface DealFormProps {
  initialDeal?: Deal;
  clients: Client[];
  stages: CrmPipelineStage[];
  onSubmit: (values: DealFormValues) => void;
  onCancel: () => void;
}

export function DealForm(props: DealFormProps) {
  const { initialDeal, clients, stages, onSubmit, onCancel } = props;

  const [values, setValues] = useState<DealFormValues>(
    initialDeal
      ? {
          title: initialDeal.title,
          clientId: initialDeal.clientId,
          value: String(initialDeal.value),
          probability: String(initialDeal.probability),
          stageId: initialDeal.stageId,
          ownerName: initialDeal.ownerName,
          expectedCloseDate: initialDeal.expectedCloseDate.slice(0, 10),
          source: initialDeal.source,
          notes: initialDeal.notes,
        }
      : { ...EMPTY_VALUES, stageId: stages[0]?.id ?? '' },
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof DealFormValues>(key: K, value: DealFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    const nextErrors: Record<string, string> = {};
    if (!values.title.trim()) nextErrors.title = 'Informe o título do negócio.';
    if (!values.clientId) nextErrors.clientId = 'Selecione o cliente.';
    if (!values.stageId) nextErrors.stageId = 'Selecione a etapa.';
    if (!values.value || Number.isNaN(Number(values.value))) nextErrors.value = 'Informe um valor numérico.';

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

        <FormField label="Cliente" required error={errors.clientId}>
          <SelectField
            value={values.clientId}
            onChange={(value) => set('clientId', value)}
            options={clients.map((client) => ({ value: client.id, label: client.name }))}
            error={Boolean(errors.clientId)}
          />
        </FormField>

        <FormField label="Valor (R$)" required error={errors.value}>
          <Input type="number" value={values.value} onChange={(value) => set('value', value)} error={Boolean(errors.value)} />
        </FormField>

        <FormField label="Probabilidade (%)">
          <Input type="number" value={values.probability} onChange={(value) => set('probability', value)} />
        </FormField>

        <FormField label="Etapa" required error={errors.stageId}>
          <SelectField
            value={values.stageId}
            onChange={(value) => set('stageId', value)}
            options={stages.map((stage) => ({ value: stage.id, label: stage.name }))}
            error={Boolean(errors.stageId)}
          />
        </FormField>

        <FormField label="Responsável">
          <Input value={values.ownerName} onChange={(value) => set('ownerName', value)} />
        </FormField>

        <FormField label="Fechamento previsto">
          <Input type="text" placeholder="AAAA-MM-DD" value={values.expectedCloseDate} onChange={(value) => set('expectedCloseDate', value)} />
        </FormField>

        <FormField label="Origem">
          <Input value={values.source} onChange={(value) => set('source', value)} />
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
