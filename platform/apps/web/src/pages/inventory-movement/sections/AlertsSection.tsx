import { useState } from "react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { AlertRuleCard } from "@shared/components/ui/AlertRuleCard";
import { Button } from "@shared/components/ui/Button";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { Field } from "@shared/components/ui/Field";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { useToast } from "@shared/components/ui/toast/useToast";
import type { StockAlertRuleResponseDto } from "@core/inventory-movement/inventoryMovement.dto";
import { useCreateStockAlertRule } from "@core/inventory-movement/useCreateStockAlertRule";
import { useDeactivateStockAlertRule } from "@core/inventory-movement/useDeactivateStockAlertRule";

interface FormState {
  readonly productId: string;
  readonly locationId: string;
  readonly thresholdQuantity: string;
}

const EMPTY_FORM: FormState = { productId: "", locationId: "", thresholdQuantity: "10" };

/**
 * Alertas (IMP-405) — "Mostrar apenas regras e alertas reais. Nenhuma IA. Nenhuma previsão. Nenhuma
 * recomendação inventada." `InventoryMovementManager` nunca expôs nenhuma Query de listagem/detalhe
 * para `StockAlertRule` (apenas `createStockAlertRule`/`deactivateStockAlertRule`, ambas Mutations) —
 * mesma disciplina honesta já aplicada à Reposição do Purchase Workspace (`ReorderRule`, mesma
 * ausência): as Regras exibidas abaixo existem apenas nesta sessão do navegador,
 * `NotConnectedNotice` explica.
 *
 * **Limitação adicional, real e distinta da ausência de listagem** — encontrada por auditoria desta
 * Sprint: mesmo quando um `StockAlertRule` genuinamente dispara no servidor (`StockAlertTriggered`,
 * avaliado internamente por `StockAlertEvaluationService` a cada `registerStockMovement`/
 * `convertReservationToMovement`, Core), esse Evento nunca atravessa HTTP — `RegisterStockMovementResponseDto`/
 * `ConvertReservationToMovementResponseDto` (IMP-403) carregam apenas `{movement, position}`/
 * `{reservation, movement, position}`, nunca um sinal de alerta disparado. Esta seção nunca simula um
 * disparo — nenhuma notificação de "Alerta disparado" aparece em nenhum lugar deste Workspace, mesmo
 * que o servidor tenha genuinamente avaliado e disparado a Regra internamente.
 */
export function AlertsSection({ tenantId, onLogged }: { readonly tenantId: string; readonly onLogged: (message: string) => void }) {
  const { showToast } = useToast();
  const createRule = useCreateStockAlertRule();
  const deactivateRule = useDeactivateStockAlertRule();

  const [rules, setRules] = useState<readonly StockAlertRuleResponseDto[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  function submitCreate() {
    if (!form.productId.trim() || !form.thresholdQuantity) {
      return;
    }
    createRule.mutate(
      { tenantId, productId: form.productId.trim(), locationId: form.locationId.trim() || undefined, thresholdQuantity: Number(form.thresholdQuantity) },
      {
        onSuccess: (rule) => {
          showToast("success", "Alert Rule criada.");
          onLogged(`Alert Rule para "${rule.productId}" criada — limite ${rule.thresholdQuantity}.`);
          setRules((current) => [rule, ...current]);
          setForm(EMPTY_FORM);
        },
        onError: () => showToast("danger", "Não foi possível criar a Alert Rule."),
      },
    );
  }

  function deactivate(rule: StockAlertRuleResponseDto) {
    deactivateRule.mutate(rule.ruleId, {
      onSuccess: (updated) => {
        showToast("success", "Alert Rule desativada.");
        onLogged(`Alert Rule para "${updated.productId}" desativada.`);
        setRules((current) => current.map((candidate) => (candidate.ruleId === updated.ruleId ? updated : candidate)));
      },
      onError: () => showToast("danger", "Não foi possível desativar a Alert Rule."),
    });
  }

  return (
    <div className="dashboard-section">
      <NotConnectedNotice fields={["Listagem de Stock Alert Rule já existentes", "Notificação real de StockAlertTriggered"]} context="Inventory Movement Hub" />

      <WidgetCard title="Regras criadas nesta sessão">
        {rules.length === 0 ? (
          <EmptyState title="Nenhuma Alert Rule criada ainda" description="Crie uma Regra no formulário abaixo." />
        ) : (
          <div className="dashboard-grid">
            {rules.map((rule) => (
              <div key={rule.ruleId}>
                <AlertRuleCard ruleId={rule.ruleId} productId={rule.productId} thresholdQuantity={rule.thresholdQuantity} active={rule.active} />
                {rule.active && (
                  <div style={{ marginTop: 8 }}>
                    <Button type="button" variant="ghost" size="sm" onClick={() => deactivate(rule)}>
                      Desativar
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </WidgetCard>

      <WidgetCard title="Criar Alert Rule">
        <div className="form-grid">
          <Field label="Identificador do Produto" value={form.productId} onChange={(event) => setForm({ ...form, productId: event.target.value })} placeholder="Ex.: product-123" />
          <Field label="Localização (opcional)" value={form.locationId} onChange={(event) => setForm({ ...form, locationId: event.target.value })} placeholder="Ex.: location-123" />
          <Field label="Quantidade limite" type="number" min={0} value={form.thresholdQuantity} onChange={(event) => setForm({ ...form, thresholdQuantity: event.target.value })} />
        </div>
        <Button type="button" variant="secondary" disabled={!form.productId.trim() || createRule.isPending} onClick={submitCreate}>
          Criar Regra
        </Button>
      </WidgetCard>
    </div>
  );
}
