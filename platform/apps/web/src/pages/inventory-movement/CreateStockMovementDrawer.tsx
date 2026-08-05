import { useState } from "react";
import { Button } from "@shared/components/ui/Button";
import { Drawer } from "@shared/components/ui/Drawer";
import { Field } from "@shared/components/ui/Field";
import { Select } from "@shared/components/ui/Select";
import { useToast } from "@shared/components/ui/toast/useToast";
import type { MovementOriginDto, RegisterStockMovementResponseDto } from "@core/inventory-movement/inventoryMovement.dto";
import { useRegisterStockMovement } from "@core/inventory-movement/useRegisterStockMovement";

const ORIGIN_OPTIONS: readonly { readonly value: MovementOriginDto; readonly label: string }[] = [
  { value: "Purchase", label: "Compra (Entrada)" },
  { value: "ProductionOutput", label: "Produção Concluída (Entrada)" },
  { value: "SaleReturn", label: "Devolução de Venda (Entrada)" },
  { value: "ManualAdjustment", label: "Ajuste Manual" },
  { value: "ProductionConsumption", label: "Consumo de Produção (Saída)" },
  { value: "SaleFulfillment", label: "Cumprimento de Venda (Saída)" },
];

interface FormState {
  readonly productId: string;
  readonly locationId: string;
  readonly quantityDelta: string;
  readonly origin: MovementOriginDto;
  readonly originReferenceId: string;
}

const EMPTY_FORM: FormState = { productId: "", locationId: "", quantityDelta: "", origin: "Purchase", originReferenceId: "" };

/**
 * Drawer de registro de Stock Movement (IMP-405) — Ação Rápida "Nova Movimentação" do `PageHeader`
 * (`InventoryMovementPage.tsx`), mesmo padrão de `CreatePurchaseOrderDrawer.tsx`. Resolve
 * explicitamente, por instrução direta desta Sprint ("Registrar nova movimentação quando suportado" +
 * "PageHeader.actions — Exemplo: Nova Movimentação"), a pergunta em aberto deixada por IMP-403/404
 * ("RegisterStockMovement é documentado como interno — o Workspace deve expor um formulário manual?")
 * — a resposta é sim, porque este Sprint pede isso explicitamente.
 *
 * Rótulos "Produto a movimentar"/"Localização de destino (opcional)" — deliberadamente distintos de
 * "Identificador do Produto"/"Localização (opcional)" já usados por `MovementsSection`/
 * `PositionsSection`/`ReservationsSection`/`AlertsSection` (todas têm seu próprio campo de busca com
 * esses rótulos). Como `PageHeader.actions` permanece disponível em qualquer aba, este Drawer pode
 * abrir sobre uma dessas seções — dois campos com o mesmo nome acessível visíveis ao mesmo tempo
 * seria uma ambiguidade real de acessibilidade, mesma classe de achado já corrigido em
 * `IMP_305_PURCHASE_WORKSPACE_REPORT.md` (nomes de botão duplicados). Corrigido aqui pela mesma razão,
 * nunca como workaround de teste — uma melhoria real de acessibilidade.
 *
 * `occurredAt` nunca é pedido neste formulário — `RegisterStockMovementRequestDto.occurredAt` é
 * opcional (Core, `InventoryFactory.createStockMovement`, usa a hora atual quando omitido); pedir essa
 * data manualmente adicionaria complexidade sem benefício real para o caso de uso "registrar agora".
 * `originReferenceId` nunca é validado como obrigatório neste formulário mesmo para origens que o
 * exigem (`ProductionConsumption`/`ProductionOutput`) — essa é uma regra de negócio real
 * (`MovementOriginReferenceRequiredError`, Core), decidida exclusivamente pelo servidor; o formulário
 * apenas propaga o erro real via toast quando isso acontece, nunca replica a regra no Frontend.
 */
export function CreateStockMovementDrawer({
  open,
  onClose,
  tenantId,
  onRegistered,
}: {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly tenantId: string;
  readonly onRegistered: (result: RegisterStockMovementResponseDto) => void;
}) {
  const { showToast } = useToast();
  const registerMovement = useRegisterStockMovement();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  function close() {
    setForm(EMPTY_FORM);
    onClose();
  }

  function submit() {
    const quantityDelta = Number(form.quantityDelta);
    if (!form.productId.trim() || !form.quantityDelta || quantityDelta === 0) {
      return;
    }
    registerMovement.mutate(
      {
        tenantId,
        productId: form.productId.trim(),
        locationId: form.locationId.trim() || undefined,
        quantityDelta,
        origin: form.origin,
        originReferenceId: form.originReferenceId.trim() || undefined,
      },
      {
        onSuccess: (result) => {
          showToast("success", "Movimentação registrada.");
          onRegistered(result);
          close();
        },
        onError: () => showToast("danger", "Não foi possível registrar a movimentação — verifique a quantidade e a origem informada."),
      },
    );
  }

  return (
    <Drawer open={open} onClose={close} title="Nova Movimentação de Estoque">
      <div className="form-grid">
        <Field label="Produto a movimentar" value={form.productId} onChange={(event) => setForm({ ...form, productId: event.target.value })} placeholder="Ex.: product-123" />
        <Field label="Localização de destino (opcional)" value={form.locationId} onChange={(event) => setForm({ ...form, locationId: event.target.value })} placeholder="Ex.: location-123" />
        <Field
          label="Quantidade (positiva para entrada, negativa para saída)"
          type="number"
          value={form.quantityDelta}
          onChange={(event) => setForm({ ...form, quantityDelta: event.target.value })}
          placeholder="Ex.: 10 ou -5"
        />
        <Select label="Origem" value={form.origin} onChange={(event) => setForm({ ...form, origin: event.target.value as MovementOriginDto })}>
          {ORIGIN_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Field
          label="Referência de origem (obrigatória para Consumo/Produção)"
          value={form.originReferenceId}
          onChange={(event) => setForm({ ...form, originReferenceId: event.target.value })}
          placeholder="Ex.: po-123, production-order-123"
        />
      </div>
      <Button type="button" variant="primary" disabled={!form.productId.trim() || !form.quantityDelta || registerMovement.isPending} onClick={submit}>
        Registrar Movimentação
      </Button>
    </Drawer>
  );
}
