import { Boxes, DollarSign, PieChart, Tags } from "lucide-react";
import { KPIGrid } from "@shared/components/ui/KPIGrid";
import { MetricCard } from "@shared/components/ui/MetricCard";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import type { ProductWorkspaceSnapshot } from "@core/commerce/productWorkspace";

/**
 * Analytics (FUN-104) — apenas dado real, per instrução explícita ("Nunca gerar IA fictícia"):
 * distribuição de Produtos por Categoria (quantos têm Categoria vs. sem), preço médio (sobre os
 * Prices já conhecidos), quantidade total em Estoque, quantidade de Categorias sem nenhum Produto
 * associado ainda. Nenhuma tendência histórica, nenhuma previsão — `CRM Analytics`/equivalente para
 * Commerce nunca foi implementado.
 */
export function AnalyticsSection({ workspace }: { readonly workspace: ProductWorkspaceSnapshot }) {
  const withCategory = workspace.products.filter((product) => product.categoryId !== undefined).length;
  const withoutCategory = workspace.products.length - withCategory;
  const averagePrice = workspace.prices.length === 0 ? undefined : workspace.prices.reduce((sum, price) => sum + price.amount, 0) / workspace.prices.length;
  const totalStock = workspace.inventory.reduce((sum, entry) => sum + entry.quantity, 0);
  const emptyCategories = workspace.categories.filter((category) => !workspace.products.some((product) => product.categoryId === category.categoryId)).length;

  return (
    <div className="dashboard-section">
      <KPIGrid>
        <MetricCard icon={<Tags size={16} aria-hidden="true" />} label="Produtos com Categoria" value={String(withCategory)} hint={`${withoutCategory} sem Categoria`} tone="primary" />
        <MetricCard icon={<DollarSign size={16} aria-hidden="true" />} label="Preço médio" value={averagePrice === undefined ? "—" : averagePrice.toLocaleString("pt-BR", { style: "currency", currency: workspace.prices[0]?.currency ?? "BRL" })} tone="success" />
        <MetricCard icon={<Boxes size={16} aria-hidden="true" />} label="Estoque total" value={String(totalStock)} hint="unidades" tone="info" />
        <MetricCard icon={<PieChart size={16} aria-hidden="true" />} label="Categorias vazias" value={String(emptyCategories)} hint="sem nenhum Produto" tone="neutral" />
      </KPIGrid>

      <NotConnectedNotice fields={["Tendência histórica entre sessões", "Previsão de demanda", "Produtos mais vendidos"]} context="Commerce Hub" />
    </div>
  );
}
