import { WidgetCard } from "@shared/components/WidgetCard";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";

/**
 * Composições (FUN-104) — um dos diferenciais pedidos pela Sprint, mas sem nenhum suporte real:
 * `packages/commerce-hub` não modela nenhuma relação de composição entre Products — nenhum "Bill of
 * Materials", nenhum Kit/Combo/Pacote/Conjunto, nenhum campo em `Product`/`Variant` referencia outro
 * Product. `CompositionCard` (`shared/components/ui/`) já existe pronto para o dia em que essa
 * modelagem existir, mas nenhum dado fabricado é exibido aqui — per a instrução explícita da Sprint
 * ("Não criar persistência").
 */
export function CompositionsSection() {
  return (
    <div className="dashboard-section">
      <NotConnectedNotice fields={["Kit", "Combo", "Pacote", "Conjunto"]} context="Commerce Hub" />
      <WidgetCard title="Composições">
        <EmptyState title="Produtos compostos ainda não são suportados" description="O Commerce Hub não modela nenhuma relação de composição entre Products nesta Sprint — nenhum dado foi inventado." />
      </WidgetCard>
    </div>
  );
}
