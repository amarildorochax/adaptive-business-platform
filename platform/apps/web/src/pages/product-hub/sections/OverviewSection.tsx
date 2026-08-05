import { Activity, Award, Layers, Package, Tags, Wallet } from "lucide-react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Badge } from "@shared/components/ui/Badge";
import { KPIGrid } from "@shared/components/ui/KPIGrid";
import { MetricCard } from "@shared/components/ui/MetricCard";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { resolveCurrentPrice, resolveInventory, type ProductWorkspaceSnapshot } from "@core/commerce/productWorkspace";
import { useBrandIdentity } from "@core/query/useBrandIdentity";
import { useBusinessProfileSummary } from "@core/query/useBusinessProfileSummary";
import { useCrmWorkspace } from "@core/query/useCrmWorkspace";

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/**
 * Visão Geral (FUN-104) — Dashboard de produto inteiramente real: todo KPI é derivado do próprio
 * Product Hub Workspace já acumulado nesta sessão (`CommerceManager` não expõe nenhuma Query de
 * listagem — ver relatório desta Sprint). "Itens ativos" é sempre zero, honestamente: `updateProduct`
 * (o único método de atualização exposto) nunca aceita o campo `status`, e `publish()`/`discontinue()`
 * existem em `ProductService` mas nunca são chamados por `CommerceManager` — todo Product criado por
 * este Workspace permanece `Draft` para sempre (limitação documentada no relatório desta Sprint, não
 * um bug desta seção). "Integração" (per instrução explícita): Segmento do Business Profile, Tema do
 * Branding Hub, Clientes do CRM Workspace — todos somente leitura, reaproveitando hooks já reais
 * desde a FUN-101/102/103.
 */
export function OverviewSection({ workspace, profileId, tenantId }: { readonly workspace: ProductWorkspaceSnapshot; readonly profileId: string; readonly tenantId: string }) {
  const profileSummary = useBusinessProfileSummary(profileId);
  const brandIdentity = useBrandIdentity(tenantId);
  const crmWorkspace = useCrmWorkspace();

  const published = workspace.products.filter((product) => product.status === "Published").length;
  const draft = workspace.products.filter((product) => product.status === "Draft").length;
  const discontinued = workspace.products.filter((product) => product.status === "Discontinued").length;

  const estimatedValue = workspace.products.reduce((total, product) => {
    const price = resolveCurrentPrice(workspace, product.productId);
    const inventory = resolveInventory(workspace, product.productId);
    return price && inventory ? total + price.amount * inventory.quantity : total;
  }, 0);
  const currency = workspace.prices[0]?.currency ?? "BRL";

  return (
    <div className="dashboard-section">
      <NotConnectedNotice fields={["Publicação de Produto (status permanece Draft)"]} context="Commerce Hub" />

      <KPIGrid>
        <MetricCard icon={<Package size={16} aria-hidden="true" />} label="Produtos" value={String(workspace.products.length)} tone="primary" />
        <MetricCard icon={<Tags size={16} aria-hidden="true" />} label="Categorias" value={String(workspace.categories.length)} tone="neutral" />
        <MetricCard icon={<Award size={16} aria-hidden="true" />} label="Itens ativos" value={String(published)} hint="Publicação não suportada por CommerceManager" tone="warning" />
        <MetricCard icon={<Wallet size={16} aria-hidden="true" />} label="Valor estimado em estoque" value={formatCurrency(estimatedValue, currency)} tone="success" />
        <MetricCard icon={<Activity size={16} aria-hidden="true" />} label="Movimentações" value={String(workspace.eventLog.length)} hint="Nesta sessão" tone="info" />
      </KPIGrid>

      <div className="dashboard-grid">
        <WidgetCard title="Status dos Produtos">
          <div className="component-gallery-row">
            <Badge tone="neutral">Rascunho: {draft}</Badge>
            <Badge tone="success">Publicado: {published}</Badge>
            <Badge tone="danger">Descontinuado: {discontinued}</Badge>
          </div>
        </WidgetCard>

        <WidgetCard title="Integração (somente leitura)">
          <p>
            Segmento: <strong>{profileSummary.data?.classification?.segment ?? "—"}</strong>
          </p>
          <p>
            <Layers size={14} aria-hidden="true" /> Tema ativo: <strong>{brandIdentity.data?.theme ? `Versão ${brandIdentity.data.theme.version}` : "—"}</strong>
          </p>
          <p>
            Clientes no CRM: <strong>{crmWorkspace.data ? crmWorkspace.data.customers.length + crmWorkspace.data.organizations.length : "—"}</strong>
          </p>
        </WidgetCard>
      </div>
    </div>
  );
}
