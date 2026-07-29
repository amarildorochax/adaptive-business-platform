// agenda.mock.ts
//
// Responsabilidade:
// Dado simulado da Agenda do CRM — compromissos, retornos, follow-ups,
// reuniões e lembretes.

import type { AgendaEvent } from '../types';

export function generateCrmAgenda(): AgendaEvent[] {
  return [
    {
      id: 'agenda-1',
      type: 'meeting',
      title: 'Reunião de fechamento — Fibra Corp',
      date: '2026-07-29',
      time: '10:00',
      clientId: 'client-1',
      dealId: 'deal-1',
      notes: 'Levar proposta final de renovação.',
      externalCalendarId: null,
    },
    {
      id: 'agenda-2',
      type: 'callback',
      title: 'Retornar ligação — Grupo Alfa',
      date: '2026-07-30',
      time: '09:30',
      clientId: 'client-2',
      dealId: 'deal-2',
      notes: 'Confirmar se a proposta já foi aprovada pelo comitê.',
      externalCalendarId: null,
    },
    {
      id: 'agenda-3',
      type: 'follow-up',
      title: 'Follow-up — Nova Marca',
      date: '2026-08-02',
      time: '14:30',
      clientId: 'client-5',
      dealId: 'deal-5',
      notes: 'Verificar interesse após a reunião de apresentação.',
      externalCalendarId: null,
    },
    {
      id: 'agenda-4',
      type: 'reminder',
      title: 'Lembrete: renovar contato com lead frio',
      date: '2026-08-05',
      time: '11:00',
      clientId: 'client-6',
      dealId: 'deal-6',
      notes: 'Lead ainda não qualificado — decidir se mantém ativo.',
      externalCalendarId: null,
    },
  ];
}
