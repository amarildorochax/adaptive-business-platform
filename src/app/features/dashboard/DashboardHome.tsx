// DashboardHome.tsx
//
// Responsabilidade:
// Composição principal do Dashboard Premium — liga `useDashboard` aos
// painéis (`DashboardHeader`, `DashboardSidebar`, `DashboardContent`,
// `DashboardFooter`). Nenhuma lógica de negócio própria: apenas
// composição.
//
// Sprint 31 (evolução visual — "Layout"): espaçamento consistente
// (tokens `24`/`16`), divisória vertical entre Sidebar e conteúdo
// (`Divider`), e um `Container maxWidth="wide"` limitando a largura em
// telas ultrawide — melhor aproveitamento da largura sem quebrar o
// Grid existente (`DashboardGrid` continua distribuindo colunas
// normalmente dentro deste container).
//
// Uma futura `page` em `@/app/pages` (ex.: `DashboardPage`) é quem
// ligará este componente a uma rota real, envolvendo-o com o
// `DashboardLayout` de `@/app/layouts` — isso não é feito nesta Sprint.

import { Flex, Container, Divider } from '@/app/primitives';
import { DashboardHeader, DashboardSidebar, DashboardContent, DashboardFooter } from './panels';
import { DashboardSection } from './sections';
import { useDashboard } from './hooks';

export function DashboardHome() {
  const dashboard = useDashboard();

  return (
    <Container maxWidth="wide">
      <Flex direction="column" gap={16}>
        <DashboardHeader />
        <Divider />

        <Flex gap={24} align="flex-start">
          <DashboardSidebar dashboard={dashboard} />
          <Divider orientation="vertical" />

          <Flex direction="column" gap={24} style={{ flex: 1, minWidth: 0 }}>
            <DashboardSection title="Visão Geral">
              <DashboardContent dashboard={dashboard} />
            </DashboardSection>
            <DashboardFooter dashboard={dashboard} />
          </Flex>
        </Flex>
      </Flex>
    </Container>
  );
}
