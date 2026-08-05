import { useState } from "react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { Tabs } from "@shared/components/ui/Tabs";
import type { DesignTokenResponseDto } from "@core/http/dtos/branding.dto";

/** As sete categorias fechadas de `TokenCategory` (`packages/branding/src/DesignToken.ts`) — nenhuma inventada, nenhuma renomeada. */
const TOKEN_CATEGORIES = ["Cor", "Tipografia", "Espaçamento", "Borda", "Sombra", "Ícone", "Estado"] as const;

/**
 * Tokens (FUN-102) — organiza as sete categorias reais e fechadas de `TokenCategory`. Apenas "Cor" e
 * "Tipografia" são populadas por algum Service hoje (`DesignTokenService.generateColorTokens`/
 * `generateTypographyTokens`) — as outras cinco ("Espaçamento", "Borda", "Sombra", "Ícone", "Estado")
 * existem apenas como estrutura do domínio, nunca preenchidas por nenhum Service desta Sprint (nenhum
 * "Spacing/Radius/Elevation/Motion Engine" foi implementado, apesar de nomeados em `BRANDING_HUB.md`).
 * Limitação adicional, crítica: não existe nenhum endpoint que liste os Tokens de um Theme de forma
 * independente (`DesignTokenService.listByTheme` existe no Service, mas nunca foi exposto por
 * `BrandingManager` nem por nenhuma rota de `apps/api/src/routes/branding.ts`) — esta lista reflete
 * exclusivamente os Tokens já recebidos nesta sessão do navegador (bootstrap inicial + qualquer
 * `updatePalette`/`regenerateTheme` já executado aqui), nunca uma consulta fresca ao servidor.
 */
export function TokensSection({ brandTokens }: { readonly brandTokens: readonly DesignTokenResponseDto[] }) {
  const [activeCategory, setActiveCategory] = useState<(typeof TOKEN_CATEGORIES)[number]>("Cor");

  const tokensInCategory = brandTokens.filter((token) => token.category === activeCategory);

  return (
    <div className="dashboard-section">
      <NotConnectedNotice fields={["Listagem independente de Tokens (sem depender do cache da sessão)"]} context="Branding Hub" />

      <WidgetCard title="Design Tokens">
        <Tabs label="Categorias de Design Tokens" items={TOKEN_CATEGORIES.map((category) => ({ id: category, label: category }))} activeId={activeCategory} onChange={(id) => setActiveCategory(id as (typeof TOKEN_CATEGORIES)[number])} />

        {tokensInCategory.length === 0 ? (
          <EmptyState title={`Nenhum Token de "${activeCategory}"`} description={activeCategory === "Cor" || activeCategory === "Tipografia" ? "Nenhum token desta categoria foi gerado ainda nesta sessão." : "Nenhum Service desta Sprint gera Tokens desta categoria — estrutura existe no domínio, mas nunca foi populada."} />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {tokensInCategory.map((token) => (
                <tr key={token.tokenId}>
                  <td>
                    <code>{token.name}</code>
                  </td>
                  <td>{token.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </WidgetCard>
    </div>
  );
}
