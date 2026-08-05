import { useSearchParams } from "react-router-dom";
import { PageContainer } from "@shared/components/PageContainer";
import { PageHeader } from "@shared/components/PageHeader";
import { AsyncState } from "@shared/components/AsyncState";
import { useAuth } from "@core/auth/useAuth";
import { useDashboardBootstrap } from "@core/query/useDashboardBootstrap";
import { SectionSubNav } from "@shared/components/ui/SectionSubNav";
import { DEFAULT_PROFILE_SECTION, isProfileSectionId, PROFILE_SECTIONS, type ProfileSectionId } from "./profileSections";
import { CompanySection } from "./sections/CompanySection";
import { CustomersSection } from "./sections/CustomersSection";
import { GoalsSection } from "./sections/GoalsSection";
import { MarketSection } from "./sections/MarketSection";
import { OverviewSection } from "./sections/OverviewSection";
import { PositioningSection } from "./sections/PositioningSection";
import { ProductsSection } from "./sections/ProductsSection";
import { SettingsSection } from "./sections/SettingsSection";
import { StrategySection } from "./sections/StrategySection";

/**
 * Perfil Empresarial (FUN-101) — módulo completo de configuração da Empresa, organizado em nove
 * seções (`profileSections.ts`) navegáveis por uma barra lateral contextual genérica (`SectionSubNav`,
 * generalizada na FUN-102 e reutilizada pelo Branding), a
 * seção ativa refletida na URL (`?section=`) para deep-link/compartilhamento, seguindo o Design
 * System (UX-001). Apenas "Visão Geral" e a classificação de "Mercado" consomem dado real, através
 * dos únicos endpoints já existentes do Business Profile Engine (`apps/api`, FUN-004/005); as demais
 * seções pedidas pela Sprint (Empresa, Clientes, Produtos, Posicionamento, Objetivos, Estratégia,
 * parte de Configurações) não têm endpoint correspondente — nenhum foi inventado, ver
 * `docs/implementation/FUN_101_BUSINESS_PROFILE_EXPERIENCE_REPORT.md`.
 */
export function BusinessProfilePage() {
  const auth = useAuth();
  const bootstrap = useDashboardBootstrap();
  const [searchParams, setSearchParams] = useSearchParams();

  const sectionParam = searchParams.get("section");
  const activeSection: ProfileSectionId = isProfileSectionId(sectionParam) ? sectionParam : DEFAULT_PROFILE_SECTION;

  function selectSection(id: ProfileSectionId) {
    setSearchParams(id === DEFAULT_PROFILE_SECTION ? {} : { section: id });
  }

  return (
    <PageContainer>
      <PageHeader title="Perfil Empresarial" description="O centro de configuração da Empresa — classificação, identidade e estratégia, consumidos por toda a plataforma." />
      <AsyncState isLoading={bootstrap.isLoading} isError={bootstrap.isError} error={bootstrap.error} onRetry={() => void bootstrap.refetch()}>
        {bootstrap.data && (
          <div className="profile-layout">
            <SectionSubNav label="Seções do Perfil Empresarial" sections={PROFILE_SECTIONS} activeId={activeSection} onSelect={selectSection} />
            <div className="profile-content">
              {activeSection === "overview" && <OverviewSection profileId={bootstrap.data.profileId} tenantId={auth.tenantId ?? bootstrap.data.tenantId} />}
              {activeSection === "company" && <CompanySection />}
              {activeSection === "market" && <MarketSection profileId={bootstrap.data.profileId} />}
              {activeSection === "customers" && <CustomersSection />}
              {activeSection === "products" && <ProductsSection />}
              {activeSection === "positioning" && <PositioningSection />}
              {activeSection === "goals" && <GoalsSection />}
              {activeSection === "strategy" && <StrategySection />}
              {activeSection === "settings" && <SettingsSection />}
            </div>
          </div>
        )}
      </AsyncState>
    </PageContainer>
  );
}
