// DashboardSection.tsx
//
// Responsabilidade:
// Agrupador genérico de conteúdo com título — ponto de extensão para
// quando o Dashboard precisar organizar widgets por categoria (ex.:
// "Visão Geral", "Atividades"). Nenhuma categorização é imposta nesta
// Sprint; `DashboardHome` usa este componente para envolver o Grid como
// uma única seção.

import type { ReactNode } from 'react';
import { Stack, Heading } from '@/app/primitives';

export interface DashboardSectionProps {
  title: string;
  children?: ReactNode;
}

export function DashboardSection(props: DashboardSectionProps) {
  const { title, children } = props;

  return (
    <Stack gap={12}>
      <Heading level={2} variant="heading">
        {title}
      </Heading>
      {children}
    </Stack>
  );
}
