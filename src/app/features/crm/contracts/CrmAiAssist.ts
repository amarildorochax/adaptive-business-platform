// CrmAiAssist.ts
//
// Responsabilidade:
// Preparação para IA (Sprint 33) — contratos para 3 capacidades
// específicas pedidas pelo ESCOPO: sugestão automática de próximo
// contato, resumo automático do cliente e pontuação futura de leads.
// Mais granular que `CrmAiExtensionPoints` (Sprint 32, 7 pontos por
// módulo/canal); aqui o contrato já modela o formato exato de
// entrada/saída de cada capacidade. **Nenhuma implementação** — apenas
// interfaces, como exigido pelo ESCOPO ("Nenhuma IA deverá ser
// implementada nesta Sprint"). Uma Sprint futura fornecerá uma classe
// que implemente `CrmAiAssistProvider` (ex.: consumindo `@/core/ai`).

export interface NextContactSuggestion {
  clientId: string;
  suggestedDate: string | null;
  reason: string | null;
}

export interface ClientAutoSummary {
  clientId: string;
  summary: string | null;
  generatedAt: string | null;
}

export type LeadScoreBand = 'cold' | 'warm' | 'hot';

export interface LeadScore {
  clientId: string;
  score: number | null;
  band: LeadScoreBand | null;
}

export interface CrmAiAssistProvider {
  suggestNextContact(clientId: string): Promise<NextContactSuggestion>;
  summarizeClient(clientId: string): Promise<ClientAutoSummary>;
  scoreLead(clientId: string): Promise<LeadScore>;
}
