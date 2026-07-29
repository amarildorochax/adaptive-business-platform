// WidgetTelemetry.ts
//
// Responsabilidade:
// Contrato de telemetria por widget — preparação arquitetural exigida
// pela Sprint 29A. NENHUMA integração real é implementada:
// `noopWidgetTelemetry.record()` não faz nada, usado como valor padrão
// até uma Sprint futura conectar um coletor real (Observability do
// Core, analytics de produto, etc.) sem precisar alterar o contrato
// nem `WidgetController`.

export type WidgetEventType = 'view' | 'refresh' | 'retry' | 'error';

export interface WidgetEvent {
  widgetId: string;
  type: WidgetEventType;
  timestamp: string;
}

export interface WidgetMetrics {
  viewCount: number;
  refreshCount: number;
  retryCount: number;
  errorCount: number;
}

export interface WidgetTelemetry {
  record(event: WidgetEvent): void;
}

/** Telemetria nula — `record()` não faz nada. Valor padrão até um coletor real existir. */
export const noopWidgetTelemetry: WidgetTelemetry = {
  record: () => undefined,
};
