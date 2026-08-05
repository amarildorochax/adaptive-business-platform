import { Award, Calendar, Layers, Palette } from "lucide-react";
import { AsyncState } from "@shared/components/AsyncState";
import { StatCard } from "@shared/components/StatCard";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Badge } from "@shared/components/ui/Badge";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { useBrandIdentity } from "@core/query/useBrandIdentity";
import { useBusinessContext } from "@core/query/useBusinessContext";
import type { DesignTokenResponseDto } from "@core/http/dtos/branding.dto";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

/**
 * Visão Geral (FUN-102) — quase inteiramente real: Tema ativo/Última atualização via `useBrandIdentity`
 * (`BrandingManager.currentTheme`, já existente desde a FUN-001/005), Quantidade de cores/tokens
 * derivada dos próprios `brandTokens` já carregados no bootstrap da sessão (nenhuma nova chamada de
 * rede), e o Contexto de Negócio via `useBusinessContext` (`BrandingManager.businessContext`, o único
 * dos sete métodos que nenhuma outra tela desta Sprint ainda consumia — integração unidirecional
 * Business Profile → Branding, Capítulo 12 de `BRANDING_HUB.md`). "Nome da marca", pedido pela
 * Sprint, não existe em nenhum campo de `Logo`/`BrandTheme`/`DesignToken` (o Branding Hub nunca
 * modelou um nome textual de marca, apenas ativos/tokens/tema) — a única exceção real desta seção,
 * marcada com `NotConnectedNotice`.
 */
export function OverviewSection({ profileId, tenantId, brandTokens }: { readonly profileId: string; readonly tenantId: string; readonly brandTokens: readonly DesignTokenResponseDto[] }) {
  const identity = useBrandIdentity(tenantId);
  const context = useBusinessContext(profileId);

  const colorTokens = brandTokens.filter((token) => token.category === "Cor");
  const hasIdentity = Boolean(identity.data?.theme);

  return (
    <AsyncState isLoading={identity.isLoading} isError={identity.isError} error={identity.error} onRetry={() => void identity.refetch()}>
      <div className="dashboard-section">
        <NotConnectedNotice fields={["Nome da marca"]} context="Branding Hub" />

        <div className="dashboard-kpis">
          <StatCard icon={<Award size={16} aria-hidden="true" />} label="Tema ativo" value={identity.data?.theme ? `Versão ${identity.data.theme.version}` : "—"} />
          <StatCard icon={<Palette size={16} aria-hidden="true" />} label="Cores geradas" value={String(colorTokens.length)} />
          <StatCard icon={<Layers size={16} aria-hidden="true" />} label="Tokens no total" value={String(brandTokens.length)} />
          <StatCard icon={<Calendar size={16} aria-hidden="true" />} label="Última atualização" value={identity.data?.theme ? formatDate(identity.data.theme.generatedAt) : "—"} />
        </div>

        <div className="dashboard-grid dashboard-grid--wide">
          <WidgetCard title="Status">
            <p>
              Identidade de marca: <Badge tone={hasIdentity ? "success" : "neutral"}>{hasIdentity ? "Gerada" : "Ainda não gerada"}</Badge>
            </p>
            <p>
              Logo: <Badge tone={identity.data?.logo ? "success" : "neutral"}>{identity.data?.logo ? "Enviado" : "Nenhum logo enviado"}</Badge>
            </p>
          </WidgetCard>

          <WidgetCard title="Resumo visual">
            {colorTokens.length === 0 ? (
              <p>Nenhuma cor gerada ainda.</p>
            ) : (
              <div className="palette-swatch-row">
                {colorTokens.map((token) => (
                  <span key={token.tokenId} className="palette-swatch" style={{ background: token.value }} title={`${token.name}: ${token.value}`} />
                ))}
              </div>
            )}
          </WidgetCard>

          <WidgetCard title="Contexto de negócio">
            <p>
              Segmento: <strong>{context.data?.segment ?? "—"}</strong>
              {context.data?.subsegment ? ` (${context.data.subsegment})` : ""}
            </p>
            <p>
              Maturidade: <strong>{context.data?.maturity ?? "—"}</strong>
            </p>
          </WidgetCard>
        </div>
      </div>
    </AsyncState>
  );
}
