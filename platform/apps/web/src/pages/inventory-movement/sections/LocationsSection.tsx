import { useState } from "react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Button } from "@shared/components/ui/Button";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { Field } from "@shared/components/ui/Field";
import { LocationCard } from "@shared/components/ui/LocationCard";
import { useToast } from "@shared/components/ui/toast/useToast";
import type { StockLocationResponseDto } from "@core/inventory-movement/inventoryMovement.dto";
import { useCreateStockLocation } from "@core/inventory-movement/useCreateStockLocation";

interface FormState {
  readonly name: string;
  readonly addressLine: string;
}

const EMPTY_FORM: FormState = { name: "", addressLine: "" };

/**
 * Localizações (IMP-405) — "Apresentar localização física quando disponível. Nenhuma lógica
 * adicional." `useActiveStockLocations(tenantId)` (carregada por `InventoryMovementPage.tsx`) é a
 * única Query genuinamente tenant-wide de todo o Inventory Movement Hub — nenhum formulário de busca
 * é necessário aqui, diferente de Movimentações/Posições/Reservas. Nenhuma ação de edição/desativação
 * existe — `StockLocationRepository`/`InventoryMovementManager` (Core, IMP-401) nunca expuseram um
 * Command de atualização para `StockLocation`, apenas criação; esta seção reflete exatamente essa
 * ausência, nunca inventa uma ação inexistente.
 */
export function LocationsSection({
  tenantId,
  activeLocations,
  onLogged,
}: {
  readonly tenantId: string;
  readonly activeLocations: readonly StockLocationResponseDto[];
  readonly onLogged: (message: string) => void;
}) {
  const { showToast } = useToast();
  const createLocation = useCreateStockLocation();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  function submit() {
    if (!form.name.trim()) {
      return;
    }
    createLocation.mutate(
      { tenantId, name: form.name.trim(), address: form.addressLine.trim() ? { line: form.addressLine.trim() } : undefined },
      {
        onSuccess: (location) => {
          showToast("success", "Localização criada.");
          onLogged(`Localização "${location.name}" criada.`);
          setForm(EMPTY_FORM);
        },
        onError: () => showToast("danger", "Não foi possível criar a Localização."),
      },
    );
  }

  return (
    <div className="dashboard-section">
      <WidgetCard title="Localizações ativas">
        {activeLocations.length === 0 ? (
          <EmptyState title="Nenhuma Localização criada ainda" description="Uma Localização é uma Capability opcional — uma Empresa de ponto único opera normalmente sem nenhuma." />
        ) : (
          <div className="dashboard-grid">
            {activeLocations.map((location) => (
              <LocationCard key={location.locationId} locationId={location.locationId} name={location.name} addressLine={location.address?.line} active={location.active} />
            ))}
          </div>
        )}
      </WidgetCard>

      <WidgetCard title="Criar Localização">
        <div className="form-grid">
          <Field label="Nome" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ex.: Depósito Central" />
          <Field label="Endereço (opcional)" value={form.addressLine} onChange={(event) => setForm({ ...form, addressLine: event.target.value })} placeholder="Ex.: Rua das Flores, 123" />
        </div>
        <Button type="button" variant="primary" disabled={!form.name.trim() || createLocation.isPending} onClick={submit}>
          Criar Localização
        </Button>
      </WidgetCard>
    </div>
  );
}
