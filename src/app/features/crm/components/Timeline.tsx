// Timeline.tsx
//
// Responsabilidade:
// Renderiza uma lista de `HistoryEntry` (histórico de um registro) como
// uma linha do tempo vertical. Lista de anexação apenas — não recebe
// nenhuma prop de edição/remoção (ver nota em `types/HistoryEntry.ts`).

import { Stack, Flex, Text, Divider } from '@/app/primitives';
import type { HistoryEntry } from '../types/HistoryEntry';

export interface TimelineProps {
  entries: HistoryEntry[];
}

export function Timeline(props: TimelineProps) {
  const { entries } = props;

  if (entries.length === 0) {
    return (
      <Text variant="caption" color="var(--ads-color-text-auxiliary)">
        Nenhum evento registrado.
      </Text>
    );
  }

  return (
    <Stack gap={12}>
      {entries.map((entry, index) => (
        <Stack key={entry.id} gap={4}>
          <Flex justify="space-between" align="center">
            <Text variant="body">{entry.action}</Text>
            <Text variant="caption" color="var(--ads-color-text-auxiliary)">
              {new Date(entry.timestamp).toLocaleString('pt-BR')}
            </Text>
          </Flex>
          <Text variant="caption" color="var(--ads-color-text-secondary)">
            {entry.actor}
          </Text>
          {index < entries.length - 1 && <Divider />}
        </Stack>
      ))}
    </Stack>
  );
}
