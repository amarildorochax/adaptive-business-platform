import { BarChart3, Briefcase, CheckSquare, History, LayoutGrid, Lightbulb, Settings, Trello, Users } from "lucide-react";
import type { SectionEntry } from "@shared/components/ui/SectionSubNav";

export type CrmSectionId = "overview" | "pipeline" | "opportunities" | "customers" | "activities" | "timeline" | "insights" | "reports" | "settings";

export type CrmSectionEntry = SectionEntry<CrmSectionId>;

/**
 * Fonte única das nove seções do CRM Workspace (FUN-103) — `SectionSubNav` e `CRMPage` leem
 * exclusivamente daqui. `hasRealData` reflete o que o CRM Workspace (`core/crm/crmWorkspace.ts`)
 * realmente consegue mostrar: Pipeline/Oportunidades/Clientes/Timeline/Insights/Relatórios são reais
 * (Commands reais, acumulados localmente nesta sessão — `CRMManager` não expõe nenhuma Query de
 * listagem, ver relatório desta Sprint); Atividades não tem nenhum método de `CRMManager` que a
 * suporte; Configurações só tem uma preferência genuinamente real (tema claro/escuro).
 */
export const CRM_SECTIONS: readonly CrmSectionEntry[] = [
  { id: "overview", label: "Visão Geral", icon: LayoutGrid, hasRealData: true },
  { id: "pipeline", label: "Pipeline", icon: Trello, hasRealData: true },
  { id: "opportunities", label: "Oportunidades", icon: Briefcase, hasRealData: true },
  { id: "customers", label: "Clientes", icon: Users, hasRealData: true },
  { id: "activities", label: "Atividades", icon: CheckSquare, hasRealData: false },
  { id: "timeline", label: "Timeline", icon: History, hasRealData: true },
  { id: "insights", label: "Insights", icon: Lightbulb, hasRealData: true },
  { id: "reports", label: "Relatórios", icon: BarChart3, hasRealData: true },
  { id: "settings", label: "Configurações", icon: Settings, hasRealData: false },
];

export const DEFAULT_CRM_SECTION: CrmSectionId = "overview";

export function isCrmSectionId(value: string | null): value is CrmSectionId {
  return CRM_SECTIONS.some((section) => section.id === value);
}
