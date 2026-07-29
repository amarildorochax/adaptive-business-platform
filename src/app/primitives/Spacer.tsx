// Spacer.tsx
//
// Responsabilidade:
// Primitivo de espaçamento fixo — um elemento invisível de tamanho
// definido por um token de espaçamento, útil dentro de `Flex`/`Stack`.

import { spacing, type SpacingToken } from '@/design-system/tokens';

export interface SpacerProps {
  size?: SpacingToken;
}

export function Spacer(props: SpacerProps) {
  const { size = 16 } = props;

  return <div aria-hidden="true" style={{ flexShrink: 0, width: spacing[size], height: spacing[size] }} />;
}
