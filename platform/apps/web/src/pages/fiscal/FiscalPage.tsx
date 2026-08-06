import { Receipt } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageContainer } from "@shared/components/PageContainer";
import { PageHeader } from "@shared/components/PageHeader";
import { AsyncState } from "@shared/components/AsyncState";
import { Button } from "@shared/components/ui/Button";
import { SectionSubNav } from "@shared/components/ui/SectionSubNav";
import { useAuth } from "@core/auth/useAuth";
import { useTaxRegime } from "@core/fiscal/useTaxRegime";
import { useFiscalHistoryLog } from "./fiscalHistoryLog";
import { DEFAULT_FISCAL_SECTION, FISCAL_SECTIONS, isFiscalSectionId, type FiscalSectionId } from "./fiscalSections";
import { IssueFiscalDocumentDrawer } from "./IssueFiscalDocumentDrawer";
import { AnalyticsSection } from "./sections/AnalyticsSection";
import { FiscalDocumentsSection } from "./sections/FiscalDocumentsSection";
import { FiscalObligationsSection } from "./sections/FiscalObligationsSection";
import { HistorySection } from "./sections/HistorySection";
import { OverviewSection } from "./sections/OverviewSection";
import { SettingsSection } from "./sections/SettingsSection";
import { TaxCalculationSection } from "./sections/TaxCalculationSection";
import { TaxRegimeSection } from "./sections/TaxRegimeSection";

/**
 * Fiscal Workspace (IMP-605) — a quinta e última etapa do Fiscal Hub, encerrando o ciclo Arquitetura →
 * Core → Persistência → HTTP API → Frontend Infrastructure → Workspace (ERP-001, IMP-601 a IMP-605), o
 * quinto e último domínio ERP completo desta plataforma (após Supplier, Purchase, Inventory Movement e
 * Production Hub) — **encerramento oficial da ERP Foundation**. Organizado em oito seções
 * (`fiscalSections.ts`) navegáveis pela mesma barra lateral contextual genérica (`SectionSubNav`) já
 * usada por todo Workspace desta série.
 *
 * Toda comunicação acontece exclusivamente através de `core/fiscal/` (IMP-604) — nenhuma seção importa
 * `ApiClient`, chama `fetch`, ou acessa `FiscalManager` diretamente. `useAuth().tenantId`, nunca
 * `useDashboardBootstrap()` — mesma decisão consciente já tomada por Supplier/Purchase/Inventory
 * Movement/Production Workspace.
 *
 * `useTaxRegime(tenantId)` é a única Query de topo — **divergência deliberada e documentada do padrão
 * de gate usado pelos quatro Workspaces anteriores** (`ProductionPage.tsx` só renderiza o conteúdo
 * quando `activeWorkCenters.data` existe): aqui, `taxRegime.data === undefined` é um estado de negócio
 * honesto ("Tenant ainda não registrou um Tax Regime"), nunca um estado de carregamento — gatear o
 * conteúdo inteiro do Workspace nessa condição deixaria a aplicação permanentemente presa para todo
 * Tenant novo, um bug real que as quatro Sprints anteriores nunca encontraram porque suas Queries de
 * topo eram sempre listas (`[]` continua sendo "carregado com sucesso", nunca `undefined`). O gate
 * aqui usa exclusivamente `isLoading`/`isError` de `useTaxRegime` — o conteúdo (incluindo o
 * `EmptyState` "nenhum Regime registrado" dentro de `OverviewSection`/`TaxRegimeSection`) sempre
 * renderiza assim que a Query resolve, com ou sem dado.
 */
