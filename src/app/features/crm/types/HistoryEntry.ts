// HistoryEntry.ts
//
// Responsabilidade:
// Contrato de "Histórico" do CRM — a linha do tempo de qualquer
// registro (Empresa/Cliente/Negócio). "Nada poderá ser perdido"
// (ESCOPO): esta é uma lista de anexação apenas — nenhum consumidor
// deste tipo deve prever edição/remoção de uma entrada.

import type { CrmEntityType } from './common';

export interface HistoryEntry {
  id: string;
  entityType: CrmEntityType;
  entityId: string;
  action: string;
  actor: string;
  timestamp: string;
}
