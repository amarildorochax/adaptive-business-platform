// CrmBreadcrumb.tsx
//
// Responsabilidade (Sprint 33A):
// Navegação contextual "Dashboard > CRM > <Seção>". Os dois primeiros
// níveis são links reais (`react-router-dom`); o último é o rótulo da
// página atual (texto, não clicável — padrão usual de breadcrumb).
//
// `<a>` nativo não herda `color` do tema (mesma causa-raiz documentada
// em `branding.css`, Sprint 31E — mas aquele fix cobre apenas
// `button/input/select/textarea`, não `a`) — por isso a cor é aplicada
// aqui via `style` diretamente em cada `Link`, sem depender de CSS
// global (nenhuma alteração ao Design System).

import { Link } from 'react-router-dom';
import { Flex, Text } from '@/app/primitives';
import type { CrmSection } from './CrmSidebar';

const linkStyle = { color: 'var(--ads-color-text-auxiliary)', textDecoration: 'none' };

export interface CrmBreadcrumbProps {
  section: CrmSection;
  sectionLabel: string;
}

export function CrmBreadcrumb(props: CrmBreadcrumbProps) {
  const { section, sectionLabel } = props;

  return (
    <Flex align="center" gap={4} as="nav">
      <Link to="/" style={linkStyle}>
        Dashboard
      </Link>
      <Text variant="caption" color="var(--ads-color-text-auxiliary)">
        ›
      </Text>
      {section === 'overview' ? (
        <Text variant="caption" color="var(--ads-color-text-primary)" style={{ fontWeight: 600 }}>
          CRM
        </Text>
      ) : (
        <>
          <Link to="/crm" style={linkStyle}>
            CRM
          </Link>
          <Text variant="caption" color="var(--ads-color-text-auxiliary)">
            ›
          </Text>
          <Text variant="caption" color="var(--ads-color-text-primary)" style={{ fontWeight: 600 }}>
            {sectionLabel}
          </Text>
        </>
      )}
    </Flex>
  );
}
