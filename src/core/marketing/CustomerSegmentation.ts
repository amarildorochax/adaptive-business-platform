import type { MarketingCustomerRecord } from "./CampaignProvider";

/** Um segmento de clientes já calculado — id/label descritivos, critério documentado, ids dos clientes membros (Tarefa 05). */
export interface MarketingSegment {
  id: string;
  label: string;
  criteria: string;
  customerIds: string[];
}

function daysSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Segmenta clientes por frequência, valor, interações, status e última
 * atividade (Tarefa 05). Um mesmo cliente pode pertencer a mais de um
 * segmento (ex.: alto valor E frequente) — segmentos não são mutuamente
 * exclusivos, cada um representa um critério independente.
 *
 * Toda segmentação usa apenas os campos de `MarketingCustomerRecord`
 * (desde a Sprint 10B, adaptado a partir do CRM Core por
 * CampaignProvider — ver `@/core/marketing/CampaignProvider`); nenhum
 * acesso a armazenamento interno de nenhum subsistema.
 *
 * Stateless — nenhum campo próprio, nenhuma dependência de EventBus ou
 * métricas (isso é responsabilidade de MarketingManager).
 */
export class CustomerSegmentation {
  /** Calcula todos os segmentos a partir da lista de clientes informada. */
  segment(customers: MarketingCustomerRecord[]): MarketingSegment[] {
    const highValue = customers.filter((customer) => customer.totalValue >= 2000);
    const frequent = customers.filter((customer) => customer.purchaseCount >= 6);
    const lowEngagement = customers.filter((customer) => customer.interactionCount <= 2);
    const recent = customers.filter(
      (customer) => customer.purchaseCount <= 1 && daysSince(customer.lastActivityAt) <= 30,
    );
    const atRisk = customers.filter(
      (customer) => customer.status === "active" && daysSince(customer.lastActivityAt) > 60,
    );
    const inactive = customers.filter((customer) => customer.status === "inactive" || customer.status === "lost");

    return [
      { id: "high-value", label: "Alto valor", criteria: "totalValue >= 2000", customerIds: highValue.map((c) => c.id) },
      { id: "frequent", label: "Frequentes", criteria: "purchaseCount >= 6", customerIds: frequent.map((c) => c.id) },
      { id: "low-engagement", label: "Baixo engajamento", criteria: "interactionCount <= 2", customerIds: lowEngagement.map((c) => c.id) },
      { id: "new", label: "Novos", criteria: "purchaseCount <= 1 e atividade nos últimos 30 dias", customerIds: recent.map((c) => c.id) },
      { id: "at-risk", label: "Em risco", criteria: "status ativo sem atividade há mais de 60 dias", customerIds: atRisk.map((c) => c.id) },
      { id: "inactive", label: "Inativos", criteria: "status inactive ou lost", customerIds: inactive.map((c) => c.id) },
    ];
  }
}
