import { Building2, Compass, LayoutGrid, LineChart, Package, Settings, Sparkles, Target, Users } from "lucide-react";
import type { SectionEntry } from "@shared/components/ui/SectionSubNav";

export type ProfileSectionId = "overview" | "company" | "market" | "customers" | "products" | "positioning" | "goals" | "strategy" | "settings";

export type ProfileSectionEntry = SectionEntry<ProfileSectionId>;

/**
 * Fonte única das nove seções do Perfil Empresarial (FUN-101) — `SectionSubNav` e
 * `BusinessProfilePage` leem exclusivamente daqui, nunca duplicam a lista.
 */
export const PROFILE_SECTIONS: readonly ProfileSectionEntry[] = [
  { id: "overview", label: "Visão Geral", icon: LayoutGrid, hasRealData: true },
  { id: "company", label: "Empresa", icon: Building2, hasRealData: false },
  { id: "market", label: "Mercado", icon: Compass, hasRealData: true },
  { id: "customers", label: "Clientes", icon: Users, hasRealData: false },
  { id: "products", label: "Produtos", icon: Package, hasRealData: false },
  { id: "positioning", label: "Posicionamento", icon: Sparkles, hasRealData: false },
  { id: "goals", label: "Objetivos", icon: Target, hasRealData: false },
  { id: "strategy", label: "Estratégia", icon: LineChart, hasRealData: false },
  { id: "settings", label: "Configurações", icon: Settings, hasRealData: false },
];

export const DEFAULT_PROFILE_SECTION: ProfileSectionId = "overview";

export function isProfileSectionId(value: string | null): value is ProfileSectionId {
  return PROFILE_SECTIONS.some((section) => section.id === value);
}