export function FiscalPage() {
  const auth = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const historyLog = useFiscalHistoryLog();
  const [isIssueDocumentOpen, setIsIssueDocumentOpen] = useState(false);

  const tenantId = auth.tenantId;
  const taxRegime = useTaxRegime(tenantId);

  const sectionParam = searchParams.get("section");
  const activeSection: FiscalSectionId = isFiscalSectionId(sectionParam) ? sectionParam : DEFAULT_FISCAL_SECTION;

  function selectSection(id: FiscalSectionId) {
    setSearchParams(id === DEFAULT_FISCAL_SECTION ? {} : { section: id });
  }

  const isLoading = tenantId === undefined || taxRegime.isLoading;
  const isError = taxRegime.isError;

  return (
    <PageContainer>
      <PageHeader
        title="Fiscal"
        description="O Fiscal Workspace — conformidade tributária de mercadoria, consumido exclusivamente via HTTP real (ERP Foundation)."
        actions={
          tenantId && (
            <Button type="button" variant="primary" leadingIcon={<Receipt size={16} aria-hidden="true" />} onClick={() => setIsIssueDocumentOpen(true)}>
              Emitir Documento Fiscal
            </Button>
          )
        }
      />
      <AsyncState isLoading={isLoading} isError={isError} error={taxRegime.error} onRetry={() => void taxRegime.refetch()}>
        {tenantId && (
          <div className="profile-layout">
            <SectionSubNav label="Seções do Fiscal Workspace" sections={FISCAL_SECTIONS} activeId={activeSection} onSelect={selectSection} />
            <div className="profile-content">
              {activeSection === "overview" && (
                <OverviewSection
                  taxRegime={taxRegime.data}
                  dataUpdatedAt={taxRegime.dataUpdatedAt}
                  taxRulesCount={historyLog.taxRules.length}
                  taxCalculationsCount={historyLog.taxCalculationsCount}
                  fiscalDocumentsCount={historyLog.fiscalDocuments.length}
                  fiscalObligationsRegisteredCount={historyLog.fiscalObligationsRegisteredCount}
                />
              )}
              {activeSection === "tax-regime" && (
                <TaxRegimeSection tenantId={tenantId} taxRegime={taxRegime.data} taxRulesThisSession={historyLog.taxRules} onLogged={historyLog.append} onTaxRuleChanged={historyLog.upsertTaxRule} />
              )}
              {activeSection === "tax-calculation" && <TaxCalculationSection taxRegime={taxRegime.data} onLogged={historyLog.append} onCalculated={historyLog.recordTaxCalculation} />}
              {activeSection === "fiscal-documents" && (
                <FiscalDocumentsSection documentsThisSession={historyLog.fiscalDocuments} onLogged={historyLog.append} onDocumentChanged={historyLog.upsertFiscalDocument} />
              )}
              {activeSection === "fiscal-obligations" && <FiscalObligationsSection tenantId={tenantId} onLogged={historyLog.append} onRegistered={historyLog.recordFiscalObligationRegistered} />}
              {activeSection === "history" && <HistorySection log={historyLog.entries} />}
              {activeSection === "analytics" && (
                <AnalyticsSection
                  taxRulesThisSession={historyLog.taxRules}
                  fiscalDocumentsThisSession={historyLog.fiscalDocuments}
                  taxCalculationsCount={historyLog.taxCalculationsCount}
                  fiscalObligationsRegisteredCount={historyLog.fiscalObligationsRegisteredCount}
                />
              )}
              {activeSection === "settings" && <SettingsSection />}
            </div>
          </div>
        )}
      </AsyncState>

      {tenantId && (
        <IssueFiscalDocumentDrawer
          open={isIssueDocumentOpen}
          onClose={() => setIsIssueDocumentOpen(false)}
          tenantId={tenantId}
          onIssued={(document) => {
            historyLog.upsertFiscalDocument(document);
            historyLog.append(`Documento ${document.fiscalDocumentId.slice(0, 8)} emitido — tipo ${document.type}.`);
            if (activeSection !== "fiscal-documents" && activeSection !== "overview") {
              selectSection("fiscal-documents");
            }
          }}
        />
      )}
    </PageContainer>
  );
}
