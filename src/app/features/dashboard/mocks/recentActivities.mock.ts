// recentActivities.mock.ts
//
// Responsabilidade:
// Dado simulado do widget "Recent Activities".

export interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  occurredAt: string;
}

export function generateRecentActivities(): ActivityItem[] {
  return [
    { id: 'a1', actor: 'Ana Souza', action: 'criou o negócio', target: 'Contrato Fibra Corp', occurredAt: '2026-07-28T09:12:00Z' },
    { id: 'a2', actor: 'Bruno Lima', action: 'concluiu a tarefa', target: 'Follow-up semanal', occurredAt: '2026-07-28T08:47:00Z' },
    { id: 'a3', actor: 'Carla Nunes', action: 'atualizou o status de', target: 'Lead Grupo Alfa', occurredAt: '2026-07-27T18:03:00Z' },
    { id: 'a4', actor: 'Diego Alves', action: 'comentou em', target: 'Campanha Q3', occurredAt: '2026-07-27T15:30:00Z' },
  ];
}
