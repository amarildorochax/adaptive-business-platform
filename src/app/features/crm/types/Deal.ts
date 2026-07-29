// Deal.ts
//
// Responsabilidade:
// Contrato de "Negócio" do CRM — vinculado a um `Client` e,
// opcionalmente, a uma `Company`, posicionado em uma `CrmPipelineStage`.

export interface Deal {
  id: string;
  clientId: string;
  companyId: string | null;
  title: string;
  value: number;
  probability: number;
  stageId: string;
  ownerName: string;
  expectedCloseDate: string;
  source: string;
  notes: string;
}
