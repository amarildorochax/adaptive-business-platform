import { AlertTriangle, ArrowRightLeft, BarChart3, Bookmark, Gauge, History, LayoutGrid, MapPin, Settings } from "lucide-react";
import type { SectionEntry } from "@shared/components/ui/SectionSubNav";

export type InventoryMovementSectionId = "overview" | "movements" | "positions" | "reservations" | "locations" | "alerts" | "history" | "analytics" | "settings";

export type InventoryMovementSectionEntry = SectionEntry<InventoryMovementSectionId>;

/**
 * Fonte única das nove seções do Inventory Movement Workspace (IMP-405) — `SectionSubNav` e
 * `InventoryMovementPage` leem exclusivamente daqui, mesmo padrão de `purchaseSections.ts`/
 * `supplierSections.ts`. `hasRealData` reflete o que `core/inventory-movement/` (IMP-404) realmente
 * expõe: Visão Geral/Movimentações/Posições/Reservas/Localizações/Alertas consomem endpoints reais
 * já aprovados (IMP-403); Histórico é "Prévia" pela mesma razão honesta de todo Workspace desta série
 * — nenhum Evento de domínio atravessa HTTP (handlers extraem apenas `result`); **Analytics também é
 * "Prévia" aqui, divergindo do precedente do Purchase Workspace** — `InventoryMovementManager` não
 * expõe nenhuma Query tenant-wide (nem para Movement, nem para Reservation — apenas
 * `listActiveStockLocations(tenantId)` é genuinamente tenant-wide), então Analytics deriva
 * exclusivamente do log de sessão, nunca de uma consulta real ao histórico completo da Empresa —
 * documentado em `IMP_405_INVENTORY_MOVEMENT_WORKSPACE_REPORT.md`, "Limitações". Configurações só
 * tem uma preferência genuinamente real (tema claro/escuro).
 */
export const INVENTORY_MOVEMENT_SECTIONS: readonly InventoryMovementSectionEntry[] = [
  { id: "overview", label: "Visão Geral", icon: LayoutGrid, hasRealData: true },
  { id: "movements", label: "Movimentações", icon: ArrowRightLeft, hasRealData: true },
  { id: "positions", label: "Posições", icon: Gauge, hasRealData: true },
  { id: "reservations", label: "Reservas", icon: Bookmark, hasRealData: true },
  { id: "locations", label: "Localizações", icon: MapPin, hasRealData: true },
  { id: "alerts", label: "Alertas", icon: AlertTriangle, hasRealData: true },
  { id: "history", label: "Histórico", icon: History, hasRealData: false },
  { id: "analytics", label: "Analytics", icon: BarChart3, hasRealData: false },
  { id: "settings", label: "Configurações", icon: Settings, hasRealData: false },
];

export const DEFAULT_INVENTORY_MOVEMENT_SECTION: InventoryMovementSectionId = "overview";

export function isInventoryMovementSectionId(value: string | null): value is InventoryMovementSectionId {
  return INVENTORY_MOVEMENT_SECTIONS.some((section) => section.id === value);
}
