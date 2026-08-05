import { useState } from "react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Alert } from "@shared/components/ui/Alert";
import { Button } from "@shared/components/ui/Button";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { Field } from "@shared/components/ui/Field";
import { ReservationCard } from "@shared/components/ui/ReservationCard";
import { useToast } from "@shared/components/ui/toast/useToast";
import type { StockReservationResponseDto } from "@core/inventory-movement/inventoryMovement.dto";
import { useConvertReservationToMovement } from "@core/inventory-movement/useConvertReservationToMovement";
import { useCreateStockReservation } from "@core/inventory-movement/useCreateStockReservation";
import { useReleaseStockReservation } from "@core/inventory-movement/useReleaseStockReservation";
import { useStockReservationsByOrder } from "@core/inventory-movement/useStockReservationsByOrder";

interface CreateFormState {
  readonly productId: string;
  readonly locationId: string;
  readonly quantity: string;
  readonly orderId: string;
}

const EMPTY_FORM: CreateFormState = { productId: "", locationId: "", quantity: "1", orderId: "" };

/**
 * Reservas (IMP-405) — "Consumir exclusivamente os dados disponíveis." `useStockReservationsByOrder`
 * exige um `orderId` conhecido — mesma ausência real de Query tenant-wide já documentada em
 * `InventoryMovementPage.tsx`. Ações reais por Reserva, condicionadas ao status atual — exatamente a
 * máquina de estados já validada em `InventoryPolicy.canTransitionReservationStatus` (Core, IMP-401),
 * nunca uma regra de negócio nova nesta camada: "Liberar"/"Converter" aparecem apenas quando
 * `status === "Active"`; se o servidor rejeitar (ex.: corrida entre duas abas), o erro real
 * (`ApiError`) aparece via toast, nunca escondido.
 */
export function ReservationsSection({
  tenantId,
  onLogged,
  onReservationChanged,
}: {
  readonly tenantId: string;
  readonly onLogged: (message: string) => void;
  readonly onReservationChanged: (reservation: StockReservationResponseDto) => void;
}) {
  const { showToast } = useToast();
  const createReservation = useCreateStockReservation();
  const releaseReservation = useReleaseStockReservation();
  const convertReservation = useConvertReservationToMovement();

  const [form, setForm] = useState<CreateFormState>(EMPTY_FORM);
  const [searchedOrderId, setSearchedOrderId] = useState<string | undefined>(undefined);
  const [orderIdInput, setOrderIdInput] = useState("");

  const reservations = useStockReservationsByOrder(searchedOrderId);

  function submitCreate() {
    if (!form.productId.trim() || !form.quantity || !form.orderId.trim()) {
      return;
    }
    createReservation.mutate(
      { tenantId, productId: form.productId.trim(), locationId: form.locationId.trim() || undefined, quantity: Number(form.quantity), orderId: form.orderId.trim() },
      {
        onSuccess: (reservation) => {
          showToast("success", "Reserva criada.");
          onReservationChanged(reservation);
          onLogged(`Reserva ${reservation.reservationId.slice(0, 8)} criada para o Produto ${reservation.productId.slice(0, 8)} (${reservation.quantity} un.).`);
          setForm(EMPTY_FORM);
          setSearchedOrderId(reservation.orderId);
          setOrderIdInput(reservation.orderId);
        },
        onError: () => showToast("danger", "Não foi possível criar a Reserva — a quantidade pode exceder o disponível em estoque."),
      },
    );
  }

  function search() {
    if (!orderIdInput.trim()) {
      return;
    }
    setSearchedOrderId(orderIdInput.trim());
  }

  function release(reservation: StockReservationResponseDto) {
    releaseReservation.mutate(reservation.reservationId, {
      onSuccess: (updated) => {
        showToast("success", "Reserva liberada.");
        onReservationChanged(updated);
        onLogged(`Reserva ${updated.reservationId.slice(0, 8)} liberada.`);
      },
      onError: () => showToast("danger", "Não foi possível liberar a Reserva."),
    });
  }

  function convert(reservation: StockReservationResponseDto) {
    convertReservation.mutate(reservation.reservationId, {
      onSuccess: (result) => {
        showToast("success", "Reserva convertida em Stock Movement de saída.");
        onReservationChanged(result.reservation);
        onLogged(`Reserva ${result.reservation.reservationId.slice(0, 8)} convertida em movimento de saída (${result.movement.quantityDelta} un.).`);
      },
      onError: () => showToast("danger", "Não foi possível converter a Reserva."),
    });
  }

  return (
    <div className="dashboard-section">
      <WidgetCard title="Criar Reserva">
        <div className="form-grid">
          <Field label="Identificador do Produto" value={form.productId} onChange={(event) => setForm({ ...form, productId: event.target.value })} placeholder="Ex.: product-123" />
          <Field label="Localização (opcional)" value={form.locationId} onChange={(event) => setForm({ ...form, locationId: event.target.value })} placeholder="Ex.: location-123" />
          <Field label="Quantidade" type="number" min={1} value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} />
          <Field label="Identificador do Order" value={form.orderId} onChange={(event) => setForm({ ...form, orderId: event.target.value })} placeholder="Ex.: order-123" />
        </div>
        <Button type="button" variant="primary" disabled={!form.productId.trim() || !form.orderId.trim() || createReservation.isPending} onClick={submitCreate}>
          Criar Reserva
        </Button>
      </WidgetCard>

      <WidgetCard title="Consultar Reservas por Order">
        <div className="form-grid">
          {/* "Order a consultar", nunca "Identificador do Order" (repetido do card "Criar Reserva" acima) —
              achado real de auditoria (Passo 1), corrigido nesta Sprint: os dois campos ficavam
              simultaneamente montados na mesma seção com o mesmo nome acessível, uma ambiguidade real
              (getByLabelText("Identificador do Order") deixava de identificar um único elemento), mesma
              classe de achado já registrada em CreateStockMovementDrawer.tsx. */}
          <Field label="Order a consultar" value={orderIdInput} onChange={(event) => setOrderIdInput(event.target.value)} placeholder="Ex.: order-123" />
        </div>
        <Button type="button" variant="secondary" disabled={!orderIdInput.trim()} onClick={search}>
          Consultar Reservas
        </Button>
      </WidgetCard>

      {searchedOrderId === undefined ? (
        <Alert tone="info">
          <p>Informe um Order acima para consultar suas Reservas reais — não existe uma listagem de Reservas "de toda a Empresa", apenas por Order.</p>
        </Alert>
      ) : (reservations.data?.length ?? 0) === 0 ? (
        <EmptyState title="Nenhuma Reserva encontrada para este Order" />
      ) : (
        <WidgetCard title={`Reservas — Order ${searchedOrderId.slice(0, 8)}`}>
          <div className="dashboard-grid">
            {reservations.data!.map((reservation) => (
              <div key={reservation.reservationId}>
                <ReservationCard reservationId={reservation.reservationId} productId={reservation.productId} quantity={reservation.quantity} orderId={reservation.orderId} status={reservation.status} />
                {reservation.status === "Active" && (
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <Button type="button" variant="ghost" size="sm" onClick={() => release(reservation)}>
                      Liberar
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => convert(reservation)}>
                      Converter em Saída
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </WidgetCard>
      )}
    </div>
  );
}
