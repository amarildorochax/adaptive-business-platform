// systemHealth.mock.ts
//
// Responsabilidade:
// Dado simulado do widget "System Health". Não consulta a
// Observability real do Core — apenas simula o formato esperado.

export type SystemHealthStatus = 'operational' | 'degraded' | 'down';

export interface SystemHealthCheck {
  id: string;
  name: string;
  status: SystemHealthStatus;
}

export function generateSystemHealth(): SystemHealthCheck[] {
  return [
    { id: 's1', name: 'API', status: 'operational' },
    { id: 's2', name: 'Fila de automações', status: 'operational' },
    { id: 's3', name: 'Integrações externas', status: 'degraded' },
  ];
}
