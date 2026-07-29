// CrmMockService.ts
//
// Responsabilidade:
// Simula a busca assíncrona de cada entidade do CRM (delay artificial +
// dado de `mocks/`), no mesmo espírito de `DashboardMockService`
// (Sprint 28). Nenhuma chamada de rede ou ao Core ocorre aqui.
//
// Substituição futura: quando o CRM for conectado ao Core (via
// `CrmAdapter`, não alterado nesta Sprint), cada método passa a chamar
// a fachada pública `crm` de `@/core/crm` em vez de `mocks/*`,
// preservando a mesma assinatura `Promise<Entidade[]>`.

import {
  generateCompanies,
  generateClients,
  generateDeals,
  generateCrmPipelineStages,
  generateActivities,
  generateCrmAgenda,
  generateTags,
  generateNotes,
  generateHistory,
} from '../mocks';
import type {
  Company,
  Client,
  Deal,
  CrmPipelineStage,
  Activity,
  AgendaEvent,
  Tag,
  Note,
  HistoryEntry,
} from '../types';

const DEFAULT_DELAY_MS = 300;

function delay<Data>(value: Data, ms: number = DEFAULT_DELAY_MS): Promise<Data> {
  return new Promise((resolve) => window.setTimeout(() => resolve(value), ms));
}

export class CrmMockService {
  async fetchCompanies(): Promise<Company[]> {
    return delay(generateCompanies());
  }

  async fetchClients(): Promise<Client[]> {
    return delay(generateClients());
  }

  async fetchDeals(): Promise<Deal[]> {
    return delay(generateDeals());
  }

  async fetchPipelineStages(): Promise<CrmPipelineStage[]> {
    return delay(generateCrmPipelineStages());
  }

  async fetchActivities(): Promise<Activity[]> {
    return delay(generateActivities());
  }

  async fetchAgenda(): Promise<AgendaEvent[]> {
    return delay(generateCrmAgenda());
  }

  async fetchTags(): Promise<Tag[]> {
    return delay(generateTags());
  }

  async fetchNotes(): Promise<Note[]> {
    return delay(generateNotes());
  }

  async fetchHistory(): Promise<HistoryEntry[]> {
    return delay(generateHistory());
  }
}

/** Instância única e compartilhada do serviço de dados mock do CRM. */
export const crmMockService = new CrmMockService();
