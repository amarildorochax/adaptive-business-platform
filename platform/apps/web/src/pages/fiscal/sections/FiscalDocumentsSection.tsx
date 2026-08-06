import { useState } from "react";
import { WidgetCard } from "@shared/components/WidgetCard";
import { Alert } from "@shared/components/ui/Alert";
import { Button } from "@shared/components/ui/Button";
import { EmptyState } from "@shared/components/ui/EmptyState";
import { Field } from "@shared/components/ui/Field";
import { FiscalDocumentCard } from "@shared/components/ui/FiscalDocumentCard";
import { useToast } from "@shared/components/ui/toast/useToast";
import type { FiscalDocumentResponseDto } from "@core/fiscal/fiscal.dto";
import { useCancelFiscalDocument } from "@core/fiscal/useCancelFiscalDocument";
import { useFiscalDocument } from "@core/fiscal/useFiscalDocument";
import { useFiscalDocumentsByOrigin } from "@core/fiscal/useFiscalDocumentsByOrigin";

function renderDocument(document: FiscalDocumentResponseDto) {
  return <FiscalDocumentCard key={document.fiscalDocumentId} fiscalDocumentId={document.fiscalDocumentId} type={document.type} status={document.status} orderId={document.orderId} invoiceId={document.invoiceId} linesCount={document.lines.length} />;
}

/**
 * Documentos Fiscais (IMP-605) — consulta e cancelamento. A emissão em si acontece exclusivamente pela
 * Ação Rápida "Emitir Documento Fiscal" do `PageHeader` (`IssueFiscalDocumentDrawer.tsx`) — nenhum
 * segundo formulário de criação aqui, mesma disciplina de prevenção de nome de botão duplicado já
 * corrigida em `IMP_405_INVENTORY_MOVEMENT_WORKSPACE_REPORT.md`/reaplicada por
 * `IMP_505_PRODUCTION_WORKSPACE_REPORT.md`.
 *
 * `useFiscalDocument`/`useFiscalDocumentsByOrigin` (`core/fiscal/`, IMP-604) exigem um identificador
 * conhecido — não existe "listar todos os Fiscal Document da Empresa" (`FiscalManager` nunca expôs essa
 * Query); esta seção reflete essa realidade honestamente com dois formulários de busca, mesmo template
 * de `OrdersSection.tsx` (Production Workspace).
 *
 * "Documentos emitidos nesta sessão" é a mesma "Session Preview" já aplicada por `OrdersSection.tsx`.
 */
export function FiscalDocumentsSection({
  documentsThisSession,
  onLogged,
  onDocumentChanged,
}: {
  readonly documentsThisSession: readonly FiscalDocumentResponseDto[];
  readonly onLogged: (message: string) => void;
  readonly onDocumentChanged: (document: FiscalDocumentResponseDto) => void;
}) {
  const { showToast } = useToast();
  const cancelDocument = useCancelFiscalDocument();

  const [idInput, setIdInput] = useState("");
  const [searchedId, setSearchedId] = useState<string | undefined>(undefined);
  const [originInput, setOriginInput] = useState("");
  const [searchedOrigin, setSearchedOrigin] = useState<string | undefined>(undefined);
  const [cancelReason, setCancelReason] = useState("");

  const byId = useFiscalDocument(searchedId);
  const byOrigin = useFiscalDocumentsByOrigin(searchedOrigin);

  function searchById() {
    if (!idInput.trim()) {
      return;
    }
    setSearchedId(idInput.trim());
  }

  function searchByOrigin() {
    if (!originInput.trim()) {
      return;
    }
    setSearchedOrigin(originInput.trim());
  }

  function cancel() {
    if (!searchedId || !cancelReason.trim()) {
      return;
    }
    cancelDocument.mutate(
      { fiscalDocumentId: searchedId, payload: { reason: cancelReason.trim() } },
      {
        onSuccess: (document) => {
          showToast("success", "Fiscal Document cancelado.");
          onDocumentChanged(document);
          onLogged(`Documento ${document.fiscalDocumentId.slice(0, 8)} cancelado — ${document.cancelReason}.`);
          setCancelReason("");
        },
        onError: () => showToast("danger", "Não foi possível cancelar o Fiscal Document."),
      },
    );
  }

  return (
    <div className="dashboard-section">
      <WidgetCard title="Consultar Documento por identificador">
        <div className="form-grid">
          <Field label="Documento a consultar" value={idInput} onChange={(event) => setIdInput(event.target.value)} placeholder="Ex.: doc-123" />
        </div>
        <Button type="button" variant="primary" disabled={!idInput.trim()} onClick={searchById}>
          Consultar Documento
        </Button>
      </WidgetCard>

      {searchedId !== undefined && (
        <WidgetCard title={`Documento ${searchedId.slice(0, 8)}`}>
          {byId.data ? (
            <>
              <div className="dashboard-grid">{renderDocument(byId.data)}</div>
              {byId.data.status === "Issued" && (
                <div style={{ marginTop: 16 }}>
                  <div className="form-grid">
                    <Field label="Motivo do cancelamento" value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} placeholder="Ex.: Devolução do cliente" />
                  </div>
                  <Button type="button" variant="danger" disabled={!cancelReason.trim() || cancelDocument.isPending} onClick={cancel}>
                    Cancelar Documento
                  </Button>
                </div>
              )}
            </>
          ) : (
            <EmptyState title="Nenhum Fiscal Document encontrado para este identificador" />
          )}
        </WidgetCard>
      )}

      <WidgetCard title="Consultar Documentos por Order de origem">
        <div className="form-grid">
          <Field label="Order de origem a consultar" value={originInput} onChange={(event) => setOriginInput(event.target.value)} placeholder="Ex.: order-123" />
        </div>
        <Button type="button" variant="secondary" disabled={!originInput.trim()} onClick={searchByOrigin}>
          Consultar por Order
        </Button>
      </WidgetCard>

      {searchedOrigin === undefined ? (
        <Alert tone="info">
          <p>Informe um Documento Fiscal ou um Order de origem acima para consultar registros reais — não existe uma listagem de Documentos "de toda a Empresa".</p>
        </Alert>
      ) : (byOrigin.data?.length ?? 0) === 0 ? (
        <EmptyState title="Nenhum Fiscal Document encontrado para este Order de origem" />
      ) : (
        <WidgetCard title={`Documentos — Order de origem ${searchedOrigin.slice(0, 8)}`}>
          <div className="dashboard-grid">{byOrigin.data!.map(renderDocument)}</div>
        </WidgetCard>
      )}

      <WidgetCard title="Documentos emitidos nesta sessão">
        {documentsThisSession.length === 0 ? (
          <EmptyState title="Nenhum Fiscal Document emitido ainda" description="Use a Ação Rápida 'Emitir Documento Fiscal', disponível em qualquer aba deste Workspace." />
        ) : (
          <div className="dashboard-grid">{documentsThisSession.map(renderDocument)}</div>
        )}
      </WidgetCard>
    </div>
  );
}
