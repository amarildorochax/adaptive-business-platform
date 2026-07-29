/**
 * Schedule Definition — administrado pelo Scheduler, define Triggers baseados em tempo — agendamento
 * recorrente, atraso programado, janela de execução —, garantindo que um Workflow com Trigger
 * temporal seja iniciado no momento correto (Time-aware Automation, `AUTOMATION_ENGINE.md`,
 * Capítulos 5 e 7). Nenhuma tecnologia de agendamento concreta (cron, temporizador) é definida —
 * cada campo permanece descritivo.
 * Estrutura definida em `AUTOMATION_ENGINE.md`, Capítulo 7.
 */
export type ScheduleKind = "Recurring" | "Delayed" | "Window";

export interface ScheduleDefinition {
  /** Identificador da Schedule Definition. */
  readonly scheduleDefinitionId: string;

  /** Trigger de categoria "Time" ao qual esta agenda se aplica — ver Trigger.ts. */
  readonly triggerId: string;

  /** Natureza do agendamento. */
  readonly kind: ScheduleKind;

  /** Descrição opaca da recorrência, do atraso, ou da janela — nenhuma tecnologia concreta definida. */
  readonly description: string;
}
