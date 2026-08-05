import { AlertTriangle, ArrowRightLeft, BarChart3, Bookmark, Boxes, Gauge, History, LayoutGrid, Package, Settings } from "lucide-react";
import type { SectionEntry } from "@shared/components/ui/SectionSubNav";

export type InventorySectionId = "overview" | "inventory" | "movements" | "availability" | "reservations" | "compositions" | "alerts" | "history" | "analytics" | "settings";

export type InventorySectionEntry = SectionEntry<InventorySectionId>;

/**
 * Fonte única das dez seções do Inventory Workspace (FUN-105) — `SectionSubNav` e `InventoryPage`
 * leem exclusivamente daqui. `hasRealData` reflete o que o Product Hub Workspace já acumulado
 * (`core/commerce/productWorkspace.ts`, reutilizado integralmente desta Sprint — nenhum novo Manager,
 * nenhuma nova semente) realmente consegue mostrar: Inventário/Movimentações/Disponibilidade/
 * Alertas/Histórico/Analytics são reais; Reservas e Composições não têm nenhum suporte no domínio
 * (`Inventory` não modela reserva; nenhuma relação de composição existe em `packages/commerce-hub`);
 * Configurações só tem uma preferência genuinamente real (tema claro/escuro).
 */
export const INVENTORY_SECTIONS: readonly InventorySectionEntry[] = [
  { id: "overview", label: "Visão Geral", icon: LayoutGrid, hasRealData: true },
  { id: "inventory", label: "Inventário", icon: Package, hasRealData: true },
  { id: "movements", label: "Movimentações", icon: ArrowRightLeft, hasRealData: true },
  { id: "availability", label: "Disponibilidade", icon: Gauge, hasRealData: true },
  { id: "reservations", label: "Reservas", icon: Bookmark, hasRealData: false },
  { id: "compositions", label: "Composições", icon: Boxes, hasRealData: false },
  { id: "alerts", label: "Alertas", icon: AlertTriangle, hasRealData: true },
  { id: "history", label: "Histórico", icon: History, hasRealData: true },
  { id: "analytics", label: "Analytics", icon: BarChart3, hasRealData: true },
  { id: "settings", label: "Configurações", icon: Settings, hasRealData: false },
];

export const DEFAULT_INVENTORY_SECTION: InventorySectionId = "overview";

export function isInventorySectionId(value: string | null): value is InventorySectionId {
  return INVENTORY_SECTIONS.some((section) => section.id === value);
}
