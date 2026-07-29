// DealDetailModal.tsx
//
// Responsabilidade:
// Detalhe de um Negócio dentro de um modal (o ESCOPO da Sprint 33 não
// pede uma página de rota dedicada para Negócios — apenas o Workspace
// com 4 visualizações — mas exige Timeline presente "em Negócio"; este
// modal é onde ela vive, junto das Observações do negócio).

import { Stack, Flex, Text, Divider } from '@/app/primitives';
import { Modal, Badge } from '@/design-system/components';
import { Timeline } from '../Timeline';
import type { Deal } from '../../types/Deal';
import type { Client } from '../../types/Client';
import type { HistoryEntry } from '../../types/HistoryEntry';
import type { Note } from '../../types/Note';

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export interface DealDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: Deal | null;
  client?: Client;
  stageName?: string;
  history: HistoryEntry[];
  notes: Note[];
}

export function DealDetailModal(props: DealDetailModalProps) {
  const { isOpen, onClose, deal, client, stageName, history, notes } = props;

  if (!deal) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={deal.title}>
      <div style={{ width: 'min(560px, 90vw)', maxHeight: '80vh', overflowY: 'auto', marginTop: 16 }}>
        <Stack gap={16}>
          <Flex justify="space-between" align="center">
            <Text variant="body" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              {formatCurrency(deal.value)}
            </Text>
            {stageName && <Badge variant="info">{stageName}</Badge>}
          </Flex>

          <Stack gap={4}>
            {client && (
              <Text variant="caption" color="var(--ads-color-text-secondary)">
                Cliente: {client.name}
              </Text>
            )}
            <Text variant="caption" color="var(--ads-color-text-auxiliary)">
              Responsável: {deal.ownerName} · Probabilidade: {deal.probability}% · Origem: {deal.source || '—'}
            </Text>
            <Text variant="caption" color="var(--ads-color-text-auxiliary)">
              Fechamento previsto: {deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString('pt-BR') : '—'}
            </Text>
          </Stack>

          {deal.notes && (
            <Text variant="caption" color="var(--ads-color-text-secondary)">
              {deal.notes}
            </Text>
          )}

          <Divider />

          <Stack gap={8}>
            <Text variant="label" style={{ fontWeight: 600 }}>
              Observações
            </Text>
            {notes.length === 0 ? (
              <Text variant="caption" color="var(--ads-color-text-auxiliary)">
                Nenhuma observação registrada.
              </Text>
            ) : (
              <Stack gap={8}>
                {notes.map((note) => (
                  <Stack key={note.id} gap={2}>
                    <Text variant="caption">{note.content}</Text>
                    <Text variant="caption" color="var(--ads-color-text-auxiliary)">
                      {note.author} · {new Date(note.createdAt).toLocaleString('pt-BR')}
                    </Text>
                  </Stack>
                ))}
              </Stack>
            )}
          </Stack>

          <Divider />

          <Stack gap={8}>
            <Text variant="label" style={{ fontWeight: 600 }}>
              Histórico
            </Text>
            <Timeline entries={history} />
          </Stack>
        </Stack>
      </div>
    </Modal>
  );
}
