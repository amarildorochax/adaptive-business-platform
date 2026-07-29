// Stack.tsx
//
// Responsabilidade:
// Primitivo de empilhamento vertical — atalho sobre `Flex` com
// `direction="column"`, o padrão mais comum de composição de UI.

import type { ReactNode } from 'react';
import type { SpacingToken } from '@/design-system/tokens';
import { Flex } from './Flex';

export interface StackProps {
  children?: ReactNode;
  gap?: SpacingToken;
  align?: 'start' | 'center' | 'end' | 'stretch';
}

export function Stack(props: StackProps) {
  const { children, gap, align } = props;

  return (
    <Flex direction="column" gap={gap} align={align === 'start' || align === 'end' ? `flex-${align}` : align}>
      {children}
    </Flex>
  );
}
