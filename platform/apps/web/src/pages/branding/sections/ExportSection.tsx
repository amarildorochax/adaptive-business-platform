import { Download } from "lucide-react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Button } from "@shared/components/ui/Button";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import type { DesignTokenResponseDto } from "@core/http/dtos/branding.dto";

/**
 * Exportação (FUN-102) — `BrandingCommand`/`BrandingEvent` catalogam `PublishBrandAssets`/
 * `BrandAssetChanged`, mas nenhum Service os implementa nesta Sprint (a Asset Library não é citada em
 * nenhuma camada do Roadmap de `BRANDING_HUB.md`, Capítulo 20) — nenhuma exportação oficial existe no
 * Backend. A única exportação real possível hoje é inteiramente client-side: baixar como arquivo
 * `.json` os Tokens já carregados nesta sessão do navegador — nunca fingida como uma Command real,
 * nunca persistida/rastreada pelo servidor.
 */
export function ExportSection({ brandTokens }: { readonly brandTokens: readonly DesignTokenResponseDto[] }) {
  function handleDownload() {
    const payload = JSON.stringify(brandTokens, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "design-tokens.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="dashboard-section">
      <WidgetCard title="Exportar Tokens carregados (client-side)">
        <p>Baixa um arquivo <code>.json</code> com os Design Tokens já carregados nesta sessão do navegador — nunca uma exportação oficial gerada/rastreada pelo Backend.</p>
        <Button type="button" variant="secondary" leadingIcon={<Download size={16} aria-hidden="true" />} onClick={handleDownload} disabled={brandTokens.length === 0}>
          Baixar design-tokens.json
        </Button>
      </WidgetCard>

      <NotConnectedNotice fields={["Exportação oficial (PDF, pacote de marca, Figma)"]} context="Branding Hub" />
      <p className="future-availability-note">Exportação oficial disponível em versão futura.</p>
    </div>
  );
}
