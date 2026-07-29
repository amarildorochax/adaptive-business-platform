// performance.mock.ts
//
// Responsabilidade:
// Dado simulado do widget "Performance" — série semanal (Sprint 28) e,
// a partir da Sprint 31, os KPIs de sistema (CPU/Memória/Latência/
// Eventos por minuto) exibidos como indicadores.

export interface PerformanceSeriesPoint {
  label: string;
  value: number;
}

export function generatePerformanceSeries(): PerformanceSeriesPoint[] {
  return [
    { label: 'Seg', value: 62 },
    { label: 'Ter', value: 71 },
    { label: 'Qua', value: 68 },
    { label: 'Qui', value: 80 },
    { label: 'Sex', value: 75 },
  ];
}

export interface SystemPerformanceSnapshot {
  cpuPercent: number;
  memoryPercent: number;
  latencyMs: number;
  eventsPerMinute: number;
}

export function generateSystemPerformance(): SystemPerformanceSnapshot {
  return {
    cpuPercent: 47,
    memoryPercent: 62,
    latencyMs: 128,
    eventsPerMinute: 340,
  };
}
