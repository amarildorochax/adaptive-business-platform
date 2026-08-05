import { WidgetCard } from "@shared/components/WidgetCard";
import type { DemoSnapshot } from "@core/managers/seedDemoData";

/**
 * `CRMManager` não expõe nenhum método de leitura em lista (`COMMAND_CATALOG.md`/`QUERY_CATALOG.md`
 * são catálogos distintos; nenhum Manager de CRM ainda implementa o lado de Query) — este widget
 * exibe o resultado já retornado pelos próprios Commands executados no bootstrap da sessão, nunca
 * uma listagem inventada.
 */
export function CRMWidget({ snapshot }: { readonly snapshot: DemoSnapshot }) {
  return (
    <WidgetCard title="CRM — Relacionamentos">
      <dl>
        <dt>Organização</dt>
        <dd>{snapshot.organization.name}</dd>
        <dt>Oportunidade em aberto</dt>
        <dd>
          {snapshot.opportunity.title} — R$ {snapshot.opportunity.value.toLocaleString("pt-BR")}
        </dd>
        <dt>Novo Lead</dt>
        <dd>
          {snapshot.lead.name} ({snapshot.lead.source})
        </dd>
      </dl>
    </WidgetCard>
  );
}
