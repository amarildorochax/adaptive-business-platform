import { Landmark } from "lucide-react";

export interface TaxRegimeCardProps {
  readonly taxRegimeId: string;
  readonly tenantId: string;
  readonly name: string;
  readonly createdAt: string;
}

/**
 * Cartão de resumo do Tax Regime real de um Tenant (`core/fiscal/`, IMP-604) — "associado a exatamente
 * uma Empresa por Tenant" (`FISCAL_HUB.md`, Capítulo 5), nunca uma lista: no máximo um por Tenant, sem
 * nenhum Command de atualização (`FiscalManager`, Core, IMP-601, nunca expôs um). Mesmo padrão de
 * `LocationCard`/`WorkCenterCard`, sem Badge de status — um Tax Regime existente é sempre, por
 * definição, o único e corrente.
 */
export function TaxRegimeCard({ taxRegimeId, tenantId, name }: TaxRegimeCardProps) {
  return (
    <div className="purchase-card">
      <div className="purchase-card__header">
        <strong>
          <Landmark size={14} aria-hidden="true" /> {name}
        </strong>
      </div>
      <div className="purchase-card__meta">
        <span>Regime {taxRegimeId.slice(0, 8)}</span>
        <span>Tenant {tenantId.slice(0, 8)}</span>
      </div>
    </div>
  );
}
