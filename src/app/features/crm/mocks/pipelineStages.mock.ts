// pipelineStages.mock.ts
//
// Responsabilidade:
// Dado simulado das etapas do Pipeline de vendas do CRM — as 8 etapas
// iniciais exigidas pelo ESCOPO, totalmente customizáveis por uma
// Sprint futura (nenhuma regra de negócio impede adicionar/remover uma
// etapa; `order` já é o único campo que determina a posição).

import type { CrmPipelineStage } from '../types';

export function generateCrmPipelineStages(): CrmPipelineStage[] {
  return [
    { id: 'new-lead', name: 'Novo Lead', order: 1, isWon: false, isLost: false },
    { id: 'first-contact', name: 'Primeiro Contato', order: 2, isWon: false, isLost: false },
    { id: 'qualification', name: 'Qualificação', order: 3, isWon: false, isLost: false },
    { id: 'proposal', name: 'Proposta', order: 4, isWon: false, isLost: false },
    { id: 'negotiation', name: 'Negociação', order: 5, isWon: false, isLost: false },
    { id: 'closing', name: 'Fechamento', order: 6, isWon: false, isLost: false },
    { id: 'won', name: 'Ganho', order: 7, isWon: true, isLost: false },
    { id: 'lost', name: 'Perdido', order: 8, isWon: false, isLost: true },
  ];
}
