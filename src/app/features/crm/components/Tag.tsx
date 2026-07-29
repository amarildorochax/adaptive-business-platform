// Tag.tsx
//
// Responsabilidade:
// Renderiza uma entidade `Tag` do CRM como um `Badge` do Design System.
// Nome do componente coincide com o da entidade de propósito ("Tag") —
// sem colisão real, pois a entidade `../types/Tag` nunca é importada no
// mesmo arquivo sob o mesmo identificador (ver `hooks/useTags.ts`, que
// já importa como `Tag as TagEntity`).

import { Badge } from '@/design-system/components';
import type { Tag as TagEntity } from '../types/Tag';

export interface TagProps {
  tag: TagEntity;
}

export function Tag(props: TagProps) {
  const { tag } = props;
  return <Badge variant={tag.variant}>{tag.label}</Badge>;
}
