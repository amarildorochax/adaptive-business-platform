// activities.mock.ts
//
// Responsabilidade:
// Dado simulado de Atividades do CRM — os 7 canais exigidos pelo
// ESCOPO, vinculadas a `clients.mock.ts`/`deals.mock.ts`.

import type { Activity } from '../types';

export function generateActivities(): Activity[] {
  return [
    {
      id: 'activity-1',
      type: 'call',
      clientId: 'client-1',
      dealId: 'deal-1',
      date: '2026-07-24',
      time: '10:30',
      ownerName: 'Ana Souza',
      description: 'Ligação de alinhamento sobre a renovação do contrato.',
      status: 'completed',
    },
    {
      id: 'activity-2',
      type: 'whatsapp',
      clientId: 'client-2',
      dealId: 'deal-2',
      date: '2026-07-25',
      time: '14:00',
      ownerName: 'Bruno Lima',
      description: 'Envio da proposta comercial atualizada.',
      status: 'completed',
    },
    {
      id: 'activity-3',
      type: 'email',
      clientId: 'client-3',
      dealId: 'deal-3',
      date: '2026-07-26',
      time: '09:00',
      ownerName: 'Carla Nunes',
      description: 'Envio de material técnico sobre o módulo de analytics.',
      status: 'completed',
    },
    {
      id: 'activity-4',
      type: 'meeting',
      clientId: 'client-5',
      dealId: 'deal-5',
      date: '2026-07-29',
      time: '11:00',
      ownerName: 'Ana Souza',
      description: 'Reunião de apresentação do plano inicial.',
      status: 'pending',
    },
    {
      id: 'activity-5',
      type: 'task',
      clientId: 'client-6',
      dealId: 'deal-6',
      date: '2026-07-30',
      time: '16:00',
      ownerName: 'Bruno Lima',
      description: 'Qualificar lead antes do próximo contato.',
      status: 'pending',
    },
    {
      id: 'activity-6',
      type: 'visit',
      clientId: 'client-4',
      dealId: 'deal-4',
      date: '2026-07-18',
      time: '15:30',
      ownerName: 'Diego Alves',
      description: 'Visita técnica para levantamento de requisitos.',
      status: 'canceled',
    },
    {
      id: 'activity-7',
      type: 'note',
      clientId: 'client-3',
      dealId: 'deal-8',
      date: '2026-07-27',
      time: '17:15',
      ownerName: 'Carla Nunes',
      description: 'Cliente sinalizou preocupação com prazo de entrega.',
      status: 'completed',
    },
  ];
}
