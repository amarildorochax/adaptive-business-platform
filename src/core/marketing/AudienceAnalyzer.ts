import type { MarketingCustomerRecord } from "./CampaignProvider";

/** Classificação de audiência — cada lista contém ids de clientes; um cliente pode aparecer em mais de uma lista (Tarefa 06). */
export interface AudienceBreakdown {
  active: string[];
  inactive: string[];
  recurring: string[];
  new: string[];
  atRisk: string[];
}

function daysSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Identifica clientes ativos, inativos, recorrentes, novos e em risco
 * (Tarefa 06). Independente de CustomerSegmentation — analisa o mesmo
 * `MarketingCustomerRecord[]`, mas sob a ótica de audiência (estado de
 * relacionamento), não de valor comercial.
 *
 * Stateless — nenhum campo próprio, nenhuma dependência de EventBus ou
 * métricas (isso é responsabilidade de MarketingManager).
 */
export class AudienceAnalyzer {
  /** Classifica a lista de clientes informada nas cinco categorias de audiência. */
  analyze(customers: MarketingCustomerRecord[]): AudienceBreakdown {
    const active = customers.filter(
      (customer) => customer.status === "active" && daysSince(customer.lastActivityAt) <= 60,
    );
    const inactive = customers.filter((customer) => customer.status === "inactive" || customer.status === "lost");
    const recurring = customers.filter((customer) => customer.purchaseCount >= 3);
    const fresh = customers.filter(
      (customer) => customer.purchaseCount <= 1 && daysSince(customer.lastActivityAt) <= 30,
    );
    const atRisk = customers.filter(
      (customer) => customer.status === "active" && daysSince(customer.lastActivityAt) > 60,
    );

    return {
      active: active.map((c) => c.id),
      inactive: inactive.map((c) => c.id),
      recurring: recurring.map((c) => c.id),
      new: fresh.map((c) => c.id),
      atRisk: atRisk.map((c) => c.id),
    };
  }
}
