import { WidgetCard } from "@shared/components/WidgetCard";
import { Field } from "@shared/components/ui/Field";
import { NotConnectedNotice } from "@shared/components/ui/NotConnectedNotice";
import { useProfileDraft } from "@core/businessProfile/useProfileDraft";
import { DraftSavedIndicator } from "@shared/components/ui/DraftSavedIndicator";

interface CompanyDraft extends Record<string, unknown> {
  readonly tradeName: string;
  readonly legalName: string;
  readonly taxId: string;
  readonly phone: string;
  readonly whatsapp: string;
  readonly email: string;
  readonly website: string;
  readonly address: string;
  readonly city: string;
  readonly state: string;
  readonly country: string;
  readonly businessHours: string;
}

const INITIAL_DRAFT: CompanyDraft = {
  tradeName: "",
  legalName: "",
  taxId: "",
  phone: "",
  whatsapp: "",
  email: "",
  website: "",
  address: "",
  city: "",
  state: "",
  country: "",
  businessHours: "",
};

/**
 * Empresa (FUN-101) — `BusinessProfile` (Entity) tem apenas `profileId`/`tenantId`/`createdAt`
 * (ver `BUSINESS_PROFILE_ENGINE_CORE_MIGRATION_REPORT.md`, Seção 3.1); nenhum campo de identificação
 * legal/contato existe em nenhum Manager. Mantido como rascunho local — nunca uma chamada de rede.
 */
export function CompanySection() {
  const draft = useProfileDraft<CompanyDraft>("company", INITIAL_DRAFT);

  return (
    <div className="dashboard-section">
      <NotConnectedNotice fields={["Nome fantasia", "Razão social", "CNPJ", "Telefone", "WhatsApp", "Email", "Site", "Endereço", "Cidade", "Estado", "País", "Horário"]} />

      <WidgetCard title="Identificação">
        <div className="form-grid">
          <Field label="Nome fantasia" value={draft.value.tradeName} onChange={(event) => draft.updateField("tradeName", event.target.value)} />
          <Field label="Razão social" value={draft.value.legalName} onChange={(event) => draft.updateField("legalName", event.target.value)} />
          <Field label="CNPJ" value={draft.value.taxId} onChange={(event) => draft.updateField("taxId", event.target.value)} placeholder="00.000.000/0000-00" pattern="[\d./ -]*" />
        </div>
      </WidgetCard>

      <WidgetCard title="Contato">
        <div className="form-grid">
          <Field label="Telefone" type="tel" value={draft.value.phone} onChange={(event) => draft.updateField("phone", event.target.value)} />
          <Field label="WhatsApp" type="tel" value={draft.value.whatsapp} onChange={(event) => draft.updateField("whatsapp", event.target.value)} />
          <Field label="Email" type="email" value={draft.value.email} onChange={(event) => draft.updateField("email", event.target.value)} />
          <Field label="Site" type="url" value={draft.value.website} onChange={(event) => draft.updateField("website", event.target.value)} placeholder="https://" />
        </div>
      </WidgetCard>

      <WidgetCard title="Endereço">
        <div className="form-grid">
          <Field label="Endereço" value={draft.value.address} onChange={(event) => draft.updateField("address", event.target.value)} />
          <Field label="Cidade" value={draft.value.city} onChange={(event) => draft.updateField("city", event.target.value)} />
          <Field label="Estado" value={draft.value.state} onChange={(event) => draft.updateField("state", event.target.value)} />
          <Field label="País" value={draft.value.country} onChange={(event) => draft.updateField("country", event.target.value)} />
          <Field label="Horário de funcionamento" value={draft.value.businessHours} onChange={(event) => draft.updateField("businessHours", event.target.value)} placeholder="Ex.: Seg–Sex, 9h–18h" />
        </div>
        <DraftSavedIndicator savedAt={draft.savedAt} onClear={draft.resetDraft} />
      </WidgetCard>
    </div>
  );
}
