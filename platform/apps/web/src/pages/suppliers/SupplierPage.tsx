import { UserPlus } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageContainer } from "@shared/components/PageContainer";
import { PageHeader } from "@shared/components/PageHeader";
import { AsyncState } from "@shared/components/AsyncState";
import { Button } from "@shared/components/ui/Button";
import { SectionSubNav } from "@shared/components/ui/SectionSubNav";
import { useAuth } from "@core/auth/useAuth";
import { useSuppliers } from "@core/supplier/useSuppliers";
import { CreateSupplierDrawer } from "./CreateSupplierDrawer";
import { AnalyticsSection } from "./sections/AnalyticsSection";
import { CatalogSection } from "./sections/CatalogSection";
import { ContactsSection } from "./sections/ContactsSection";
import { ContractsSection } from "./sections/ContractsSection";
import { HistorySection } from "./sections/HistorySection";
import { OverviewSection } from "./sections/OverviewSection";
import { SettingsSection } from "./sections/SettingsSection";
import { SuppliersSection } from "./sections/SuppliersSection";
import { DEFAULT_SUPPLIER_SECTION, isSupplierSectionId, SUPPLIER_SECTIONS, type SupplierSectionId } from "./supplierSections";
import { useSupplierHistoryLog } from "./supplierHistoryLog";

/**
 * Supplier Workspace (IMP-205) — a quinta e última etapa do Supplier Hub, encerrando o ciclo
 * Arquitetura → Core → Persistência → HTTP API → Frontend Infrastructure → Workspace (ERP-001,
 * IMP-201 a IMP-204). Organizado em oito seções (`supplierSections.ts`) navegáveis pela mesma barra
 * lateral contextual genérica (`SectionSubNav`) já usada por todo Workspace desde a FUN-101.
 *
 * Toda comunicação acontece exclusivamente através de `core/supplier/` (IMP-204) — nenhuma seção
 * importa `ApiClient`, chama `fetch`, ou acessa `SupplierManager` diretamente. `useSuppliers(tenantId)`
 * é a única Query de topo desta página — todas as outras seções operam sobre a mesma lista já
 * carregada, nunca uma segunda fonte.
 *
 * Diferente de CRM (FUN-103)/Product Hub (FUN-104)/Inventory (FUN-105)/Purchase (FUN-106), que
 * dependem de `useDashboardBootstrap()` (o Composition Root em processo, `core/managers/`) para
 * resolver `tenantId`, este Workspace usa exclusivamente `useAuth().tenantId` — o Supplier Hub não
 * tem nenhuma relação com o Business Profile Engine nem com nenhum Manager em processo; depender do
 * bootstrap aqui acoplaria este Workspace a um pipeline de seed inteiramente alheio ao seu próprio
 * domínio. Decisão documentada em `IMP_205_SUPPLIER_WORKSPACE_REPORT.md`, "Arquitetura Utilizada".
 *
 * `PageHeader actions` (UX-002) — primeiro uso real desse prop nesta plataforma (já existia desde a
 * UX-001, "nenhuma página existente precisou passar a fornecê-lo"): a Ação Rápida "Novo Fornecedor"
 * abre `CreateSupplierDrawer` a partir de qualquer aba, nunca exigindo navegar até "Fornecedores"
 * primeiro — "Navegação... Ações rápidas", Capítulo 7 da UX-002.
 */
export function SupplierPage() {
  const auth = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const historyLog = useSupplierHistoryLog();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const tenantId = auth.tenantId;
  const suppliers = useSuppliers(tenantId);

  const sectionParam = searchParams.get("section");
  const activeSection: SupplierSectionId = isSupplierSectionId(sectionParam) ? sectionParam : DEFAULT_SUPPLIER_SECTION;

  function selectSection(id: SupplierSectionId) {
    setSearchParams(id === DEFAULT_SUPPLIER_SECTION ? {} : { section: id });
  }

  const isLoading = tenantId === undefined || suppliers.isLoading;
  const isError = suppliers.isError;

  return (
    <PageContainer>
      <PageHeader
        title="Fornecedores"
        description="O Supplier Workspace — cadastro de Fornecedores, Contatos, Contratos e Catálogo, consumidos exclusivamente via HTTP real (ERP Foundation)."
        actions={
          tenantId && (
            <Button type="button" variant="primary" leadingIcon={<UserPlus size={16} aria-hidden="true" />} onClick={() => setIsCreateOpen(true)}>
              Novo Fornecedor
            </Button>
          )
        }
      />
      <AsyncState isLoading={isLoading} isError={isError} error={suppliers.error} onRetry={() => void suppliers.refetch()}>
        {tenantId && suppliers.data && (
          <div className="profile-layout">
            <SectionSubNav label="Seções do Supplier Workspace" sections={SUPPLIER_SECTIONS} activeId={activeSection} onSelect={selectSection} />
            <div className="profile-content">
              {activeSection === "overview" && <OverviewSection suppliers={suppliers.data} dataUpdatedAt={suppliers.dataUpdatedAt} />}
              {activeSection === "suppliers" && <SuppliersSection suppliers={suppliers.data} onLogged={historyLog.append} onOpenCreate={() => setIsCreateOpen(true)} />}
              {activeSection === "contacts" && <ContactsSection suppliers={suppliers.data} onLogged={historyLog.append} />}
              {activeSection === "contracts" && <ContractsSection suppliers={suppliers.data} onLogged={historyLog.append} />}
              {activeSection === "catalog" && <CatalogSection suppliers={suppliers.data} onLogged={historyLog.append} />}
              {activeSection === "history" && <HistorySection log={historyLog.entries} />}
              {activeSection === "analytics" && <AnalyticsSection suppliers={suppliers.data} />}
              {activeSection === "settings" && <SettingsSection />}
            </div>
          </div>
        )}
      </AsyncState>

      {tenantId && (
        <CreateSupplierDrawer
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          tenantId={tenantId}
          onCreated={(supplier) => {
            historyLog.append(`Fornecedor "${supplier.legalName}" cadastrado.`);
            if (activeSection !== "suppliers" && activeSection !== "overview") {
              selectSection("suppliers");
            }
          }}
        />
      )}
    </PageContainer>
  );
}
