import { BarChart3, ClipboardList, Cog, History, Layers, LayoutGrid, PlayCircle, Settings } from "lucide-react";
import type { SectionEntry } from "@shared/components/ui/SectionSubNav";

export type ProductionSectionId = "overview" | "orders" | "in-progress" | "work-centers" | "bom" | "history" | "analytics" | "settings";

export type ProductionSectionEntry = SectionEntry<ProductionSectionId>;

/**
 * Fonte única das oito seções do Production Workspace (IMP-505) — `SectionSubNav` e `ProductionPage`
 * leem exclusivamente daqui, mesmo padrão de `inventoryMovementSections.ts`/`purchaseSections.ts`/
 * `supplierSections.ts`. `hasRealData` reflete o que `core/production/` (IMP-504) realmente expõe:
 * Visão Geral/Ordens de Produção/Ordens em Execução/Centros de Trabalho/Estruturas consomem endpoints
 * reais já aprovados (IMP-503); Histórico é "Prévia" pela mesma razão honesta de todo Workspace desta
 * série — nenhum `ProductionEvent` atravessa HTTP; Analytics também é "Prévia" — `ProductionManager`
 * não expõe nenhuma Query tenant-wide (nem para `ProductionOrder`, nem para `BillOfMaterials` — apenas
 * `listActiveWorkCenters()` é próxima de tenant-wide, e mesmo essa sem `tenantId` no próprio endpoint,
 * ver `IMP_503_PRODUCTION_HTTP_API_REPORT.md`), mesma divergência já documentada por
 * `IMP_405_INVENTORY_MOVEMENT_WORKSPACE_REPORT.md` para o Inventory Movement Workspace. Configurações
 * só tem uma preferência genuinamente real (tema claro/escuro).
 */
export const PRODUCTION_SECTIONS: readonly ProductionSectionEntry[] = [
  { id: "overview", label: "Visão Geral", icon: LayoutGrid, hasRealData: true },
  { id: "orders", label: "Ordens de Produção", icon: ClipboardList, hasRealData: true },
  { id: "in-progress", label: "Ordens em Execução", icon: PlayCircle, hasRealData: true },
  { id: "work-centers", label: "Centros de Trabalho", icon: Cog, hasRealData: true },
  { id: "bom", label: "Estruturas (BOM)", icon: Layers, hasRealData: true },
  { id: "history", label: "Histórico", icon: History, hasRealData: false },
  { id: "analytics", label: "Analytics", icon: BarChart3, hasRealData: false },
  { id: "settings", label: "Configurações", icon: Settings, hasRealData: false },
];

export const DEFAULT_PRODUCTION_SECTION: ProductionSectionId = "overview";

export function isProductionSectionId(value: string | null): value is ProductionSectionId {
  return PRODUCTION_SECTIONS.some((section) => section.id === value);
}
