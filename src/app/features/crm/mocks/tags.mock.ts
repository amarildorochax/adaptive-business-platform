// tags.mock.ts
//
// Responsabilidade:
// Dado simulado de Etiquetas do CRM — exemplos iniciais explicitamente
// citados pelo ESCOPO; totalmente personalizáveis (ver `types/Tag.ts`).

import type { Tag } from '../types';

export function generateTags(): Tag[] {
  return [
    { id: 'tag-vip', label: 'VIP', variant: 'warning' },
    { id: 'tag-urgent', label: 'Urgente', variant: 'danger' },
    { id: 'tag-old-client', label: 'Cliente Antigo', variant: 'info' },
    { id: 'tag-partner', label: 'Parceiro', variant: 'success' },
    { id: 'tag-supplier', label: 'Fornecedor', variant: 'neutral' },
    { id: 'tag-prospect', label: 'Prospect', variant: 'primary' },
  ];
}
