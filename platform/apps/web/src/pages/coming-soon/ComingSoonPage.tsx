import { Clock } from "lucide-react";
import { PageContainer } from "@shared/components/PageContainer";
import { PageHeader } from "@shared/components/PageHeader";
import { WidgetCard } from "@shared/components/WidgetCard";

export interface ComingSoonPageProps {
  readonly domainLabel: string;
  readonly managerName: string;
  readonly packageName: string;
}

/**
 * Página de espera para os Managers já mapeados (relatório do FUN-001, Seção 2) mas ainda não
 * conectados ao Composition Root — a rota e o item de menu já existem ("preparar estrutura para os
 * demais Managers ainda não utilizados"), mas nenhum dado é exibido, porque nenhum foi conectado.
 * Nunca preenchida com dado inventado.
 */
export function ComingSoonPage({ domainLabel, managerName, packageName }: ComingSoonPageProps) {
  return (
    <PageContainer>
      <PageHeader title={domainLabel} description="Este módulo ainda não foi conectado ao Frontend." />
      <WidgetCard title="Em breve">
        <p className="coming-soon__body">
          <Clock size={18} aria-hidden="true" />
          <span>
            <code>{managerName}</code> (<code>{packageName}</code>) já está implementado e mapeado, mas ainda não foi conectado ao Composition Root — ver{" "}
            <code>FUN_001_FRONTEND_DOMAIN_INTEGRATION_REPORT.md</code>, Seção 2.
          </span>
        </p>
      </WidgetCard>
    </PageContainer>
  );
}
