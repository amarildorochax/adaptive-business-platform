import { useState } from "react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Button } from "@shared/components/ui/Button";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { Field } from "@shared/components/ui/Field";
import { FiscalObligationCard } from "@shared/components/ui/FiscalObligationCard";
import { useToast } from "@shared/components/ui/toast/useToast";
import { useEvaluateFiscalObligations } from "@core/fiscal/useEvaluateFiscalObligations";
import { useFulfillFiscalObligation } from "@core/fiscal/useFulfillFiscalObligation";
import { useOverdueFiscalObligations } from "@core/fiscal/useOverdueFiscalObligations";
import { usePendingFiscalObligations } from "@core/fiscal/usePendingFiscalObligations";
import { useRegisterFiscalObligation } from "@core/fiscal/useRegisterFiscalObligation";

/**
 * Obrigações Acessórias (IMP-605) — registro, listagem real (`Pending`/`Overdue`) e cumprimento.
 * `type`/`periodicity` permanecem texto livre — o Core (IMP-601) não especifica um enum fechado para
 * nenhum dos dois (`FiscalObligation.ts`), esta seção nunca inventa uma restrição estrutural não
 * escrita.
 *
 * **`usePendingFiscalObligations`/`useOverdueFiscalObligations` são Queries reais, mas ficam
 * desatualizadas após qualquer Mutation desta seção** (nenhuma sincronização automática existe —
 * `fiscalCache.ts`, IMP-604, "LIMITAÇÃO DOCUMENTADA": duas chaves fixas e independentes, nenhuma
 * estratégia de remoção entre elas jamais existiu nesta plataforma) — por isso um botão "Atualizar"
 * explícito em cada lista refaz a consulta manualmente após qualquer ação, mesma disciplina de
 * `InProgressSection.tsx` (Production Workspace) diante da mesma classe de limitação em
 * `productionOrdersByStatus`.
 *
 * "Avaliar Vencimentos" (`evaluateFiscalObligations`) não é um dos oito Commands aprovados — uma
 * avaliação em lote que pode transicionar várias Fiscal Obligation de `Pending` para `Overdue`
 * simultaneamente; o resultado (`data.overdue`) é exibido diretamente, mas as duas listas em cache só
 * refletem a mudança depois de "Atualizar", mesma limitação, agravada por afetar potencialmente muitos
 * registros de uma vez.
 */
export function FiscalObligationsSection({ tenantId, onLogged, onRegistered }: { readonly tenantId: string; readonly onLogged: (message: string) => void; readonly onRegistered: () => void }) {
  const { showToast } = useToast();
  const pending = usePendingFiscalObligations();
  const overdue = useOverdueFiscalObligations();
  const registerObligation = useRegisterFiscalObligation();
  const fulfillObligation = useFulfillFiscalObligation();
  const evaluateObligations = useEvaluateFiscalObligations();

  const [form, setForm] = useState({ type: "", periodicity: "", dueDate: "" });

  function submit() {
    if (!form.type.trim() || !form.periodicity.trim() || !form.dueDate) {
      return;
    }
    registerObligation.mutate(
      { tenantId, type: form.type.trim(), periodicity: form.periodicity.trim(), dueDate: new Date(form.dueDate).toISOString() },
      {
        onSuccess: (obligation) => {
          showToast("success", "Fiscal Obligation registrada.");
          onRegistered();
          onLogged(`Obrigação ${obligation.fiscalObligationId.slice(0, 8)} registrada — ${obligation.type}.`);
          setForm({ type: "", periodicity: "", dueDate: "" });
        },
        onError: () => showToast("danger", "Não foi possível registrar a Fiscal Obligation."),
      },
    );
  }

  function fulfill(fiscalObligationId: string) {
    fulfillObligation.mutate(fiscalObligationId, {
      onSuccess: (obligation) => {
        showToast("success", "Fiscal Obligation cumprida.");
        onLogged(`Obrigação ${obligation.fiscalObligationId.slice(0, 8)} cumprida.`);
      },
      onError: () => showToast("danger", "Não foi possível cumprir a Fiscal Obligation."),
    });
  }

  function evaluate() {
    evaluateObligations.mutate(
      {},
      {
        onSuccess: (result) => {
          showToast("info", `${result.overdue.length} Fiscal Obligation(s) vencida(s) nesta avaliação.`);
          onLogged(`Avaliação de vencimentos executada — ${result.overdue.length} obrigação(ões) transicionada(s) para Overdue.`);
        },
        onError: () => showToast("danger", "Não foi possível avaliar os vencimentos."),
      },
    );
  }

  return (
    <div className="dashboard-section">
      <WidgetCard title="Registrar Fiscal Obligation">
        <div className="form-grid">
          <Field label="Tipo" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} placeholder="Ex.: ICMS" />
          <Field label="Periodicidade" value={form.periodicity} onChange={(event) => setForm({ ...form, periodicity: event.target.value })} placeholder="Ex.: Mensal" />
          <Field label="Data de vencimento" type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} />
        </div>
        <Button type="button" variant="primary" disabled={!form.type.trim() || !form.periodicity.trim() || !form.dueDate || registerObligation.isPending} onClick={submit}>
          Registrar Fiscal Obligation
        </Button>
      </WidgetCard>

      <WidgetCard title="Obrigações Pendentes">
        <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
          <Button type="button" variant="secondary" size="sm" onClick={() => void pending.refetch()}>
            Atualizar Pendentes
          </Button>
          <Button type="button" variant="secondary" size="sm" disabled={evaluateObligations.isPending} onClick={evaluate}>
            Avaliar Vencimentos
          </Button>
        </div>
        {(pending.data?.length ?? 0) === 0 ? (
          <EmptyState title="Nenhuma Fiscal Obligation pendente" />
        ) : (
          <div className="dashboard-grid">
            {pending.data!.map((obligation) => (
              <div key={obligation.fiscalObligationId}>
                <FiscalObligationCard fiscalObligationId={obligation.fiscalObligationId} type={obligation.type} periodicity={obligation.periodicity} dueDate={obligation.dueDate} status={obligation.status} />
                <div style={{ marginTop: 8 }}>
                  <Button type="button" variant="ghost" size="sm" disabled={fulfillObligation.isPending} onClick={() => fulfill(obligation.fiscalObligationId)}>
                    Cumprir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </WidgetCard>

      <WidgetCard title="Obrigações Vencidas">
        <div style={{ marginBottom: 12 }}>
          <Button type="button" variant="secondary" size="sm" onClick={() => void overdue.refetch()}>
            Atualizar Vencidas
          </Button>
        </div>
        {(overdue.data?.length ?? 0) === 0 ? (
          <EmptyState title="Nenhuma Fiscal Obligation vencida" />
        ) : (
          <div className="dashboard-grid">
            {overdue.data!.map((obligation) => (
              <div key={obligation.fiscalObligationId}>
                <FiscalObligationCard fiscalObligationId={obligation.fiscalObligationId} type={obligation.type} periodicity={obligation.periodicity} dueDate={obligation.dueDate} status={obligation.status} />
                <div style={{ marginTop: 8 }}>
                  <Button type="button" variant="ghost" size="sm" disabled={fulfillObligation.isPending} onClick={() => fulfill(obligation.fiscalObligationId)}>
                    Cumprir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </WidgetCard>
    </div>
  );
}
