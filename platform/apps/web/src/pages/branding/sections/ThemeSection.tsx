import { Moon, RefreshCw, Sun } from "lucide-react";
import { useState } from "react";
import { AsyncState } from "@shared/components/AsyncState";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Button } from "@shared/components/ui/Button";
import { Field } from "@shared/components/ui/Field";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { useToast } from "@shared/components/ui/toast/useToast";
import { useBrandIdentity } from "@core/query/useBrandIdentity";
import { useRegenerateTheme } from "@core/query/useRegenerateTheme";
import { useTheme } from "@core/theme/useTheme";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/**
 * Tema (FUN-102) — versão/data de geração são reais via `useBrandIdentity` (`currentTheme`);
 * "Regenerar Tema" é o Command "UpdateTheme" real (`useRegenerateTheme`, ADR-012: regeneração
 * completa, nunca incremental — um novo `themeId`/versão e todos os Tokens recriados). O par
 * Dark/Light pedido pela Sprint já existe de verdade na aplicação (`core/theme/`, alternável aqui com
 * o mesmo `useTheme()` já usado por Configurações do Perfil Empresarial, FUN-101) — mas é uma
 * preferência de UI do navegador, não algo que `BrandTheme` armazene por Tenant; "Contraste" nunca
 * existiu como um terceiro modo (`ThemeName` é um union fechado de dois literais, `core/theme/
 * themeStorage.ts`).
 */
export function ThemeSection({ tenantId }: { readonly tenantId: string }) {
  const identity = useBrandIdentity(tenantId);
  const regenerateTheme = useRegenerateTheme(tenantId);
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const [titleFont, setTitleFont] = useState("Poppins");
  const [bodyFont, setBodyFont] = useState("Inter");
  const [primaryColorHex, setPrimaryColorHex] = useState("#2E7D32");
  const [backgroundHex, setBackgroundHex] = useState("#FFFFFF");

  function handleRegenerate() {
    regenerateTheme.mutate(
      { tenantId, primaryColorHex, backgroundHex, titleFont, bodyFont },
      {
        onSuccess: () => showToast("success", "Tema regenerado."),
        onError: () => showToast("danger", "Não foi possível regenerar o Tema."),
      },
    );
  }

  return (
    <div className="dashboard-section">
      <AsyncState isLoading={identity.isLoading} isError={identity.isError} error={identity.error} onRetry={() => void identity.refetch()}>
        <WidgetCard title="Tema vigente">
          {identity.data?.theme ? (
            <dl>
              <dt>Versão</dt>
              <dd>{identity.data.theme.version}</dd>
              <dt>Gerado em</dt>
              <dd>{formatDate(identity.data.theme.generatedAt)}</dd>
            </dl>
          ) : (
            <p>Nenhum Tema gerado ainda.</p>
          )}
        </WidgetCard>
      </AsyncState>

      <WidgetCard title="Regenerar Tema (regeneração completa — novos Tokens)">
        <div className="form-grid">
          <Field label="Cor de destaque (hex)" value={primaryColorHex} onChange={(event) => setPrimaryColorHex(event.target.value)} placeholder="#2E7D32" />
          <Field label="Cor de fundo (hex)" value={backgroundHex} onChange={(event) => setBackgroundHex(event.target.value)} placeholder="#FFFFFF" />
          <Field label="Fonte de título" value={titleFont} onChange={(event) => setTitleFont(event.target.value)} />
          <Field label="Fonte de corpo" value={bodyFont} onChange={(event) => setBodyFont(event.target.value)} />
        </div>
        <Button type="button" variant="primary" leadingIcon={<RefreshCw size={16} aria-hidden="true" />} onClick={handleRegenerate} disabled={regenerateTheme.isPending}>
          {regenerateTheme.isPending ? "Regenerando…" : "Regenerar Tema"}
        </Button>
      </WidgetCard>

      <WidgetCard title="Dark / Light">
        <p>Tema atual da aplicação: {theme === "dark" ? "Escuro" : "Claro"}</p>
        <Button type="button" variant="secondary" leadingIcon={theme === "dark" ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />} onClick={toggleTheme}>
          Alternar para tema {theme === "dark" ? "claro" : "escuro"}
        </Button>
        <div className="theme-preview-row">
          <div className="theme-preview-card theme-preview-card--dark">
            <span>Escuro</span>
          </div>
          <div className="theme-preview-card theme-preview-card--light">
            <span>Claro</span>
          </div>
        </div>
      </WidgetCard>

      <NotConnectedNotice fields={["Modo de Contraste"]} context="Branding Hub" />
    </div>
  );
}
