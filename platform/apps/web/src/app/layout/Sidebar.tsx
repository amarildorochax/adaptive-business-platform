import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { NAV_ENTRIES, type NavCategory } from "@app/navigation/navEntries";
import { loadSidebarCollapsed, saveSidebarCollapsed } from "@core/layout/sidebarStorage";

export interface SidebarProps {
  readonly mobileOpen?: boolean;
  readonly onCloseMobile?: () => void;
}

/** Ordem fixa de exibição dos grupos — nunca a ordem de inserção em `NAV_ENTRIES` (`Array.prototype.sort` seria instável entre módulos da mesma categoria adicionados em Sprints diferentes). */
const CATEGORY_ORDER: readonly NavCategory[] = ["Comercial", "Operação", "Inteligência", "Plataforma"];

/**
 * Navegação principal entre módulos (UX-001, agrupamento por `category` desde a UX-002) — lê
 * exclusivamente `NAV_ENTRIES`, nunca duplica a lista de rotas. Recolher/expandir é uma preferência
 * puramente visual, persistida (`sidebarStorage.ts`), nunca afeta quais módulos existem. Em telas
 * estreitas (<1024px), vira um painel sobreposto controlado por `mobileOpen`/`onCloseMobile` (ver
 * `AppLayout.tsx`).
 *
 * Agrupar por `category` (Comercial/Operação/Inteligência/Plataforma), em vez de por
 * `status` (ativo/planejado) como antes da UX-002, reforça visualmente a fronteira de
 * responsabilidade de cada módulo ("Organização Modular") sem esconder o que ainda está planejado
 * — cada item planejado continua com seu próprio selo "Em breve" (`SidebarLink`), agora dentro do
 * grupo funcional a que pertence, nunca isolado num segundo bloco genérico.
 */
export function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(loadSidebarCollapsed);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      saveSidebarCollapsed(next);
      return next;
    });
  }

  const homeEntry = NAV_ENTRIES.find((entry) => entry.category === "Início");
  const groups = CATEGORY_ORDER.map((category) => ({ category, entries: NAV_ENTRIES.filter((entry) => entry.category === category) })).filter((group) => group.entries.length > 0);

  return (
    <nav className={["sidebar", collapsed ? "sidebar--collapsed" : "", mobileOpen ? "sidebar--mobile-open" : ""].filter(Boolean).join(" ")} aria-label="Navegação entre módulos">
      <div className="sidebar__brand">
        <span className="sidebar__brand-mark" aria-hidden="true">
          A
        </span>
        <span className="sidebar__brand-text">Adaptive</span>
      </div>

      <div className="sidebar__nav">
        {homeEntry && <SidebarLink entry={homeEntry} onClick={onCloseMobile} />}

        {groups.map((group) => (
          <div key={group.category} className="sidebar__group">
            <span className="sidebar__group-label">{group.category}</span>
            {group.entries.map((entry) => (
              <SidebarLink key={entry.path} entry={entry} onClick={onCloseMobile} />
            ))}
          </div>
        ))}
      </div>

      <div className="sidebar__footer">
        <button type="button" className="sidebar__collapse-btn" onClick={toggleCollapsed} aria-pressed={collapsed} aria-label={collapsed ? "Expandir menu" : "Recolher menu"}>
          {collapsed ? <ChevronsRight size={18} aria-hidden="true" /> : <ChevronsLeft size={18} aria-hidden="true" />}
          {!collapsed && <span>Recolher</span>}
        </button>
      </div>
    </nav>
  );
}

function SidebarLink({ entry, onClick }: { readonly entry: (typeof NAV_ENTRIES)[number]; readonly onClick?: () => void }) {
  const Icon = entry.icon;

  return (
    <NavLink to={entry.path} end={entry.path === "/"} onClick={onClick} className={({ isActive }) => (isActive ? "sidebar__link sidebar__link--active" : "sidebar__link")}>
      <span className="sidebar__link-icon">
        <Icon size={18} aria-hidden="true" />
      </span>
      <span className="sidebar__link-label">{entry.label}</span>
      {entry.status === "planned" && <span className="sidebar__badge">Em breve</span>}
    </NavLink>
  );
}
