import { useState } from "react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Alert } from "@shared/components/ui/Alert";
import { Button } from "@shared/components/ui/Button";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { Field } from "@shared/components/ui/Field";
import { ProductionOrderCard } from "@shared/components/ui/ProductionOrderCard";
import { useToast } from "@shared/components/ui/toast/useToast";
import type { ProductionOrderResponseDto } from "@core/production/production.dto";
import { useCancelProduction } from "@core/production/useCancelProduction";
import { useCompleteProduction } from "@core/production/useCompleteProduction";
import { useProductionOrdersByStatus } from "@core/production/useProductionOrdersByStatus";
import { useRegisterProductionConsumption } from "@core/production/useRegisterProductionConsumption";
import { useRegisterProductionOutput } from "@core/production/useRegisterProductionOutput";
import { useStartProduction } from "@core/production/useStartProduction";

/**
 * Analisa "produto:quantidade" separados por vírgula (ex.: "flour:20,yeast:2") em
 * `Record<string, number>` — forma HTTP de `ReadonlyMap<string, number>` já exigida por
 * `StartProductionRequestDto.availableQuantities` (`core/production/production.dto.ts`, IMP-504).
 * Entrada manual, deliberada — ver nota em `startProduction` abaixo.
 */
function parseAvailableQuantities(input: string): Record<string, number> {
  const result: Record<string, number> = {};
  for (const pair of input.split(",")) {
    const [productId, quantity] = pair.split(":").map((part) => part.trim());
    if (productId && quantity) {
      result[productId] = Number(quantity);
    }
  }
  return result;
}

/**
 * Ordens em Execução (IMP-505) — o cockpit operacional real: iniciar, registrar consumo, registrar
 * geração, concluir e cancelar, cada ação uma Command real (`core/production/`, IMP-504), gatilhada
 * apenas pelo `status` já visível, mesma disciplina de `ReservationsSection.tsx` (Inventory Movement
 * Workspace) — nunca uma regra de negócio nova nesta camada: se o servidor rejeitar (ex.: tentativa de
 * registrar consumo antes de `StartProduction`), o erro real (`ApiError`) aparece via toast, nunca
 * escondido.
 *
 * **`useProductionOrdersByStatus("InProgress")` é uma Query real, mas fica desatualizada após
 * qualquer Mutation desta seção** (nenhuma sincronização automática existe — `productionCache.ts`,
 * IMP-504, "LIMITAÇÃO DOCUMENTADA", mesma classe de `requisitionsByStatus` do Purchase Workspace) —
 * por isso um botão "Atualizar" explícito refaz a consulta manualmente após qualquer ação, nunca uma
 * tentativa de recálculo local do que já deveria ter mudado.
 *
 * **`startProduction` exige `availableQuantities` já composto pelo chamador** (Core, IMP-501,
 * Divergência 2; `IMP_504_PRODUCTION_FRONTEND_REPORT.md`, §13: "o Workspace precisará compor essa
 * informação a partir de uma fonte real de Stock Position"). Esta Sprint (escopo exclusivamente
 * Workspace do Production Hub, proibida de alterar Frontend Infrastructure ou compor um novo Hook
 * cross-Hub) não integra `core/inventory-movement/useStockPosition` — o operador informa manualmente a
 * disponibilidade conhecida de cada insumo (`productId:quantidade`, separados por vírgula). Decisão
 * documentada em `IMP_505_PRODUCTION_WORKSPACE_REPORT.md` — nunca uma simulação de integração real,
 * apenas um formulário honesto sobre uma limitação já herdada de três Sprints anteriores.
 */
