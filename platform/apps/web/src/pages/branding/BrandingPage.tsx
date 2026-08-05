import { useSearchParams } from "react-router-dom";
import { PageContainer } from "@shared/components/PageContainer";
import { PageHeader } from "@shared/components/PageHeader";
import { AsyncState } from "@shared/components/AsyncState";
import { useAuth } from "@core/auth/useAuth";
import { useDashboardBootstrap } from "@core/query/useDashboardBootstrap";
import { SectionSubNav } from "@shared/components/ui/SectionSubNav";
import { BRANDING_SECTIONS, DEFAULT_BRANDING_SECTION, isBrandingSectionId, type BrandingSectionId } from "./brandingSections";
import { ComponentsSection } from "./sections/ComponentsSection";
import { ExportSection } from "./sections/ExportSection";
import { LogoSection } from "./sections/LogoSection";
import { ManualSection } from "./sections/ManualSection";
import { OverviewSection } from "./sections/OverviewSection";
import { PaletteSection } from "./sections/PaletteSection";
import { ThemeSection } from "./sections/ThemeSection";
import { TokensSection } from "./sections/TokensSection";
import { TypographySection } from "./sections/TypographySection";

/**
 * Brand Center (FUN-102) — módulo completo de identidade visual da Empresa, organizado em nove
 * seções (`brandingSections.ts`) navegáveis pela mesma barra lateral contextual genérica
 * (`SectionSubNav`) já usada pelo Perfil Empresarial (FUN-101), a seção ativa refletida na URL
 * (`?section=`) para deep-link/compartilhamento. Auditoria completa do `BrandingManager` (sete
 * métodos públicos) documentada em `docs/implementation/FUN_102_BRANDING_EXPERIENCE_REPORT.md`:
 * Logo, Paleta e Tema têm mutação/leitura real; Tokens depende do cache de sessão (nenhum endpoint
 * de listagem independente existe); Tipografia, Componentes, Manual e Exportação (oficial) não têm
 * endpoint próprio — nenhum foi inventado.
 */
export function BrandingPage() {
  const auth = useAuth();
  const bootstrap = useDashboardBootstrap();
  const [searchParams, setSearchParams] = useSearchParams();

  const sectionParam = searchParams.get("section");
  const activeSection: BrandingSectionId = isBrandingSectionId(sectionParam) ? sectionParam : DEFAULT_BRANDING_SECTION;

  function selectSection(id: BrandingSectionId) {
    setSearchParams(id === DEFAULT_BRANDING_SECTION ? {} : { section: id });
  }

  return (
    <PageContainer>
      <PageHeader title="Branding" description="O Brand Center — identidade visual da Empresa, mantida pelo Branding Hub e consumida por toda a plataforma." />
      <AsyncState isLoading={bootstrap.isLoading} isError={bootstrap.isError} error={bootstrap.error} onRetry={() => void bootstrap.refetch()}>
        {bootstrap.data && (
          <div className="profile-layout">
            <SectionSubNav label="Seções do Brand Center" sections={BRANDING_SECTIONS} activeId={activeSection} onSelect={selectSection} />
            <div className="profile-content">
              {activeSection === "overview" && <OverviewSection profileId={bootstrap.data.profileId} tenantId={auth.tenantId ?? bootstrap.data.tenantId} brandTokens={bootstrap.data.brandTokens} />}
              {activeSection === "logo" && <LogoSection tenantId={auth.tenantId ?? bootstrap.data.tenantId} />}
              {activeSection === "palette" && <PaletteSection tenantId={auth.tenantId ?? bootstrap.data.tenantId} brandTokens={bootstrap.data.brandTokens} />}
              {activeSection === "typography" && <TypographySection brandTokens={bootstrap.data.brandTokens} />}
              {activeSection === "tokens" && <TokensSection brandTokens={bootstrap.data.brandTokens} />}
              {activeSection === "theme" && <ThemeSection tenantId={auth.tenantId ?? bootstrap.data.tenantId} />}
              {activeSection === "components" && <ComponentsSection />}
              {activeSection === "manual" && <ManualSection brandTokens={bootstrap.data.brandTokens} />}
              {activeSection === "export" && <ExportSection brandTokens={bootstrap.data.brandTokens} />}
            </div>
          </div>
        )}
      </AsyncState>
    </PageContainer>
  );
}
