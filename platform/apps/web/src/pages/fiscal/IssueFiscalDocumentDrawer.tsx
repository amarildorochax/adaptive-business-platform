import { useState } from "react";
import { Button } from "@shared/components/ui/Button";
import { Drawer } from "@shared/components/ui/Drawer";
import { Field } from "@shared/components/ui/Field";
import { Select } from "@shared/components/ui/Select";
import { useToast } from "@shared/components/ui/toast/useToast";
import type { FiscalDocumentResponseDto, FiscalDocumentTypeDto } from "@core/fiscal/fiscal.dto";
import { useIssueFiscalDocument } from "@core/fiscal/useIssueFiscalDocument";

interface FormState {
  readonly type: FiscalDocumentTypeDto;
  readonly orderId: string;
  readonly invoiceId: string;
  readonly fiscalDocumentLineId: string;
  readonly productId: string;
  readonly quantity: string;
  readonly unitValueAmount: string;
  readonly unitValueCurrencyCode: string;
  readonly classificationCode: string;
  readonly taxCalculationId: string;
  readonly taxRuleId: string;
  readonly taxAmount: string;
  readonly taxCurrencyCode: string;
}

const TYPE_OPTIONS: readonly FiscalDocumentTypeDto[] = ["Sale", "Return", "Transfer"];
const TYPE_LABEL: Record<FiscalDocumentTypeDto, string> = { Sale: "Venda", Return: "Devolução", Transfer: "Transferência" };

const EMPTY_FORM: FormState = {
  type: "Sale",
  orderId: "",
  invoiceId: "",
  fiscalDocumentLineId: "",
  productId: "",
  quantity: "1",
  unitValueAmount: "",
  unitValueCurrencyCode: "BRL",
  classificationCode: "",
  taxCalculationId: "",
  taxRuleId: "",
  taxAmount: "",
  taxCurrencyCode: "BRL",
};

/**
 * Drawer de emissão de FiscalDocument (IMP-605) — Ação Rápida "Emitir Documento Fiscal" do
 * `PageHeader` (`FiscalPage.tsx`), mesmo padrão de `CreateProductionOrderDrawer.tsx`. Referencia um
 * `TaxCalculation` **já produzido** por uma chamada anterior a `CalculateTax` (Seção "Cálculo de
 * Imposto") — exatamente como `CreateProductionOrderDrawer` referencia uma `BillOfMaterials` já ativa
 * criada em outra seção; este formulário nunca recalcula o imposto, apenas transporta os valores já
 * obtidos.
 *
 * **Uma única linha por emissão (decisão documentada, `IMP_605_FISCAL_WORKSPACE_REPORT.md`).** O
 * Command `IssueFiscalDocument` (Core, IMP-601) aceita um array completo de linhas — esta Sprint não
 * reduz essa capacidade real em nenhuma camada (Core/Persistence/HTTP/Frontend Infrastructure
 * permanecem intocados); apenas o formulário deste Drawer constrói um array de um único elemento a
 * partir dos campos preenchidos, mesma simplificação ergonômica (nunca de regra de negócio) já aceita
 * por `CreateProductionOrderDrawer.tsx` para uma única `ProductionOrder` por vez.
 *
 * **`taxCalculation.calculatedAt` nunca é um campo do formulário — sempre o momento da transcrição
 * (`new Date().toISOString()`)**, mesmo padrão já aceito por `ReceivingsSection.tsx` (Purchase
 * Workspace) para `receivedAt`: o Workspace nunca expõe um seletor de data/hora para um valor cujo
 * significado real é "agora", evitando um campo `datetime-local` frágil por um ganho de precisão sem
 * valor prático (o `TaxCalculation` referenciado já foi produzido momentos antes, na seção "Cálculo de
 * Imposto").
 *
 * O servidor rejeita com 422 quando nem `orderId` nem `invoiceId` são informados
 * (`FiscalDocumentMissingOriginError`) — este formulário nunca valida essa regra localmente, apenas
 * propaga o erro real via toast.
 *
 * **Rótulos "Tipo do Documento"/"Identificador da linha do documento"/"Classificação fiscal da linha
 * (NCM)" — deliberadamente distintos** de "Tipo" (`FiscalObligationsSection.tsx`), "Identificador da
 * linha" e "Classificação fiscal (NCM)" (`TaxCalculationSection.tsx`/`TaxRegimeSection.tsx`): este
 * Drawer é uma Ação Rápida global do `PageHeader`, presente sobre qualquer seção (`Drawer` nunca
 * desmonta o conteúdo por trás de si) — um rótulo acessível repetido entre este formulário e o de uma
 * seção simultaneamente montada quebraria `getByLabelText` em teste (e a busca por leitor de tela em
 * produção), mesma disciplina de prevenção de ambiguidade de nome acessível já documentada em
 * `CreateStockMovementDrawer.tsx` (`IMP_305_PURCHASE_WORKSPACE_REPORT.md`).
 */
