import { useState } from "react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Button } from "@shared/components/ui/Button";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { Field } from "@shared/components/ui/Field";
import { PriceCard } from "@shared/components/ui/PriceCard";
import { Select } from "@shared/components/ui/Select";
import { useToast } from "@shared/components/ui/toast/useToast";
import { resolveCurrentPrice, type ProductWorkspaceSnapshot } from "@core/commerce/productWorkspace";
import { useSetPrice } from "@core/query/useSetPrice";

/**
 * Precificação (FUN-104) — página de cálculo real: cada Produto com um Price conhecido mostra seu
 * valor de lista (`PriceCard`). "Definir Preço" invoca o Command real `setPrice` (Evento
 * `PriceChanged`) — `PriceService.set` substitui o Price vigente quando já existe um, ou cria um
 * novo; este Workspace, sem nenhuma Query para reler o estado real, sempre acrescenta o novo Price
 * ao histórico local e usa o mais recente como vigente (ver `resolveCurrentPrice`).
 */
export function PricingSection({ workspace }: { readonly workspace: ProductWorkspaceSnapshot }) {
  const setPrice = useSetPrice();
  const { showToast } = useToast();
  const [productId, setProductId] = useState(workspace.products[0]?.productId ?? "");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("BRL");

  function handleSetPrice() {
    const numericAmount = Number(amount);
    if (!productId || Number.isNaN(numericAmount) || numericAmount <= 0) {
      return;
    }
    setPrice.mutate(
      { productId, variantId: undefined, amount: numericAmount, currency },
      { onSuccess: () => { showToast("success", "Preço atualizado."); setAmount(""); }, onError: () => showToast("danger", "Não foi possível definir o Preço.") },
    );
  }

  return (
    <div className="dashboard-section">
      <WidgetCard title="Definir Preço">
        <div className="form-grid">
          <Select label="Produto" value={productId} onChange={(event) => setProductId(event.target.value)}>
            {workspace.products.length === 0 && <option value="">Nenhum Produto cadastrado</option>}
            {workspace.products.map((product) => (
              <option key={product.productId} value={product.productId}>
                {product.name}
              </option>
            ))}
          </Select>
          <Field label="Valor" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" />
          <Field label="Moeda (ISO 4217)" value={currency} onChange={(event) => setCurrency(event.target.value.toUpperCase())} placeholder="BRL" />
        </div>
        <Button type="button" variant="primary" onClick={handleSetPrice} disabled={setPrice.isPending || !productId}>
          {setPrice.isPending ? "Definindo…" : "Definir Preço"}
        </Button>
      </WidgetCard>

      <WidgetCard title="Preços vigentes">
        {workspace.products.length === 0 ? (
          <EmptyState title="Nenhum Produto cadastrado ainda" />
        ) : (
          <div className="dashboard-grid">
            {workspace.products.map((product) => {
              const price = resolveCurrentPrice(workspace, product.productId);
              return price ? <PriceCard key={product.productId} label={product.name} amount={price.amount} currency={price.currency} /> : null;
            })}
          </div>
        )}
      </WidgetCard>
    </div>
  );
}
