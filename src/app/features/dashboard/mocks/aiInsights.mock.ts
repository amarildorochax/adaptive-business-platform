// aiInsights.mock.ts
//
// Responsabilidade:
// Dado simulado do widget "AI Insights". Não consome o AI Gateway real
// do Core — texto estático simulando o formato que um insight real
// teria.

export interface AIInsight {
  id: string;
  summary: string;
  confidence: number;
}

export function generateAIInsights(): AIInsight[] {
  return [
    { id: 'i1', summary: 'Leads do setor de tecnologia têm 34% mais chance de conversão este mês.', confidence: 0.82 },
    { id: 'i2', summary: 'Três negócios estão parados há mais de 10 dias sem follow-up.', confidence: 0.91 },
  ];
}
