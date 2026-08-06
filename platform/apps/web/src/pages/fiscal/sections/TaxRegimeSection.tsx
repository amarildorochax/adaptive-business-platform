import { useState } from "react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Alert } from "@shared/components/ui/Alert";
import { Button } from "@shared/components/ui/Button";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { Field } from "@shared/components/ui/Field";
import { Select } from "@shared/components/ui/Select";
import { TaxRegimeCard } from "@shared/components/ui/TaxRegimeCard";
import { TaxRuleCard } from "@shared/components/ui/TaxRuleCard";
import { useToast } from "@shared/components/ui/toast/useToast";
import type { TaxRateTypeDto, TaxRegimeResponseDto, TaxRuleResponseDto } from "@core/fiscal/fiscal.dto";
import { useCreateTaxRule } from "@core/fiscal/useCreateTaxRule";
import { useDeactivateTaxRule } from "@core/fiscal/useDeactivateTaxRule";
import { useRegisterTaxRegime } from "@core/fiscal/useRegisterTaxRegime";
import { useTaxRule } from "@core/fiscal/useTaxRule";

const RATE_TYPES: readonly TaxRateTypeDto[] = ["Percentage", "Fixed"];

function renderTaxRule(rule: TaxRuleResponseDto) {
  return <TaxRuleCard key={rule.taxRuleId} taxRuleId={rule.taxRuleId} taxRegimeId={rule.taxRegimeId} classificationCode={rule.classification.code} rateType={rule.rate.type} rateValue={rule.rate.value} active={rule.active} />;
}

/**
 * Regime & Regras Fiscais (IMP-605) — registro do Tax Regime (no máximo um por Tenant, `FISCAL_HUB.md`,
 * Capítulo 5) e ciclo de vida de Tax Rule (criação, consulta, desativação). `useTaxRule` (`core/fiscal/`,
 * IMP-604) exige um identificador conhecido — não existe "listar todas as Tax Rule da Empresa"
 * (`FiscalManager` nunca expôs essa Query); esta seção reflete essa realidade honestamente, mesma
 * disciplina de `OrdersSection.tsx`/`BOMSection.tsx` (Production Workspace).
 *
 * "Regras criadas nesta sessão" é a mesma "Session Preview" já aplicada por `BOMSection.tsx` — a única
 * forma real de o operador revisitar uma Regra recém-criada sem conhecer de antemão seu identificador.
 */
