// AppShell.tsx
//
// Responsabilidade:
// Composição do Application Shell completo — SkipLink, Header, Sidebar,
// ContentArea e Footer, envolvidos por um ErrorBoundary. A Sidebar
// colapsa automaticamente abaixo do breakpoint `tablet`, consumindo
// `useBreakpoint` do Adaptive Design System (Sprint 26) — nenhum valor
// de largura é fixado aqui.

import { useEffect, type ReactNode } from 'react';
import { useBreakpoint } from '@/design-system/hooks';
import { SidebarProvider, useSidebar } from '../contexts/SidebarContext';
import { SkipLink } from './SkipLink';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ContentArea } from './ContentArea';
import { Footer } from './Footer';
import { ErrorBoundary } from './ErrorBoundary';

export interface AppShellProps {
  children?: ReactNode;
  headerContent?: ReactNode;
  sidebarContent?: ReactNode;
  footerContent?: ReactNode;
}

function AppShellBody(props: AppShellProps) {
  const { children, headerContent, sidebarContent, footerContent } = props;
  const isDesktop = useBreakpoint('desktop');
  const { setCollapsed } = useSidebar();

  useEffect(() => {
    setCollapsed(!isDesktop);
  }, [isDesktop, setCollapsed]);

  return (
    <div>
      <SkipLink />
      <Header>{headerContent}</Header>
      <Sidebar>{sidebarContent}</Sidebar>
      <ContentArea>
        <ErrorBoundary>{children}</ErrorBoundary>
      </ContentArea>
      <Footer>{footerContent}</Footer>
    </div>
  );
}

export function AppShell(props: AppShellProps) {
  return (
    <SidebarProvider>
      <AppShellBody {...props} />
    </SidebarProvider>
  );
}
