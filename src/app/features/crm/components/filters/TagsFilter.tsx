// TagsFilter.tsx
//
// Responsabilidade:
// Filtro por etiqueta — seleção múltipla (um cliente pode ter várias
// tags), por isso usa uma lista de `Checkbox` em vez de `<select>`.

import { Stack, Flex, Text } from '@/app/primitives';
import { Checkbox } from '@/design-system/components';
import type { Tag as TagEntity } from '../../types/Tag';

export interface TagsFilterProps {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  tags: TagEntity[];
}

export function TagsFilter(props: TagsFilterProps) {
  const { selectedTagIds, onChange, tags } = props;

  function toggle(tagId: string) {
    onChange(
      selectedTagIds.includes(tagId) ? selectedTagIds.filter((id) => id !== tagId) : [...selectedTagIds, tagId],
    );
  }

  return (
    <Stack gap={4}>
      <Text variant="caption" color="var(--ads-color-text-auxiliary)">
        Etiquetas
      </Text>
      <Flex wrap gap={8}>
        {tags.map((tag) => (
          <Checkbox key={tag.id} checked={selectedTagIds.includes(tag.id)} onChange={() => toggle(tag.id)} label={tag.label} />
        ))}
      </Flex>
    </Stack>
  );
}
