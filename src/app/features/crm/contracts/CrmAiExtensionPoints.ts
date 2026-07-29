// CrmAiExtensionPoints.ts
//
// Responsabilidade:
// Documenta — sem implementar — onde futuras integrações se conectarão
// à arquitetura do CRM ("Preparação para IA", ESCOPO da Sprint 32).
// Nenhum destes hooks é chamado nesta Sprint; existem apenas como
// contrato reservado, seguindo o mesmo padrão de "contrato futuro"
// usado pelos ~45 Providers do Core (Sprints 8-23) e pelos 13 Adapters
// da Core Integration Foundation (Sprint 30).

export type CrmAiExtensionPointId =
  | 'ai-agents' // Agentes de IA — resumo automático de negócios, sugestão de próxima ação.
  | 'whatsapp' // Envio/recebimento de mensagens WhatsApp por Cliente/Negócio.
  | 'email' // Envio/recebimento de e-mail por Cliente/Negócio.
  | 'automation' // Gatilhos de Automation Center a partir de mudança de etapa/status.
  | 'marketing' // Sincronização de Cliente ↔ Campanha (Marketing Intelligence).
  | 'analytics' // Métricas de CRM alimentando Business Analytics/Business Intelligence.
  | 'finance'; // Negócio Ganho ↔ lançamento financeiro (Finance Intelligence).

export interface CrmAiExtensionPoint {
  id: CrmAiExtensionPointId;
  description: string;
  /** Sempre `false` nesta Sprint — nenhuma integração real existe ainda. */
  connected: boolean;
}

export const CRM_AI_EXTENSION_POINTS: CrmAiExtensionPoint[] = [
  { id: 'ai-agents', description: 'Agentes de IA — resumo e próxima ação sugerida.', connected: false },
  { id: 'whatsapp', description: 'Mensagens de WhatsApp vinculadas a Cliente/Negócio.', connected: false },
  { id: 'email', description: 'E-mails vinculados a Cliente/Negócio.', connected: false },
  { id: 'automation', description: 'Gatilhos de automação por mudança de etapa/status.', connected: false },
  { id: 'marketing', description: 'Sincronização com campanhas de Marketing.', connected: false },
  { id: 'analytics', description: 'Métricas de CRM alimentando Analytics/BI.', connected: false },
  { id: 'finance', description: 'Negócio Ganho gerando lançamento financeiro.', connected: false },
];
