import { BarChart3, Boxes, Calculator, History, LayoutGrid, Package, Settings, Tag, Tags, Truck, Warehouse } from "lucide-react";
import type { SectionEntry } from "@shared/components/ui/SectionSubNav";

export type ProductHubSectionId = "overview" | "catalog" | "categories" | "compositions" | "stock" | "purchases" | "costs" | "pricing" | "history" | "analytics" | "settings";

export type ProductHubSectionEntry = SectionEntry<ProductHubSectionId>;

/**
 * Fonte única das onze seções do Product Hub Workspace (FUN-104) — `SectionSubNav` e
 * `ProductHubPage` leem exclusivamente daqui. `hasRealData` reflete o que o Product Hub Workspace
 * (`core/commerce/productWorkspace.ts`) realmente consegue mostrar: Catálogo/Categorias/Estoque/
 * Precificação/Histórico/Analytics são reais (Commands reais de `CommerceManager`, acumulados
 * localmente nesta sessão — nenhuma Query de listagem existe, ver relatório desta Sprint);
 * Composições e Compras não têm nenhum suporte no domínio; Custos só tem Preço real (já coberto por
 * Precificação) — Custo/Margem/Lucro não existem; Configurações só tem uma preferência genuinamente
 * real (tema claro/escuro).
 */
export const PRODUCT_HUB_SECTIONS: readonly ProductHubSectionEntry[] = [
  { id: "overview", label: "Visão Geral", icon: LayoutGrid, hasRealData: true },
  { id: "catalog", label: "Catálogo", icon: Package, hasRealData: true },
  { id: "categories", label: "Categorias", icon: Tags, hasRealData: true },
  { id: "compositions", label: "Composições", icon: Boxes, hasRealData: false },
  { id: "stock", label: "Estoque", icon: Warehouse, hasRealData: true },
  { id: "purchases", label: "Compras", icon: Truck, hasRealData: false },
  { id: "costs", label: "Custos", icon: Calculator, hasRealData: false },
  { id: "pricing", label: "Precificação", icon: Tag, hasRealData: true },
  { id: "history", label: "Histórico", icon: History, hasRealData: true },
  { id: "analytics", label: "Analytics", icon: BarChart3, hasRealData: true },
  { id: "settings", label: "Configurações", icon: Settings, hasRealData: false },
];

export const DEFAULT_PRODUCT_HUB_SECTION: ProductHubSectionId = "overview";

export function isProductHubSectionId(value: string | null): value is ProductHubSectionId {
  return PRODUCT_HUB_SECTIONS.some((section) => section.id === value);
}
