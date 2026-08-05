import { useState } from "react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Button } from "@shared/components/ui/Button";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { Field } from "@shared/components/ui/Field";
import { WorkCenterCard } from "@shared/components/ui/WorkCenterCard";
import { useToast } from "@shared/components/ui/toast/useToast";
import type { WorkCenterResponseDto } from "@core/production/production.dto";
import { useCreateWorkCenter } from "@core/production/useCreateWorkCenter";

interface FormState {
  readonly name: string;
  readonly nominalCapacity: string;
}

const EMPTY_FORM: FormState = { name: "", nominalCapacity: "" };

/**
 * Centros de Trabalho (IMP-505) — "Apresentar localização/estação física quando disponível. Nenhuma
 * lógica adicional." `useActiveWorkCenters()` (carregada por `ProductionPage.tsx`) é a Query mais
 * próxima de tenant-wide de todo o Production Hub — nenhum formulário de busca é necessário aqui,
 * mesmo padrão de `LocationsSection.tsx` (Inventory Movement Workspace, mesma Capability opcional).
 * Nenhuma ação de edição/desativação existe — `WorkCenterRepository`/`ProductionManager` (Core,
 * IMP-501) nunca expuseram um Command de atualização para `WorkCenter`, apenas criação; esta seção
 * reflete exatamente essa ausência, nunca inventa uma ação inexistente.
 */
export function WorkCentersSection({
  tenantId,
  activeWorkCenters,
  onLogged,
}: {
  readonly tenantId: string;
  readonly activeWorkCenters: readonly WorkCenterResponseDto[];
  readonly onLogged: (message: string) => void;
}) {
  const { showToast } = useToast();
  const createWorkCenter = useCreateWorkCenter();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  function submit() {
    if (!form.name.trim()) {
      return;
    }
    createWorkCenter.mutate(
      { tenantId, name: form.name.trim(), nominalCapacity: form.nominalCapacity.trim() ? Number(form.nominalCapacity) : undefined },
      {
        onSuccess: (workCenter) => {
          showToast("success", "Centro de Trabalho criado.");
          onLogged(`Centro de Trabalho "${workCenter.name}" criado.`);
          setForm(EMPTY_FORM);
        },
        onError: () => showToast("danger", "Não foi possível criar o Centro de Trabalho."),
      },
    );
  }

  return (
    <div className="dashboard-section">
      <WidgetCard title="Centros de Trabalho ativos">
        {activeWorkCenters.length === 0 ? (
          <EmptyState title="Nenhum Centro de Trabalho criado ainda" description="Um Centro de Trabalho é uma Capability opcional — uma Empresa sem produção segmentada em etapas opera normalmente sem nenhum." />
        ) : (
          <div className="dashboard-grid">
            {activeWorkCenters.map((workCenter) => (
              <WorkCenterCard key={workCenter.workCenterId} workCenterId={workCenter.workCenterId} name={workCenter.name} nominalCapacity={workCenter.nominalCapacity} active={workCenter.active} />
            ))}
          </div>
        )}
      </WidgetCard>

      <WidgetCard title="Criar Centro de Trabalho">
        <div className="form-grid">
          <Field label="Nome" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ex.: Linha 1" />
          <Field label="Capacidade nominal (opcional)" type="number" min={0} value={form.nominalCapacity} onChange={(event) => setForm({ ...form, nominalCapacity: event.target.value })} />
        </div>
        <Button type="button" variant="primary" disabled={!form.name.trim() || createWorkCenter.isPending} onClick={submit}>
          Criar Centro de Trabalho
        </Button>
      </WidgetCard>
    </div>
  );
}
