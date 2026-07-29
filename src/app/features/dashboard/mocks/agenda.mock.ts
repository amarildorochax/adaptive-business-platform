// agenda.mock.ts
//
// Responsabilidade:
// Dado simulado do widget "Agenda".

export interface AgendaEvent {
  id: string;
  title: string;
  startsAt: string;
  location?: string;
}

export function generateAgenda(): AgendaEvent[] {
  return [
    { id: 'e1', title: 'Reunião com Grupo Alfa', startsAt: '2026-07-28T14:00:00Z', location: 'Sala 3 / Remoto' },
    { id: 'e2', title: 'Revisão de pipeline', startsAt: '2026-07-28T16:30:00Z' },
    { id: 'e3', title: 'Integração de novo cliente', startsAt: '2026-07-29T13:00:00Z', location: 'Remoto' },
  ];
}
