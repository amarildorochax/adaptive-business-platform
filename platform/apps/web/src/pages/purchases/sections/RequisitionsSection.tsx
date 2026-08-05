import { useState } from "react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Button } from "@shared/components/ui/Button";
import { Drawer } from "@shared/components/ui/Drawer";
import { Field } from "@shared/components/ui/Field";
import { RequisitionStatusBadge } from "@shared/components/ui/RequisitionStatusBadge";
import { Select } from "@shared/components/ui/Select";
import { Table, type TableColumn } from "@shared/components/ui/Table";
import { useToast } from "@shared/components/ui/toast/useToast";
import type { PurchaseRequisitionResponseDto, PurchaseRequisitionLineDto } from "@core/purchase/purchase.dto";
import { useApprovePurchaseRequisition } from "@core/purchase/useApprovePurchaseRequisition";
import { useConvertRequisitionToPurchaseOrder } from "@core/purchase/useConvertRequisitionToPurchaseOrder";
import { usePurchaseRequisitions, type PurchaseRequisitionStatusFilter } from "@core/purchase/usePurchaseRequisitions";
import { useRejectPurchaseRequisition } from "@core/purchase/useRejectPurchaseRequisition";

const STATUS_OPTIONS: readonly PurchaseRequisitionStatusFilter[] = ["Open", "Approved", "Rejected", "ConvertedToPurchaseOrder"];
const STATUS_LABEL: Record<PurchaseRequisitionStatusFilter, string> = { Open: "Abertas", Approved: "Aprovadas", Rejected: "Rejeitadas", ConvertedToPurchaseOrder: "Convertidas" };

interface ConvertFormState {
  readonly supplierId: string;
  readonly currencyCode: string;
  readonly costs: Record<string, string>;
}

/**
 * Requisições (IMP-305) — tabela real filtrada por status (`usePurchaseRequisitions(tenantId, status)`
 * — `PurchaseManager.listPurchaseRequisitionsByStatus` exige um status explícito, nunca "todos",
 * mesma limitação já documentada em `core/purchase/`, IMP-304). Ações reais: Criar
 * (`useCreatePurchaseRequisition`), Aprovar (`useApprovePurchaseRequisition`), Rejeitar
 * (`useRejectPurchaseRequisition`), Converter em Pedido (`useConvertRequisitionToPurchaseOrder`,
 * apenas sobre Requisition já Aprovada). **Nenhum botão "Editar" ou "Cancelar"** — `PurchaseManager`
 * (Core, IMP-301) nunca expôs nenhum Command de atualização parcial nem de cancelamento para
 * Purchase Requisition (apenas Create/Approve/Reject/Convert) — per instrução explícita desta Sprint
 * ("Somente ações realmente suportadas"), nenhuma das duas é exibida.
 */
