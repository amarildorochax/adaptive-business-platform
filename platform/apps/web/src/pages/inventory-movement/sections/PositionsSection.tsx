import { useState } from "react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Alert } from "@shared/components/ui/Alert";
import { Button } from "@shared/components/ui/Button";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { Field } from "@shared/components/ui/Field";
import { KPIGrid } from "@shared/components/ui/KPIGrid";
import { MetricCard } from "@shared/components/ui/MetricCard";
import { useStockPosition } from "@core/inventory-movement/useStockPosition";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

/**
 * Posições (IMP-405) — "Mostrar apenas posições reais retornadas pelo domínio. Nunca recalcular saldo
 * na UI." `useStockPosition` devolve exatamente `StockPositionResponseDto` já calculado por
 * `SqliteStockPositionRepository.recalculate` (`SUM(quantity_delta)` real em SQL, IMP-402) — esta
 * seção nunca soma `quantityDelta` por conta própria para produzir `quantityOnHand`; os três números
 * exibidos são lidos diretamente da resposta HTTP, nunca derivados aqui.
 *
 * **Limitação real do domínio, encontrada por auditoria desta Sprint (Passo 1) — nunca corrigida
 * silenciosamente**: `InventoryMovementManager.createStockReservation`/`releaseStockReservation`
 * (Core, IMP-401) nunca chamam `StockPositionProjectionService.recalculate` — apenas
 * `registerStockMovement`/`convertReservationToMovement` o fazem. Isso significa que
 * `quantityReserved`/`quantityAvailable` exibidos abaixo só refletem uma Reservation criada/liberada
 * depois que o próximo Movement/Conversion real recalcular a posição — nunca imediatamente após criar
 * ou liberar uma Reserva. Esta seção nunca tenta mascarar essa defasagem (nenhum recálculo client-side,
 * nenhum "otimistic update") — o `Alert` abaixo comunica exatamente essa realidade.
 */
export function PositionsSection() {
  const [productId, setProductId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [searchedProductId, setSearchedProductId] = useState<string | undefined>(undefined);
  const [searchedLocationId, setSearchedLocationId] = useState<string | undefined>(undefined);

  const position = useStockPosition(searchedProductId, searchedLocationId);

  function search() {
    if (!productId.trim()) {
      return;
    }
    setSearchedProductId(productId.trim());
    setSearchedLocationId(locationId.trim() || undefined);
  }

  return (
    <div className="dashboard-section">
      <WidgetCard title="Consultar a Stock Position de um Produto">
        <div className="form-grid">
          <Field label="Identificador do Produto" value={productId} onChange={(event) => setProductId(event.target.value)} placeholder="Ex.: product-123" />
          <Field label="Localização (opcional)" value={locationId} onChange={(event) => setLocationId(event.target.value)} placeholder="Ex.: location-123" />
        </div>
        <Button type="button" variant="primary" disabled={!productId.trim()} onClick={search}>
          Consultar Posição
        </Button>
      </WidgetCard>

      {searchedProductId === undefined ? (
        <Alert tone="info">
          <p>Informe um Produto acima para consultar sua Stock Position real — não existe uma posição consolidada "de toda a Empresa", apenas por Produto/Localização.</p>
        </Alert>
      ) : position.isLoading ? (
        <EmptyState title="Consultando…" />
      ) : position.data === undefined ? (
        <EmptyState title="Nenhuma Stock Position calculada ainda para este Produto" description="Uma Position só existe depois do primeiro Stock Movement registrado para este Produto/Localização." />
      ) : (
        <>
          <WidgetCard title={`Stock Position — Produto ${searchedProductId.slice(0, 8)}`}>
            <KPIGrid>
              <MetricCard label="Em mãos" value={String(position.data.quantityOnHand)} tone="primary" />
              <MetricCard label="Reservado" value={String(position.data.quantityReserved)} tone="warning" />
              <MetricCard label="Disponível" value={String(position.data.quantityAvailable)} tone={position.data.quantityAvailable > 0 ? "success" : "danger"} />
            </KPIGrid>
            <p>Recalculada em: {formatDateTime(position.data.recalculatedAt)}</p>
          </WidgetCard>

          <Alert tone="info">
            <p>
              "Reservado"/"Disponível" refletem apenas as Reservas já existentes no momento do último Stock Movement registrado para este Produto — uma Reserva criada ou liberada depois disso só
              aparece aqui após um novo Movement recalcular a posição (limitação real do domínio, Core — nunca corrigida nesta camada).
            </p>
          </Alert>
        </>
      )}
    </div>
  );
}
