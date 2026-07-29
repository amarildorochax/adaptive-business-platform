// history.mock.ts
//
// Responsabilidade:
// Dado simulado do Histórico (linha do tempo) do CRM — inclui os
// exemplos citados literalmente pelo ESCOPO.

import type { HistoryEntry } from '../types';

export function generateHistory(): HistoryEntry[] {
  return [
    {
      id: 'history-1',
      entityType: 'client',
      entityId: 'client-1',
      action: 'Cliente criado.',
      actor: 'Ana Souza',
      timestamp: '2026-02-10T10:05:00Z',
    },
    {
      id: 'history-2',
      entityType: 'client',
      entityId: 'client-1',
      action: 'Ligação realizada.',
      actor: 'Ana Souza',
      timestamp: '2026-07-24T10:30:00Z',
    },
    {
      id: 'history-3',
      entityType: 'deal',
      entityId: 'deal-2',
      action: 'WhatsApp enviado.',
      actor: 'Bruno Lima',
      timestamp: '2026-07-25T14:00:00Z',
    },
    {
      id: 'history-4',
      entityType: 'deal',
      entityId: 'deal-2',
      action: 'Proposta enviada.',
      actor: 'Bruno Lima',
      timestamp: '2026-07-25T14:05:00Z',
    },
    {
      id: 'history-5',
      entityType: 'deal',
      entityId: 'deal-1',
      action: 'Negociação iniciada.',
      actor: 'Ana Souza',
      timestamp: '2026-07-20T09:00:00Z',
    },
    {
      id: 'history-6',
      entityType: 'deal',
      entityId: 'deal-7',
      action: 'Negócio ganho.',
      actor: 'Ana Souza',
      timestamp: '2026-07-05T16:00:00Z',
    },
    {
      id: 'history-7',
      entityType: 'deal',
      entityId: 'deal-4',
      action: 'Negócio perdido.',
      actor: 'Diego Alves',
      timestamp: '2026-07-15T13:00:00Z',
    },
  ];
}
