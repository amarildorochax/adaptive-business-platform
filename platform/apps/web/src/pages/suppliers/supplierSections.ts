import { BarChart3, Building2, Contact, FileSignature, History, LayoutGrid, Package, Settings } from "lucide-react";
import type { SectionEntry } from "@shared/components/ui/SectionSubNav";

export type SupplierSectionId = "overview" | "suppliers" | "contacts" | "contracts" | "catalog" | "history" | "analytics" | "settings";

export type SupplierSectionEntry = SectionEntry<SupplierSectionId>;

/**
 * Fonte única das oito seções do Supplier Workspace (IMP-205) — `SectionSubNav` e `SupplierPage`
 * leem exclusivamente daqui, mesmo padrão já estabelecido por CRM (FUN-103)/Product Hub (FUN-104)/
 * Inventory (FUN-105)/Purchase (FUN-106). `hasRealData` reflete o que `core/supplier/` (IMP-204)
 * realmente expõe: Visão Geral/Fornecedores/Contatos/Analytics consomem `GET /suppliers/by-tenant/:tenantId`
 * (lista real, com `contacts` embutido); Contratos/Catálogo criam dado real via `POST` já aprovado
 * (IMP-203), mas nenhum `GET` de listagem existe para nenhum dos dois — a seção mostra o que acabou
 * de ser criado nesta sessão, nunca inventa um histórico; Histórico é a única seção genuinamente
 * "Prévia" — nenhum Evento de domínio é exposto por nenhum endpoint HTTP (ver
 * `IMP_205_SUPPLIER_WORKSPACE_REPORT.md`, "Limitações"), o log mostrado é reconstruído no navegador
 * a partir do resultado real de cada Mutation desta sessão, nunca sincronizado com o servidor;
 * Configurações só tem uma preferência genuinamente real (tema claro/escuro), mesma disciplina já
 * usada por toda Sprint anterior.
 */
export const SUPPLIER_SECTIONS: readonly SupplierSectionEntry[] = [
  { id: "overview", label: "Visão Geral", icon: LayoutGrid, hasRealData: true },
  { id: "suppliers", label: "Fornecedores", icon: Building2, hasRealData: true },
  { id: "contacts", label: "Contatos", icon: Contact, hasRealData: true },
  { id: "contracts", label: "Contratos", icon: FileSignature, hasRealData: true },
  { id: "catalog", label: "Catálogo", icon: Package, hasRealData: true },
  { id: "history", label: "Histórico", icon: History, hasRealData: false },
  { id: "analytics", label: "Analytics", icon: BarChart3, hasRealData: true },
  { id: "settings", label: "Configurações", icon: Settings, hasRealData: false },
];

export const DEFAULT_SUPPLIER_SECTION: SupplierSectionId = "overview";

export function isSupplierSectionId(value: string | null): value is SupplierSectionId {
  return SUPPLIER_SECTIONS.some((section) => section.id === value);
}
