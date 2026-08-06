import { BarChart3, Calculator, CalendarClock, History, Landmark, LayoutGrid, Receipt, Settings } from "lucide-react";
import type { SectionEntry } from "@shared/components/ui/SectionSubNav";

export type FiscalSectionId = "overview" | "tax-regime" | "tax-calculation" | "fiscal-documents" | "fiscal-obligations" | "history" | "analytics" | "settings";

export type FiscalSectionEntry = SectionEntry<FiscalSectionId>;

/**
 * Fonte única das oito seções do Fiscal Workspace (IMP-605) — `SectionSubNav` e `FiscalPage` leem
 * exclusivamente daqui, mesmo padrão de `productionSections.ts`/`inventoryMovementSections.ts`/
 * `purchaseSections.ts`/`supplierSections.ts`. `hasRealData` reflete o que `core/fiscal/` (IMP-604)
 * realmente expõe: Visão Geral/Regime & Regras/Cálculo de Imposto/Documentos Fiscais/Obrigações
 * Acessórias consomem endpoints reais já aprovados (IMP-603); Histórico é "Prévia" pela mesma razão
 * honesta de todo Workspace desta série — nenhum `FiscalEvent` atravessa HTTP; Analytics também é
 * "Prévia" — `FiscalManager` não expõe nenhuma Query tenant-wide de listagem completa (apenas
 * `getTaxRegime(tenantId)`, singular, e as duas listas de Fiscal Obligation, sem filtro de Tenant no
 * próprio endpoint — mesma divergência já documentada por `IMP_505_PRODUCTION_WORKSPACE_REPORT.md`
 * para o Production Workspace). Configurações só tem uma preferência genuinamente real (tema
 * claro/escuro).
 */
export const FISCAL_SECTIONS: readonly FiscalSectionEntry[] = [
  { id: "overview", label: "Visão Geral", icon: LayoutGrid, hasRealData: true },
  { id: "tax-regime", label: "Regime & Regras Fiscais", icon: Landmark, hasRealData: true },
  { id: "tax-calculation", label: "Cálculo de Imposto", icon: Calculator, hasRealData: true },
  { id: "fiscal-documents", label: "Documentos Fiscais", icon: Receipt, hasRealData: true },
  { id: "fiscal-obligations", label: "Obrigações Acessórias", icon: CalendarClock, hasRealData: true },
  { id: "history", label: "Histórico", icon: History, hasRealData: false },
  { id: "analytics", label: "Analytics", icon: BarChart3, hasRealData: false },
  { id: "settings", label: "Configurações", icon: Settings, hasRealData: false },
];

export const DEFAULT_FISCAL_SECTION: FiscalSectionId = "overview";

export function isFiscalSectionId(value: string | null): value is FiscalSectionId {
  return FISCAL_SECTIONS.some((section) => section.id === value);
}
