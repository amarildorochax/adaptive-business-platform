// timeline.mock.ts
//
// Responsabilidade:
// Dado simulado do widget "Timeline" — marcos de um projeto/onboarding.

export type TimelineMilestoneStatus = 'done' | 'current' | 'upcoming';

export interface TimelineMilestone {
  id: string;
  title: string;
  date: string;
  status: TimelineMilestoneStatus;
}

export function generateTimeline(): TimelineMilestone[] {
  return [
    { id: 't1', title: 'Kickoff do projeto', date: '2026-07-01', status: 'done' },
    { id: 't2', title: 'Configuração inicial concluída', date: '2026-07-10', status: 'done' },
    { id: 't3', title: 'Onboarding da equipe', date: '2026-07-22', status: 'current' },
    { id: 't4', title: 'Revisão de 30 dias', date: '2026-08-01', status: 'upcoming' },
  ];
}
