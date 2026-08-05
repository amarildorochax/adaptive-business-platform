import { BarChart3, ClipboardList, History, LayoutGrid, PackageCheck, Recycle, Settings, ShoppingCart } from "lucide-react";
import type { SectionEntry } from "@shared/components/ui/SectionSubNav";

export type PurchaseSectionId = "overview" | "requisitions" | "orders" | "receivings" | "reorder" | "history" | "analytics" | "settings";

export type PurchaseSectionEntry = SectionEntry<PurchaseSectionId>;

/**
 * Fonte única das oito seções do Purchase Workspace (IMP-305) — `SectionSubNav` e `PurchasePage`
 * leem exclusivamente daqui, mesmo padrão de `supplierSections.ts` (IMP-205). `hasRealData` reflete
 * o que `core/purchase/` (IMP-304) realmente expõe: Visão Geral/Requisições/Pedidos/Recebimentos/
 * Reposição/Analytics consomem endpoints reais (`GET`/`POST` já aprovados em IMP-303); Reposição em
 * particular só tem Mutations reais (`createReorderRule`/`evaluateReorderRule`/`deactivateReorderRule`)
 * — nenhuma Query de listagem existe para `ReorderRule`, mesma disciplina honesta já aplicada a
 * Contratos/Catálogo do Supplier Workspace (IMP-205); Histórico é a única seção genuinamente "Prévia"
 * — nenhum Evento de domínio é exposto por nenhum endpoint HTTP (`purchaseHistoryLog.ts`); Configurações
 * só tem uma preferência genuinamente real (tema claro/escuro).
 */
export const PURCHASE_SECTIONS: readonly PurchaseSectionEntry[] = [
  { id: "overview", label: "Visão Geral", icon: LayoutGrid, hasRealData: true },
  { id: "requisitions", label: "Requisições", icon: ClipboardList, hasRealData: true },
  { id: "orders", label: "Pedidos", icon: ShoppingCart, hasRealData: true },
  { id: "receivings", label: "Recebimentos", icon: PackageCheck, hasRealData: true },
  { id: "reorder", label: "Reposição", icon: Recycle, hasRealData: true },
  { id: "history", label: "Histórico", icon: History, hasRealData: false },
  { id: "analytics", label: "Analytics", icon: BarChart3, hasRealData: true },
  { id: "settings", label: "Configurações", icon: Settings, hasRealData: false },
];

export const DEFAULT_PURCHASE_SECTION: PurchaseSectionId = "overview";

export function isPurchaseSectionId(value: string | null): value is PurchaseSectionId {
  return PURCHASE_SECTIONS.some((section) => section.id === value);
}
