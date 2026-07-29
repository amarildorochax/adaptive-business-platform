// Tag.ts
//
// Responsabilidade:
// Contrato de etiqueta (Tag) do CRM — totalmente personalizável pelo
// usuário; os valores em `mocks/tags.mock.ts` são apenas exemplos
// iniciais, não uma lista fechada.

import type { ComponentVariant } from '@/design-system/types';

export interface Tag {
  id: string;
  label: string;
  variant: ComponentVariant;
}
