import { WidgetCard } from "@shared/components/WidgetCard";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";

/**
 * Reservas (FUN-105) — inteiramente placeholder. `packages/commerce-hub` não modela nenhum campo de
 * reserva em `Inventory`; `COMMERCE_HUB_ARCHITECTURE.md` descreve o fluxo "reservado no Checkout →
 * decrementado em OrderPaid → revertido em ReturnApproved" (capítulo de Inventory & Stock Movement),
 * mas nenhuma parte dele foi implementada — `Checkout` em si está fora de escopo desde a IMP-006 (ver
 * `COMMERCE_CORE_MIGRATION_REPORT.md`, "Componentes Ausentes"). `ReservationBadge` (novo, FUN-105) já
 * existe pronto para o dia em que essa modelagem existir; nenhum dado fabricado é exibido aqui.
 */
export function ReservationsSection() {
  return (
    <div className="dashboard-section">
      <NotConnectedNotice fields={["Reservas de estoque"]} context="Commerce Hub" />
      <WidgetCard title="Reservas">
        <EmptyState title="Reservas ainda não são suportadas" description="Nenhum campo de reserva existe em Inventory; o fluxo de reserva via Checkout descrito na arquitetura nunca foi implementado." />
      </WidgetCard>
    </div>
  );
}