export function TaxRegimeSection({
  tenantId,
  taxRegime,
  taxRulesThisSession,
  onLogged,
  onTaxRuleChanged,
}: {
  readonly tenantId: string;
  readonly taxRegime: TaxRegimeResponseDto | undefined;
  readonly taxRulesThisSession: readonly TaxRuleResponseDto[];
  readonly onLogged: (message: string) => void;
  readonly onTaxRuleChanged: (rule: TaxRuleResponseDto) => void;
}) {
  const { showToast } = useToast();
  const registerTaxRegime = useRegisterTaxRegime();
  const createTaxRule = useCreateTaxRule();
  const deactivateTaxRule = useDeactivateTaxRule();

  const [regimeName, setRegimeName] = useState("");

  const [ruleForm, setRuleForm] = useState({ classificationCode: "", rateType: "Percentage" as TaxRateTypeDto, rateValue: "", exemptionCondition: "", validFrom: "", validUntil: "" });

  const [ruleIdInput, setRuleIdInput] = useState("");
  const [searchedRuleId, setSearchedRuleId] = useState<string | undefined>(undefined);
  const searchedRule = useTaxRule(searchedRuleId);

  function submitRegime() {
    if (!regimeName.trim()) {
      return;
    }
    registerTaxRegime.mutate(
      { tenantId, name: regimeName.trim() },
      {
        onSuccess: (regime) => {
          showToast("success", "Regime Tributário registrado.");
          onLogged(`Regime Tributário "${regime.name}" registrado.`);
          setRegimeName("");
        },
        onError: () => showToast("danger", "Não foi possível registrar o Regime Tributário — o Tenant pode já possuir um."),
      },
    );
  }

  function submitRule() {
    if (!taxRegime || !ruleForm.classificationCode.trim() || !ruleForm.rateValue || !ruleForm.validFrom) {
      return;
    }
    createTaxRule.mutate(
      {
        tenantId,
        taxRegimeId: taxRegime.taxRegimeId,
        classification: { code: ruleForm.classificationCode.trim() },
        rate: { type: ruleForm.rateType, value: Number(ruleForm.rateValue) },
        exemptionCondition: ruleForm.exemptionCondition.trim() || undefined,
        validFrom: new Date(ruleForm.validFrom).toISOString(),
        validUntil: ruleForm.validUntil ? new Date(ruleForm.validUntil).toISOString() : undefined,
      },
      {
        onSuccess: (rule) => {
          showToast("success", "Tax Rule criada.");
          onTaxRuleChanged(rule);
          onLogged(`Tax Rule ${rule.taxRuleId.slice(0, 8)} criada — classificação ${rule.classification.code}.`);
          setRuleForm({ classificationCode: "", rateType: "Percentage", rateValue: "", exemptionCondition: "", validFrom: "", validUntil: "" });
        },
        onError: () => showToast("danger", "Não foi possível criar a Tax Rule."),
      },
    );
  }

  function searchRule() {
    if (!ruleIdInput.trim()) {
      return;
    }
    setSearchedRuleId(ruleIdInput.trim());
  }

  function deactivate() {
    if (!searchedRuleId) {
      return;
    }
    deactivateTaxRule.mutate(searchedRuleId, {
      onSuccess: (rule) => {
        showToast("success", "Tax Rule desativada.");
        onTaxRuleChanged(rule);
        onLogged(`Tax Rule ${rule.taxRuleId.slice(0, 8)} desativada.`);
      },
      onError: () => showToast("danger", "Não foi possível desativar a Tax Rule."),
    });
  }

  return (
    <div className="dashboard-section">
      <WidgetCard title="Regime Tributário">
        {taxRegime ? (
          <div className="dashboard-grid">
            <TaxRegimeCard taxRegimeId={taxRegime.taxRegimeId} tenantId={taxRegime.tenantId} name={taxRegime.name} createdAt={taxRegime.createdAt} />
          </div>
        ) : (
          <>
            <EmptyState title="Nenhum Regime Tributário registrado ainda" description="Obrigatório antes de criar qualquer Tax Rule — no máximo um por Tenant." />
            <div className="form-grid">
              <Field label="Nome do Regime Tributário" value={regimeName} onChange={(event) => setRegimeName(event.target.value)} placeholder="Ex.: Simples Nacional" />
            </div>
            <Button type="button" variant="primary" disabled={!regimeName.trim() || registerTaxRegime.isPending} onClick={submitRegime}>
              Registrar Regime Tributário
            </Button>
          </>
        )}
      </WidgetCard>

      {taxRegime ? (
        <WidgetCard title="Criar Tax Rule">
          <div className="form-grid">
            <Field label="Classificação fiscal (NCM)" value={ruleForm.classificationCode} onChange={(event) => setRuleForm({ ...ruleForm, classificationCode: event.target.value })} placeholder="Ex.: 1234.56.78" />
            <Select label="Tipo de alíquota" value={ruleForm.rateType} onChange={(event) => setRuleForm({ ...ruleForm, rateType: event.target.value as TaxRateTypeDto })}>
              {RATE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type === "Percentage" ? "Percentual" : "Fixa"}
                </option>
              ))}
            </Select>
            <Field label="Valor da alíquota" type="number" min={0} value={ruleForm.rateValue} onChange={(event) => setRuleForm({ ...ruleForm, rateValue: event.target.value })} />
            <Field label="Condição de isenção (opcional)" value={ruleForm.exemptionCondition} onChange={(event) => setRuleForm({ ...ruleForm, exemptionCondition: event.target.value })} />
            <Field label="Início da vigência" type="date" value={ruleForm.validFrom} onChange={(event) => setRuleForm({ ...ruleForm, validFrom: event.target.value })} />
            <Field label="Fim da vigência (opcional)" type="date" value={ruleForm.validUntil} onChange={(event) => setRuleForm({ ...ruleForm, validUntil: event.target.value })} />
          </div>
          <Button type="button" variant="primary" disabled={!ruleForm.classificationCode.trim() || !ruleForm.rateValue || !ruleForm.validFrom || createTaxRule.isPending} onClick={submitRule}>
            Criar Tax Rule
          </Button>
        </WidgetCard>
      ) : (
        <Alert tone="info">
          <p>Registre o Regime Tributário acima antes de criar uma Tax Rule.</p>
        </Alert>
      )}

      <WidgetCard title="Consultar Tax Rule por identificador">
        <div className="form-grid">
          <Field label="Regra a consultar" value={ruleIdInput} onChange={(event) => setRuleIdInput(event.target.value)} placeholder="Ex.: rule-123" />
        </div>
        <Button type="button" variant="secondary" disabled={!ruleIdInput.trim()} onClick={searchRule}>
          Consultar Tax Rule
        </Button>
      </WidgetCard>

      {searchedRuleId !== undefined && (
        <WidgetCard title={`Tax Rule ${searchedRuleId.slice(0, 8)}`}>
          {searchedRule.data ? (
            <>
              <div className="dashboard-grid">{renderTaxRule(searchedRule.data)}</div>
              {searchedRule.data.active && (
                <div style={{ marginTop: 16 }}>
                  <Button type="button" variant="danger" disabled={deactivateTaxRule.isPending} onClick={deactivate}>
                    Desativar Tax Rule
                  </Button>
                </div>
              )}
            </>
          ) : (
            <EmptyState title="Nenhuma Tax Rule encontrada para este identificador" />
          )}
        </WidgetCard>
      )}

      <WidgetCard title="Regras criadas nesta sessão">
        {taxRulesThisSession.length === 0 ? <EmptyState title="Nenhuma Tax Rule criada ainda nesta sessão" /> : <div className="dashboard-grid">{taxRulesThisSession.map(renderTaxRule)}</div>}
      </WidgetCard>
    </div>
  );
}
