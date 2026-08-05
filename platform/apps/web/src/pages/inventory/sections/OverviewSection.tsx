import { Boxes, CheckCircle2, ClipboardList, Layers, XCircle } from "lucide-react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { KPIGrid } from "@shared/components/ui/KPIGrid";
import { MetricCard } from "@shared/components/ui/MetricCard";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { resolveInventory, type ProductWorkspaceSnapshot } from "@core/commerce/productWorkspace";
import { useBrandIdentity } from "@core/query/useBrandIdentity";
import { useBusinessProfileSummary } from "@core/query/useBusinessProfileSummary";
import { useCrmWorkspace } from "@core/query/useCrmWorkspace";

/**
 * Visão Geral (FUN-105) — Dashboard operacional real: todo KPI é derivado do mesmo Product Hub
 * Workspace já acumulado nesta sessão (FUN-104, `useProductWorkspace`) — nenhum novo dado, apenas uma
 * lente operacional sobre ele. "Reservados" e "Em composição", pedidos pela Sprint, não têm nenhum
 * campo real correspondente (`Inventory` não modela reserva; nenhuma relação de composição existe —
 * ver relatório desta Sprint) — `NotConnectedNotice` explícito, nunca um "0" que sugira dado real
 * ausente. "Integração" (per instrução explícita): Business Profile, Branding, CRM e Product Hub,
 * todos somente leitura.
 */
export function OverviewSection({ workspace, profileId, tenantId }: { readonly workspace: ProductWorkspaceSnapshot; readonly profileId: string; readonly tenantId: string }) {
  const profileSummary = useBusinessProfileSummary(profileId);
  const brandIdentity = useBrandIdentity(tenantId);
  const crmWorkspace = useCrmWorkspace();

  const available = workspace.products.filter((product) => (resolveInventory(workspace, product.productId)?.quantity ?? 0) > 0).length;
  const outOfStock = workspace.products.filter((product) => (resolveInventory(workspace, product.productId)?.quantity ?? 0) <= 0).length;

  return (
    <div className="dashboard-section">
      <NotConnectedNotice fields={["Reservados", "Em composição"]} context="Commerce Hub" />

      <KPIGrid>
        <MetricCard icon={<ClipboardList size={16} aria-hidden="true" />} label="Itens cadastrados" value={String(workspace.products.length)} tone="primary" />
        <MetricCard icon={<CheckCircle2 size={16} aria-hidden="true" />} label="Disponíveis" value={String(available)} tone="success" />
        <MetricCard icon={<Layers size={16} aria-hidden="true" />} label="Reservados" value="—" hint="Sem suporte no domínio" tone="neutral" />
        <MetricCard icon={<Boxes size={16} aria-hidden="true" />} label="Em composição" value="—" hint="Sem suporte no domínio" tone="neutral" />
        <MetricCard icon={<XCircle size={16} aria-hidden="true" />} label="Sem estoque" value={String(outOfStock)} tone="danger" />
      </KPIGrid>

      <div className="dashboard-grid">
        <WidgetCard title="Integração (somente leitura)">
          <p>
            Segmento (Business Profile): <strong>{profileSummary.data?.classification?.segment ?? "—"}</strong>
          </p>
          <p>
            Tema ativo (Branding): <strong>{brandIdentity.data?.theme ? `Versão ${brandIdentity.data.theme.version}` : "—"}</strong>
          </p>
          <p>
            Clientes (CRM): <strong>{crmWorkspace.data ? crmWorkspace.data.customers.length + crmWorkspace.data.organizations.length : "—"}</strong>
          </p>
          <p>
            Catálogos (Product Hub): <strong>{workspace.catalogs.length}</strong>
          </p>
        </WidgetCard>
      </div>
    </div>
  );
}
