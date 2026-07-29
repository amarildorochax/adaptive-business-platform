// Note.ts
//
// Responsabilidade:
// Contrato de "Observação" do CRM — histórico ilimitado (nenhum limite
// de quantidade é imposto nesta camada; a UI apenas lista o que
// existir), sempre com autor, data e hora.

import type { CrmEntityType } from './common';

export interface Note {
  id: string;
  entityType: CrmEntityType;
  entityId: string;
  author: string;
  content: string;
  createdAt: string;
}
