import { Bell, LogOut, Menu, Moon, Search, Sun, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NAV_ENTRIES } from "@app/navigation/navEntries";
import { useAuth } from "@core/auth/useAuth";
import { useTheme } from "@core/theme/useTheme";
import { useDashboardBootstrap } from "@core/query/useDashboardBootstrap";
import { DropdownMenu } from "@shared/components/ui/DropdownMenu";

export interface TopbarProps {
  readonly onToggleMobileMenu?: () => void;
}

/**
 * Cabeçalho fixo da aplicação (UX-001) — Pesquisa Global, Painel de Notificações, Ações Rápidas,
 * alternância de tema e Perfil, todos sobre dado real já existente, nenhum inventado:
 *
 * - **Pesquisa Global** busca exclusivamente `NAV_ENTRIES` (navegar para um módulo) — nenhum Manager
 *   expõe busca textual sobre dado de negócio ainda, então uma busca "global" sobre dados seria
 *   fabricada; buscar destinos de navegação é o padrão real e honesto equivalente ao Cmd+K de
 *   referências como Linear/GitHub (conceito de UX, nunca a implementação/visual copiados).
 * - **Notificações** reaproveita `useDashboardBootstrap()` (mesmo cache do TanStack Query já usado
 *   pelo Dashboard — nenhuma nova requisição) e apresenta a Mensagem/Execução/Lead mais recentes já
 *   carregados como "atividade recente", nunca uma Entidade "Notification" inventada (nenhuma existe
 *   em nenhum Manager).
 * - **Ações Rápidas** apenas navega para módulos já ativos — nenhuma ação de negócio nova.
 *
 * Nenhuma identidade visual do Branding Hub é aplicada aqui — per a instrução da FUN-005, o Branding
 * é consumido como dado, exibido de forma completa em `/branding`, não duplicado aqui.
 */
export function Topbar({ onToggleMobileMenu }: TopbarProps) {
  const auth = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const bootstrap = useDashboardBootstrap();
  const [query, setQuery] = useState("");

  const searchResults = useMemo(() => {
    if (query.trim() === "") {
      return [];
    }
    const needle = query.trim().toLowerCase();
    return NAV_ENTRIES.filter((entry) => entry.label.toLowerCase().includes(needle)).slice(0, 6);
  }, [query]);

  const quickActionEntries = NAV_ENTRIES.filter((entry) => entry.status === "active" && entry.path !== "/");

  const initials = (auth.identity ?? "?").slice(0, 2).toUpperCase();

  return (
    <header className="topbar">
      <button type="button" className="topbar__icon-btn topbar__menu-btn" onClick={onToggleMobileMenu} aria-label="Abrir menu de navegação">
        <Menu size={18} aria-hidden="true" />
      </button>

      <div className="topbar__search">
        <Search size={16} className="topbar__search-icon" aria-hidden="true" />
        <input
          type="search"
          className="topbar__search-input"
          placeholder="Buscar um módulo…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          role="combobox"
          aria-expanded={searchResults.length > 0}
          aria-controls="topbar-search-results"
          aria-label="Pesquisa global"
        />
        {searchResults.length > 0 && (
          <div id="topbar-search-results" className="topbar__search-results" role="listbox">
            {searchResults.map((entry) => (
              <button
                key={entry.path}
                type="button"
                className="dropdown__item"
                role="option"
                aria-selected={false}
                onClick={() => {
                  navigate(entry.path);
                  setQuery("");
                }}
              >
                <entry.icon size={16} aria-hidden="true" />
                {entry.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="topbar__spacer" />

      <div className="topbar__actions">
        <DropdownMenu
          panelLabel="Ações rápidas"
          trigger={(props) => (
            <button type="button" className="topbar__icon-btn" aria-label="Ações rápidas" {...props}>
              <Zap size={18} aria-hidden="true" />
            </button>
          )}
        >
          <span className="dropdown__section-title">Ir para</span>
          {quickActionEntries.map((entry) => (
            <button key={entry.path} type="button" className="dropdown__item" onClick={() => navigate(entry.path)}>
              <entry.icon size={16} aria-hidden="true" />
              {entry.label}
            </button>
          ))}
        </DropdownMenu>

        <DropdownMenu
          panelLabel="Notificações"
          trigger={(props) => (
            <button type="button" className="topbar__icon-btn" aria-label="Notificações" {...props}>
              <Bell size={18} aria-hidden="true" />
              {bootstrap.data && <span className="topbar__icon-btn-dot" aria-hidden="true" />}
            </button>
          )}
        >
          <span className="dropdown__section-title">Atividade recente</span>
          {bootstrap.data ? (
            <>
              <div className="dropdown__item" role="none">
                Nova mensagem: {bootstrap.data.message.content}
              </div>
              <div className="dropdown__item" role="none">
                Execução concluída: {bootstrap.data.execution.status}
              </div>
              <div className="dropdown__item" role="none">
                Novo Lead: {bootstrap.data.lead.name}
              </div>
            </>
          ) : (
            <span className="dropdown__empty">Nenhuma atividade ainda.</span>
          )}
        </DropdownMenu>

        <button type="button" className="topbar__icon-btn" onClick={toggleTheme} aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}>
          {theme === "dark" ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
        </button>

        <DropdownMenu
          panelLabel="Perfil"
          trigger={(props) => (
            <button type="button" className="topbar__profile-trigger" aria-label="Menu de perfil" {...props}>
              <span className="topbar__avatar" aria-hidden="true">
                {initials}
              </span>
              <span className="topbar__profile-meta">
                <span className="topbar__profile-name">{auth.identity}</span>
                <span className="topbar__profile-tenant">{auth.tenantId}</span>
              </span>
            </button>
          )}
        >
          <div className="dropdown__item" role="none">
            <div>
              <div>{auth.identity}</div>
              <div className="topbar__profile-tenant">{auth.roles.length > 0 ? auth.roles.join(", ") : "Sem Papel atribuído"}</div>
            </div>
          </div>
          <button type="button" className="dropdown__item" onClick={() => void auth.logout()}>
            <LogOut size={16} aria-hidden="true" />
            Sair
          </button>
        </DropdownMenu>
      </div>
    </header>
  );
}
