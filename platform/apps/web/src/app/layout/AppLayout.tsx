import { Suspense, useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Breadcrumb } from "./Breadcrumb";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

/**
 * Casca visual da aplicação (UX-001) — Sidebar fixa de altura total à esquerda, Topbar apenas sobre
 * a área de conteúdo (padrão moderno de SaaS — conceito de UX estudado em referências como Linear/
 * Vercel, nunca sua identidade visual copiada, ver `docs/design/UX_001_ADAPTIVE_DESIGN_SYSTEM.md`).
 * O único `<Suspense>` da aplicação vive aqui — cada página é carregada via `React.lazy`
 * (`ApplicationRouter.tsx`), nunca um `<Suspense>` duplicado por página.
 *
 * `mobileOpen` é o único estado desta Sprint que precisa ser compartilhado entre `Sidebar` (visual)
 * e `Topbar` (botão de gatilho) — abaixo de 1024px a Sidebar vira um painel sobreposto.
 */
export function AppLayout({ children }: { readonly children?: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-layout">
      {mobileOpen && <div className="app-layout__mobile-backdrop" onClick={() => setMobileOpen(false)} />}
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="app-layout__content">
        <Topbar onToggleMobileMenu={() => setMobileOpen((current) => !current)} />
        <Breadcrumb />
        <div className="app-layout__page">
          <Suspense fallback={<div role="status">Carregando módulo…</div>}>{children ?? <Outlet />}</Suspense>
        </div>
      </div>
    </div>
  );
}
