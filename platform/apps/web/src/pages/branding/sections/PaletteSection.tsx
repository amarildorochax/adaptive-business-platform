import { useEffect, useState } from "react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Button } from "@shared/components/ui/Button";
import { Field } from "@shared/components/ui/Field";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { useToast } from "@shared/components/ui/toast/useToast";
import { useBrandIdentity } from "@core/query/useBrandIdentity";
import { useUpdatePalette } from "@core/query/useUpdatePalette";
import type { DesignTokenResponseDto } from "@core/http/dtos/branding.dto";

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

/**
 * Paleta (FUN-102) — a Paleta da Marca (Cor de destaque primária + Cor de texto primária) é real:
 * gerada por `DesignTokenService.generateColorTokens` e editável através do Command "UpdatePalette"
 * (`useUpdatePalette`, `POST /branding/palette`), com preview em tempo real do hex digitado antes do
 * envio. Secundária e as quatro cores de Feedback (Sucesso/Erro/Aviso/Informação), pedidas pela
 * Sprint, não são geradas pelo Branding Hub por Tenant — são as cores fixas do próprio Design System
 * (`styles/tokens.css`, UX-001), mostradas aqui claramente rotuladas como tal, nunca confundidas com
 * dado gerado pelo `BrandingManager`. Terciária e Neutras não existem em nenhuma das duas fontes.
 */
export function PaletteSection({ tenantId, brandTokens }: { readonly tenantId: string; readonly brandTokens: readonly DesignTokenResponseDto[] }) {
  const identity = useBrandIdentity(tenantId);
  const updatePalette = useUpdatePalette();
  const { showToast } = useToast();

  const accent = brandTokens.find((token) => token.category === "Cor" && token.name === "cor-destaque-primaria");
  const text = brandTokens.find((token) => token.category === "Cor" && token.name === "cor-texto-primaria");

  const [primaryColorHex, setPrimaryColorHex] = useState(accent?.value ?? "#2E7D32");
  const [backgroundHex, setBackgroundHex] = useState("#FFFFFF");

  useEffect(() => {
    if (accent) {
      setPrimaryColorHex(accent.value);
    }
  }, [accent]);

  const themeId = identity.data?.theme?.themeId;
  const canSubmit = Boolean(themeId) && HEX_PATTERN.test(primaryColorHex) && HEX_PATTERN.test(backgroundHex);

  function handleSubmit() {
    if (!themeId || !canSubmit) {
      return;
    }
    updatePalette.mutate(
      { tenantId, themeId, primaryColorHex, backgroundHex },
      {
        onSuccess: () => showToast("success", "Paleta atualizada."),
        onError: () => showToast("danger", "Não foi possível atualizar a paleta."),
      },
    );
  }

  return (
    <div className="dashboard-section">
      <WidgetCard title="Paleta da marca (Tenant)">
        <div className="palette-swatch-row">
          <div className="palette-swatch-item">
            <span className="palette-swatch palette-swatch--lg" style={{ background: primaryColorHex }} />
            <span>Destaque primária</span>
            <code>{accent?.value ?? "—"}</code>
          </div>
          <div className="palette-swatch-item">
            <span className="palette-swatch palette-swatch--lg" style={{ background: text?.value ?? backgroundHex }} />
            <span>Texto primário (contraste AA garantido pelo Backend)</span>
            <code>{text?.value ?? "—"}</code>
          </div>
        </div>

        <div className="form-grid">
          <Field label="Nova cor de destaque (hex)" value={primaryColorHex} onChange={(event) => setPrimaryColorHex(event.target.value)} placeholder="#2E7D32" />
          <Field label="Nova cor de fundo (hex)" value={backgroundHex} onChange={(event) => setBackgroundHex(event.target.value)} placeholder="#FFFFFF" />
        </div>
        <Button type="button" variant="primary" onClick={handleSubmit} disabled={!canSubmit || updatePalette.isPending}>
          {updatePalette.isPending ? "Atualizando…" : "Atualizar paleta"}
        </Button>
      </WidgetCard>

      <WidgetCard title="Paleta do Design System (aplicação, não gerada por Tenant)">
        <div className="palette-swatch-row">
          <div className="palette-swatch-item">
            <span className="palette-swatch palette-swatch--lg" style={{ background: "var(--color-secondary)" }} />
            <span>Secundária</span>
          </div>
          <div className="palette-swatch-item">
            <span className="palette-swatch palette-swatch--lg" style={{ background: "var(--color-success)" }} />
            <span>Sucesso</span>
          </div>
          <div className="palette-swatch-item">
            <span className="palette-swatch palette-swatch--lg" style={{ background: "var(--color-danger)" }} />
            <span>Erro</span>
          </div>
          <div className="palette-swatch-item">
            <span className="palette-swatch palette-swatch--lg" style={{ background: "var(--color-warning)" }} />
            <span>Aviso</span>
          </div>
          <div className="palette-swatch-item">
            <span className="palette-swatch palette-swatch--lg" style={{ background: "var(--color-info)" }} />
            <span>Informação</span>
          </div>
        </div>
      </WidgetCard>

      <NotConnectedNotice fields={["Cor terciária", "Cores neutras (escala própria por Tenant)"]} context="Branding Hub" />
    </div>
  );
}
