import { WidgetCard } from "@shared/components/WidgetCard";
import { Alert } from "@shared/components/ui/Alert";
import { Badge } from "@shared/components/ui/Badge";
import { Button } from "@shared/components/ui/Button";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import type { DesignTokenResponseDto } from "@core/http/dtos/branding.dto";

/**
 * Manual (FUN-102) — página somente leitura, per instrução explícita da Sprint ("Caso não exista
 * backend: Página somente leitura"): nenhum "Brand Validator"/gerador de manual de marca existe em
 * `BrandingManager` (ver auditoria do relatório desta Sprint). Sintetiza os Tokens de Cor/Tipografia
 * já carregados nesta sessão (mesmo dado de `TokensSection`, nunca uma segunda fonte) e reaproveita
 * os componentes do Design System como exemplo de "boas práticas" — nenhum dado novo, nenhuma
 * chamada de rede própria.
 */
export function ManualSection({ brandTokens }: { readonly brandTokens: readonly DesignTokenResponseDto[] }) {
  const colorTokens = brandTokens.filter((token) => token.category === "Cor");
  const typographyTokens = brandTokens.filter((token) => token.category === "Tipografia");

  return (
    <div className="dashboard-section">
      <Alert tone="info">
        <p>Manual de marca — somente leitura. Nenhum gerador de manual existe no Branding Hub; este resumo é composto a partir dos Tokens já carregados nesta sessão.</p>
      </Alert>

      <WidgetCard title="Cores">
        {colorTokens.length === 0 ? (
          <p>Nenhuma cor gerada ainda.</p>
        ) : (
          <div className="palette-swatch-row">
            {colorTokens.map((token) => (
              <div key={token.tokenId} className="palette-swatch-item">
                <span className="palette-swatch palette-swatch--lg" style={{ background: token.value }} />
                <span>{token.name}</span>
                <code>{token.value}</code>
              </div>
            ))}
          </div>
        )}
      </WidgetCard>

      <WidgetCard title="Tipografia">
        {typographyTokens.length === 0 ? (
          <p>Nenhuma fonte gerada ainda.</p>
        ) : (
          <ul>
            {typographyTokens.map((token) => (
              <li key={token.tokenId} style={{ fontFamily: token.value }}>
                {token.name}: {token.value}
              </li>
            ))}
          </ul>
        )}
      </WidgetCard>

      <NotConnectedNotice fields={["Espaçamentos", "Boas práticas geradas automaticamente"]} context="Branding Hub" />

      <WidgetCard title="Botões — boas práticas">
        <p>Use sempre o botão primário para a ação principal de uma tela e o secundário para ações alternativas.</p>
        <div className="component-gallery-row">
          <Button variant="primary">Ação principal</Button>
          <Button variant="secondary">Ação alternativa</Button>
        </div>
      </WidgetCard>

      <WidgetCard title="Ícones e estados — boas práticas">
        <div className="component-gallery-row">
          <Badge tone="success">Sucesso</Badge>
          <Badge tone="danger">Erro</Badge>
          <Badge tone="warning">Aviso</Badge>
        </div>
      </WidgetCard>
    </div>
  );
}
