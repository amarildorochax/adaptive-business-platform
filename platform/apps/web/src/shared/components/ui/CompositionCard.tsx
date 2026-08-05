export interface CompositionItem {
  readonly name: string;
  readonly quantity: number;
}

export interface CompositionCardProps {
  readonly title: string;
  /** Ex.: "Kit", "Combo", "Pacote", "Conjunto" — nunca um valor fixo, sempre o que o chamador already conhece. */
  readonly kind?: string;
  readonly items: readonly CompositionItem[];
}

/**
 * Cartão de um produto composto (Kit/Combo/Pacote/Conjunto — um Product formado por outros Products
 * em quantidade). Genérico e pronto para reuso, mas **sem nenhum dado real por trás nesta Sprint**:
 * `packages/commerce-hub` não modela nenhuma relação de composição entre Products (nenhum "Bill of
 * Materials", nenhum campo em `Product`/`Variant` referencia outro Product) — ver a seção
 * "Composições" do relatório desta Sprint (`FUN_104_PRODUCT_HUB_WORKSPACE_REPORT.md`). Este
 * componente existe pronto para o dia em que essa modelagem existir; nenhuma seção do Product Hub
 * Workspace o instancia com dado fabricado.
 */
export function CompositionCard({ title, kind, items }: CompositionCardProps) {
  return (
    <div className="composition-card">
      <div className="composition-card__header">
        <strong>{title}</strong>
        {kind && <span className="badge badge--info">{kind}</span>}
      </div>
      <ul className="composition-card__items">
        {items.map((item) => (
          <li key={item.name}>
            {item.quantity}× {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
