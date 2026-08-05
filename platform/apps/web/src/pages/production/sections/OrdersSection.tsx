import { useState } from "react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Alert } from "@shared/components/ui/Alert";
import { Button } from "@shared/components/ui/Button";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { Field } from "@shared/components/ui/Field";
import { ProductionOrderCard } from "@shared/components/ui/ProductionOrderCard";
import type { ProductionOrderResponseDto } from "@core/production/production.dto";
import { useProductionOrder } from "@core/production/useProductionOrder";
import { useProductionOrdersByOrigin } from "@core/production/useProductionOrdersByOrigin";

function renderOrder(order: ProductionOrderResponseDto) {
  return (
    <ProductionOrderCard
      key={order.productionOrderId}
      productionOrderId={order.productionOrderId}
      billOfMaterialsId={order.billOfMaterialsId}
      plannedOutputQuantity={order.plannedOutputQuantity}
      status={order.status}
      workCenterId={order.workCenterId}
      orderId={order.orderId}
      consumptionsCount={order.consumptions.length}
      outputsCount={order.outputs.length}
    />
  );
}

/**
 * Ordens de Produção (IMP-505) — criação/consulta. A criação em si acontece exclusivamente pela Ação
 * Rápida "Nova Ordem de Produção" do `PageHeader` (`CreateProductionOrderDrawer.tsx`) — nenhum
 * segundo formulário de criação aqui, mesma disciplina de prevenção de nome de botão duplicado já
 * corrigida em `IMP_405_INVENTORY_MOVEMENT_WORKSPACE_REPORT.md`.
 *
 * `useProductionOrder`/`useProductionOrdersByOrigin` (`core/production/`, IMP-504) exigem um
 * identificador conhecido — não existe "listar todas as Ordens da Empresa" no domínio
 * (`ProductionManager` nunca expôs essa Query); esta seção reflete essa realidade honestamente com
 * dois formulários de busca, nunca uma lista pré-carregada fictícia. Mesmo template de
 * `MovementsSection.tsx` (Inventory Movement Workspace) — "consulta por identificador obrigatório",
 * precedente já antecipado por `IMP_405_INVENTORY_MOVEMENT_WORKSPACE_REPORT.md`, §19.
 *
 * "Ordens criadas nesta sessão" é a mesma "Session Preview" já aplicada por
 * `AlertsSection.tsx`/`ReorderSection.tsx` — a única forma real de o operador revisitar uma Ordem
 * recém-criada sem conhecer de antemão seu identificador.
 */
export function OrdersSection({
  productionOrdersThisSession,
}: {
  readonly productionOrdersThisSession: readonly ProductionOrderResponseDto[];
}) {
  const [orderIdInput, setOrderIdInput] = useState("");
  const [searchedOrderId, setSearchedOrderId] = useState<string | undefined>(undefined);
  const [originInput, setOriginInput] = useState("");
  const [searchedOrigin, setSearchedOrigin] = useState<string | undefined>(undefined);

  const byId = useProductionOrder(searchedOrderId);
  const byOrigin = useProductionOrdersByOrigin(searchedOrigin);

  function searchById() {
    if (!orderIdInput.trim()) {
      return;
    }
    setSearchedOrderId(orderIdInput.trim());
  }

  function searchByOrigin() {
    if (!originInput.trim()) {
      return;
    }
    setSearchedOrigin(originInput.trim());
  }

  return (
    <div className="dashboard-section">
      <WidgetCard title="Consultar Ordem por identificador">
        <div className="form-grid">
          <Field label="Ordem a consultar" value={orderIdInput} onChange={(event) => setOrderIdInput(event.target.value)} placeholder="Ex.: po-123" />
        </div>
        <Button type="button" variant="primary" disabled={!orderIdInput.trim()} onClick={searchById}>
          Consultar Ordem
        </Button>
      </WidgetCard>

      {searchedOrderId !== undefined && (
        <WidgetCard title={`Ordem ${searchedOrderId.slice(0, 8)}`}>
          {byId.data ? <div className="dashboard-grid">{renderOrder(byId.data)}</div> : <EmptyState title="Nenhuma Ordem de Produção encontrada para este identificador" />}
        </WidgetCard>
      )}

      <WidgetCard title="Consultar Ordens por Order de origem">
        <div className="form-grid">
          <Field label="Order de origem a consultar" value={originInput} onChange={(event) => setOriginInput(event.target.value)} placeholder="Ex.: order-123" />
        </div>
        <Button type="button" variant="secondary" disabled={!originInput.trim()} onClick={searchByOrigin}>
          Consultar por Order
        </Button>
      </WidgetCard>

      {searchedOrigin === undefined ? (
        <Alert tone="info">
          <p>Informe uma Ordem de Produção ou um Order de origem acima para consultar registros reais — não existe uma listagem de Ordens "de toda a Empresa".</p>
        </Alert>
      ) : (byOrigin.data?.length ?? 0) === 0 ? (
        <EmptyState title="Nenhuma Ordem de Produção encontrada para este Order de origem" />
      ) : (
        <WidgetCard title={`Ordens — Order de origem ${searchedOrigin.slice(0, 8)}`}>
          <div className="dashboard-grid">{byOrigin.data!.map(renderOrder)}</div>
        </WidgetCard>
      )}

      <WidgetCard title="Ordens criadas nesta sessão">
        {productionOrdersThisSession.length === 0 ? (
          <EmptyState title="Nenhuma Ordem de Produção criada ainda" description="Use a Ação Rápida 'Nova Ordem de Produção', disponível em qualquer aba deste Workspace." />
        ) : (
          <div className="dashboard-grid">{productionOrdersThisSession.map(renderOrder)}</div>
        )}
      </WidgetCard>
    </div>
  );
}