export function IssueFiscalDocumentDrawer({
  open,
  onClose,
  tenantId,
  onIssued,
}: {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly tenantId: string;
  readonly onIssued: (document: FiscalDocumentResponseDto) => void;
}) {
  const { showToast } = useToast();
  const issueDocument = useIssueFiscalDocument();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  function close() {
    setForm(EMPTY_FORM);
    onClose();
  }

  function submit() {
    const quantity = Number(form.quantity);
    const unitValueAmount = Number(form.unitValueAmount);
    const taxAmount = Number(form.taxAmount);
    if (!form.fiscalDocumentLineId.trim() || !form.productId.trim() || !quantity || !form.unitValueAmount || !form.classificationCode.trim() || !form.taxCalculationId.trim() || !form.taxRuleId.trim() || !form.taxAmount) {
      return;
    }
    issueDocument.mutate(
      {
        tenantId,
        type: form.type,
        orderId: form.orderId.trim() || undefined,
        invoiceId: form.invoiceId.trim() || undefined,
        lines: [
          {
            fiscalDocumentLineId: form.fiscalDocumentLineId.trim(),
            productId: form.productId.trim(),
            quantity,
            unitValue: { amount: unitValueAmount, currencyCode: form.unitValueCurrencyCode.trim() },
            classification: { code: form.classificationCode.trim() },
            taxCalculation: {
              taxCalculationId: form.taxCalculationId.trim(),
              fiscalDocumentLineId: form.fiscalDocumentLineId.trim(),
              taxRuleId: form.taxRuleId.trim(),
              amount: { amount: taxAmount, currencyCode: form.taxCurrencyCode.trim() },
              calculatedAt: new Date().toISOString(),
            },
          },
        ],
      },
      {
        onSuccess: (document) => {
          showToast("success", "Fiscal Document emitido.");
          onIssued(document);
          close();
        },
        onError: () => showToast("danger", "Não foi possível emitir o Fiscal Document — verifique se há ao menos uma origem (Order ou Invoice) informada."),
      },
    );
  }

  const disabled =
    !form.fiscalDocumentLineId.trim() ||
    !form.productId.trim() ||
    !form.unitValueAmount ||
    !form.classificationCode.trim() ||
    !form.taxCalculationId.trim() ||
    !form.taxRuleId.trim() ||
    !form.taxAmount ||
    issueDocument.isPending;

  return (
    <Drawer open={open} onClose={close} title="Emitir Documento Fiscal">
      <div className="form-grid">
        <Select label="Tipo do Documento" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as FiscalDocumentTypeDto })}>
          {TYPE_OPTIONS.map((type) => (
            <option key={type} value={type}>
              {TYPE_LABEL[type]}
            </option>
          ))}
        </Select>
        <Field label="Order de origem (Commerce Hub, opcional)" value={form.orderId} onChange={(event) => setForm({ ...form, orderId: event.target.value })} placeholder="Ex.: order-123" />
        <Field label="Invoice de origem (Finance Hub, opcional)" value={form.invoiceId} onChange={(event) => setForm({ ...form, invoiceId: event.target.value })} placeholder="Ex.: invoice-123" />
      </div>

      <h3>Linha do documento</h3>
      <div className="form-grid">
        <Field label="Identificador da linha do documento" value={form.fiscalDocumentLineId} onChange={(event) => setForm({ ...form, fiscalDocumentLineId: event.target.value })} placeholder="Ex.: line-123" />
        <Field label="Produto" value={form.productId} onChange={(event) => setForm({ ...form, productId: event.target.value })} placeholder="Ex.: bread" />
        <Field label="Quantidade" type="number" min={0} value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} />
        <Field label="Valor unitário" type="number" min={0} value={form.unitValueAmount} onChange={(event) => setForm({ ...form, unitValueAmount: event.target.value })} />
        <Field label="Moeda do valor unitário" value={form.unitValueCurrencyCode} onChange={(event) => setForm({ ...form, unitValueCurrencyCode: event.target.value })} placeholder="Ex.: BRL" />
        <Field label="Classificação fiscal da linha (NCM)" value={form.classificationCode} onChange={(event) => setForm({ ...form, classificationCode: event.target.value })} placeholder="Ex.: 1234.56.78" />
      </div>

      <h3>Tax Calculation já aplicado (obtido na seção "Cálculo de Imposto")</h3>
      <div className="form-grid">
        <Field label="Identificador do cálculo" value={form.taxCalculationId} onChange={(event) => setForm({ ...form, taxCalculationId: event.target.value })} placeholder="Ex.: calc-123" />
        <Field label="Tax Rule aplicada" value={form.taxRuleId} onChange={(event) => setForm({ ...form, taxRuleId: event.target.value })} placeholder="Ex.: rule-123" />
        <Field label="Valor do imposto" type="number" min={0} value={form.taxAmount} onChange={(event) => setForm({ ...form, taxAmount: event.target.value })} />
        <Field label="Moeda do imposto" value={form.taxCurrencyCode} onChange={(event) => setForm({ ...form, taxCurrencyCode: event.target.value })} placeholder="Ex.: BRL" />
      </div>

      <Button type="button" variant="primary" disabled={disabled} onClick={submit}>
        Confirmar Emissão
      </Button>
    </Drawer>
  );
}
