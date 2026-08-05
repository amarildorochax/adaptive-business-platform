import { useState } from "react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Badge } from "@shared/components/ui/Badge";
import { Button } from "@shared/components/ui/Button";
import { Field } from "@shared/components/ui/Field";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { Select } from "@shared/components/ui/Select";
import { useToast } from "@shared/components/ui/toast/useToast";
import { useLocalDraft } from "@core/localDraft/useLocalDraft";
import { resolveContactNames, resolvePartyName, type CrmWorkspaceSnapshot } from "@core/crm/crmWorkspace";
import { useCreateOpportunity } from "@core/query/useCreateOpportunity";

const OUTCOME_TONE = { Open: "info", Won: "success", Lost: "danger" } as const;

function formatCurrency(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR")}`;
}

interface NotesDraft extends Record<string, unknown> {
  readonly text: string;
}

function OpportunityDetail({ workspace, opportunityId }: { readonly workspace: CrmWorkspaceSnapshot; readonly opportunityId: string }) {
  const opportunity = workspace.opportunities.find((candidate) => candidate.opportunityId === opportunityId)!;
  const draft = useLocalDraft<NotesDraft>("crm", `opportunity-notes-${opportunityId}`, { text: "" });

  return (
    <WidgetCard title={opportunity.title}>
      <dl className="form-grid">
        <div>
          <dt>Empresa</dt>
          <dd>{resolvePartyName(workspace, opportunity.relationshipId) ?? "—"}</dd>
        </div>
        <div>
          <dt>Contato</dt>
          <dd>{resolveContactNames(workspace, opportunity.relationshipId).join(", ") || "—"}</dd>
        </div>
        <div>
          <dt>Valor</dt>
          <dd>{formatCurrency(opportunity.value)}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>
            <Badge tone={OUTCOME_TONE[opportunity.outcome as keyof typeof OUTCOME_TONE] ?? "neutral"}>{opportunity.outcome}</Badge>
          </dd>
        </div>
        <div>
          <dt>Responsável</dt>
          <dd>{workspace.relationships.find((relationship) => relationship.relationshipId === opportunity.relationshipId)?.accountManagerId ?? "—"}</dd>
        </div>
      </dl>

      <NotConnectedNotice fields={["Produtos", "Origem", "Probabilidade"]} context="CRM Hub" />

      <div className="form-grid">
        <Field label="Observações (rascunho local)" value={draft.value.text} onChange={(event) => draft.updateField("text", event.target.value)} placeholder="Anotações sobre esta Oportunidade" />
      </div>
    </WidgetCard>
  );
}

/**
 * Oportunidades (FUN-103) — página detalhada por Opportunity. Empresa/Contato/Valor/Responsável são
 * reais (derivados do CRM Workspace); Status é o campo real `outcome`; Produtos/Origem/Probabilidade
 * não existem em `Opportunity` (ver `packages/crm-hub/src/Opportunity.ts`) — `NotConnectedNotice`.
 * Observações é rascunho local (`useLocalDraft`, generalizado na FUN-102), já que `updateCustomer` é
 * o único Command de atualização existente, e não cobre Opportunity. "Nova Oportunidade" invoca o
 * Command real `CreateOpportunity`.
 */
export function OpportunitiesSection({ workspace, tenantId }: { readonly workspace: CrmWorkspaceSnapshot; readonly tenantId: string }) {
  const createOpportunity = useCreateOpportunity();
  const { showToast } = useToast();
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [relationshipId, setRelationshipId] = useState(workspace.relationships[0]?.relationshipId ?? "");
  const [stageId, setStageId] = useState("stage-qualificacao");

  const parties = workspace.relationships.map((relationship) => ({ relationshipId: relationship.relationshipId, name: resolvePartyName(workspace, relationship.relationshipId) ?? relationship.relationshipId }));

  function handleCreate() {
    const numericValue = Number(value);
    if (!title.trim() || !relationshipId || Number.isNaN(numericValue) || numericValue <= 0) {
      return;
    }
    createOpportunity.mutate(
      { tenantId, title: title.trim(), value: numericValue, relationshipId, pipelineId: "pipeline-padrao", stageId: stageId.trim() || "stage-qualificacao" },
      {
        onSuccess: () => {
          showToast("success", "Oportunidade criada.");
          setTitle("");
          setValue("");
        },
        onError: () => showToast("danger", "Não foi possível criar a Oportunidade."),
      },
    );
  }

  return (
    <div className="dashboard-section">
      <WidgetCard title="Nova Oportunidade">
        <div className="form-grid">
          <Field label="Título" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex.: Renovação de contrato anual" />
          <Field label="Valor (R$)" type="number" value={value} onChange={(event) => setValue(event.target.value)} placeholder="0" />
          <Select label="Empresa/Cliente" value={relationshipId} onChange={(event) => setRelationshipId(event.target.value)}>
            {parties.length === 0 && <option value="">Nenhum Cliente cadastrado</option>}
            {parties.map((party) => (
              <option key={party.relationshipId} value={party.relationshipId}>
                {party.name}
              </option>
            ))}
          </Select>
          <Field label="Etapa inicial" value={stageId} onChange={(event) => setStageId(event.target.value)} />
        </div>
        <Button type="button" variant="primary" onClick={handleCreate} disabled={createOpportunity.isPending}>
          {createOpportunity.isPending ? "Criando…" : "Criar Oportunidade"}
        </Button>
      </WidgetCard>

      {workspace.opportunities.length === 0 ? (
        <NotConnectedNotice fields={["Nenhuma Oportunidade nesta sessão ainda"]} context="CRM Hub" />
      ) : (
        workspace.opportunities.map((opportunity) => <OpportunityDetail key={opportunity.opportunityId} workspace={workspace} opportunityId={opportunity.opportunityId} />)
      )}
    </div>
  );
}
