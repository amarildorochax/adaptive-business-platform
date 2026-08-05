import { Link, useLocation } from "react-router-dom";
import { findNavEntry } from "@app/navigation/navEntries";

/**
 * Trilha de navegação derivada de `NAV_ENTRIES` pela rota atual — nunca uma segunda fonte de
 * rótulo de módulo. Desde a UX-002, o segmento raiz é um link real de volta ao Dashboard (antes,
 * texto estático) — "Navegação... Links rápidos", ganho de um clique a menos para qualquer usuário
 * dentro de um módulo profundo (ex.: `/suppliers?section=contracts`) que precise voltar à Visão
 * Geral sem usar a Sidebar.
 */
export function Breadcrumb() {
  const location = useLocation();
  const entry = findNavEntry(location.pathname);
  const isHome = !entry || entry.path === "/";

  return (
    <nav aria-label="Breadcrumb" className="breadcrumb">
      {isHome ? <span>Adaptive Business Platform</span> : <Link to="/">Adaptive Business Platform</Link>}
      {!isHome && (
        <>
          <span aria-hidden="true"> / </span>
          <span>{entry.label}</span>
        </>
      )}
    </nav>
  );
}
