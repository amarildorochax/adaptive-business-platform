import { useState } from "react";
import { Calculator } from "lucide-react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Alert } from "@shared/components/ui/Alert";
import { Button } from "@shared/components/ui/Button";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { Field } from "@shared/components/ui/Field";
import { useToast } from "@shared/components/ui/toast/useToast";
import type { TaxCalculationDto, TaxRegimeResponseDto } from "@core/fiscal/fiscal.dto";
import { useCalculateTax } from "@core/fiscal/useCalculateTax";

function CalculationResultCard({ calculation }: { readonly calculation: TaxCalculationDto }) {
  return (
    <div className="purchase-card">
      <div className="purchase-card__header">
        <strong>
          <Calculator size={14} aria-hidden="true" /> Cálculo {calculation.taxCalculationId.slice(0, 8)}
        </strong>
      </div>
      <div className="purchase-card__meta">
        <span>Linha {calculation.fiscalDocumentLineId.slice(0, 8)}</span>
        <span>Tax Rule {calculation.taxRuleId.slice(0, 8)}</span>
        <span>
          Imposto: {calculation.amount.amount} {calculation.amount.currencyCode}
        </span>
      </div>
    </div>
  );
}

/**
 * Cálculo de Imposto (IMP-605) — `CalculateTax` é um Command próprio, publicamente invocável mesmo fora
 * de uma emissão de documento ("preview de imposto antes de uma emissão", `FISCAL_HUB.md`, Capítulo 10;
 * `TaxCalculationService.ts`, Core, IMP-601) — esta seção existe exatamente para esse uso legítimo e
 * independente, nunca apenas um passo interno oculto de "Documentos Fiscais".
 *
 * **Nenhum cálculo é armazenado em cache** (`core/fiscal/fiscalCache.ts`, IMP-604: `TaxCalculation` não
 * possui nenhuma Query em nenhuma camada) — "Cálculos realizados nesta sessão" abaixo é um estado local
 * exclusivo desta seção (nunca promovido a `fiscalHistoryLog.ts`, que mantém apenas a contagem via
 * `recordTaxCalculation`), perdido ao navegar para outra aba, mesma disciplina honesta de nunca fingir
 * uma persistência que não existe.
 *
 * O operador copia manualmente os identificadores de um resultado aqui para a seção "Documentos
 * Fiscais"/a Ação Rápida "Emitir Documento Fiscal" — nenhuma composição automática entre as duas
 * seções, mesma disciplina de `BOMSection.tsx`/`CreateProductionOrderDrawer.tsx` (Production Workspace)
 * referenciando manualmente um identificador já obtido em outra seção.
 */
export function TaxCalculationSection({ taxRegime, onLogged, onCalculated }: { readonly taxRegime: TaxRegimeResponseDto | undefined; readonly onLogged: (message: string) => void; readonly onCalculated: () => void }) {
  const { showToast } = useToast();
  const calculateTax = useCalculateTax();

  const [form, setForm] = useState({ fiscalDocumentLineId: "", taxRegimeId: "", classificationCode: "", baseAmount: "", currencyCode: "BRL" });
  const [calculationsThisSession, setCalculationsThisSession] = useState<readonly TaxCalculationDto[]>([]);

  function submit() {
    if (!form.fiscalDocumentLineId.trim() || !form.taxRegimeId.trim() || !form.classificationCode.trim() || !form.baseAmount) {
      return;
    }
    calculateTax.mutate(
      {
        fiscalDocumentLineId: form.fiscalDocumentLineId.trim(),
        taxRegimeId: form.taxRegimeId.trim(),
        classification: { code: form.classificationCode.trim() },
        baseAmount: { amount: Number(form.baseAmount), currencyCode: form.currencyCode.trim() },
      },
      {
        onSuccess: (calculation) => {
          showToast("success", "Imposto calculado.");
          onCalculated();
          onLogged(`Imposto calculado para a linha ${calculation.fiscalDocumentLineId.slice(0, 8)} — ${calculation.amount.amount} ${calculation.amount.currencyCode}.`);
          setCalculationsThisSession((current) => [calculation, ...current]);
          setForm({ fiscalDocumentLineId: "", taxRegimeId: form.taxRegimeId, classificationCode: "", baseAmount: "", currencyCode: "BRL" });
        },
        onError: () => showToast("danger", "Não foi possível calcular o imposto — verifique se existe uma Tax Rule vigente para esta combinação."),
      },
    );
  }

  return (
    <div className="dashboard-section">
      {!taxRegime && (
        <Alert tone="info">
          <p>Nenhum Regime Tributário registrado ainda — registre um na aba "Regime & Regras Fiscais" antes de calcular.</p>
        </Alert>
      )}

      <WidgetCard title="Calcular Imposto">
        <div className="form-grid">
          <Field label="Identificador da linha" value={form.fiscalDocumentLineId} onChange={(event) => setForm({ ...form, fiscalDocumentLineId: event.target.value })} placeholder="Ex.: line-123" />
          <Field label="Tax Regime" value={form.taxRegimeId} onChange={(event) => setForm({ ...form, taxRegimeId: event.target.value })} placeholder={taxRegime?.taxRegimeId ?? "Ex.: regime-123"} />
          <Field label="Classificação fiscal (NCM)" value={form.classificationCode} onChange={(event) => setForm({ ...form, classificationCode: event.target.value })} placeholder="Ex.: 1234.56.78" />
          <Field label="Valor base" type="number" min={0} value={form.baseAmount} onChange={(event) => setForm({ ...form, baseAmount: event.target.value })} />
          <Field label="Moeda" value={form.currencyCode} onChange={(event) => setForm({ ...form, currencyCode: event.target.value })} placeholder="Ex.: BRL" />
        </div>
        <Button type="button" variant="primary" disabled={!form.fiscalDocumentLineId.trim() || !form.taxRegimeId.trim() || !form.classificationCode.trim() || !form.baseAmount || calculateTax.isPending} onClick={submit}>
          Calcular Imposto
        </Button>
      </WidgetCard>

      <WidgetCard title="Cálculos realizados nesta sessão">
        {calculationsThisSession.length === 0 ? (
          <EmptyState title="Nenhum cálculo realizado ainda nesta sessão" description="O resultado nunca fica salvo no servidor além do próprio TaxCalculation — reutilize os identificadores abaixo ao emitir um Documento Fiscal." />
        ) : (
          <div className="dashboard-grid">
            {calculationsThisSession.map((calculation) => (
              <CalculationResultCard key={calculation.taxCalculationId} calculation={calculation} />
            ))}
          </div>
        )}
      </WidgetCard>
    </div>
  );
}
