/**
 * Status comercial de um Customer.
 *
 * Nota de projeto: usa deliberadamente o mesmo vocabulário já adotado
 * por `MarketingCustomerRecord.status` (`@/core/marketing/
 * MarketingSimulatedData.ts`, Sprint 10) — "active"/"inactive"/"lead"/
 * "lost" — para que a futura substituição de `MarketingSimulatedData`
 * por um `CampaignProvider` conectado a este CRM (ver CONTEXTO desta
 * Sprint) não exija nenhum mapeamento de vocabulário.
 */
export type CustomerStatus = "active" | "inactive" | "lead" | "lost";

/**
 * Cliente — entidade central do CRM (Tarefa 04).
 */
export interface Customer {
  id: string;

  name: string;

  email: string;

  phone: string;

  status: CustomerStatus;

  createdAt: Date;

  updatedAt: Date;

  metadata: Record<string, unknown>;
}
