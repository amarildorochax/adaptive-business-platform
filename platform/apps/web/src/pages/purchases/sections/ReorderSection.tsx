import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Badge } from "@shared/components/ui/Badge";
import { Button } from "@shared/components/ui/Button";
import { Drawer } from "@shared/components/ui/Drawer";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { Field } from "@shared/components/ui/Field";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { useToast } from "@shared/components/ui/toast/useToast";
import type { EvaluateReorderRuleResponseDto, ReorderRuleResponseDto } from "@core/purchase/purchase.dto";
import { useCreateReorderRule } from "@core/purchase/useCreateReorderRule";
import { useDeactivateReorderRule } from "@core/purchase/useDeactivateReorderRule";
import { useEvaluateReorderRule } from "@core/purchase/useEvaluateReorderRule";

interface CreateFormState {
  readonly productId: string;
  readonly thresholdQuantity: string;
  readonly reorderQuantity: string;
  readonly preferredSupplierId: string;
}

const EMPTY_FORM: CreateFormState = { productId: "", thresholdQuantity: "10", reorderQuantity: "50", preferredSupplierId: "" };

/**
 * Reposição (IMP-305) — "Mostrar apenas o resultado real de `evaluateReorderRule()`. Nenhuma
 * recomendação de IA. Nenhuma simulação." `PurchaseManager` nunca expôs nenhuma Query de
 * listagem/detalhe para `ReorderRule` (apenas `createReorderRule`/`deactivateReorderRule`/
 * `evaluateReorderRule`, todas Mutations) — mesma disciplina honesta já aplicada por
 * Contratos/Catálogo do Supplier Workspace (IMP-205): as Regras exibidas abaixo existem apenas
 * nesta sessão do navegador, `NotConnectedNotice` explica.
 *
 * `evaluateReorderRule` exige a quantidade em estoque corrente como parâmetro explícito do
 * chamador — `ReorderEvaluationService` (Core, IMP-301) não tem nenhuma inscrição real em evento de
 * estoque, porque o Inventory Movement Hub ainda não existe como código (limite de domínio já
 * documentado desde o Core). O campo "Quantidade em estoque corrente" abaixo é, portanto, sempre um
 * input manual real do usuário — nunca uma simulação, nunca uma recomendação de IA; o resultado
 * exibido é exatamente o que `POST /reorder-rules/:ruleId/evaluate` devolveu.
 */
