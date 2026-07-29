// FilterBar.tsx
//
// Responsabilidade:
// Layout horizontal (com quebra de linha responsiva) para agrupar os
// filtros de uma página — puro wrapper de composição.

import type { ReactNode } from 'react';
import { Flex } from '@/app/primitives';

export interface FilterBarProps {
  children?: ReactNode;
}

export function FilterBar(props: FilterBarProps) {
  const { children } = props;
  return (
    <Flex align="flex-end" gap={16} wrap>
      {children}
    </Flex>
  );
}