export function InProgressSection({
  onLogged,
  onOrderChanged,
}: {
  readonly onLogged: (message: string) => void;
  readonly onOrderChanged: (order: ProductionOrderResponseDto) => void;
}) {
  const { showToast } = useToast();
  const inProgressOrders = useProductionOrdersByStatus("InProgress");
  const startProduction = useStartProduction();
  const registerConsumption = useRegisterProductionConsumption();
  const registerOutput = useRegisterProductionOutput();
  const completeProduction = useCompleteProduction();
  const cancelProduction = useCancelProduction();

  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(undefined);

  const [startOrderId, setStartOrderId] = useState("");
  const [availableQuantitiesInput, setAvailableQuantitiesInput] = useState("");

  const [consumptionForm, setConsumptionForm] = useState({ inputProductId: "", quantityConsumed: "", acquisitionCost: "" });
  const [outputForm, setOutputForm] = useState({ outputProductId: "", quantityGenerated: "" });
  const [cancelReason, setCancelReason] = useState("");

  function start() {
    if (!startOrderId.trim()) {
      return;
    }
    startProduction.mutate(
      { productionOrderId: startOrderId.trim(), payload: { availableQuantities: parseAvailableQuantities(availableQuantitiesInput) } },
      {
        onSuccess: ({ productionOrder, started }) => {
          onOrderChanged(productionOrder);
          if (started) {
            showToast("success", "Produção iniciada.");
            onLogged(`Ordem ${productionOrder.productionOrderId.slice(0, 8)} iniciada.`);
            setStartOrderId("");
            setAvailableQuantitiesInput("");
          } else {
            showToast("info", "Insumo insuficiente — a Ordem permanece Planejada.");
            onLogged(`Ordem ${productionOrder.productionOrderId.slice(0, 8)} não pôde ser iniciada — insumo insuficiente.`);
          }
        },
        onError: () => showToast("danger", "Não foi possível iniciar a Produção."),
      },
    );
  }

  function submitConsumption() {
    if (!selectedOrderId || !consumptionForm.inputProductId.trim() || !consumptionForm.quantityConsumed || !consumptionForm.acquisitionCost) {
      return;
    }
    registerConsumption.mutate(
      {
        productionOrderId: selectedOrderId,
        payload: {
          inputProductId: consumptionForm.inputProductId.trim(),
          quantityConsumed: Number(consumptionForm.quantityConsumed),
          acquisitionCost: Number(consumptionForm.acquisitionCost),
        },
      },
      {
        onSuccess: ({ productionOrder }) => {
          showToast("success", "Consumo registrado.");
          onOrderChanged(productionOrder);
          onLogged(`Consumo registrado na Ordem ${productionOrder.productionOrderId.slice(0, 8)}.`);
          setConsumptionForm({ inputProductId: "", quantityConsumed: "", acquisitionCost: "" });
        },
        onError: () => showToast("danger", "Não foi possível registrar o consumo."),
      },
    );
  }

  function submitOutput() {
    if (!selectedOrderId || !outputForm.outputProductId.trim() || !outputForm.quantityGenerated) {
      return;
    }
    registerOutput.mutate(
      { productionOrderId: selectedOrderId, payload: { outputProductId: outputForm.outputProductId.trim(), quantityGenerated: Number(outputForm.quantityGenerated) } },
      {
        onSuccess: ({ productionOrder }) => {
          showToast("success", "Geração registrada.");
          onOrderChanged(productionOrder);
          onLogged(`Geração registrada na Ordem ${productionOrder.productionOrderId.slice(0, 8)}.`);
          setOutputForm({ outputProductId: "", quantityGenerated: "" });
        },
        onError: () => showToast("danger", "Não foi possível registrar a geração."),
      },
    );
  }

  function complete() {
    if (!selectedOrderId) {
      return;
    }
    completeProduction.mutate(selectedOrderId, {
      onSuccess: (order) => {
        showToast("success", "Produção concluída.");
        onOrderChanged(order);
        onLogged(`Ordem ${order.productionOrderId.slice(0, 8)} concluída.`);
        setSelectedOrderId(undefined);
      },
      onError: () => showToast("danger", "Não foi possível concluir a Produção — verifique se ao menos uma geração já foi registrada."),
    });
  }

  function cancel() {
    if (!selectedOrderId || !cancelReason.trim()) {
      return;
    }
    cancelProduction.mutate(
      { productionOrderId: selectedOrderId, payload: { reason: cancelReason.trim() } },
      {
        onSuccess: (order) => {
          showToast("success", "Ordem cancelada.");
          onOrderChanged(order);
          onLogged(`Ordem ${order.productionOrderId.slice(0, 8)} cancelada — ${order.cancelReason}.`);
          setCancelReason("");
          setSelectedOrderId(undefined);
        },
        onError: () => showToast("danger", "Não foi possível cancelar a Ordem — ela pode já possuir consumo registrado."),
      },
    );
  }

  return (
    <div className="dashboard-section">
      <WidgetCard title="Iniciar Produção">
        <div className="form-grid">
          <Field label="Ordem a iniciar" value={startOrderId} onChange={(event) => setStartOrderId(event.target.value)} placeholder="Ex.: po-123" />
          <Field
            label="Disponibilidade de insumos (produto:quantidade, separados por vírgula)"
            value={availableQuantitiesInput}
            onChange={(event) => setAvailableQuantitiesInput(event.target.value)}
            placeholder="Ex.: flour:20,yeast:2"
          />
        </div>
        <Button type="button" variant="primary" disabled={!startOrderId.trim() || startProduction.isPending} onClick={start}>
          Iniciar Produção
        </Button>
      </WidgetCard>

      <WidgetCard title="Ordens em Execução (InProgress)">
        <div style={{ marginBottom: 12 }}>
          <Button type="button" variant="secondary" size="sm" onClick={() => void inProgressOrders.refetch()}>
            Atualizar
          </Button>
        </div>
        {(inProgressOrders.data?.length ?? 0) === 0 ? (
          <EmptyState title="Nenhuma Ordem em execução no momento" description="Inicie uma Ordem Planejada acima para vê-la aqui." />
        ) : (
          <div className="dashboard-grid">
            {inProgressOrders.data!.map((order) => (
              <div key={order.productionOrderId}>
                <ProductionOrderCard
                  productionOrderId={order.productionOrderId}
                  billOfMaterialsId={order.billOfMaterialsId}
                  plannedOutputQuantity={order.plannedOutputQuantity}
                  status={order.status}
                  workCenterId={order.workCenterId}
                  orderId={order.orderId}
                  consumptionsCount={order.consumptions.length}
                  outputsCount={order.outputs.length}
                />
                <div style={{ marginTop: 8 }}>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedOrderId(order.productionOrderId)}>
                    Selecionar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </WidgetCard>

      {selectedOrderId === undefined ? (
        <Alert tone="info">
          <p>Selecione uma Ordem em Execução acima para registrar consumo, geração, concluir ou cancelar.</p>
        </Alert>
      ) : (
        <WidgetCard title={`Ações — Ordem ${selectedOrderId.slice(0, 8)}`}>
          <div className="form-grid">
            <Field label="Insumo consumido" value={consumptionForm.inputProductId} onChange={(event) => setConsumptionForm({ ...consumptionForm, inputProductId: event.target.value })} placeholder="Ex.: flour" />
            <Field label="Quantidade consumida" type="number" min={0} value={consumptionForm.quantityConsumed} onChange={(event) => setConsumptionForm({ ...consumptionForm, quantityConsumed: event.target.value })} />
            <Field label="Custo de aquisição" type="number" min={0} value={consumptionForm.acquisitionCost} onChange={(event) => setConsumptionForm({ ...consumptionForm, acquisitionCost: event.target.value })} />
          </div>
          <Button type="button" variant="secondary" disabled={registerConsumption.isPending} onClick={submitConsumption}>
            Registrar Consumo
          </Button>

          <div className="form-grid" style={{ marginTop: 16 }}>
            <Field label="Produto acabado gerado" value={outputForm.outputProductId} onChange={(event) => setOutputForm({ ...outputForm, outputProductId: event.target.value })} placeholder="Ex.: bread" />
            <Field label="Quantidade gerada" type="number" min={0} value={outputForm.quantityGenerated} onChange={(event) => setOutputForm({ ...outputForm, quantityGenerated: event.target.value })} />
          </div>
          <Button type="button" variant="secondary" disabled={registerOutput.isPending} onClick={submitOutput}>
            Registrar Produção
          </Button>

          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <Button type="button" variant="primary" disabled={completeProduction.isPending} onClick={complete}>
              Concluir Produção
            </Button>
          </div>

          <div className="form-grid" style={{ marginTop: 16 }}>
            <Field label="Motivo do cancelamento" value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} placeholder="Ex.: Cliente desistiu do pedido" />
          </div>
          <Button type="button" variant="danger" disabled={!cancelReason.trim() || cancelProduction.isPending} onClick={cancel}>
            Cancelar Ordem
          </Button>
        </WidgetCard>
      )}
    </div>
  );
}
