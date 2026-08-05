import type { ContactResponseDto, CustomerResponseDto, LeadResponseDto, OpportunityResponseDto, OrganizationResponseDto, RelationshipResponseDto } from "@core/http/dtos/crm.dto";
import type { DemoSnapshot } from "@core/managers/seedDemoData";

/**
 * Entrada sintética de log de atividade — NUNCA um `TimelineEvent` real (`packages/crm-hub/src/TimelineEvent.ts`):
 * `CRMManager` grava um `TimelineEvent` real a cada Command bem-sucedido (`timeline.record(...)`,
 * ver `CRMManager.ts`), mas não expõe nenhum método de leitura de Timeline, e `apps/api/src/routes/crm.ts`
 * também nunca devolve `CRMEvent[]` pela HTTP (cada rota destrói `command`/`events`, devolvendo apenas
 * `result`). Esta entrada é construída inteiramente no navegador, a partir do que o próprio Frontend
 * acabou de fazer nesta sessão — ver Seção "A Limitação Central" do relatório desta Sprint.
 */
export interface CrmActivityLogEntry {
  readonly id: string;
  readonly label: string;
  readonly occurredAt: string;
}

/**
 * Fotografia local, acumulada durante a sessão, de tudo que o CRM Workspace já sabe —
 * `CRMManager` (auditado no relatório desta Sprint, `docs/implementation/FUN_103_CRM_WORKSPACE_REPORT.md`)
 * expõe exatamente oito métodos, todos de escrita, nenhum de leitura em lista (nenhum `listOpportunities`,
 * nenhum `customer360`, nenhum `pipelineSummary`, nenhum `getTimeline`). Toda lista, todo Kanban, toda
 * Timeline desta experiência é reconstruída exclusivamente a partir do que os próprios Commands já
 * executados nesta sessão do navegador devolveram — nunca uma Query real, nunca dado inventado.
 * `convertedLeadIds` é a única exceção clara: não é campo de nenhum DTO real, é apenas a memória local
 * do Frontend de quais Leads ele mesmo já mandou converter, usada só para rotular visualmente.
 */
export interface CrmWorkspaceSnapshot {
  readonly organizations: readonly OrganizationResponseDto[];
  readonly relationships: readonly RelationshipResponseDto[];
  readonly customers: readonly CustomerResponseDto[];
  readonly contacts: readonly ContactResponseDto[];
  readonly opportunities: readonly OpportunityResponseDto[];
  readonly leads: readonly LeadResponseDto[];
  readonly convertedLeadIds: readonly string[];
  readonly activityLog: readonly CrmActivityLogEntry[];
}

let logSequence = 0;

export function crmLogEntry(label: string, occurredAt: string = new Date().toISOString()): CrmActivityLogEntry {
  logSequence += 1;
  return { id: `crm-log-${logSequence}`, label, occurredAt };
}

/** Semente inicial do Workspace — os três registros já criados por `seedDemoData` no bootstrap da sessão. */
export function buildInitialCrmWorkspace(snapshot: DemoSnapshot): CrmWorkspaceSnapshot {
  return {
    organizations: [snapshot.organization],
    relationships: [snapshot.relationship],
    customers: [],
    contacts: [],
    opportunities: [snapshot.opportunity],
    leads: [snapshot.lead],
    convertedLeadIds: [],
    activityLog: [
      crmLogEntry(`Organização "${snapshot.organization.name}" cadastrada.`, snapshot.organization.createdAt),
      crmLogEntry(`Oportunidade "${snapshot.opportunity.title}" criada.`, snapshot.opportunity.createdAt),
      crmLogEntry(`Lead "${snapshot.lead.name}" capturado (origem: ${snapshot.lead.source}).`, snapshot.lead.createdAt),
    ],
  };
}

/** Nome de exibição de uma Organization ou Customer associado a um `relationshipId`, quando conhecido nesta sessão. */
export function resolvePartyName(workspace: CrmWorkspaceSnapshot, relationshipId: string): string | undefined {
  return workspace.organizations.find((organization) => organization.relationshipId === relationshipId)?.name ?? workspace.customers.find((customer) => customer.relationshipId === relationshipId)?.name;
}

/**
 * Nomes dos Contacts associados à Organization/Customer de um `relationshipId` — `Contact.associationId`
 * referencia o `organizationId`/`customerId`, nunca o `relationshipId` diretamente (ver `Contact.ts`),
 * então a resolução passa primeiro pela Organization/Customer correspondente.
 */
export function resolveContactNames(workspace: CrmWorkspaceSnapshot, relationshipId: string): readonly string[] {
  const partyId = workspace.organizations.find((organization) => organization.relationshipId === relationshipId)?.organizationId ?? workspace.customers.find((customer) => customer.relationshipId === relationshipId)?.customerId;

  if (!partyId) {
    return [];
  }

  return workspace.contacts.filter((contact) => contact.associationId === partyId).map((contact) => contact.name);
}
