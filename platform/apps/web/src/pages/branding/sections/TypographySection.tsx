import { WidgetCard } from "@shared/components/WidgetCard";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import type { DesignTokenResponseDto } from "@core/http/dtos/branding.dto";

const SCALE_STEPS = [
  { id: "h1", label: "H1", fontSize: "var(--font-size-h1)", fontWeight: "var(--font-weight-h1)" },
  { id: "h2", label: "H2", fontSize: "var(--font-size-h2)", fontWeight: "var(--font-weight-h2)" },
  { id: "h3", label: "H3", fontSize: "var(--font-size-h3)", fontWeight: "var(--font-weight-h3)" },
  { id: "body", label: "Corpo", fontSize: "var(--font-size-body)", fontWeight: "var(--font-weight-body)" },
  { id: "label", label: "Rótulo", fontSize: "var(--font-size-label)", fontWeight: "var(--font-weight-label)" },
  { id: "caption", label: "Legenda", fontSize: "var(--font-size-caption)", fontWeight: "var(--font-weight-caption)" },
] as const;

/**
 * Tipografia (FUN-102) — Fonte de título/corpo são reais (`DesignTokenService.generateTypographyTokens`
 * — os únicos dois nomes literais desse Service, "fonte-titulo"/"fonte-corpo"; nunca "Fonte
 * principal/secundária" como a Sprint nomeou, mantido honesto ao nome real do domínio). "Escalas,
 * Pesos, Hierarquia", pedidos pela Sprint, não existem em nenhum Token gerado pelo Branding Hub por
 * Tenant (`TokenCategory` não tem um literal de escala/peso) — a única fonte real de hierarquia
 * tipográfica é a escala fixa do próprio Design System (`styles/tokens.css`), mostrada aqui
 * claramente rotulada como tal.
 */
export function TypographySection({ brandTokens }: { readonly brandTokens: readonly DesignTokenResponseDto[] }) {
  const titleFont = brandTokens.find((token) => token.category === "Tipografia" && token.name === "fonte-titulo");
  const bodyFont = brandTokens.find((token) => token.category === "Tipografia" && token.name === "fonte-corpo");

  return (
    <div className="dashboard-section">
      <WidgetCard title="Fontes da marca (Tenant)">
        {!titleFont && !bodyFont ? (
          <p>Nenhuma fonte gerada ainda.</p>
        ) : (
          <div className="typography-preview-grid">
            {titleFont && (
              <div>
                <span className="typography-preview-label">Fonte de título ({titleFont.value})</span>
                <p style={{ fontFamily: titleFont.value, fontSize: "var(--font-size-h2)" }}>Identidade visual adaptativa</p>
              </div>
            )}
            {bodyFont && (
              <div>
                <span className="typography-preview-label">Fonte de corpo ({bodyFont.value})</span>
                <p style={{ fontFamily: bodyFont.value }}>Texto de exemplo usando a fonte de corpo definida para esta marca.</p>
              </div>
            )}
          </div>
        )}
      </WidgetCard>

      <NotConnectedNotice fields={["Escalas por Tenant", "Pesos por Tenant"]} context="Branding Hub" />

      <WidgetCard title="Hierarquia tipográfica (Design System, não gerada por Tenant)">
        <div className="typography-scale">
          {SCALE_STEPS.map((step) => (
            <p key={step.id} style={{ fontSize: step.fontSize, fontWeight: step.fontWeight, margin: 0 }}>
              {step.label} — Aa Bb Cc
            </p>
          ))}
        </div>
      </WidgetCard>
    </div>
  );
}
