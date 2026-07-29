// CRMCard.tsx
//
// Responsabilidade:
// Moldura visual compartilhada por telas/blocos do CRM — título +
// slot de ação opcional + conteúdo, usando o `Card` do Adaptive Design
// System (nunca uma cor/estilo próprio). Mais simples que `WidgetFrame`
// (Dashboard, Sprint 28): não gerencia loading/error/refresh — cada
// página do CRM decide isso com seus próprios hooks.

import type { ReactNode } from 'react';
import { Card } from '@/design-system/components';
import { Flex, Text } from '@/app/primitives';

export interface CRMCardProps {
  title?: string;
  action?: ReactNode;
  children?: ReactNode;
}

export function CRMCard(props: CRMCardProps) {
  const { title, action, children } = props;

  return (
    <Card elevated>
      {(title || action) && (
        <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
          {title && (
            <Text variant="body" style={{ fontWeight: 600 }}>
              {title}
            </Text>
          )}
          {action}
        </Flex>
      )}
      {children}
    </Card>
  );
}
