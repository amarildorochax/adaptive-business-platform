import type { LucideIcon } from "lucide-react";

export interface SectionEntry<TId extends string = string> {
  readonly id: TId;
  readonly label: string;
  readonly icon: LucideIcon;
  /** `true` quando a seção tem ao menos um campo real, consumido de um endpoint já existente — nunca inventado. */
  readonly hasRealData: boolean;
}

export interface SectionSubNavProps<TId extends string> {
  readonly label: string;
  readonly sections: readonly SectionEntry<TId>[];
  readonly activeId: TId;
  readonly onSelect: (id: TId) => void;
}

/**
 * Barra lateral contextual genérica (primeiro uso: Perfil Empresarial, FUN-101; reutilizada por
 * Branding, FUN-102) — navegação vertical entre as seções de um módulo, distinta da Sidebar global
 * da aplicação (UX-001). Padrão de "settings sidebar" comum a SaaS premium estudados (GitHub/Stripe/
 * Figma — conceito de UX, nunca visual/componente copiado), preferido a abas horizontais simples por
 * escalar melhor a muitas seções sem quebra de linha. Genérico por módulo — nunca um componente
 * exclusivo de um único módulo, per a regra explícita da FUN-102.
 */
export function SectionSubNav<TId extends string>({ label, sections, activeId, onSelect }: SectionSubNavProps<TId>) {
  return (
    <nav className="section-subnav" aria-label={label}>
      <ul>
        {sections.map((section) => (
          <li key={section.id}>
            <button
              type="button"
              className={section.id === activeId ? "section-subnav__link section-subnav__link--active" : "section-subnav__link"}
              aria-current={section.id === activeId ? "page" : undefined}
              onClick={() => onSelect(section.id)}
            >
              <section.icon size={16} aria-hidden="true" />
              <span>{section.label}</span>
              {!section.hasRealData && (
                <span className="badge badge--neutral" aria-label="Prévia — ainda não conectado à API">
                  Prévia
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
