import { Award, BookOpen, Component, Download, Image, LayoutGrid, Palette, SlidersHorizontal, Type } from "lucide-react";
import type { SectionEntry } from "@shared/components/ui/SectionSubNav";

export type BrandingSectionId = "overview" | "logo" | "palette" | "typography" | "tokens" | "theme" | "components" | "manual" | "export";

export type BrandingSectionEntry = SectionEntry<BrandingSectionId>;

/**
 * Fonte única das nove seções do Brand Center (FUN-102) — `SectionSubNav` e `BrandingPage` leem
 * exclusivamente daqui, nunca duplicam a lista. `hasRealData` reflete o que `BrandingManager`
 * realmente expõe (ver auditoria no relatório desta Sprint): Logo e Paleta têm mutação real
 * (`submitLogo`/`updatePalette`), Tema tem leitura + regeneração real (`currentTheme`/
 * `regenerateTheme`), Tokens depende do cache de sessão (nenhum endpoint de listagem independente
 * existe) — Tipografia, Componentes, Manual e Exportação não têm nenhum endpoint próprio.
 */
export const BRANDING_SECTIONS: readonly BrandingSectionEntry[] = [
  { id: "overview", label: "Visão Geral", icon: LayoutGrid, hasRealData: true },
  { id: "logo", label: "Logo", icon: Image, hasRealData: true },
  { id: "palette", label: "Paleta", icon: Palette, hasRealData: true },
  { id: "typography", label: "Tipografia", icon: Type, hasRealData: true },
  { id: "tokens", label: "Tokens", icon: SlidersHorizontal, hasRealData: true },
  { id: "theme", label: "Tema", icon: Award, hasRealData: true },
  { id: "components", label: "Componentes", icon: Component, hasRealData: false },
  { id: "manual", label: "Manual", icon: BookOpen, hasRealData: false },
  { id: "export", label: "Exportação", icon: Download, hasRealData: false },
];

export const DEFAULT_BRANDING_SECTION: BrandingSectionId = "overview";

export function isBrandingSectionId(value: string | null): value is BrandingSectionId {
  return BRANDING_SECTIONS.some((section) => section.id === value);
}
