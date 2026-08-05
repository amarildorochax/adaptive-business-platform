import { WidgetCard } from "@shared/components/WidgetCard";
import { Field } from "@shared/components/ui/Field";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { useProfileDraft } from "@core/businessProfile/useProfileDraft";
import { DraftSavedIndicator } from "@shared/components/ui/DraftSavedIndicator";

interface ProductsDraft extends Record<string, unknown> {
  readonly categories: string;
  readonly products: string;
  readonly services: string;
  readonly averageTicket: string;
  readonly mainOffers: string;
  readonly featuredProducts: string;
}

const INITIAL_DRAFT: ProductsDraft = { categories: "", products: "", services: "", averageTicket: "", mainOffers: "", featuredProducts: "" };

/**
 * Produtos (FUN-101) — "Produtos e Serviços" é um elemento nomeado no Modelo de Perfil (Capítulo 8,
 * `BUSINESS_PROFILE_ENGINE.md`), mas nunca implementado: nenhuma Entity/Repository correspondente
 * existe em `@abp/business-profile` (confirmado em
 * `BUSINESS_PROFILE_ENGINE_CORE_MIGRATION_REPORT.md`, Seção 8, "fora de escopo"). Rascunho local.
 */
export function ProductsSection() {
  const draft = useProfileDraft<ProductsDraft>("products", INITIAL_DRAFT);

  return (
    <div className="dashboard-section">
      <NotConnectedNotice fields={["Categorias", "Produtos", "Serviços", "Ticket médio", "Principais ofertas", "Produtos destaque"]} />

      <WidgetCard title="Catálogo">
        <div className="form-grid">
          <Field label="Categorias" value={draft.value.categories} onChange={(event) => draft.updateField("categories", event.target.value)} />
          <Field label="Produtos" value={draft.value.products} onChange={(event) => draft.updateField("products", event.target.value)} />
          <Field label="Serviços" value={draft.value.services} onChange={(event) => draft.updateField("services", event.target.value)} />
          <Field label="Ticket médio" value={draft.value.averageTicket} onChange={(event) => draft.updateField("averageTicket", event.target.value)} placeholder="R$" />
        </div>
      </WidgetCard>

      <WidgetCard title="Destaques">
        <div className="form-grid">
          <Field label="Principais ofertas" value={draft.value.mainOffers} onChange={(event) => draft.updateField("mainOffers", event.target.value)} />
          <Field label="Produtos destaque" value={draft.value.featuredProducts} onChange={(event) => draft.updateField("featuredProducts", event.target.value)} />
        </div>
        <DraftSavedIndicator savedAt={draft.savedAt} onClear={draft.resetDraft} />
      </WidgetCard>
    </div>
  );
}