export function RequisitionsSection({
  tenantId,
  onCreateRequested,
  onLogged,
}: {
  readonly tenantId: string;
  readonly onCreateRequested: () => void;
  readonly onLogged: (message: string) => void;
}) {
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState<PurchaseRequisitionStatusFilter>("Open");
  const requisitions = usePurchaseRequisitions(tenantId, statusFilter);
  const approveRequisition = useApprovePurchaseRequisition();
  const rejectRequisition = useRejectPurchaseRequisition();
  const convertRequisition = useConvertRequisitionToPurchaseOrder();

  const [converting, setConverting] = useState<PurchaseRequisitionResponseDto | undefined>(undefined);
  const [convertForm, setConvertForm] = useState<ConvertFormState>({ supplierId: "", currencyCode: "BRL", costs: {} });

  function openConvert(requisition: PurchaseRequisitionResponseDto) {
    setConvertForm({ supplierId: "", currencyCode: "BRL", costs: Object.fromEntries(requisition.lines.map((line) => [line.productId, ""])) });
    setConverting(requisition);
  }

  function submitConvert() {
    if (!converting || !convertForm.supplierId.trim()) {
      return;
    }
    const acquisitionCosts = converting.lines
      .filter((line) => convertForm.costs[line.productId])
      .map((line) => ({ productId: line.productId, cost: { amount: Number(convertForm.costs[line.productId]), currencyCode: convertForm.currencyCode } }));

    convertRequisition.mutate(
      { requisitionId: converting.requisitionId, payload: { supplierId: convertForm.supplierId.trim(), acquisitionCosts } },
      {
        onSuccess: (conversion) => {
          showToast("success", `Requisição convertida no Pedido ${conversion.purchaseOrder.purchaseOrderId.slice(0, 8)}.`);
          onLogged(`Requisição convertida no Pedido ${conversion.purchaseOrder.purchaseOrderId.slice(0, 8)}.`);
          setConverting(undefined);
        },
        onError: () => showToast("danger", "Não foi possível converter a Requisição — confirme o custo de cada Produto."),
      },
    );
  }

  const columns: readonly TableColumn<PurchaseRequisitionResponseDto>[] = [
    { key: "requisitionId", header: "Requisição", render: (row) => row.requisitionId.slice(0, 8), sortValue: (row) => row.requisitionId },
    { key: "origin", header: "Origem", render: (row) => row.origin, sortValue: (row) => row.origin },
    { key: "status", header: "Status", render: (row) => <RequisitionStatusBadge status={row.status} /> },
    { key: "lines", header: "Produtos", render: (row) => row.lines.length, sortValue: (row) => row.lines.length },
    { key: "createdAt", header: "Criada em", render: (row) => new Date(row.createdAt).toLocaleDateString("pt-BR"), sortValue: (row) => row.createdAt },
  ];

  return (
    <div className="dashboard-section">
      <WidgetCard title="Requisições de Compra">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
          <Select label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as PurchaseRequisitionStatusFilter)}>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABEL[status]}
              </option>
            ))}
          </Select>
          <Button type="button" variant="primary" onClick={onCreateRequested}>
            Nova Requisição
          </Button>
        </div>
        <Table
          columns={columns}
          rows={requisitions.data ?? []}
          getRowId={(row) => row.requisitionId}
          searchPlaceholder="Buscar por identificador…"
          searchText={(row) => `${row.requisitionId} ${row.origin}`}
          emptyTitle={`Nenhuma Requisição ${STATUS_LABEL[statusFilter].toLowerCase()} ainda`}
          rowActions={(row) => (
            <div style={{ display: "flex", gap: 8 }}>
              {row.status === "Open" && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      approveRequisition.mutate(row.requisitionId, {
                        onSuccess: () => {
                          showToast("success", "Requisição aprovada.");
                          onLogged(`Requisição ${row.requisitionId.slice(0, 8)} aprovada.`);
                        },
                        onError: () => showToast("danger", "Não foi possível aprovar a Requisição."),
                      })
                    }
                  >
                    Aprovar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      rejectRequisition.mutate(row.requisitionId, {
                        onSuccess: () => {
                          showToast("success", "Requisição rejeitada.");
                          onLogged(`Requisição ${row.requisitionId.slice(0, 8)} rejeitada.`);
                        },
                        onError: () => showToast("danger", "Não foi possível rejeitar a Requisição."),
                      })
                    }
                  >
                    Rejeitar
                  </Button>
                </>
              )}
              {row.status === "Approved" && (
                <Button type="button" variant="ghost" size="sm" onClick={() => openConvert(row)}>
                  Converter em Pedido
                </Button>
              )}
            </div>
          )}
        />
      </WidgetCard>

      <Drawer open={converting !== undefined} onClose={() => setConverting(undefined)} title="Converter Requisição em Pedido">
        {converting && (
          <div className="form-grid">
            <Field label="Identificador do Fornecedor" value={convertForm.supplierId} onChange={(event) => setConvertForm({ ...convertForm, supplierId: event.target.value })} placeholder="Ex.: supplier-123" />
            <Field label="Moeda" value={convertForm.currencyCode} onChange={(event) => setConvertForm({ ...convertForm, currencyCode: event.target.value })} placeholder="BRL" />
            {converting.lines.map((line: PurchaseRequisitionLineDto) => (
              <Field
                key={line.productId}
                label={`Custo de aquisição — ${line.productId} (${line.suggestedQuantity} un.)`}
                type="number"
                min={0}
                step="0.01"
                value={convertForm.costs[line.productId] ?? ""}
                onChange={(event) => setConvertForm({ ...convertForm, costs: { ...convertForm.costs, [line.productId]: event.target.value } })}
              />
            ))}
          </div>
        )}
        <Button type="button" variant="primary" disabled={!convertForm.supplierId.trim() || convertRequisition.isPending} onClick={submitConvert}>
          Converter
        </Button>
      </Drawer>
    </div>
  );
}
