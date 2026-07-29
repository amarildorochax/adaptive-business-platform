// donutChart.mock.ts
//
// Responsabilidade:
// Dado simulado do widget "Gráfico de Rosca".

export interface DonutSegment {
  id: string;
  label: string;
  value: number;
  color: string;
}

export function generateDonutSegments(): DonutSegment[] {
  return [
    { id: 'organic', label: 'Orgânico', value: 42, color: 'var(--ads-color-solid-primary)' },
    { id: 'paid', label: 'Pago', value: 28, color: 'var(--ads-color-solid-secondary)' },
    { id: 'referral', label: 'Indicação', value: 18, color: 'var(--ads-color-solid-success)' },
    { id: 'other', label: 'Outros', value: 12, color: 'var(--ads-color-solid-neutral)' },
  ];
}
