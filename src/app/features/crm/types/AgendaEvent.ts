// AgendaEvent.ts
//
// Responsabilidade:
// Contrato de evento de Agenda do CRM — compromissos, retornos,
// follow-ups, reuniões e lembretes. `externalCalendarId` é um campo
// reservado (sempre `null` nesta Sprint) para a futura integração com
// um calendário externo mencionada no ESCOPO ("Integração futura com
// calendário") — não implementada agora.

export type AgendaEventType = 'appointment' | 'callback' | 'follow-up' | 'meeting' | 'reminder';

export interface AgendaEvent {
  id: string;
  type: AgendaEventType;
  title: string;
  date: string;
  time: string;
  clientId: string | null;
  dealId: string | null;
  notes: string;
  /** Reservado para integração futura com calendário externo — sempre `null` nesta Sprint. */
  externalCalendarId: string | null;
}
