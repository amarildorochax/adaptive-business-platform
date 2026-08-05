import { useState } from "react";
import { Button } from "@shared/components/ui/Button";
import { Drawer } from "@shared/components/ui/Drawer";
import { Field } from "@shared/components/ui/Field";
import { useToast } from "@shared/components/ui/toast/useToast";
import type { ProductionOrderResponseDto } from "@core/production/production.dto";
import { useCreateProductionOrder } from "@core/production/useCreateProductionOrder";

interface FormState {
  readonly billOfMaterialsId: string;
  readonly plannedOutputQuantity: string;
  readonly workCenterId: string;
  readonly orderId: string;
}

const EMPTY_FORM: FormState = { billOfMaterialsId: "", plannedOutputQuantity: "1", workCenterId: "", orderId: "" };

/**
 * Drawer de criação de ProductionOrder (IMP-505) — Ação Rápida "Nova Ordem de Produção" do
 * `PageHeader` (`ProductionPage.tsx`), mesmo padrão de `CreateStockMovementDrawer.tsx`. Referencia
 * exatamente uma `BillOfMaterials` já `Active` (Core, IMP-501, Capítulo 11) — o servidor rejeita com
 * 404/409 quando o identificador informado não existe ou não está ativo; este formulário nunca
 * valida essa regra localmente, apenas propaga o erro real via toast.
 *
 * Rótulo "Composição (BillOfMaterials) já ativa" — deliberadamente distinto de "Composição a
 * consultar"/"Consultar Composição" já usados por `BOMSection`, mesma disciplina de prevenção de
 * ambiguidade de nome acessível já documentada em `CreateStockMovementDrawer.tsx`
 * (`IMP_305_PURCHASE_WORKSPACE_REPORT.md`).
 */
export function CreateProductionOrderDrawer({
  open,
  onClose,
  tenantId,
  onCreated,
}: {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly tenantId: string;
  readonly onCreated: (order: ProductionOrderResponseDto) => void;
}) {
  const { showToast } = useToast();
  const createOrder = useCreateProductionOrder();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  function close() {
    setForm(EMPTY_FORM);
    onClose();
  }

  function submit() {
    const plannedOutputQuantity = Number(form.plannedOutputQuantity);
    if (!form.billOfMaterialsId.trim() || !form.plannedOutputQuantity || plannedOutputQuantity <= 0) {
      return;
    }
    createOrder.mutate(
      {
        tenantId,
        billOfMaterialsId: form.billOfMaterialsId.trim(),
        plannedOutputQuantity,
        workCenterId: form.workCenterId.trim() || undefined,
        orderId: form.orderId.trim() || undefined,
      },
      {
        onSuccess: (order) => {
          showToast("success", "Ordem de Produção criada.");
          onCreated(order);
          close();
        },
        onError: () => showToast("danger", "Não foi possível criar a Ordem de Produção — verifique se a Composição informada existe e está ativa."),
      },
    );
  }

  return (
    <Drawer open={open} onClose={close} title="Nova Ordem de Produção">
      <div className="form-grid">
        <Field
          label="Composição (BillOfMaterials) já ativa"
          value={form.billOfMaterialsId}
          onChange={(event) => setForm({ ...form, billOfMaterialsId: event.target.value })}
          placeholder="Ex.: bom-123"
        />
        <Field
          label="Quantidade de saída planejada"
          type="number"
          min={1}
          value={form.plannedOutputQuantity}
          onChange={(event) => setForm({ ...form, plannedOutputQuantity: event.target.value })}
        />
        <Field
          label="Centro de Trabalho (opcional)"
          value={form.workCenterId}
          onChange={(event) => setForm({ ...form, workCenterId: event.target.value })}
          placeholder="Ex.: wc-123"
        />
        <Field
          label="Order de origem (opcional — ausente para reabastecimento manual)"
          value={form.orderId}
          onChange={(event) => setForm({ ...form, orderId: event.target.value })}
          placeholder="Ex.: order-123"
        />
      </div>
      <Button
        type="button"
        variant="primary"
        disabled={!form.billOfMaterialsId.trim() || !form.plannedOutputQuantity || createOrder.isPending}
        onClick={submit}
      >
        Criar Ordem de Produção
      </Button>
    </Drawer>
  );
}
