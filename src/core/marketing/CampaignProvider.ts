import type { Customer } from "@/core/crm/Customer";
import type { Interaction } from "@/core/crm/Interaction";
import type { Opportunity } from "@/core/crm/Opportunity";
import { crm } from "@/core/crm/CRM";
import type { CampaignRecord } from "@/core/campaign/CampaignRecord";
import { campaign } from "@/core/campaign/Campaign";

/**
 * Cliente no formato que os Analyzers de Marketing esperam — mesmo
 * formato usado desde a Sprint 10, hoje adaptado a partir de dados
 * reais do CRM (ver `CampaignProvider.toCustomerRecord()`), antes
 * gerado por `MarketingSimulatedData.ts` (removido nesta Sprint).
 * Nenhum Analyzer conhece a origem deste dado.
 */
export interface MarketingCustomerRecord {
  id: string;
  name: string;
  purchaseCount: number;
  totalValue: number;
  interactionCount: number;
  status: "active" | "inactive" | "lead" | "lost";
  lastActivityAt: Date;
}

/**
 * Campanha no formato que CampaignAnalyzer espera — mesmo formato usado
 * desde a Sprint 10, hoje adaptado a partir de dados reais do Campaign
 * Management (Sprint 11/12, ver `CampaignProvider.toCampaignRecord()`).
 * `CampaignAnalyzer` não conhece, e nunca conheceu, `CampaignRecord`
 * (`@/core/campaign`) — apenas este formato.
 */
export interface MarketingCampaignRecord {
  id: string;
  name: string;
  sentCount: number;
  convertedCount: number;
  revenue: number;
  cost: number;
  startedAt: Date;
}

/**
 * Implementação real do CampaignProvider (Tarefa 02/03/04, Sprint 10B;
 * Tarefa 01/02, Sprint 12) — a única ponte entre Marketing Intelligence
 * e o CRM Core / Campaign Management, substituindo
 * `MarketingSimulatedData.ts` (Sprint 10, removido na Sprint 10B).
 *
 * Consulta exclusivamente as fachadas públicas do CRM —
 * `crm.listCustomers()`/`crm.listInteractions()`/
 * `crm.listOpportunities()` — e do Campaign Management —
 * `campaign.listCampaigns()`/`campaign.listResults()` — nunca
 * `CRMManager`/`CustomerService`/`InteractionService`/
 * `OpportunityService`/`CampaignManager`/`CampaignService`/os Stores de
 * nenhum dos dois módulos diretamente.
 *
 * Toda adaptação de formato (CRM/Campaign → `MarketingCustomerRecord`/
 * `MarketingCampaignRecord`) acontece exclusivamente aqui — nenhum
 * Analyzer (CampaignAnalyzer/CustomerSegmentation/AudienceAnalyzer/
 * MarketingInsights) importa nada de `@/core/crm` ou `@/core/campaign`,
 * nem sabe que estes registros vêm de lá.
 *
 * `purchaseCount`/`totalValue` são derivados de Opportunity com
 * `status === "won"` (uma "compra" = uma oportunidade ganha);
 * `interactionCount` é a contagem de Interaction do cliente;
 * `lastActivityAt` é a mais recente entre `customer.updatedAt` e as
 * datas de suas Interaction/Opportunity.
 *
 * `sentCount`/`convertedCount`/`revenue` são agregados a partir de
 * `campaign.listResults(campaignId)` (soma de `delivered`/`converted`/
 * `revenue` de todo o histórico de CampaignResult da campanha);
 * `startedAt` vem de `CampaignRecord.startDate`. `cost` é sempre `0` —
 * Campaign Management (Sprint 11) não modela custo em nenhuma de suas
 * quatro entidades (CampaignRecord/CampaignAudience/CampaignExecution/
 * CampaignResult); `CampaignAnalyzer.roi` já trata `cost === 0`
 * normalmente (retorna `0`, nunca divide por zero) — ver Dívida técnica
 * no relatório da Sprint 12.
 *
 * Consumido exclusivamente por MarketingManager.
 */
export class CampaignProvider {
  /** Clientes do CRM, adaptados para o formato que os Analyzers de Marketing esperam. */
  listCustomers(): MarketingCustomerRecord[] {
    const customers = crm.listCustomers();
    const interactions = crm.listInteractions();
    const opportunities = crm.listOpportunities();

    return customers.map((customer) => this.toCustomerRecord(customer, interactions, opportunities));
  }

  /** Campanhas do Campaign Management, adaptadas para o formato que CampaignAnalyzer espera. */
  listCampaigns(): MarketingCampaignRecord[] {
    return campaign.listCampaigns().map((record) => this.toCampaignRecord(record));
  }

  private toCustomerRecord(
    customer: Customer,
    interactions: Interaction[],
    opportunities: Opportunity[],
  ): MarketingCustomerRecord {
    const customerInteractions = interactions.filter((interaction) => interaction.customerId === customer.id);
    const customerOpportunities = opportunities.filter((opportunity) => opportunity.customerId === customer.id);
    const wonOpportunities = customerOpportunities.filter((opportunity) => opportunity.status === "won");

    const activityDates = [
      customer.updatedAt,
      ...customerInteractions.map((interaction) => interaction.createdAt),
      ...customerOpportunities.map((opportunity) => opportunity.updatedAt),
    ];

    const lastActivityAt = activityDates.reduce(
      (latest, date) => (date > latest ? date : latest),
      customer.updatedAt,
    );

    return {
      id: customer.id,
      name: customer.name,
      purchaseCount: wonOpportunities.length,
      totalValue: wonOpportunities.reduce((sum, opportunity) => sum + opportunity.value, 0),
      interactionCount: customerInteractions.length,
      status: customer.status,
      lastActivityAt,
    };
  }

  private toCampaignRecord(record: CampaignRecord): MarketingCampaignRecord {
    const results = campaign.listResults(record.id);

    return {
      id: record.id,
      name: record.name,
      sentCount: results.reduce((sum, result) => sum + result.delivered, 0),
      convertedCount: results.reduce((sum, result) => sum + result.converted, 0),
      revenue: results.reduce((sum, result) => sum + result.revenue, 0),
      cost: 0,
      startedAt: record.startDate,
    };
  }
}

/** Instância única e compartilhada do CampaignProvider para toda a plataforma. */
export const campaignProvider = new CampaignProvider();
