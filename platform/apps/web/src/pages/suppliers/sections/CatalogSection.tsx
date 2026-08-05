import { Package2 } from "lucide-react";
import { useState } from "react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Button } from "@shared/components/ui/Button";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { Field } from "@shared/components/ui/Field";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { Select } from "@shared/components/ui/Select";
import { useToast } from "@shared/components/ui/toast/useToast";
import type { SupplierCatalogItemResponseDto, SupplierResponseDto } from "@core/supplier/supplier.dto";
import { useRegisterSupplierCatalogItem } from "@core/supplier/useRegisterSupplierCatalogItem";

function formatCurrency(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: currencyCode }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}

/**
 * Catálogo (IMP-205) — "Consumir exatamente o que o Supplier Hub expõe. Se determinado recurso
 * ainda não existir, Placeholder claramente identificado." Registrar um item de catálogo é real
 * (`useRegisterSupplierCatalogItem`, `POST /supplier-catalog-items`, IMP-203) — `productId` é um
 * identificador opaco de Produto do Commerce Hub (`SUPPLIER_HUB.md`, Capítulo 5); nenhum seletor de
 * Produto real existe aqui porque `core/supplier/` nunca importa tipo de `@abp/commerce-hub` (Limite
 * do Domínio já documentado desde o Core, IMP-201) — informado como texto livre, nunca validado
 * contra um Catalog real. Mesma lacuna de listagem de Contratos: nenhum `GET` existe para
 * `SupplierCatalogItem`, `NotConnectedNotice` explica.
 */
export function CatalogSection({ suppliers, onLogged }: { readonly suppliers: readonly SupplierResponseDto[]; readonly onLogged: (message: string) => void }) {
  const { showToast } = useToast();
  const registerItem = useRegisterSupplierCatalogItem();

  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.supplierId ?? "");
  const [productId, setProductId] = useState("");
  const [amount, setAmount] = useState("");
  const [currencyCode, setCurrencyCode] = useState("BRL");
  const [leadTimeInDays, setLeadTimeInDays] = useState("5");
  const [minimumOrderQuantity, setMinimumOrderQuantity] = useState("1");
  const [createdThisSession, setCreatedThisSession] = useState<readonly SupplierCatalogItemResponseDto[]>([]);

  function supplierName(supplierId: string): string | undefined {
    return suppliers.find((supplier) => supplier.supplierId === supplierId)?.legalName;
  }

  function submit() {
    const tenantId = suppliers.find((supplier) => supplier.supplierId === selectedSupplierId)?.tenantId;
    if (!selectedSupplierId || !productId.trim() || !amount || !tenantId) {
      return;
    }

    registerItem.mutate(
      {
        supplierId: selectedSupplierId,
        tenantId,
        productId: productId.trim(),
        listPrice: { amount: Number(amount), currencyCode },
        leadTimeInDays: Number(leadTimeInDays),
        minimumOrderQuantity: Number(minimumOrderQuantity),
      },
      {
        onSuccess: (item) => {
          showToast("success", "Item de catálogo registrado.");
          onLogged(`Item de catálogo "${item.productId}" registrado para "${supplierName(selectedSupplierId) ?? "Fornecedor"}".`);
          setCreatedThisSession((current) => [item, ...current]);
          setProductId("");
          setAmount("");
        },
        onError: () => showToast("danger", "Não foi possível registrar o item de catálogo."),
      },
    );
  }

  return (
    <div className="dashboard-section">
      <NotConnectedNotice fields={["Listagem de itens de Catálogo já existentes"]} context="Supplier Hub" />

      <WidgetCard title="Itens registrados nesta sessão">
        {createdThisSession.length === 0 ? (
          <EmptyState title="Nenhum item de catálogo registrado ainda" description="Registre um item no formulário abaixo." />
        ) : (
          <ul className="activity-log-list">
            {createdThisSession.map((item) => (
              <li key={item.catalogItemId}>
                <Package2 size={16} aria-hidden="true" />
                <span>
                  {item.productId} — {supplierName(item.supplierId) ?? "Fornecedor não identificado"}
                </span>
                <span>{formatCurrency(item.listPrice.amount, item.listPrice.currencyCode)}</span>
              </li>
            ))}
          </ul>
        )}
      </WidgetCard>

      <WidgetCard title="Registrar item de Catálogo">
        {suppliers.length === 0 ? (
          <p>Cadastre um Fornecedor antes de registrar um item de Catálogo.</p>
        ) : (
          <>
            <div className="form-grid">
              <Select label="Fornecedor" value={selectedSupplierId} onChange={(event) => setSelectedSupplierId(event.target.value)}>
                {suppliers.map((supplier) => (
                  <option key={supplier.supplierId} value={supplier.supplierId}>
                    {supplier.legalName}
                  </option>
                ))}
              </Select>
              <Field label="Identificador do Produto (Commerce Hub)" value={productId} onChange={(event) => setProductId(event.target.value)} placeholder="Ex.: product-123" />
              <Field label="Preço de tabela" type="number" min={0} step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} />
              <Field label="Moeda" value={currencyCode} onChange={(event) => setCurrencyCode(event.target.value)} placeholder="BRL" />
              <Field label="Prazo de entrega (dias)" type="number" min={0} value={leadTimeInDays} onChange={(event) => setLeadTimeInDays(event.target.value)} />
              <Field label="Quantidade mínima de pedido" type="number" min={0} value={minimumOrderQuantity} onChange={(event) => setMinimumOrderQuantity(event.target.value)} />
            </div>
            <Button type="button" variant="secondary" disabled={!selectedSupplierId || !productId.trim() || !amount || registerItem.isPending} onClick={submit}>
              Registrar item
            </Button>
          </>
        )}
      </WidgetCard>
    </div>
  );
}
