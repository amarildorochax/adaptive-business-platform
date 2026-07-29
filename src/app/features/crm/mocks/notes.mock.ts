// notes.mock.ts
//
// Responsabilidade:
// Dado simulado de Observações do CRM.

import type { Note } from '../types';

export function generateNotes(): Note[] {
  return [
    {
      id: 'note-1',
      entityType: 'client',
      entityId: 'client-1',
      author: 'Ana Souza',
      content: 'Cliente prefere contato por telefone no período da manhã.',
      createdAt: '2026-07-20T09:00:00Z',
    },
    {
      id: 'note-2',
      entityType: 'deal',
      entityId: 'deal-2',
      author: 'Bruno Lima',
      content: 'Comitê de compras se reúne às quintas-feiras.',
      createdAt: '2026-07-22T15:20:00Z',
    },
    {
      id: 'note-3',
      entityType: 'company',
      entityId: 'company-3',
      author: 'Carla Nunes',
      content: 'Empresa em processo de expansão para mais duas filiais.',
      createdAt: '2026-07-23T11:40:00Z',
    },
    {
      id: 'note-4',
      entityType: 'client',
      entityId: 'client-3',
      author: 'Carla Nunes',
      content: 'Sensível a prazo — priorizar respostas rápidas.',
      createdAt: '2026-07-27T17:20:00Z',
    },
  ];
}