export function ReorderSection({ tenantId, onLogged }: { readonly tenantId: string; readonly onLogged: (message: string) => void }) {
  const { showToast } = useToast();
  const createRule = useCreateReorderRule();
  const deactivateRule = useDeactivateReorderRule();
  const evaluateRule = useEvaluateReorderRule();

  const [rules, setRules] = useState<readonly ReorderRuleResponseDto[]>([]);
  const [form, setForm] = useState<CreateFormState>(EMPTY_FORM);

  const [evaluatingRuleId, setEvaluatingRuleId] = useState<string | undefined>(undefined);
  const [currentQuantity, setCurrentQuantity] = useState("0");
  const [lastEvaluation, setLastEvaluation] = useState<EvaluateReorderRuleResponseDto | undefined>(undefined);

  function submitCreate() {
    if (!form.productId.trim() || !form.thresholdQuantity || !form.reorderQuantity) {
      return;
    }
    createRule.mutate(
      {
        tenantId,
        productId: form.productId.trim(),
        thresholdQuantity: Number(form.thresholdQuantity),
        reorderQuantity: Number(form.reorderQuantity),
        preferredSupplierId: form.preferredSupplierId.trim() || undefined,
      },
      {
        onSuccess: (rule) => {
          showToast("success", "Reorder Rule criada.");
          onLogged(`Reorder Rule para "${rule.productId}" criada.`);
          setRules((current) => [rule, ...current]);
          setForm(EMPTY_FORM);
        },
        onError: () => showToast("danger", "Não foi possível criar a Reorder Rule."),
      },
    );
  }

  function submitEvaluate() {
    if (!evaluatingRuleId) {
      return;
    }
    evaluateRule.mutate(
      { ruleId: evaluatingRuleId, payload: { currentQuantity: Number(currentQuantity) } },
      {
        onSuccess: (evaluation) => {
          setLastEvaluation(evaluation);
          onLogged(
            evaluation.triggered
              ? `Reorder Rule "${evaluation.rule.productId}" disparou — Requisição ${evaluation.requisition?.requisitionId.slice(0, 8) ?? ""} criada.`
              : `Reorder Rule "${evaluation.rule.productId}" avaliada — não disparou.`,
          );
        },
        onError: () => showToast("danger", "Não foi possível avaliar a Reorder Rule."),
      },
    );
  }

  function deactivate(rule: ReorderRuleResponseDto) {
    deactivateRule.mutate(rule.ruleId, {
      onSuccess: (updated) => {
        showToast("success", "Reorder Rule desativada.");
        onLogged(`Reorder Rule para "${updated.productId}" desativada.`);
        setRules((current) => current.map((candidate) => (candidate.ruleId === updated.ruleId ? updated : candidate)));
      },
      onError: () => showToast("danger", "Não foi possível desativar a Reorder Rule."),
    });
  }

  return (
    <div className="dashboard-section">
      <NotConnectedNotice fields={["Listagem de Reorder Rule já existentes"]} context="Purchase Hub" />

      <WidgetCard title="Regras criadas nesta sessão">
        {rules.length === 0 ? (
          <EmptyState title="Nenhuma Reorder Rule criada ainda" description="Crie uma Regra no formulário abaixo." />
        ) : (
          <ul className="activity-log-list">
            {rules.map((rule) => (
              <li key={rule.ruleId}>
                <RotateCcw size={16} aria-hidden="true" />
                <span>
                  {rule.productId} — limite {rule.thresholdQuantity}, repõe {rule.reorderQuantity}
                </span>
                <Badge tone={rule.active ? "success" : "neutral"}>{rule.active ? "Ativa" : "Inativa"}</Badge>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button type="button" variant="ghost" size="sm" disabled={!rule.active} onClick={() => setEvaluatingRuleId(rule.ruleId)}>
                    Avaliar
                  </Button>
                  <Button type="button" variant="ghost" size="sm" disabled={!rule.active} onClick={() => deactivate(rule)}>
                    Desativar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </WidgetCard>

      {lastEvaluation && (
        <WidgetCard title="Última avaliação">
          <p>
            <strong>{lastEvaluation.rule.productId}</strong> — {lastEvaluation.triggered ? "disparou" : "não disparou"}.
          </p>
          {lastEvaluation.triggered && lastEvaluation.requisition && (
            <p>
              Purchase Requisition criada: <strong>{lastEvaluation.requisition.requisitionId.slice(0, 8)}</strong> ({lastEvaluation.requisition.lines[0]?.suggestedQuantity} un. sugeridas)
            </p>
          )}
        </WidgetCard>
      )}

      <WidgetCard title="Criar Reorder Rule">
        <div className="form-grid">
          <Field label="Identificador do Produto" value={form.productId} onChange={(event) => setForm({ ...form, productId: event.target.value })} placeholder="Ex.: product-123" />
          <Field label="Quantidade limite" type="number" min={0} value={form.thresholdQuantity} onChange={(event) => setForm({ ...form, thresholdQuantity: event.target.value })} />
          <Field label="Quantidade de reposição" type="number" min={1} value={form.reorderQuantity} onChange={(event) => setForm({ ...form, reorderQuantity: event.target.value })} />
          <Field label="Fornecedor preferencial (opcional)" value={form.preferredSupplierId} onChange={(event) => setForm({ ...form, preferredSupplierId: event.target.value })} placeholder="Ex.: supplier-123" />
        </div>
        <Button type="button" variant="secondary" disabled={!form.productId.trim() || createRule.isPending} onClick={submitCreate}>
          Criar Regra
        </Button>
      </WidgetCard>

      <Drawer open={evaluatingRuleId !== undefined} onClose={() => setEvaluatingRuleId(undefined)} title="Avaliar Reorder Rule">
        <div className="form-grid">
          <Field label="Quantidade em estoque corrente (informada manualmente — Inventory Movement Hub ainda não existe)" type="number" min={0} value={currentQuantity} onChange={(event) => setCurrentQuantity(event.target.value)} />
        </div>
        <Button
          type="button"
          variant="primary"
          disabled={evaluateRule.isPending}
          onClick={() => {
            submitEvaluate();
            setEvaluatingRuleId(undefined);
          }}
        >
          Confirmar Avaliação
        </Button>
      </Drawer>
    </div>
  );
}
