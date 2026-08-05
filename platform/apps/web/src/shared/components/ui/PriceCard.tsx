export interface PriceCardProps {
  readonly label: string;
  readonly amount: number;
  readonly currency: string;
  readonly hint?: string;
}

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/**
 * Cartão de valor monetário — `currency` é sempre o código real já presente em `Price.currency`
 * (nunca fixo em BRL, `Intl.NumberFormat` formata qualquer código ISO 4217 válido). Primeiro uso no
 * Product Hub Workspace (FUN-104, Precificação/Custos), genérico para qualquer módulo futuro que
 * precise destacar um valor monetário isolado.
 */
export function PriceCard({ label, amount, currency, hint }: PriceCardProps) {
  return (
    <div className="price-card">
      <span className="price-card__label">{label}</span>
      <strong className="price-card__value">{formatCurrency(amount, currency)}</strong>
      {hint && <span className="price-card__hint">{hint}</span>}
    </div>
  );
}
